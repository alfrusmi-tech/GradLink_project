
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const uploadDir = path.resolve("uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName = crypto.randomUUID();

    const extension =
      file.fieldname === "cv"
        ? ".pdf"
        : path.extname(file.originalname).toLowerCase();

    cb(null, `${uniqueName}${extension}`);
  },
});

// Validate CV metadata before accepting the upload.
// Actual file content is checked separately.
const cvFileFilter = (req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    extension !== ".pdf" ||
    file.mimetype !== "application/pdf"
  ) {
    return cb(
      new Error("Only PDF files are allowed")
    );
  }

  cb(null, true);
};

// Existing image upload functionality.
const imageFileFilter = (req, file, cb) => {
  if (
    !file.mimetype.startsWith("image/") ||
    ![".jpg", ".jpeg", ".png", ".webp"].includes(
      path.extname(file.originalname).toLowerCase()
    )
  ) {
    return cb(
      new Error("Only JPG, PNG or WebP images are allowed")
    );
  }

  cb(null, true);
};

export const uploadCV = multer({
  storage,
  fileFilter: cvFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
});
