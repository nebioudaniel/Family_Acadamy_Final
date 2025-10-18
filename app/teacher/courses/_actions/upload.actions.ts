"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function getSignedUploadSignature(fileName: string) {
  try {
    const FOLDER = "course_videos";
    const TAGS = "nextjs-course-video";
    const baseName = fileName.split(".")[0] || "video";
    const public_id = `${FOLDER}/${baseName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}-${Date.now()}`;

    const options = {
      public_id,
      timestamp: Math.round(Date.now() / 1000),
      folder: FOLDER,
      tags: TAGS,
    };

    const signature = cloudinary.utils.api_sign_request(
      options,
      process.env.CLOUDINARY_API_SECRET as string
    );

    return {
      success: true,
      timestamp: options.timestamp,
      public_id: options.public_id,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      error: null,
    };
  } catch (error) {
    console.error("Cloudinary Signature Error:", error);
    return { success: false, error: "Failed to generate upload signature." };
  }
}
