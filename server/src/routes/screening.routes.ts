import { Router } from "express";
import screeningController from "../controllers/screening.controller";

const router = Router();

/**
 * TECHNICAL SCREENING ENDPOINTS
 * @access Recruiter-Facing Portal
 */

// Execute candidate ranking protocol
router.post("/execute", screeningController.execute);

// Retrieve saved rankings for a job
router.get("/job/:jobId", screeningController.getJobRankings);

// Remove specific ranking
router.delete("/:id", screeningController.delete);

export default router;
