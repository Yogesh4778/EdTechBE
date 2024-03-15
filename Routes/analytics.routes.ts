import Express from "express";
import { AuthorizeRole, isAutheticated } from "../Middleware/ProtectedAuth";
import { getUserAnalytics, getcoursesAnalytics, getorderAnalytics } from "../Controller/analytics.controller";
import {UpadteAccessToken} from "../Controller/user.controller"
const AnalyticsRouter=Express.Router();

AnalyticsRouter.get("/get-user-analytics",UpadteAccessToken, isAutheticated,AuthorizeRole("admin"),getUserAnalytics);

AnalyticsRouter.get("/get-courses-analytics",UpadteAccessToken, isAutheticated,AuthorizeRole("admin"),getcoursesAnalytics);

AnalyticsRouter.get("/get-order-analytics",UpadteAccessToken, isAutheticated,AuthorizeRole("admin"),getorderAnalytics);

export default AnalyticsRouter;