import { Response,Request,NextFunction } from "express";
import { ChacheError } from "../Middleware/ChacheErrors";
import ErrorHandling from "../utils/ErrorHandling";
import { generateLast12MothsData } from "../utils/analytics.generator";
import userModel from "../Models/user.model";
import courseModel from "../Models/courses.model";
import OrderModel from "../Models/orderModel";

// get user Analytics-- only Admin

export const getUserAnalytics = ChacheError(async (res: Response, req: Request, next: NextFunction) => {
    try {
        const users= await generateLast12MothsData(userModel);

        res.status(200).json({
            success:true,
            users,
        })
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 500));
    }
})

// get courses Analytics-- only Admin

export const getcoursesAnalytics = ChacheError(async (res: Response, req: Request, next: NextFunction) => {
    try {
        const courses= await generateLast12MothsData(courseModel);

        res.status(200).json({
            success:true,
            courses,
        })
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 500));
    }
})

// get order Analytics-- only Admin

export const getorderAnalytics = ChacheError(async (res: Response, req: Request, next: NextFunction) => {
    try {
        const order= await generateLast12MothsData(OrderModel);

        res.status(200).json({
            success:true,
            order,
        })
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 500));
    }
})