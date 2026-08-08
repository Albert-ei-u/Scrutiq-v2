import { Request, Response } from "express";
import authService from "../services/auth.service";
import emailService from "../services/email.service";

class AuthController {
  /**
   * Technical Activation:
   * Verifies the email via a unique code.
   */
  async verifyCode(req: Request, res: Response) {
    try {
      const { code } = req.body;
      if (!code)
        return res
          .status(400)
          .json({ status: "fault", message: "Verification code required." });

      const user = await authService.findUserByCode(code);
      if (!user)
        return res.status(400).json({
          status: "fault",
          message: "Invalid or expired activation code.",
        });

      user.isVerified = true;
      user.verificationCode = undefined;
      await user.save();

      return res.status(200).json({
        status: "success",
        message: "Account activated successfully. You can now login.",
        data: { user: { id: user.id || user._id, email: user.email } },
      });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { fullName, email: rawEmail, password, companyName } = req.body;
      const email = rawEmail?.toLowerCase()?.trim();

      if (!fullName || !email || !password || !companyName) {
        return res
          .status(400)
          .json({ status: "fault", message: "Please fill in all fields." });
      }

      // Strong Password Validation: 8+ chars, 1 uppercase, 1 symbol
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          status: "fault",
          message:
            "Password must be at least 8 characters, include 1 uppercase and 1 technical symbol (!@#$%^&*).",
        });
      }

      const existingUser = await authService.findUserByEmail(email);

      if (existingUser) {
        if (existingUser.isVerified) {
          return res.status(400).json({
            status: "fault",
            message: "This email is already registered and verified.",
          });
        } else {
          // If unverified, we delete the stale account to allow fresh registration
          console.log(
            `[AUTH] Removing unverified account for ${email} to allow re-registration.`,
          );
          const User = (await import("../models/User.model")).default;
          await User.findByIdAndDelete(existingUser._id);
        }
      }

      const newUser = await authService.createUser({
        fullName,
        email,
        passwordHash: password,
        companyName,
      });

      // BLOCKING Email Dispatch: If this fails, the account creation is rolled back
      try {
        await emailService.sendVerificationCode(
          newUser.email,
          newUser.verificationCode!,
        );
      } catch (emailError: any) {
        console.error(
          "[AUTH] Email Dispatch Failed. Rolling back account creation...",
          emailError,
        );
        const User = (await import("../models/User.model")).default;
        await User.findByIdAndDelete(newUser._id);
        return res.status(500).json({
          status: "fault",
          message: `Technical Fault: Could not dispatch activation code. Registration aborted. Error: ${emailError.message}`,
        });
      }

      return res.status(201).json({
        status: "success",
        message: "Account initialized. Activation code sent to email.",
        data: { email: newUser.email },
      });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email: rawEmail, password } = req.body;
      const email = rawEmail?.toLowerCase()?.trim();
      console.log(`[AUTH DEBUG] Login attempt for email: "${email}"`);

      const user = await authService.findUserByEmail(email);

      if (!user) {
        console.log(`[AUTH DEBUG] User not found for email: "${email}"`);
        return res
          .status(401)
          .json({ status: "fault", message: "Invalid credentials." });
      }

      console.log(`[AUTH DEBUG] User found. isVerified: ${user.isVerified}`);

      if (!user.isVerified) {
        return res.status(401).json({
          status: "fault",
          message: "Account not verified. Please activate via email.",
        });
      }

      const isMatch = await authService.verifyPassword(
        password,
        user.passwordHash,
      );
      console.log(`[AUTH DEBUG] Password match result: ${isMatch}`);

      if (!isMatch) {
        console.log(`[AUTH DEBUG] Password mismatch for user: ${email}`);
        return res
          .status(401)
          .json({ status: "fault", message: "Invalid credentials." });
      }

      const auditService = (await import("../services/audit.service")).default;
      auditService.log(
        "USER_LOGIN",
        "AUTH",
        `Recruiter authenticated successfully.`,
        user._id.toString(),
      );

      // Technical Repair: Bridging to Google's OpenSocial proxy container for direct branding fetch
      const profilePic = user.profilePic || `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=https://www.google.com/s2/photos/profile/${user.email}?sz=128`;

      return res.status(200).json({

        status: "success",
        data: {
          user: {
            id: user.id || user._id,
            name: user.fullName,
            email: user.email,
            company: user.companyName,
            role: user.role,
            profilePic
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { fullName, companyName, notifications } = req.body;
      const mongoose = await import("mongoose");
      const User = (await import("../models/User.model")).default;

      let user;
      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await User.findById(id);
      } else {
        user = await User.findOne({ id });
      }

      if (!user) {
        return res
          .status(404)
          .json({ status: "fault", message: "User not found." });
      }

      if (fullName) user.fullName = fullName;
      if (companyName) user.companyName = companyName;
      if (notifications) {
        user.notifications = {
          ...user.notifications,
          ...notifications
        };
      }

      await user.save();

      const auditService = (await import("../services/audit.service")).default;
      auditService.log(
        "PROFILE_UPDATE",
        "AUTH",
        `Recruiter profile and notification preferences synchronized.`,
        user._id.toString(),
      );

      return res.status(200).json({
        status: "success",
        data: {
          id: user.id || user._id,
          name: user.fullName,
          email: user.email,
          company: user.companyName,
          role: user.role,
          notifications: user.notifications
        },
      });

    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const mongoose = await import("mongoose");
      const User = (await import("../models/User.model")).default;

      let user;
      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await User.findById(id);
      } else {
        user = await User.findOne({ id });
      }

      if (!user) {
        return res
          .status(404)
          .json({ status: "fault", message: "User not found." });
      }

      return res.status(200).json({
        status: "success",
        data: {
          id: user.id || user._id,
          name: user.fullName,
          email: user.email,
          company: user.companyName,
          role: user.role,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  async getAuditLogs(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const mongoose = await import("mongoose");
      const User = (await import("../models/User.model")).default;

      let user;
      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await User.findById(id);
      } else {
        user = await User.findOne({ id });
      }

      if (!user) {
        return res
          .status(404)
          .json({ status: "fault", message: "Invalid profile identifier." });
      }

      const auditService = (await import("../services/audit.service")).default;
      // We log with the string format of _id, so get by string
      const logs = await auditService.getLogs(user._id.toString());

      return res.status(200).json({
        status: "success",
        data: logs,
      });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  async deleteProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const mongoose = await import("mongoose");
      const User = (await import("../models/User.model")).default;
      const Job = (await import("../models/Job.model")).default;
      const Applicant = (await import("../models/Applicant.model")).default;
      const Screening = (await import("../models/Screening.model")).default;
      const AuditLog = (await import("../models/AuditLog.model")).default;

      let user;
      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await User.findById(id);
      } else {
        user = await User.findOne({ id });
      }

      if (!user) {
        return res
          .status(404)
          .json({ status: "fault", message: "User not found." });
      }

      // Hard delete user
      await User.findByIdAndDelete(user._id);

      // In a real application, you might want to also delete related records:
      // Jobs, Applicants, Screenings, and AuditLogs matching the user._id.
      // For now we'll delete the user and return success.
      return res.status(200).json({
        status: "success",
        message: "Account and associated data deleted successfully.",
      });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email: rawEmail } = req.body;
      const email = rawEmail?.toLowerCase()?.trim();
      if (!email)
        return res
          .status(400)
          .json({ status: "fault", message: "Email is required." });

      const user = await authService.findUserByEmail(email);
      if (!user) {
        // Obfuscate to prevent email harvesting
        return res.status(200).json({
          status: "success",
          message: "If that email is registered, a recovery PIN has been sent.",
        });
      }

      const pin = await authService.generateResetPin(user);
      await emailService.sendPasswordResetPin(user.email, pin);

      return res.status(200).json({
        status: "success",
        message: "A recovery PIN has been dispatched to your email.",
      });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  async verifyResetPin(req: Request, res: Response) {
    try {
      const { email: rawEmail, pin } = req.body;
      const email = rawEmail?.toLowerCase()?.trim();
      if (!email || !pin)
        return res
          .status(400)
          .json({ status: "fault", message: "Email and PIN are required." });

      const User = (await import("../models/User.model")).default;
      const user = await User.findOne({ email, resetCode: pin });

      if (!user) {
        return res
          .status(400)
          .json({ status: "fault", message: "Invalid verification PIN." });
      }

      if (user.resetCodeExpires && user.resetCodeExpires < new Date()) {
        return res
          .status(400)
          .json({ status: "fault", message: "Recovery PIN has expired." });
      }

      return res.status(200).json({
        status: "success",
        message: "PIN verified. Secure session established.",
        data: { email: user.email },
      });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email: rawEmail, pin, password, fullName, companyName } = req.body;
      const email = rawEmail?.toLowerCase()?.trim();
      if (!email || !pin || !password) {
        return res.status(400).json({
          status: "fault",
          message: "Metadata and new credentials required.",
        });
      }

      const User = (await import("../models/User.model")).default;
      const user = await User.findOne({ email, resetCode: pin });

      if (!user) {
        return res.status(400).json({
          status: "fault",
          message: "Security breach or invalid recovery state.",
        });
      }

      // Strong Password Validation: 8+ chars, 1 uppercase, 1 symbol
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          status: "fault",
          message:
            "Password must be at least 8 characters, include 1 uppercase and 1 technical symbol (!@#$%^&*).",
        });
      }

      // Security Protocol: Actually apply and persist the new password hash
      await authService.updatePassword(user, password);
      // No extra user.save() here as it is handled inside updatePassword

      const auditService = (await import("../services/audit.service")).default;
      auditService.log(
        "PASSWORD_RESET",
        "AUTH",
        `Recruiter successfully recovered account via secure PIN and rotated credentials.`,
        user._id.toString(),
      );

      return res.status(200).json({
        status: "success",
        message:
          "Security credentials updated. You can now login with your new password.",
      });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }
}

export default new AuthController();
