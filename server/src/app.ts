import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Direct Route Imports (Matching the existing directory structure)
import jobRoutes from "./routes/jobs.routes";
import applicantRoutes from "./routes/applicants.routes";
import screeningRoutes from "./routes/screening.routes";
import authRoutes from "./routes/auth.routes";
import statsRoutes from "./routes/stats.routes";
import chatRoutes from "./routes/chat.routes";

const app: Express = express();

// Standard Technical Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabling CSP for development to allow all resource types in iframes
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(morgan("dev"));

// AFTER
const allowedOrigins = [
  "http://localhost:3000",
  "https://scrutiq-v1.vercel.app",
  "https://scrutiq-phi.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));
app.options("*", cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", (req, res, next) => {
  // Only force PDF content type for .pdf files or files without extensions (legacy resumes)
  if (req.path.includes("/resumes/")) {
    const ext = req.path.split(".").pop()?.toLowerCase();
    if (ext === "pdf" || !req.path.includes(".")) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
    }
  }
  next();
}, express.static("uploads"));

// System Health Check Protocol
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ 
    status: "online", 
    system: "Technical Portal API", 
    version: "1.0.0",
    timestamp: new Date().toISOString() 
  });
});

// API Routes Initialization
app.use("/api/jobs", jobRoutes);
app.use("/api/applicants", applicantRoutes);
app.use("/api/screening", screeningRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Global Error Handling Protocol
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("System Fault Detected:", err);
  res.status(err.status || 500).json({
    status: "fault",
    message: err.message || "Internal system technical error.",
    protocol: "Error-Handling-Module"
  });
});

export default app;
