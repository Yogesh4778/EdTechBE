import { NextFunction, Response, Request } from "express";
import { ChacheError } from "../Middleware/ChacheErrors";
import OrderModel, { IOrder } from "../Models/orderModel";
import ErrorHandling from "../utils/ErrorHandling";
import userModel from "../Models/user.model";
import courseModel from "../Models/courses.model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/SendMail";
import NotificationModel from "../Models/notificationModel";
import { CreateOrder, getAllOrderService } from "../Service/order.service";

//Create order

export const createOrder = ChacheError(async (res: Response, req: Request, next: NextFunction) => {
    try {
        const { courseId, payment_info } = req.body as IOrder;

        const user = await userModel.findById(req.user?._id);

        const IsCourseAlready = user?.courses.some((course: any) => courseId.toString() === courseId);

        if (IsCourseAlready) {
            return next(new ErrorHandling("Course already purchased", 400));
        }
        const course = await courseModel.findById(courseId);

        if (!course) {
            return next(new ErrorHandling("No such course Exist", 400));
        }

        const data: any = {
            userId: user?._id,
            courseId: course._id,
            payment_info
        }

        const mailData = {
            order: {
                _id: courseId.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            }
        }

        const html = await ejs.renderFile(path.join(__dirname, "../Mails/Order-mail.ejs"), { order: mailData });
        try {
            if (user) {
                await sendMail({
                    email: user.email,
                    subject: "order-conformation",
                    template: "Order-mail.ejs",
                    data: mailData
                });
            }
        } catch (error: any) {
            return next(new ErrorHandling(error.message, 500));
        }

        user?.courses.push(course?._id);

        await user?.save();
        await NotificationModel.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new order from ${course?.name}`
        })

        course.purchased ? course.purchased+=1:course.purchased;

        await course.save();

        CreateOrder(data, res, next);

    } catch (error: any) {
        return next(new ErrorHandling(error.message, 500));
    }
})


//get all order -- for admin only

export const getAllOrders = ChacheError(async (res: Response, req: Request, next: NextFunction) => {
    try {
        getAllOrderService(res);
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 404));
    }
})
