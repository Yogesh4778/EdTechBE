
import mongoose, { Document, Schema, Model } from "mongoose";
import { Iuser } from "./user.model";

interface IComment extends Document {
    user: Iuser;
    questions: string;
    questionsReplies?: IComment[];
}

interface IReviews extends Document {
    user: Iuser;
    rating: number;
    comment: string;
    commentReplies?: IComment[];
}

interface ILink extends Document {
    title: string;
    url: string;
}

interface ICoursesdata extends Document {
    title: string;
    description: string;
    videoUrl: string;
    //videoThumbnail: object;
    videoSection: string;
    videoLength: number;
    videoPlayer: string;
    links: ILink[];
    suggestions: string;
    questions: IComment[];

}

interface ICourses extends Document {
    name: string;
    description: string;
    price: number;
    estimatedPrice: number;
    thumbnail: object;
    tags: string;
    levels: string;
    demoUrl: string;
    benefits: { title: string }[];
    prerequisites: { title: string }[];
    review: IReviews[];
    courseData: ICoursesdata[];
    rating?: number;
    purchased?: number;
}

const reviewSchema = new Schema<IReviews>({
    user: Object,
    comment: String,
    rating: {
        type: Number,
        default: 0
    },
    commentReplies:[Object]
});

const linkSchema = new Schema<ILink>({
    title: String,
    url: String
});

const commentSchema = new Schema<IComment>({
    user: Object,
    questions: String,
    questionsReplies: [Object],
});

const courseDataSchema = new Schema<ICoursesdata>({
    videoUrl: String,
    //videoThumbnail: Object,
    title: String,
    videoSection: String,
    description: String,
    videoLength: Number,
    videoPlayer: String,
    links: [linkSchema],
    suggestions: String,
    questions: [commentSchema],
});

const courseSchema = new Schema<ICourses>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    estimatedPrice: {
        type: Number,
    },
    thumbnail: {
        public_id: {
            type: String,
            //required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    tags: {
        type: String,
        required: true
    },
    levels: {
        type: String,
        required: true
    },
    demoUrl: {
        type: String,
        required: true
    },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    review: [reviewSchema],
    courseData: [courseDataSchema],
    rating: {
        type: Number,
        default: 0
    },
    purchased: {
        type: Number,
        default: 0
    },
},{timestamps:true});

const courseModel: Model<ICourses> = mongoose.model("Courses", courseSchema);

export default courseModel;