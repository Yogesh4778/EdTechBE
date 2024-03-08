import express, { Request, Response, NextFunction } from "express";
export const app = express();
require('dotenv').config();
import cors from "cors";
import cookiesparser from "cookie-parser";
import { ErrorMiddleware } from "./Middleware/Error";
import UserRouter from "./Routes/user.routes";
import { AuthenticatedRequest } from "./@types/custom";
import CourseRouter from "./Routes/course.routes";
import orderRouter from "./Routes/Order.route";
import notificationRoute from "./Routes/notification.routes";
import AnalyticsRouter from "./Routes/analytics.routes";
import LayoutRouter from "./Routes/layout.routes";

//limit of body parser
app.use(express.json({ limit: "50mb" }));

//cookie parser
app.use(cookiesparser());

//cors==> cross origin resource sharing
app.use(cors({
    // origin: process.env.ORIGIN
    origin: ['http://localhost:3000'],
    credentials: true,
}));

//Router
app.use("/api/v1", UserRouter);

app.use("/api/v1", CourseRouter);

app.use("/api/v1", orderRouter);

app.use("/api/v1", notificationRoute);

app.use("/api/v1", AnalyticsRouter);

app.use("/api/v1",LayoutRouter);
//testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "Api is working"
    });
});

//unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not fount`) as any;
    err.statuscode = 404;
    next(err);
});

// app.ts or routes.ts

app.get('/some-route', (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
});

app.use(ErrorMiddleware);


