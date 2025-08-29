// Controllers are Methods

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import User from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import { trusted } from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
   try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()
      user.refreshtoken = refreshToken
      await user.save({ validateBeforeSave: false})
      return {refreshToken, accessToken}
   } catch (error) {
      throw new ApiError(500, "Someting went wrong while generating Refresh and Access Token")
   }
} 

const registerUser = asyncHandler(async (req, res) => {
   //1 -> Get User Details from frontend
   //2 -> validation
   //3 -> check if the user alrady exist by username && email
   //4 -> check for image and avatar
   //5 -> upload to cloudinary, avatar is Uploded(check if multer done it's work)
   //6 -> create User Object - Create entry in DB
   //7 -> remove Password and refresh token from response 
   //8 -> check for User Creation (check if succesfully created ?)
   //9 -> return Response

   const { fullname, email, username, password } = req.body ; //Extracting the Data from request
   // console.log("Email: ", email);

   // Validating if Its Empty || NULL
   if(fullname.trim() === ""){
      throw new ApiError(400, "fullname is Required !!!");
   }if(email.trim() === ""){
      throw new ApiError(400, "email is Required !!!");
   }if(username.trim() === ""){
      throw new ApiError(400, "trim is Required !!!");
   }if(password.trim() === ""){
      throw new ApiError(400, "Password is Required !!!");
   }

   // Search if the User already exist
   const ExistedUser = await User.findOne({
      $or: [{username}, {email}]
   })
   if(ExistedUser) throw new ApiError(409, "User with email or username already exist")
   
   // retreving local Path of uploaded files
   const avatarLocalPath = req.files?.avatar[0]?.path
   const coverImageLocalPath = req.files?.coverImage[0]?.path
   // console.log(req.file)
   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar File is Required")
   }
   if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover Image File is Required")
   }
   // Uploading files to Cloudinary 
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if (!avatar) {
      throw new ApiError(400, "Unable to Upload Avatar")
   }
   // Creating a User Using user.model.js
   const user = await User.create({
      fullname: fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email: email,
      password: password,
      username: username.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select(
      "-password -refreshtoken"
   )

   if(!createdUser) throw new ApiError(500, "Someting Went wrong while Registering the User !!!")

   return res.status(201).json(
      new ApiResponse(200, createdUser, "User Registered Succefully !!!")
   )
})

const loginUser = asyncHandler(async (req, res) => {
   // get Details from frontend (req body -> data)
   // Validation Username or Email
   // Checking if User Exist
   // if Exist then Check Compare the Username and password
   // if True, then generate Access and Refresh Token
   // Send Cookie and Response

   const {email, username, password} = req.body;
   if(!(username || email)){
      throw new ApiError(400, "Enter Valid Username and Email")
   }if(!password){
      throw new ApiError(400, "Enter Password")
   }

   const user = await User.findOne({
      $or: [{username}, {email}]
   })
   if(!user){
      throw new ApiError(404, "User does not Exist || Please Register")
   }

   const isPasswordValid = await user.isPasswordCorrect(password)
   if(!isPasswordValid){
      throw new ApiError(401, "Password Incorrect")
   }
   const {refreshToken, accessToken} = await generateAccessAndRefreshTokens(user._id);
   // user.accessToken = accessToken ;
   const loggedInUser = await User.findById(user._id).
   select("-password -refreshToken");

   const options = {
      httpOnly: true,
      secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(200, {
         user: loggedInUser,
         accessToken: accessToken,
         refreshToken: refreshToken
      }, "User Loggedin Succesfully")
   )
})

const logoutUser = asyncHandler(async (req, res) => {
   //Find User By using refreshToken
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $ser: {
            refreshToken: undefined
         }
      },
      {
         new: true
      }
   )
   const options = {
      httpOnly: true,
      secure: true
   }
   return res
   .status(200)
   .clearCookie("accessToken")
   .clearCookie("refreshToken")
   .json(new ApiResponse(200, {}, "Logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
   const incommingrefreshToken = req.cookies.refreshToken || req.body.refreshToken ;
   if(!incommingrefreshToken){
      throw ApiError(401, "Unauthorized Request !!!")
   }
   const decodedToken = jwt.verify(
      incommingrefreshToken,
      process.env.REFRESH_TOKEN_SECRET
   )

   const user = User.findById(decodedToken._id)
   if(!user){
      throw new ApiError(401, "Invalid Refresh Token")
   }

   if(incommingrefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh Token is expired or Invalid")
   }

   const options = {
      httpOnly: true,
      secure: true
   }

   const {newrefreshToken, accessToken} = await generateAccessAndRefreshTokens(user._id);

   return res
   .status(200)
   .cookie("AccessToken", accessToken)
   .cookie("RefreshToken", newrefreshToken)
   .json({
      "status": 200,
      "Access Token": accessToken, 
      "Refresh Token": newrefreshToken,
      "message": "Access token Refreshed Succesfully"
   })
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
   // Fields required To authenticate User
   // Oldpassword, NewPassord Needed Input Fields
   // If(user is logged in) -> Using Cookies -> getting UserID and Details
   const {oldPassword, newPassword} = req.body;

   const user = await User.findById(req.user?._id)
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
   if(!isPasswordCorrect){
      throw new ApiError(400, "Invalid Old Password !!!")
   }

   user.password = newPassword ;
   await user.save({validateBeforeSave: false})

   return res
   .status(200)
   .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
   return res
   .status(200)
   .json({
      "status": 200,
      "user": req.user,
      "message": "Current User fetched Successfully"
   });
})

const updateAccountDetails = asyncHandler(async (req, res) => {
   const { fullName, email, Username } = req.body;
   const user = User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            fullName: fullName ?? user.fullname,
            email: email ?? user.email
         }
      },
      {new: true}
   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(200, {user}, "User deatils Updated Succesfully"))
});

const updateUserAvatar = asyncHandler(async (req, res) => {
   const avatarLocalPath = req.file?.path

   if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file is Missing")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   if(!avatar.url){
      throw new ApiError(400, "Error While Uploading Avatar to Cloudinary")
   }

   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
            avatar: avatar.url
         }
      },
      {new: true}
   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(200, {}, "User Avatar Updated Succesfully"));
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
   const coverImageLocalPath = req.file?.path

   if(!avatarLocalPath){
      throw new ApiError(400, "Cover Image file is Missing")
   }

   const CoverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!CoverImage.url){
      throw new ApiError(400, "Error While Uploading Cover Image to Cloudinary")
   }

   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
            coverimage: CoverImage.url
         }
      },
      {new: true}
   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(200, {}, "User Cover Image Updated Succesfully"));
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
   const {username} = req.params

   if(!username?.trim()){
      throw new ApiError(400, "Username is missing")
   }

   const channel = await User.aggregate([
      {
         $match: {
            username: username?.toLowerCase
         }
      },
      {
         $lookup: {
            from:"subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
         }
      },
      {
         $lookup: {
            from:"subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
         }
      },
      {
         $addFields:{
            subscribersCount: {
               $size: "$subscribers"
            },
            channelsSubscribedToCount: {
               $size:"$subscribedTo"
            },
            isSubscribed: {
               $cond: {
                  if:{$in: [req.user?._id, "$subscribers.subscriber"]},
                  then: true,
                  else: false
               }
            }
         }
      },
      {
         $project: {
            fullname: 1,
            username: 1,
            avatar: 1,
            coverimage: 1,
            email: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1,
         }
      }
   ])

   if(!channel?.length){
      throw new ApiError(404, "Channel Does Not Exist !!!")
   }

   return res
   .status(200)
   .json(
      new ApiResponse(200, channel[0], "User Channel Fetched Succesfully")
   )
})

const getWatchHistory = asyncHandler(async (req, res) => {
   const user = await User.aggregate([
      {
         $match: {
            _id: new mongoose.Types.ObjectId(req.user._id)
         }
      },
      {
         $lookup: {
            from: "videos",
            localField: "watchHistory",
            foreignField: "_id",
            as: "watchHistory",
            pipeline: [
               {
                  $lookup:{
                     from: "users",
                     localField: "owner",
                     foreignField: "_id",
                     as: "owner",
                     pipeline: [
                        {
                           $project: {
                              fullname: 1,
                              username: 1,
                              avatar: 1
                           }
                        }
                     ]
                  }
               },
               {
                  $addFields: {
                     owner: {
                        $first: "$owner"
                     }
                  }
               }
            ]
         }
      }
   ])

   return res
   .status(200)
   .json(new ApiResponse(
      200,
      user[0].watchHistory,
      "Watch History Fetched Succesfully"))
})

export {
      registerUser,
      loginUser,
      logoutUser,
      refreshAccessToken,
      changeCurrentPassword,
      getCurrentUser,
      updateAccountDetails,
      updateUserAvatar,
      updateUserCoverImage,
      getUserChannelProfile,
      getWatchHistory
   }