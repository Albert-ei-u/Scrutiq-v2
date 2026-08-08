import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authConfig } from "../config/auth";
import { ApiError } from "../utils/apiError";
import { StatusCodes } from "http-status-codes";

export interface AuthRequest extends Request {
  user?: { sub: string; role: string };
}

export const requireAuth = (roles?: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "Missing token"));
    }
    const token = header.split(" ")[1];
    try {
      const payload = jwt.verify(token, authConfig.jwtSecret) as any;
      if (roles && !roles.includes(payload.role)) {
        return next(new ApiError(StatusCodes.FORBIDDEN, "Forbidden"));
      }
      req.user = payload;
      return next();
    } catch (err) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token", err));
    }
  };
};
