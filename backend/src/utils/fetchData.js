
import { Itinerary } from "../models/itinerary.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from  "../utils/ApiError.js";
import { ApiResponse } from  "../utils/ApiResponse.js";
export const getitinerary = async (itineraryId) => {
    
  
    if (!itineraryId) {
      throw new ApiError(400, "Itinerary ID is required.");
    }
  
    const itinerary = await Itinerary.findById(itineraryId).select(
      "-hotels -destinations"
    );
  
    if (!itinerary) {
      throw new ApiError(404, "Itinerary not found.");
    }
  
    return  itinerary;
  };

  export const getDestinations_by_itinerary = async (itineraryId) => {
    
  
    const itinerary = await Itinerary.findById(itineraryId).populate(
      "destinations"
    );
    if (!itinerary) {
      throw new ApiError(404, "Itinerary not found.");
    }
  
    const destinations = itinerary.destinations;
    const days = itinerary.Days;
  
    let formulate_destination = [];
    let idx = 0;
  
    for (let i = 0; i < days; i++) {
      let collections = [];
  
      for (let j = 0; j < 5 && idx < destinations.length; j++) {
        collections.push(destinations[idx]);
        idx++;
      }
  
      while (collections.length < 5) {
        collections.push({});
      }
  
      formulate_destination.push(collections);
    }
  
    return  formulate_destination;
  };

  export const updateDestinations_to_Itinerary = async (itineraryId, itinerary) => {
    if (!itineraryId || !itinerary || !Array.isArray(itinerary)) {
      throw new ApiError(
        400,
        "Itinerary ID and an array of destinations are required."
      );
    }

    console.log(itinerary);
  
    // Flatten the nested array (if itinerary is a 2D array)
    const destinations = itinerary.flat();
    const formattedDestinations = destinations.map((dest) => {
      const {
        id,
        name,
        significance,
        city,
        state,
        type,
        Date,
        airportWithin50kmRadius,
        costPerDay,
        banner,
      } = dest;
  
      return {
        id,
        name,
        significance,
        city,
        state,
        type,
        Date,
        airportWithin50kmRadius,
        costPerDay,
        banner,
      };
    });
  
    // Perform a bulk update
    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      itineraryId,
      { $set: { destinations: formattedDestinations } }, // Set the entire destinations array
      { new: true, upsert: true } // Return the updated document and create if not exists
    );
  
    if (!updatedItinerary) {
      throw new ApiError(
        500,
        "Something went wrong while updating the itinerary!"
      );
    }
  
    return  "Destinations updated successfully.";
  };