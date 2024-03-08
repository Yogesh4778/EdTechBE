import { NextFunction, Request, Response } from "express";
import ErrorHandling from "../utils/ErrorHandling";

export const ErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internet server Failed";

    // wrong mongoDB id

    if (err.name === 'CastError') {
        const message = `Resources not found, Invalid ${err.path}`;
        err = new ErrorHandling(message, 400);
    }

    //duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.KeyValue)} entered`
        err = new ErrorHandling(message, 400);
    }

    //Wrong jwt token
    if (err.name === 'JsonWebTokenError') {
        const message = `Json web token is Invalid, Try again`;
        err = new ErrorHandling(message, 400);
    }

    //Jwt token expire
    if (err.name === 'TokenExpiredError') {
        const message = `Json web token expired, try again`;
        err = new ErrorHandling(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        Message: err.message
    })
}