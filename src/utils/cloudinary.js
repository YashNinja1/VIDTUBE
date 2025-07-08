import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS for secure uploads
});

const uploadImage = async (filePath) => {
  if (!filePath) {
    throw new Error("File path is required for image upload");
  }
  // Function to upload an image to Cloudinary
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "vidtube/images", // Specify the folder in Cloudinary
      resource_type: "auto", // Specify the resource type as image
    });

    fs.unlinkSync(filePath); // Clean up the temporary file after upload

    return result; // Return the upload result
  } catch (error) {
    fs.unlinkSync(filePath); // Clean up the temporary file
    console.error("Error uploading image to Cloudinary:", error);
    throw error; // Rethrow the error for further handling
  }
};

const deleteImage = async (publicId) => {
  if (!publicId) {
    throw new Error("Public ID is required for image deletion");
  }
  // Function to delete an image from Cloudinary
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    return;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error; // Rethrow the error for further handling
  }
};
export {uploadImage, deleteImage};
