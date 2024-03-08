import { Request, Response, NextFunction, } from "express";
import { ChacheError } from "../Middleware/ChacheErrors";
import ErrorHandling from "../utils/ErrorHandling";
import cloudinary from "cloudinary"
import { createCourse, getAllCourseService } from "../Service/course.service";
import courseModel from "../Models/courses.model";
import { redis } from "../utils/Redis";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/SendMail";
import NotificationModel from "../Models/notificationModel";




//Upload data

export const UploadCourse = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

        createCourse(data, res, next);
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 500));
    }

});

//edit courses

export const EditCourse = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            await cloudinary.v2.uploader.destroy(thumbnail.public_id);

            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

        const courseId = req.params.id;
        const course = await courseModel.findByIdAndUpdate(courseId, { $set: data }, { new: true });

        res.status(201).json({
            success: true,
            course
        })


    } catch (error: any) {
        return next(new ErrorHandling(error.message, 500));
    }

});

// get single course === without purchase
export const getSingleCourse = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const courseId = req.params.id;

        const isCacheExist = await redis.get(courseId);

        if (isCacheExist) {
            const course = JSON.parse(isCacheExist);

            res.status(201).json({
                success: true,
                course
            })
        }
        else {
            const course = await courseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links")

            await redis.set(courseId, JSON.stringify(course),"EX",604800);
            res.status(201).json({
                success: true,
                course
            })
        }
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 500));
    }

});

// get all course === without purchase
export const getAllCourse = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const isCacheExist = await redis.get("allcourses");

        if (isCacheExist) {
            const course = JSON.parse(isCacheExist);

            res.status(201).json({
                success: true,
                course
            })
        } else {
            const course = await courseModel.find().select("-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links")
            await redis.set("allcourses", JSON.stringify(course));
            res.status(201).json({
                success: true,
                course
            })
        }
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 500));
    }

});

// get course content === only for valid user

export const getCourseContent = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const courseList = req.user?.course;
        const courseId = req.params.id;

        const courseExist = courseList.find((course: any) => course._id.toString() === courseId);

        if (!courseExist) {
            return next(new ErrorHandling("Not valid user to access this course", 404));
        }
        const course = await courseModel.findById(courseId);
        const content = course?.courseData;
        res.status(201).json({
            success: true,
            content
        });
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 500));
    }

});

// Add question in course

interface IAddQuestion {
    question: string;
    courseId: string;
    contentId: string;
}

export const AddQuestion = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { question, courseId, contentId } = req.body as IAddQuestion;

        const course = await courseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandling("Invalid content Id", 400));
        }

        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));

        if (!courseContent) {
            return next(new ErrorHandling("Invalid content Id", 400));
        }

        // create a new question object
        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: []
        }


        // add this questions to our course content
        courseContent.questions.push(newQuestion);

        await NotificationModel.create({
            user:req.user?._id,
            title:"New Question",
            message:`You have a new question in ${courseContent.title}`
        });

        //save the updated course
        await course?.save();

        res.status(201).json({
            success: true,
            course

        });
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 500));
    }

});

// Add question in course

interface IAddAnswer {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

export const AddAnswer = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { answer, courseId, contentId, questionId } = req.body as IAddAnswer;

        const course = await courseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandling("Invalid content Id", 400));
        }

        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));

        if (!courseContent) {
            return next(new ErrorHandling("Invalid content Id", 400));
        }

        const question = courseContent?.questions?.find((item: any) => item._id.equals(questionId));

        if (!question) {
            return next(new ErrorHandling("Invalid question Id", 400));
        }


        // create a new anwer object
        const newAnswer: any = {
            user: req.user,
            answer

        }

        // add this questions to our course content
        question.questionsReplies?.push(newAnswer);

        //save the updated course
        await course?.save();

        if (req.user?._id === question.user?._id) {
            //create notification
            await NotificationModel.create({
                user:req.user?._id,
                title:"New Question reply received",
                message:`You have a new question reply in ${courseContent.title}`
            });
        } else {
            const data = {
                name: question.user.name,
                title: courseContent.title
            }
            const html = await ejs.renderFile(path.join(__dirname, "../Mails/question-mail.ejs"), data);

            try {
                await sendMail({
                    email: question.user.email,
                    subject: "question-reply",
                    template: "question-mail.ejs",
                    data
                })
            } catch (error: any) {
                return next(new ErrorHandling(error.message, 500));
            }
        }

        res.status(201).json({
            success: true,
            course

        });
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 500));
    }
});

// add review in course

interface IAddReview {
    review: string,
    rating: number,
    userId: string
}

export const AddReview = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const userCourseList = req.user?.course;

        const courseId = req.params.id;

        //check if courseId already exist in userCourseList based on id
        const courseExist = userCourseList?.some((course: any) => course._id.toString() === courseId.toString());

        if (!courseExist) {
            return next(new ErrorHandling("you are not eligible to access this course", 500));
        }

        const course = await courseModel.findById(courseId);

        const { review, rating } = req.body as IAddReview;

        const ReviewData: any = {
            user: req.user,
            Comment: review,
            rating
        }

        course?.review.push(ReviewData);

        let avg = 0;

        course?.review.forEach((rev: any) => {
            avg += rev.rating;
        });

        if (course) {
            course.rating = avg / course.review.length;
        }

        await course?.save();

        const notification = {
            titlt: "New Review recevied",
            message: `${req.user?.name} has given a review in ${course?.name}`,
        }

        //create notification

        res.status(201).json({
            success: true,
            course
        });

    } catch (error: any) {
        return next(new ErrorHandling(error.message, 500));
    }
})

//Add reply in review

interface IAddReviewReply {
    comment: string;
    courseId: string;
    ReviewId: string;
}

export const AddReviewreply = ChacheError(async (Req: Request, Res: Response, next: NextFunction) => {
    try {
        const { comment, courseId, ReviewId } = Req.body as IAddReviewReply;

        const course = await courseModel.findById(courseId);

        if (!course) {
            return next(new ErrorHandling("Course not found", 500));
        }

        const review = course?.review?.find((rev: any) => rev._id.toString() === ReviewId)

        if (!review) {
            return next(new ErrorHandling("Review not found", 500));
        }

        const replyData: any = {
            user: Req.user,
            comment
        }

        if (!review.commentReplies) {
            review.commentReplies = [];
        }

        review.commentReplies?.push(replyData);

        await course?.save();

        Res.status(201).json({
            success: true,
            course
        });

    } catch (error: any) {
        return next(new ErrorHandling(error.message, 500));
    }
});


//get all course -- for admin only

export const getAllCourses = ChacheError(async (res: Response, req: Request, next: NextFunction) => {
    try {
        getAllCourseService(res);
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 404));
    }
})


//Delete course -- Only for Admin

export const DeleteCourse = ChacheError(async (res: Response, req: Request, next: NextFunction) => {
    try {
        const { id } = req.body;

        const course = await courseModel.findById(id);

        if (!course) {
            return next(new ErrorHandling("course not found", 404));
        }

        await course.deleteOne({ id });

        await redis.del(id);

        res.status(200).json({
            success: "true",
            message: "course deleted successfully"
        })
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 404));
    }
})