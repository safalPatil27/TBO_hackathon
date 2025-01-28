import mongoose from "mongoose";

const DB_NAME = process.env.DB_NAME;
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        const connection_Instance = await mongoose.connect(`${MONGO_URI}/${DB_NAME}`);
        console.log("MongoDB is connected!! DBHOST", connection_Instance.connection.host);
    } catch (error) {
        console.log("MongoDB connection error", error);
    }
}

export default connectDB;