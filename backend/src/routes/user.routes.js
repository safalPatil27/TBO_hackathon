import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails
} from "../controllers/server/user.server.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const userrouter = Router()

userrouter.route("/register").post(
    registerUser
)

userrouter.route("/login").post(loginUser)

userrouter.route("/logout").post(verifyJWT, logoutUser)
userrouter.route("/refresh-token").post(refreshAccessToken)
userrouter.route("/change-password").post(verifyJWT, changeCurrentPassword)
userrouter.route("/current-user").get(verifyJWT, getCurrentUser)
userrouter.route("/update-account").patch(verifyJWT, updateAccountDetails)

export default userrouter