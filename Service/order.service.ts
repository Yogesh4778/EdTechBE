import { NextFunction ,Response} from "express";
import { ChacheError } from "../Middleware/ChacheErrors";
import OrderModel from "../Models/orderModel";

export const CreateOrder=ChacheError(async (data:any,next:NextFunction,res:Response)=>{
    const order=await OrderModel.create(data);
    
    res.status(201).json({
        success:true,
        order,
     });
})


//Get All order-- only for admin

export const getAllOrderService = async (res: Response) => {
    const orders = await OrderModel.find().sort({ Created: -1 });

    res.status(201).json({
        success: true,
        orders,
    });
}