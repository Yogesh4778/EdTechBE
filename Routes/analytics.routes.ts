import Express from "express";
import { AuthorizeRole, isAutheticated } from "../Middleware/ProtectedAuth";
import { getUserAnalytics, getcoursesAnalytics, getorderAnalytics } from "../Controller/analytics.controller";
const AnalyticsRouter=Express.Router();

AnalyticsRouter.get("/get-user-analytics",isAutheticated,AuthorizeRole("admin"),getUserAnalytics);

AnalyticsRouter.get("/get-courses-analytics",isAutheticated,AuthorizeRole("admin"),getcoursesAnalytics);

AnalyticsRouter.get("/get-order-analytics",isAutheticated,AuthorizeRole("admin"),getorderAnalytics);

export default AnalyticsRouter;