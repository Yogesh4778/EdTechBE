import express from "express";
import { AuthorizeRole, isAutheticated } from "../Middleware/ProtectedAuth";
import { AddAnswer, AddQuestion, AddReview, AddReviewreply, DeleteCourse, EditCourse, UploadCourse, getAllCourse, getAllCourses, getCourseContent, getSingleCourse } from "../Controller/course.controller";
import {UpadteAccessToken} from "../Controller/user.controller";

const CourseRouter = express.Router();

CourseRouter.post("/create-course",
UpadteAccessToken,
isAutheticated,AuthorizeRole("admin"),UploadCourse);

CourseRouter.put("/edit-course/:id",UpadteAccessToken, isAutheticated,AuthorizeRole("admin"),EditCourse);

CourseRouter.get("/get-single-course/:id",getSingleCourse);

CourseRouter.get("/get-all-course",getAllCourse);

CourseRouter.get("/get-course-content/:id",UpadteAccessToken, isAutheticated,getCourseContent);

CourseRouter.put("/add-question",UpadteAccessToken, isAutheticated,AddQuestion);

CourseRouter.put("/add-answer",UpadteAccessToken, isAutheticated,AddAnswer);

CourseRouter.put("/add-Review/:id",UpadteAccessToken, isAutheticated,AddReview);

CourseRouter.put("/add-ReviewReply",UpadteAccessToken, isAutheticated,AuthorizeRole("admin"),AddReviewreply);

CourseRouter.get("/get-courses",UpadteAccessToken, isAutheticated,AuthorizeRole("admin"),getAllCourses);

CourseRouter.delete("/delete-courses/:id",UpadteAccessToken, isAutheticated,AuthorizeRole("admin"),DeleteCourse);
export default CourseRouter;