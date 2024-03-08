import Express  from "express";
import { AuthorizeRole, isAutheticated } from "../Middleware/ProtectedAuth";
import { createOrder, getAllOrders } from "../Controller/order.controller";


const orderRouter=Express.Router();
orderRouter.post("/create-order",isAutheticated,createOrder);

orderRouter.get("/get-order",isAutheticated,AuthorizeRole("admin"),getAllOrders);

export default orderRouter;