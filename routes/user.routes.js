import { Router } from "express";
import { 
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
   } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const router = Router()

router.route("/register").post(
   // uploading files to localStorage through Multer Middleware
   upload.fields([
      {
         name: "avatar",
         maxCount: 1
      },
      {
         name: "coverImage",
         maxCount: 1
      }
   ]),
   registerUser
) //when clicked the http://localhost:8000/api/v1/user/register

router.route("/login").post(loginUser)

// Secured Routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/getCurrentUser").post(
   verifyJWT, // Use of MiddleWare is to fetch and Verify User and then it passes to the next route (Very Convient way) 
   getCurrentUser
)

router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar-update").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/coverImage-update").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)


export default router