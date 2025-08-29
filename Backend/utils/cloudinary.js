import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

cloudinary.config({ 
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
      api_key: process.env.CLOUDINARY_API_KEY, 
      api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
   });

const uploadOnCloudinary = async (localFilePath) => {
   try {
      if(!localFilePath) return null
      // Upload Files on Cloudinary
      const uploadResult = await cloudinary.uploader
      .upload(localFilePath, {
         resource_type: "auto"
      })
      // File has been Uploaded Succesfully
      // console.log("File Uploaded Succesfully", uploadResult.url);
      // console.log(uploadResult);
      
      fs.unlinkSync(localFilePath);
      return uploadResult

   } catch (error) {
      console.log("Someting Went Wrong, Please Retry !!!", error);
      fs.unlinkSync(localFilePath) // Remove the Locally Saved Temporary File as the upload method failed
      return null
   }
}

export { uploadOnCloudinary }