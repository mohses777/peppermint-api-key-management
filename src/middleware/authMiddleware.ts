import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../utils/error/CustomError";
import config from "../config";

interface JwtPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new CustomError(
      "You are not authorized to access this resource",
      401
    );
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new CustomError("Token has expired. Please log in again.", 401);
    }
    if (error.name === "JsonWebTokenError") {
      throw new CustomError("Invalid token. Please log in again.", 403);
    }
    throw new CustomError("Failed to authenticate token", 500);
  }
};

export const checkUserAuthorization = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;

  if (req.user?.id !== userId) {
    throw new CustomError("You are not authorized to perform this action", 403);
  }

  next();
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    req.user = undefined;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
  } catch (error: any) {
    req.user = undefined;
  }

  next();
};

