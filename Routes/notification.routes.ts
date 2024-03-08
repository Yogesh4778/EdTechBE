import  Express from "express";
import { AuthorizeRole, isAutheticated } from "../Middleware/ProtectedAuth";
import { getNotifications } from "../Controller/notification.controller";

const notificationRoute=Express.Router();

notificationRoute.get("/get-all-notification",isAutheticated,AuthorizeRole("Admin"),getNotifications);

notificationRoute.put("update/notification",isAutheticated,AuthorizeRole("admin"),getNotifications);

export default notificationRoute;
