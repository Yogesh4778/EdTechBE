import { Response } from "express";
import { redis } from "../utils/Redis";
import userModel from "../Models/user.model";


//get user info

export const getUserID = async (id: string, res: Response) => {
    const userJson = await redis.get(id);
    if (userJson) {
        const user = JSON.parse(userJson)
        res.status(200).json({
            success: true,
            user,
        })
    }

}

//Get All user

export const getAllUserService = async (res: Response) => {
    const users = await userModel.find().sort({ Created: -1 });

    res.status(201).json({
        success: true,
        users,
    });
}

//update User Service

export const updateUserRoleService = async (res: Response,id:String,role:String) => {
    
    const users = await userModel.findByIdAndUpdate(id,{role},{new:true});

    res.status(201).json({
        success: true,
        users,
    });
}
