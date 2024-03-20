import { Request, Response, NextFunction } from "express";
import { ChacheError } from "./ChacheErrors";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/Redis";
import ErrorHandling from "../utils/ErrorHandling";
import { UpadteAccessToken } from "../Controller/user.controller";
require("dotenv").config();

// Autheticated User

export const isAutheticated = ChacheError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token as string;

    if (!access_token) {
      return next(
        new ErrorHandling(
          "Please login to access this resource (error in Server->Middleware->ProtectedAuth)",
          400
        )
      );
    }
    const decode = jwt.decode(access_token) as JwtPayload;

    if (!decode) {
      return next(new ErrorHandling("Access token is not valid", 400));
    }
    //check is the access token is expired
    if (decode.exp && decode.exp <= Date.now() / 1000) {
      try {
        await UpadteAccessToken(req, res, next);
      } catch (error) {
        return next(error);
      }
    } else {
      const user = await redis.get(decode.id);

      if (!user) {
        return next(
          new ErrorHandling("Please Login to access the course", 400)
        );
      }
      req.user = JSON.parse(user);

      next();
    }
  }
);

export const AuthorizeRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandling(
          `Role: ${req.user?.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
