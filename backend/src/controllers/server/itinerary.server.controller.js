import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { Itinerary } from "../../models/itinerary.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import mongoose from "mongoose";
import axios from "axios";
import { User } from "../../models/user.model.js";
import {v4 as uuidv4} from "uuid";

const findCodeByLocation = (location, cityList) => {
  const city = cityList.find((city) =>
    city.Name.toLowerCase().includes(location.toLowerCase())
  );

  return city ? city.Code : null;
};


const create_Itinerary = asyncHandler(async (req, res) => {
  const { title, location, days, budget } = req.body;

  if (!title || !location || !days || !budget) {
    throw new ApiError(400, 'Missing required fields');
  }
  const shareableLink = `http://localhost:${process.env.HOST || 5173}/itinerary/join-itinerary/${uuidv4()}`;
  const newItinerary = await Itinerary.create({
    userId: req.user._id,
    title,
    location: location.toLowerCase(),
    Days: days,
    sharable_link: shareableLink,
    permissions: [
      {
        userId: req.user._id,
        access: "owner"
      }
    ],
    budget
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        itineraries: {
          itineraryId: newItinerary._id,
          access: "owner"
        }
      }
    },
  );

  if (!user) {
    throw new ApiError(500, "Something went wrong while creating Itinerary!");
  }


  if (!newItinerary) {
    throw new ApiError(500, "Something went wrong while creating Itinerary!");
  }


  return res
    .status(201)
    .json(new ApiResponse(200, newItinerary, "User registered Successfully"));
});

const display_hotel_to_Itinerary = asyncHandler(async (req, res) => {
  const { countrycode, location, adults, children, star_rating, start_date, end_date, No_of_rooms } = req.body;

  if (!countrycode || !star_rating || !adults || !location || !start_date || !end_date || !No_of_rooms) {
    throw new ApiError(400, 'Missing required fields');
  }
  const children_ages = new Array(children).fill(0);
  const username = "hackathontest";
  const password = "Hac@98910186";

  const Citylist_json = await axios.post(
    "http://api.tbotechnology.in/TBOHolidays_HotelAPI/Citylist",
    {
      CountryCode: countrycode,
    },
    {
      auth: {
        username: username,
        password: password,
      },
    }
  );

  if (!Citylist_json) {
    throw new ApiError(500, "Something went wrong while getting hotels! Citylist")
  }


  const citycode = findCodeByLocation(location, Citylist_json.data.CityList);

  if (!citycode) {
    throw new ApiError(500, "Something went wrong while getting hotels! Citycode")
  }

  console.log(citycode);

  const Hotellist_json = await axios.post(
    "http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList",
    {
      CityCode: citycode, // Request body payload
    },
    {
      auth: {
        username: username,
        password: password,
      },
    }
  );


  if (!Hotellist_json) {
    throw new ApiError(500, "Something went wrong while getting hotels! Hotellist")
  }
  const filteredHotelCodes = Hotellist_json.data.Hotels.filter(hotel => hotel.HotelRating === star_rating).map(hotel => hotel.HotelCode);
  const hotelCodesString = filteredHotelCodes.join(',');

  const response = await axios.post(
    "http://api.tbotechnology.in/TBOHolidays_HotelAPI/search",
    {
      CheckIn: start_date,
      CheckOut: end_date,
      GuestNationality: "IN",
      PaxRooms: [
        {
          "Adults": adults,
          "Children": children,
          "ChildrenAges": children_ages
        }],
      HotelCodes: hotelCodesString,
      Filters: {
        "Refundable": false,
        "NoOfRooms": No_of_rooms,
        "MealType": "All"
      }
    },
    {
      auth: {
        username: username, // Basic Auth Username
        password: password, // Basic Auth Password
      },
    }
  );

  const Hotel = response.data.HotelResult;
  console.log(response.data, "response");
  
  if (!Hotel) {
    throw new ApiError(500,response.data.Status.Description || "Something went wrong while getting hotels!" )
  }


  const updatedResult = Hotel.map(item => {
    const hotel = Hotellist_json.data.Hotels.find(h => h.HotelCode === item.HotelCode);
    if (hotel) {
      return { ...item, ...hotel };
    }
  });

  return res.status(201).json(
    new ApiResponse(
      200,
      updatedResult,
      response.data.Message
    )
  )

});


const addHotel_to_Itinerary = asyncHandler(async (req, res) => {
  const { itineraryId, HotelName,
    HotelRating,
    Address,
    CountryName,
    CountryCode,
    CityName,
    TotalFare,
    TotalTax,
    startDate,
    endDate,
  } = req.body;


  if (!itineraryId || !HotelName || !HotelRating || !Address || !CountryName || !CountryCode || !CityName || !TotalFare || !TotalTax || !startDate || !endDate) {
    throw new ApiError(400, 'Missing required fields');
  }


  const newHotel = await Itinerary.findByIdAndUpdate(
    itineraryId,
    {
      $push: {
        hotels: {
          HotelName,
          HotelRating,
          Address,
          CountryName,
          CountryCode,
          CityName,
          TotalFare,
          TotalTax,
          startDate,
          endDate,
        }
      }
    }
  );

  if (!newHotel) {
    throw new ApiError(500, "Something went wrong while adding hotel!");
  }

  return res.status(201).json(
    new ApiResponse(
      200,
      {},
      200,
      {},
      "Hotel added Successfully"
    )
  );
});


const addDestination_to_Itinerary = asyncHandler(async (req, res) => {
  const { itineraryId, itinerary } = req.body;
  console.log(req.body);

  if (!itineraryId || !itinerary || !Array.isArray(itinerary)) {
    throw new ApiError(
      400,
      "Itinerary ID and an array of destinations are required."
    );
  }

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
      startTime,
      endTime,
      costPerDay,
      image_url,
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
      startTime,
      endTime,
      costPerDay,
      banner: image_url,
    };
  });

  // Perform a bulk update
  const updatedItinerary = await Itinerary.findByIdAndUpdate(
    itineraryId,
    { $push: { destinations: formattedDestinations } }, // Set the entire destinations array
    { new: true, upsert: true } // Return the updated document and create if not exists
  );

  if (!updatedItinerary) {
    throw new ApiError(
      500,
      "Something went wrong while updating the itinerary!"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Destinations added successfully."));
});

const updateDestinations_to_Itinerary = asyncHandler(async (req, res) => {
  const { itineraryId, itinerary } = req.body;
  if (!itineraryId || !itinerary || !Array.isArray(itinerary)) {
    throw new ApiError(
      400,
      "Itinerary ID and an array of destinations are required."
    );
  }

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

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Destinations updated successfully."));
});

const getitinerary = asyncHandler(async (req, res) => {
  const { itineraryId } = req.params;

  if (!itineraryId) {
    throw new ApiError(400, "Itinerary ID is required.");
  }

  const itinerary = await Itinerary.findById(itineraryId).select(
    "-hotels -destinations"
  );

  if (!itinerary) {
    throw new ApiError(404, "Itinerary not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, itinerary, "Itinerary fetched successfully."));
});

const getDestinations_by_itinerary = asyncHandler(async (req, res) => {
  const { itineraryId } = req.params;

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

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formulate_destination,
        "Destinations fetched successfully."
      )
    );
});

const getitinerary_by_user = asyncHandler(async (req, res) => {
  // Fetch itineraries where the user has permissions
  const itineraries = await Itinerary.find({ "permissions.userId": req.user._id.toString() });

  if (itineraries.length === 0) {
    throw new ApiError(404, "Itinerary not found.");
  }

  // Add access level to each itinerary
  const updatedItineraries = itineraries.map(itinerary => {
    const isOwner = itinerary.userId.toString() === req.user._id.toString();
    return {
      ...itinerary.toObject(), 
      access: isOwner ? "owner" : "edit",
    };
  });

  console.log(updatedItineraries);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedItineraries, "Itinerary fetched successfully."));
});

const delete_Itinerary = asyncHandler(async (req, res) => {
  const { itineraryId } = req.params;

  if (!itineraryId) {
    throw new ApiError(400, "Itinerary ID is required.");
  }
  const itinerary = await Itinerary.findById(itineraryId);

  if (!itinerary) {
    throw new ApiError(404, "Itinerary not found.");
  }

  await Itinerary.findByIdAndDelete(itineraryId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Itinerary deleted successfully."
      )
    )
});

const add_user_with_Status_Itinerary = asyncHandler(async (req, res) => {
  const user_id = req.user._id;
  const {link}  = req.params;
  const itinerary = await Itinerary.findOne({ sharable_link: `http://localhost:${process.env.HOST || 5173}/itinerary/join-itinerary/${link}` });
  
  console.log(itinerary)
  if (!itinerary) {
    throw new ApiError(404, "Itinerary not found.");
  }

  const isUserInItinerary = itinerary.permissions.some(user => user.userId.toString() === user_id);
  if (!isUserInItinerary) {
    itinerary.permissions.push({ userId: user_id, access: "edit" }); 
    await itinerary.save();
  }
  else{
    throw new ApiError(404, "User not found."); 
  }

  const user = await User.findByIdAndUpdate(
    user_id,
    { 
      $push: { 
        itineraries: { itineraryId: itinerary._id, type: "edit" } 
      } 
    },
    { new: true } 
  );
  
  if(!user){
    throw new ApiError(404, "Error in User-accessing");
  }

  return res.status(200).json(
      new ApiResponse(
          200,
          {},
          "User added to the itinerary with the specified status."
      )
  )
});

const get_Status_of_User_Itinerary = asyncHandler(async (req, res) => {
  const { itineraryId, userId } = req.params;

  if (!itineraryId) {
    throw new ApiError(400, "Itinerary ID is required.");
  }

  const itinerary = await Itinerary.findById(itineraryId);

  if (!itinerary) {
    throw new ApiError(404, "Itinerary not found.");
  }

  const userAccess = itinerary.permissions?.find(
    (permission) => permission.userId.toString() === userId.toString()
  )?.access;

  if (!userAccess) {
    throw new ApiError(403, "User does not have permissions.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userAccess, "User status fetched successfully.")
    );
});

export {
  create_Itinerary,
  addHotel_to_Itinerary,
  addDestination_to_Itinerary,
  updateDestinations_to_Itinerary,
  getitinerary,
  getitinerary_by_user,
  getDestinations_by_itinerary,
  delete_Itinerary,
  add_user_with_Status_Itinerary,
  get_Status_of_User_Itinerary,
  display_hotel_to_Itinerary
}