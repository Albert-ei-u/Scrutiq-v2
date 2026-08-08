import { Request, Response, NextFunction } from "express";

/**
 * TECHNICAL ERROR PROTOCOL MIDDLEWARE
 * Provides structured administrative feedback for system faults.
 */
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || "Internal Technical Fault detected in the registry protocol.";
  
  console.error(`[SYSTEM FAULT] | NODE_ENV: ${process.env.NODE_ENV} | PATH: ${req.path}`);
  console.error(err.stack);

  res.status(status).json({
    status: "fault",
    message: message,
    protocol: "Error-Handling-Module",
    system_log: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};
