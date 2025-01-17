import {Router} from "express";
import { suggestion } from "../controllers/server/recommendation.server.controller.js";

const itineraryrouter = Router();

itineraryrouter.route("/suggestion").post(suggestion)

export default itineraryrouter