import { Response } from "express";
import { ChacheError } from "../Middleware/ChacheErrors";
import courseModel from "../Models/courses.model";


//create course

export const createCourse= ChacheError(async(res:Response,data:any)=>{
    const course = await courseModel.create(data);
    res.status(200).json({
        success:true,
        course
    })
})

//Get All course-- only for admin

export const getAllCourseService = async (res: Response) => {
    const courses = await courseModel.find().sort({ Created: -1 });

    res.status(201).json({
        success: true,
        courses,
    });
}
