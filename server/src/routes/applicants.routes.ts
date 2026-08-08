import { Router } from "express";
import applicantsController from "../controllers/applicants.controller";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

/**
 * CANDIDATE REGISTRY ENDPOINTS
 * @access Recruiter-Facing Portal
 */

// List all candidates
router.get("/", applicantsController.getAll);

// Profile Detail Retrieval
router.get("/:id", applicantsController.getById);

// Bulk Remove Profiles
router.delete("/bulk", applicantsController.deleteBulk);

// Remove Profile
router.delete("/:id", applicantsController.delete);

// Candidate Profile Initialization (Manual)
router.post("/", applicantsController.create);

/**
 * TALENT INGESTION PROTOCOL
 * Handles administrative PDF/CSV uploads to the registry.
 */
router.post(
  "/upload",
  upload.array("dossiers", 20),
  applicantsController.upload,
);

// Individual Outreach Dispatch
router.post("/:id/email", applicantsController.sendEmail);

// Duplicate Management
router.post("/:id/resolve-duplicate", applicantsController.handleResolveDuplicate);

export default router;
