import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";


dotenv.config({
    path: './.env'
});

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
})
.catch((error)=>{
    console.log("MongoDB connection error", error);
})