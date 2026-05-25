// src/config/cloudinary.js
import cloudinary from "cloudinary";
import { config } from "./index.js";

cloudinary.v2.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadToCloudinary = (filePath, folder = "careerconnect") => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      filePath,
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
};
