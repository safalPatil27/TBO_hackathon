from flask import Flask, request, jsonify
import numpy as np
import pickle
from openai import OpenAI
import json
from dotenv import load_dotenv
import os
load_dotenv()

app = Flask(__name__)

token = os.getenv("api_token")
endpoint = "https://models.inference.ai.azure.com"
modelName = "gpt-4o"

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
        input_sentence = data.get("sentence")
        input_tag_array = data.get("tag_array")
        input_days = data.get("days")
        input_mainLocation = data.get("mainLocation")
        input_children = data.get("children")

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
            }}
            b. 2 objects for restaurants with the following keys:
            {{
                name: <restaurant name>,
                city: <city>,
                distance: <distance from main locations, in km>
            }}
            
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
        
        return jsonify({"itinerary": output}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
