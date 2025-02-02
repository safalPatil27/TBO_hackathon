import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
console.log(process.env.CORS_ORIGIN);

app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ limit: '16mb', extended: true }));
app.use(express.static('public'));
app.use(cookieParser());


import userrouter from "./routes/user.routes.js";
import itineraryrouter from "./routes/itinerary.routes.js";

app.use("/api/v1/user", userrouter);
app.use("/api/v1/itinerary", itineraryrouter);




export { app };



