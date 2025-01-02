import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema({
    activityName: {
        type: String,
        required: true,
        trim: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false }); // No separate `_id` for subdocuments

const destinationSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    banner: {
        type: String,
        trim: true
    },
    activities: [activitySchema]
}, { _id: false });

const hotelSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    banner: {
        type: String,
        trim: true
    },
    costPerDay: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const permissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    access: {
        type: String,
        enum: ["owner", "view", "edit"],
        required: true
    }
}, { _id: false });

const itinerarySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    banner: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    destinations: [destinationSchema],
    hotels: [hotelSchema],
    budget: {
        type: Number,
        required: true,
        min: 0
    },
    notes: {
        type: String,
        trim: true
    },
    permissions: [permissionSchema]
}, {
    timestamps: true // Automatically handles `createdAt` and `updatedAt`
});

export default Itinerary =  mongoose.model("Itinerary", itinerarySchema);
