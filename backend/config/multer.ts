import multer from "multer";
import type { FileFilterCallback } from "multer";
import type { Request } from "express";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Ensure environment is loaded
dotenv.config();

// Ensure uploads directory exists
const uploadDir = "uploads/documents";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Cloudinary
const cloudinaryUrl = process.env.CLOUDINARY_URL || process.env.CLOUDINARY_URL_VAR;
const isCloudinaryConfigured = !!(cloudinaryUrl || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET));

if (isCloudinaryConfigured) {
  if (cloudinaryUrl) {
    cloudinary.config({
      cloudinary_url: cloudinaryUrl
    });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    } as any);
  }
}

// Configure storage
let storage;

if (isCloudinaryConfigured && process.env.NODE_ENV === "production") {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "fitme/documents",
      resource_type: "auto",
    } as any,
  });
} else {
  // Use local storage for dev/test or if Cloudinary is missing
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });
}

// File filter - only allow images and PDFs (Cloudinary also filters based on allowed_formats)
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and PDFs are allowed."));
  }
};

// Create multer instance
export const documentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5, // Max 5 files at once
  },
});
