import { Router } from "express";
import statsController from "../controllers/stats.controller";

const router = Router();

/**
 * TECHNICAL SYSTEM METRICS ENDPOINTS
 * @access Recruiter-Facing Portal
 */

// Retrieve global system stats
router.get("/", statsController.getSystemStats);

export default router;
