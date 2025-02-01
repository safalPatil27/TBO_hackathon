import { Server } from 'socket.io';
import {addDestination_to_Itinerary} from "../controllers/server/itinerary.server.controller.js";
import axios from 'axios';
import { getDestinations_by_itinerary, getitinerary, updateDestinations_to_Itinerary } from '../utils/fetchData.js';

const socketConfig = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);
        socket.on("joinRoom", async(roomId) => {
            socket.join(roomId);
            const dataItinerayInfo = await getitinerary(roomId);
            const dataItineraryDesctinations = await getDestinations_by_itinerary(roomId);
            console.log(dataItineraryDesctinations, dataItinerayInfo, "socket");
            
            socket.emit("initialData", {
                itineraryInfo: dataItinerayInfo,
                itineraryDestinations: dataItineraryDesctinations,
            });
        })

        

        // Listen for updates
        socket.on("updateData", (updatedData) => {
            itineraryData = updatedData;
            socket.broadcast.emit("updatedData", itineraryData);
        });

        socket.on("saveData", async (updatedData) => {
           const {itinerary, itineraryId} = updatedData;

           
            const data = await updateDestinations_to_Itinerary( itineraryId,itinerary);
            socket.broadcast.emit("savedData", data);
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected:", socket.id);
        });
    });

    return io;
};

export default socketConfig;
