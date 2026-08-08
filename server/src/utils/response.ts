import { Response } from "express";

/**
 * TECHNICAL API RESPONSE UTILITY
 * Standardizes the administrative feedback protocol across the Aurora portal.
 */

export const sendSuccess = (res: Response, data: any, status: number = 200) => {
  return res.status(status).json({
    status: "success",
    data: data,
    timestamp: new Date().toISOString()
  });
};

export const sendFault = (res: Response, message: string, status: number = 500) => {
  return res.status(status).json({
    status: "fault",
    message: message,
    protocol: "Error-Handling-Module",
    timestamp: new Date().toISOString()
  });
};
