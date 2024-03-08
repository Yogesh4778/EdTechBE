require('dotenv').config();
import jwt from "jsonwebtoken";
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from 'bcryptjs';
const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface Iuser extends Document {
    [x: string]: any;
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: String;
    };
    // _id:string;
    role: string;
    isVerified: boolean;
    courses: Array<{ courseId: String }>;
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
};

const userSchema: Schema<Iuser> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your Name'],
    },
    email: {
        type: String,
        required: [true, "Please Enter a email"],
        validate: {
            validator: function (value: string) {
                return emailRegexPattern.test(value);
            },
            message: "please enter a valid Email",
        },
        unique: true,
    },
    password: {
        type: String,
       // required: [true, 'Please enter valid Password'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    avatar: {
        public_id: String,
        url: String,
    },
    // _id:{
    //     type:String,
    // },
    role: {
        type: String,
        default: "user",

    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    courses: [
        {
            courseId: String,
        }
    ]
}, { timestamps: true });

//Hash Password before saving

userSchema.pre<Iuser>('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//sign access token
userSchema.methods.SignAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || '',{
        expiresIn:"5m",
    });
};

//Sign Refresh Token
userSchema.methods.SignRefreshToken = async function () {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || '',{
        expiresIn:"3d",
    });
};


//compare password

userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<Boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
}

const userModel: Model<Iuser> = mongoose.model("user", userSchema);
export default userModel;

