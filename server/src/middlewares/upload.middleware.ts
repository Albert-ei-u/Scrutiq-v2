import multer from "multer";
import path from "path";

// Technical Registry Storage Protocol:
// Temporarily storing uploaded files for AI mechanical analysis.
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = [".pdf", ".csv", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File Type Fault: ${ext} is not supported by the mechanical registry.`));
  }
};

/**
 * TECHNICAL REGISTRY UPLOAD MIDDLEWARE
 * Handles administrative talent profile uploads (PDF/CSV).
 */
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB System Limit
  }
});
