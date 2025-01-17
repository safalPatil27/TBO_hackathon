import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiError} from "../../utils/ApiError.js";
import {ApiResponse} from "../../utils/ApiResponse.js";






const suggestion = asyncHandler(async (req, res) => {
    const {id, priority_map, days, mainLocation, children} = req.body;
    

    if (!id && !priority_map && !days && !mainLocation && !children) {
        return ApiError(400, "Priority map is required");
    }
    if(days >7 || days < 1) {
        return ApiError(400, "Days should be between 1 and 7");
    }

    if(priority_map.length !== 11) {
        return ApiError(400, "Priority map should contain exactly 5 elements");
    }
    const str ="There are no Children!";
    if(children){
        str = "There are Children!"
    }

    const prompt = `
        You are a travel planner. Create a ${days}-day travel itinerary for the main location "${mainLocation}". Use the following priority map: ${JSON.stringify(priority_map)}. 
        Avoid locations categorized as AdventureSports, trekking, or rafting as the group includes children and ${str}. For each day:
        1. Suggest 3 main visit places based on the priority map and inside a 50 km radius of each other.
        2. Suggest 2 restaurants within 20 km of the visit places.
        3. All these locations must be in ${mainLocation} and inside a 50 km radius of the main location.

        Output the itinerary as an array, where each day contains 5 entries (3 locations + 2 restaurants) in the following format:
        {
            id: <unique ID>,
            state: <state>,
            city: <city>,
            name: <place name>,
            type: <place type>,
            airportWithin50kmRadius: <True/False>,
            significance: <one-liner about the place>,
        }

        Restaurants should only include name, city, and distance.`;
    
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });

        const itinerary = response.data.choices[0].message.content;

        if(!itinerary) {
            throw new ApiError(500, "Something went wrong while creating itinerary!")
        }   
        
        return res
        .status(201)
        .json(
            new ApiResponse(
                200, 
                { itinerary: JSON.parse(itinerary) }, 
                "Itinerary created Successfully"
            )
        )


});

export {suggestion};