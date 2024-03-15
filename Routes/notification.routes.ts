import  Express from "express";
import { AuthorizeRole, isAutheticated } from "../Middleware/ProtectedAuth";
import { getNotifications } from "../Controller/notification.controller";
import { UpadteAccessToken } from "../Controller/user.controller"

const notificationRoute=Express.Router();

notificationRoute.get("/get-all-notification",UpadteAccessToken,isAutheticated,AuthorizeRole("Admin"),getNotifications);

notificationRoute.put("update/notification",UpadteAccessToken,isAutheticated,AuthorizeRole("admin"),getNotifications);

export default notificationRoute;
 