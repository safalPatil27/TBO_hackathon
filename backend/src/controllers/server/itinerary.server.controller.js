import { asyncHandler } from ".../utils/asyncHandler.js";
import {ApiError} from ".../utils/ApiError.js";
import {Itinerary} from ".../models/itinerary.model.js";
import {uploadOnCloudinary} from ".../utils/cloudinary.js";
import { ApiResponse } from ".../utils/ApiResponse.js";

const create_Itinerary = asyncHandler(async (req, res) => {
    const {title, location, days} = req.body;

    if (!title || !location || !days) {
        throw new ApiError(400, 'Missing required fields');
    }
    const newItinerary = await Itinerary.create({
        userId: req.user._id,
        title,
        location: location.toLowerCase(),
        days,
        permissions: [
            {
                userId: req.user._id,
                access: "owner"
            }
        ]
    });
    

    if (!newItinerary) {
        throw new ApiError(500, "Something went wrong while creating Itinerary!")
    }

    return res.status(201).json(
        new ApiResponse(
            200, 
            newItinerary, 
            "User registered Successfully"
        )
    )
});

const addHotel_to_Itinerary = asyncHandler(async (req, res) => {
    const{ itineraryId, hotel } = req.body;
    const bannerLocalpath = req.file?.path;

    if (!bannerLocalpath) {
        throw new ApiError(400, 'Missing required fields');
    }

    const banner_hotel = await uploadOnCloudinary(bannerLocalpath);

    if (!banner_hotel.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    if (!itineraryId || !hotel) {
        throw new ApiError(400, 'Missing required fields');
    }
    const {name, description, startDate, endDate, costPerDay} = hotel;

    const newHotel = await Itinerary.findByIdAndUpdate(
        itineraryId,
        {
            $push: {
                hotels: {
                    name,
                    description,    
                    startDate, 
                    endDate,
                    costPerDay,
                    banner : banner_hotel.url
                }
            }
        }
    );
    if (!newHotel) {
        throw new ApiError(500, "Something went wrong while adding hotel!")
    }

    return res.status(201).json(
        new ApiResponse(
            200, 
            {}, 
            "Hotel added Successfully"
        )
    )

});

const addDestination_to_Itinerary = asyncHandler(async (req, res) => {
    const{ itineraryId, destinations } = req.body;
    const images = req.files;
    if (!itineraryId || !destinations) {
        throw new ApiError(400, 'Missing required fields');
    }

    if(images.length !== destinations.length) {
        throw new ApiError(400, 'Number of images does not match number of destinations')
    }
    
    for(let i = 0; i < destinations.length; i++) {
        const {name, description, Date, startTime, endTime, costPerDay} = destinations[i];
        const imagelocalpath = image[i].path;
        const image = uploadOnCloudinary(imagelocalpath);

        if(!image.url){
            throw new ApiError(500, "Failed to upload image to cloudinary");
        }
        const newDestination = await Itinerary.findByIdAndUpdate(
            itineraryId,
            {
                $push: {
                    destinations: {
                        name,
                        description,    
                        Date,  
                        startTime,
                        endTime,
                        costPerDay,
                        banner: image?.url
                    }
                }
            }    
        );

        if (!newDestination) {
            throw new ApiError(500, "Something went wrong while adding destination!")
        }

    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200, 
            {}, 
            "Destinations added Successfully"
        )
    );
})

const addUsertoitinerary = asyncHandler(async (req, res) => {
    const itineraryId = req.param.itineraryId;
    const userId = req.body.userId;
    const access = req.body.access;
    const newItinerary = await Itinerary.findByIdAndUpdate(itineraryId, {
        $push: {
            permissions: {
                userId,
                access: access,
            }
        }
    });
    if (!newItinerary) {
        throw new ApiError(500, "Something went wrong while adding user to itinerary!")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200, 
            {}, 
            "User added Successfully"
        )
    )
});

const updateToItinerary = asyncHandler(async (req, res) => {
    
});