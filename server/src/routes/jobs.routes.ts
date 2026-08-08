import { Router } from "express";
import jobsController from "../controllers/jobs.controller";

const router = Router();

/**
 * TECHNICAL REQUIREMENT REGISTRY ENDPOINTS
 * @access Recruiter-Facing Portal
 */

// List all active requirements
router.get("/", jobsController.getAll);

// Detail Matrix Retrieval
router.get("/:id", jobsController.getById);

// Job Requirement Initialization
router.post("/", jobsController.create);

// Update Judgement Criteria
router.put("/:id", jobsController.updateJob);

// Remove Job Requirement
router.delete("/:id", jobsController.delete);

export default router;
