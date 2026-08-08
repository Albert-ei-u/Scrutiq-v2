import { Router } from "express";
import authController from "../controllers/auth.controller";

const router = Router();

/**
 * USER ACCESS ROUTES
 * Simple endpoints for signing up and logging in.
 */

// Create a new account
router.post("/register", authController.register);

// Login to existing account
router.post("/login", authController.login);

// Email verification
router.post("/verify", authController.verifyCode);

// Update Recruiter Profile
router.put("/profile/:id", authController.updateProfile);

// Get Recruiter Profile
router.get("/profile/:id", authController.getProfile);

// Get Recruiter Audit Logs
router.get("/profile/:id/logs", authController.getAuditLogs);

// Delete Recruiter Profile
router.delete("/profile/:id", authController.deleteProfile);

// Password Recovery Flow
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-reset-pin", authController.verifyResetPin);
router.post("/reset-password", authController.resetPassword);

export default router;

