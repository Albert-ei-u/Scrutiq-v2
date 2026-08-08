import app from "./app";
import dotenv from "dotenv";
import connectDB from "./config/db";

import emailService from "./services/email.service";

// Load environment variables
dotenv.config();

// Initialize Database Connection
connectDB();

const port = process.env.PORT || 5000;
const environment = process.env.NODE_ENV || "development";

// Hardened Cloud Keep-Alive: Standing Autonomous Heartbeat with Emergency Alerts
const server = app.listen(port, () => {
  console.log(`
  🚀 TECHNICAL PORTAL API INITIALIZED
  🚀 PORT: ${port}
  🚀 ENVIRONMENT: ${environment}
  🚀 CLOUD READINESS: OK
  `);
});

// System Termination Protocol
const shutdown = async (signal: string) => {
  console.log(`Cleanup Protocol Initiated (${signal}). Closing system resources...`);
  
  try {
    console.log("[Emergency-Alert] Dispatching shutdown notification...");
    await emailService.sendCustomEmail(
      "ishyarugemachille4@gmail.com",
      "System Shutdown Alert",
      `The Scrutiq Technical Portal (${environment}) has received a ${signal} signal and is gracefully shutting down.\n\nTime: ${new Date().toISOString()}\n\nNote: If this was not a manual restart, please examine the deployment logs.`
    );
  } catch (err: any) {
    console.error("Shutdown notification failed:", err.message);
  }

  server.close(() => {
    console.log("System Process Finalized.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));


process.on("unhandledRejection", (err: Error) => {
  console.error("Unhandled Technical Rejection:", err);
  process.exit(1);
});
