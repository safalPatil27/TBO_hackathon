from flask import Flask, request, jsonify
import numpy as np
import pickle
from openai import OpenAI
import json
from dotenv import load_dotenv
import os
import requests
import json

load_dotenv()
from flask_cors import CORS
app = Flask(__name__)
CORS(app, origins=["http://127.0.0.1:5173", "http://localhost:5173"])
token = os.getenv("api_token")
endpoint = "https://models.inference.ai.azure.com"
modelName = "gpt-4o"

UNSPLASH_API_URL = "https://api.unsplash.com/search/photos"

ACCESS_KEY = os.getenv("access_key")

def get_location_image(location):
    """
    Fetches real-life images of a location from Unsplash.
    """
    try:

        if not location:
            return ""

        # API Request to Unsplash
        params = {
            "query": location,
            "per_page": 1,  # Fetch a single image
            "client_id": ACCESS_KEY,
        }
        response = requests.get(UNSPLASH_API_URL, params=params)
        response.raise_for_status()

        # Parse Response
        data = response.json()
        if data["results"]:
            image_url = data["results"][0]["urls"]["regular"]
            return image_url
        else:
            return ""

    except requests.exceptions.RequestException as e:
        return ""


# Load the regressor model
with open("regressor_model.pkl", "rb") as f:
    regressor = pickle.load(f)

# Load the vectorizer
with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# Function to classify a new sentence
def classify_sentence(input_sentence):
    embedding = vectorizer.transform([input_sentence]).toarray()
    scores = regressor.predict(embedding)
    return np.array(scores).flatten()

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict relevance scores for a given input sentence.
    """
    try:
        # Get JSON data
        data = request.json
        body = json.loads(data.get("body")) 
        print(body)
        input_sentence = body.get("sentence")
        input_tag_array = body.get("tag_array")
        input_days = body.get("days")
        input_mainLocation = body.get("mainLocation")
        input_children = body.get("children")
        # Validate input  
        if not input_sentence or not isinstance(input_sentence, str):
            return jsonify({"error": "Invalid or missing 'sentence'. Provide a single sentence as a string."}), 400

        if not input_tag_array or not isinstance(input_tag_array, list):
            return jsonify({"error": "Invalid or missing 'tag_array'. Provide a list of tag scores."}), 400

        if len(input_tag_array) != 11:
            return jsonify({"error": "'tag_array' should contain exactly 5 elements."}), 400

        scores = classify_sentence(input_sentence)

        # Define the classes
        classes = ["Temple", "Beach", "Fort", "Lake", "National Park", "AdventureSports", "Amusement", "Nature", "Cultural", "UrbanDevelopment", "Scenic"]

        # Combine the scores with the input tag array and create a priority map
        priority_map = {cls: round(score + tag_score, 2) for cls, score, tag_score in zip(classes, scores, input_tag_array)}

        client =  OpenAI( base_url= endpoint, api_key= token )

        prompt = f"""
            You are a travel planner. Create a {input_days}-day travel itinerary for the main location "{input_mainLocation}". Use the following priority map: {priority_map}. 
            Avoid locations categorized as AdventureSports, trekking, or rafting as the group includes children and {input_children}. For each day:
            1. Suggest 3 main visit places based on the priority map and inside a 50 km radius of each other.
            2. Suggest 2 restaurants within 20 km of the visit places.
            3. All these locations must be in {input_mainLocation} and inside a 50 km radius of the main location.

            4. Output the itinerary as an array, where each day contains 5 entries (3 locations + 2 restaurants) in the following format:
            a. 3 objects for locations with the following keys:
            {{
                id: <unique number (1,2,3,4...)>,
                state: <state>,
                city: <city>,
                name: <place name>,
                type: <place type>,
                airportWithin50kmRadius: <True/False>,
                significance: <one-liner about the place>,
                costPerDay: <cost per day(travel cost(from main location) + entry fee)in dollars> <type: number>
            }}
            Example:{{
                    "airportWithin50kmRadius": true,
                    "city": "London",
                    "id": 9,
                    "name": "Primrose Hill",
                    "significance": "Offers panoramic views of the London skyline and a peaceful environment.",
                    "state": "England",
                    "type": "Scenic"
                    costPerDay: 100
                }}
            b. 2 objects for restaurants with the following keys:
            {{
                id: <unique number (1,2,3,4...)>,
                state: <state>,
                city: <city>,
                name: <place name>,
                type: <place type>,
                airportWithin50kmRadius: <True/False>,
                significance: <one-liner about the place>,
                costPerDay: 100
            }}
            c. you have to give the output as for day.
            [location, restaurant, location, restaurant, location] and give according to it.
            d. Id must be unique for each day and it should be in order.
            
            4. The final output should be an array of days, where each day contains an array of 5 entries (3 locations + 2 restaurants).Just give json output with no other words.
        """


        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            temperature= 1.0,
            top_p= 1.0,
            max_tokens= 10000,
            model= modelName
        )
        itinerary = str(response.choices[0].message.content)

        

        cleaned_itinerary = itinerary.replace("```", "").replace("\n", "").replace("json", "")
        output = json.loads(cleaned_itinerary)

        for day in output:
            for entry in day:
                entry["image_url"] = get_location_image(entry["name"]+", "+entry["city"] + ", " + entry["state"])
                   
        return jsonify({"itinerary": output}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/change', methods=['POST'])
def change():
    """
    Predict relevance scores for a given input sentence.
    """
    try:
        # Get JSON data
        data = request.json
        input_itinerary = data.get("itinerary")
        input_id = data.get("id")
        

        # Validate input
        if not input_itinerary or not isinstance(input_itinerary, list):
            return jsonify({"error": "Invalid or missing 'itinerary'. Provide a itinerary as a json."}), 400

        if not input_id or not isinstance(input_id, int):
            return jsonify({"error": "Invalid or missing 'id'. Provide a integer."}), 400

       
        client =  OpenAI( base_url= endpoint, api_key= token )

        prompt = f"""
            1. You are provided with:
                a. An ID {input_id} of a location/restaurant that needs to be updated.
                b. A JSON itinerary {input_itinerary} containing a list of locations/resturants.
            2. Your task is to:
                a. Identify the location in the JSON associated with the given ID.
                b. Replace this location with a similar but different location that is not already present in the itinerary.
                c. Ensure the format of the JSON remains unchanged.
                {{
                id: <unique number (1,2,3,4...)>,
                state: <state>,
                city: <city>,
                name: <place name>,
                type: <place type>,
                airportWithin50kmRadius: <True/False>,
                significance: <one-liner about the place >,
                costPerDay: <cost per day(travel cost(from main location) + entry fee)in dollars> <type: number>
            }}
            Example:{{
                    "airportWithin50kmRadius": true,
                    "city": "London",
                    "id": 9,
                    "name": "Primrose Hill",
                    "significance": "Offers panoramic views of the London skyline and a peaceful environment.",
                    "state": "England",
                    "type": "Scenic",
                    
                    costPerDay: 100
            }}
            3.The final  Output should be json of just modified location. Just give json output with no other words."""


        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            temperature= 1.0,
            top_p= 1.0,
            max_tokens= 10000,
            model= modelName
        )
        changed_location = str(response.choices[0].message.content)
        
        cleaned_changed_location = changed_location.replace("'", '"').replace("```", "").replace("\n", "").replace("json", "")
        output = json.loads(cleaned_changed_location)

        output["image_url"] = get_location_image(output["name"]+", "+output["city"])
        return jsonify({"changed_location": output}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
