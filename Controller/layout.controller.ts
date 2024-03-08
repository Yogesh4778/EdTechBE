import { Request, Response, NextFunction } from "express";
import ErrorHandling from "../utils/ErrorHandling";
import { ChacheError } from "../Middleware/ChacheErrors";
import cloudinary from "cloudinary";
import layoutModel from "../Models/layout.model";
//create layout

export const CreateLayout = ChacheError(async (res: Response, req: Request, next: NextFunction) => {
    try {
        const { type } = req.body;
        const isTypeExist = await layoutModel.findOne({ type });
        if (isTypeExist) {
            return type(new ErrorHandling(`${type} already exist`, 400));
        }

        if (type === "Banner") {
            const { image, title, subtitle } = req.body;
            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: "layout"
            });
            const banner = {
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                },
                title,
                subtitle
            }
            await layoutModel.create(banner);
        }

        if (type === "faq") {
            const { faq } = req.body;
            const faqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer
                    };
                })
            )
            await layoutModel.create({ type: "FAQ", faq: faqItems });
        }

        if (type == "categories") {
            const { categories } = req.body;
            const categoriesItems = await Promise.all(
                categories.map(async (item: any) => {
                    return {
                        title: item.title,

                    };
                })
            )
            await layoutModel.create({ type: "categories", categories: categoriesItems });
        }

        res.status(200).json({
            success: true,
            message: "Layout created Successfully"
        })
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 500));
    }
})

//edit Layout

export const EditLayout = ChacheError(async (res: Response, req: Request, next: NextFunction) => {
    try {
        const { type } = req.body;

        if (type === "Banner") {

            const BannerData: any = await layoutModel.findOne({ type: "Banner" });
            const { image, title, subtitle } = req.body;
            if (BannerData) {
                await cloudinary.v2.uploader.destroy(BannerData.image.public_id);
            }
            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: "layout"
            });
            const banner = {
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                },
                title,
                subtitle
            }
            await layoutModel.findByIdAndUpdate(BannerData._id, { banner });
        }

        if (type === "FAQ") {
            const { faq } = req.body;
            const faqItem = await layoutModel.findOne({ type: "FAQ" });
            const faqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer
                    };
                })
            )
            await layoutModel.findByIdAndUpdate(faqItem?._id, { type: "FAQ", faq: faqItems });
        }

        if (type == "categories") {
            const { categories } = req.body;
            const categoriesItem = await layoutModel.findOne({ type: "categories" });
            const categoriesItems = await Promise.all(
                categories.map(async (item: any) => {
                    return {
                        title: item.title,

                    };
                })
            )
            await layoutModel.findByIdAndUpdate(categoriesItem?._id, { type: "categories", categories: categoriesItems });
        }

        res.status(200).json({
            success: true,
            message: "Layout updated Successfully"
        })
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 400));
    }
})


// get Layout by type

export const GetLayout= ChacheError(async(res:Response,req:Request,next:NextFunction)=>{
    try {
        const {type}= req.body;
        const layout= await layoutModel.findOne({type});
        res.status(201).json({
            success:true,
            layout
        })
    } catch (error:any) {
        return next(new ErrorHandling(error.message,400));
    }
})