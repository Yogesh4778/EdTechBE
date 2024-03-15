import Express  from "express";
import { AuthorizeRole, isAutheticated } from "../Middleware/ProtectedAuth";
import { createOrder, getAllOrders } from "../Controller/order.controller";
import { UpadteAccessToken } from "../Controller/user.controller"


const orderRouter=Express.Router();
orderRouter.post("/create-order",UpadteAccessToken,isAutheticated,createOrder);

orderRouter.get("/get-order",UpadteAccessToken,isAutheticated,AuthorizeRole("admin"),getAllOrders);

export default orderRouter;