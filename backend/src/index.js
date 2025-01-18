
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import http from "http";
import socketConfig from "./config/socket.js";

const server = http.createServer(app);
socketConfig(server);

dotenv.config({
    path: '../.env'
});
const PORT = process.env.PORT || 8000;



connectDB()
    .then(() => {
        // app.listen(process.env.PORT || 8000, () => {
        //     console.log(`Server is running on port ${process.env.PORT || 8000}`);
        // })
        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB connection error", error);
    })