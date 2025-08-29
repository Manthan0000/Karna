// This Middleware is Used for the Verfication and Fetching of User By 
// using the Refresh Token Cookie Stored in User Browser

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import  User  from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
   try {
      const token = req.cookies?.accessToken || req.header // taking Token from Cookies present in the Browser
      ("Authorization")?.replace("Bearer ", "");
   
      if(!token){
         throw new ApiError(401, "Uauthorized request !!!");
      }
   
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
   
      const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
      if(!user){
         throw new ApiError(401, "Invalid Access Tokena")
      }
   
      req.user = user;
      next() // This Tells the Router to Go the the next route
      //       (that is meantioned in the route Function)(IN this Case: logoutUser)

   } catch (error) {
      throw new ApiError(401, error?.message || "Invalid access token")
   }
})