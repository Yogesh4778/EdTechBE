import express from "express";
import { AuthorizeRole, isAutheticated } from "../Middleware/ProtectedAuth";
import { AddAnswer, AddQuestion, AddReview, AddReviewreply, DeleteCourse, EditCourse, UploadCourse, getAllCourse, getAllCourses, getCourseContent, getSingleCourse } from "../Controller/course.controller";

const CourseRouter = express.Router();

CourseRouter.post("/create-course",isAutheticated,AuthorizeRole("admin"),UploadCourse);

CourseRouter.put("/edit-course/:id",isAutheticated,AuthorizeRole("admin"),EditCourse);

CourseRouter.get("/get-single-course/:id",getSingleCourse);

CourseRouter.get("/get-all-course/",getAllCourse);

CourseRouter.get("/get-course-content/:id",isAutheticated,getCourseContent);

CourseRouter.put("/add-question",isAutheticated,AddQuestion);

CourseRouter.put("/add-answer",isAutheticated,AddAnswer);

CourseRouter.put("/add-Review/:id",isAutheticated,AddReview);

CourseRouter.put("/add-ReviewReply",isAutheticated,AuthorizeRole("admin"),AddReviewreply);

CourseRouter.get("/get-courses",isAutheticated,AuthorizeRole("admin"),getAllCourses);

CourseRouter.delete("/delete-courses/:id",isAutheticated,AuthorizeRole("admin"),DeleteCourse);
export default CourseRouter;