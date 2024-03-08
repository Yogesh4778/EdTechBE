import { Request, Response, NextFunction } from "express";
import { ChacheError } from "./ChacheErrors";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/Redis";
import ErrorHandling from "../utils/ErrorHandling";
require("dotenv").config();

// Autheticated User

export const isAutheticated = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    const access_Token = req.cookies.access_Token as string;

    if (!access_Token) {
        return next(new ErrorHandling("Please login to access this resource", 400));
    }
    const decode = jwt.verify(access_Token, process.env.ACCESS_TOKEN as string) as JwtPayload;

    if (!decode) {
        return next(new ErrorHandling("Access token is not valid", 400));
    }
    const user = await redis.get(decode.id);

    if (!user) {
        return next(new ErrorHandling("Please Login to access the course", 400));
    }
    req.user = JSON.parse(user);

    next();


})

export const AuthorizeRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || '')) {
            return next(new ErrorHandling(`Role: ${req.user?.role} is not allowed to access this resource`, 403));
        }
        next();
    }
}

