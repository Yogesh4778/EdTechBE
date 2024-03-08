require('dotenv').config();
import { Request, Response, NextFunction } from "express";
import userModel, { Iuser } from "../Models/user.model";
import ErrorHandling from "../utils/ErrorHandling";
import { ChacheError } from "../Middleware/ChacheErrors";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from 'ejs';
import path from "path";
import sendMail from "../utils/SendMail";
import { accessTokenOption, refreshTokenOption, sendToken } from "../utils/jwt";
import { redis } from "../utils/Redis";
import { getAllUserService, getUserID, updateUserRoleService } from "../Service/user.service";
import cloudinary from "cloudinary";



// Register Users

interface IRegistrationBody {
    name: string;
    email: string;
    password: string;
    Avatar?: string;
}

export const Registration = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
            return next(new ErrorHandling("Email is already exist", 400));
        };

        const user: IRegistrationBody = {
            name,
            email,
            password,
        };
        const activationToken = CreateActivationToken(user);
        const activationCode = activationToken.activationCode;

        const data = { user: { name: user.name }, activationCode };
        const html = await ejs.renderFile(path.join(__dirname, "../Mails/Activation-mail.ejs"), data);

        try {
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                template: "Activation-mail.ejs",
                data,
            });
            res.status(201).json({
                success: true,
                message: `please check your email ${user.email} to activate your account`,
                activationToken: activationToken.token,
            });
        } catch (error: any) {
            return next(new ErrorHandling(error.message, 400));
        }

    } catch (error: any) {
        return next(new ErrorHandling(error.message, 400));
    }
})

interface IActivationToken {
    token: string;
    activationCode: string;
}


export const CreateActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign({
        user, activationCode
    },
        process.env.ACTIVATION_SECRET as Secret, {
        expiresIn: "5m",
    })
    return { token, activationCode };
}

//Activate user

interface IActivationRequest {
   activation_token: string;
    activation_code: string;
}

export const ActivateUser = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {activation_token, activation_code } = req.body as IActivationRequest;
        const newuser: { user: Iuser; activationCode: string } = jwt.verify(
           activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as { user: Iuser; activationCode: string };

        if (newuser.activationCode !== activation_code) {
            return next(new ErrorHandling("Invalide Activation Code", 400));
        }
        const { name, email, password } = newuser.user;
        const existUser = await userModel.findOne({ email });
        if (existUser) {
            return next(new ErrorHandling("Email already exist", 400));
        }
        const user = await userModel.create({
            name,
            email,
            password
        });
        res.status(201).json({
            success: true,
        });
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 400));
    }
})

//Login User

interface ILoginRequest {
    email: string;
    password: string;
}

export const loginUser = ChacheError(async (req: Request, res: Response, next: NextFunction) => {


    try {
        const { email, password } = req.body as ILoginRequest;
        if (!email || !password) {
            return next(new ErrorHandling("Please enter email and Password", 400));
        };
        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorHandling("Invalid email and Password", 400));
        }
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return next(new ErrorHandling("Invalid email and Password", 400));
        };

        sendToken(user, 200, res);

    } catch (error: any) {
        return next(new ErrorHandling(error.message, 400));
    }
}

);


//Logout User

export const LogoutUser = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("access_Token", "", { maxAge: 1 });
        res.cookie("refresh_Token", "", { maxAge: 1 });

        // const userID = req.user?._id || "";
        // redis.del(userID);

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        }
        )
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 400));
    }
})

//update access token

export const UpadteAccessToken = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refresh_Token = req.cookies.refresh_Token as string;
        const decode = jwt.verify(refresh_Token, process.env.REFRESH_TOKEN as string) as JwtPayload;
        const message = "could not have refresh token";

        if (!decode) {
            return next(new ErrorHandling(message, 400));
        }

        const sessions = await redis.get(decode.id as string);

        if (!sessions) {
            return next(new ErrorHandling("Please login to access this website", 400));
        }

        const user = JSON.parse(sessions);

        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
            expiresIn: "5m",
        });

        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
            expiresIn: "3d",
        });

        req.user = user;

        res.cookie("access_Token", accessToken, accessTokenOption);
        res.cookie("refresh_Token", refreshToken, refreshTokenOption);

        await redis.set(user._id,JSON.stringify(user),"EX",604800); // 7 day login expire

        res.status(200).json({
            status: "success",
            accessToken,
        })

    } catch (error: any) {
        return next(new ErrorHandling(error.message, 400));
    }
});

//get user info

export const userInfo = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id || "";
        getUserID(userId, res);

    } catch (error: any) {
        return next(new ErrorHandling(error.message, 400));
    }
});

interface ISocialBody {
    email: string;
    name: string;
    avatar?: string;
}

//social auth

export const SocialAuth = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, name, avatar } = req.body as ISocialBody;
        const user = await userModel.findOne({ email });
        if (!user) {
            const newUser = await userModel.create({ email, name, avatar });
            sendToken(newUser, 200, res);
        }
        else {
            sendToken(user, 200, res);
        }


    } catch (error: any) {
        return next(new ErrorHandling(error.message, 400));
    }
});

interface IUpdateUser {
    name: string;
    email: string;
}

export const UpdateUserInfo = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email } = req.body as IUpdateUser;
        const userId = req.user?.id || "";
        const user = await userModel.findById(userId);

        if (email && user) {
            const isEmailExist = await userModel.findOne({ email });
            if (isEmailExist) {
                return next(new ErrorHandling("Email is already exist", 400));
            }
            user.email = email;
        }

        if (name && user) {
            user.name = name;
        }
        await user?.save();

        await redis.set(userId, JSON.stringify(user));

        res.status(200).json({
            success: "true",
            user,
        })

    } catch (error: any) {
        return next(new ErrorHandling(error.message, 400));
    }
})

//Update password 

interface IUpdatePassword {
    oldPassword: string;
    newPassword: string;
}

export const UpdatePassword = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { oldPassword, newPassword } = req.body as IUpdatePassword;

        if (!oldPassword || !newPassword) {
            return next(new ErrorHandling("Please enter old and new Password", 400));

        }

        const user = await userModel.findById(req.user?.id).select("+password");

        if (user?.password === undefined) {
            return next(new ErrorHandling("Invalid user", 400));
        }

        const IsPasswordMatch = await user?.comparePassword(oldPassword);

        if (!IsPasswordMatch) {
            return next(new ErrorHandling("Invalid old Password", 400));
        }

        user.password = newPassword;
        await user.save();

        await redis.set(req.user?._id, JSON.stringify(user));

        res.status(200).json({
            success: "true",
            user,
        })

    } catch (error: any) {
        return next(new ErrorHandling(error.message, 400));
    }
})

interface IUpdateProfile {
    avatar: string;
}

//Update Profile Picture

export const UpdateProfile = ChacheError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { avatar } = req.body as IUpdateProfile;
        const userid = req.user?._id;

        const user = await userModel.findById(userid);

        if (avatar && user) {
            // if user have a profile picture then call it

            if (user?.avatar?.public_id) {

                //if user have a profile picture then delete it
                await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

                const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatar",
                    width: 150,
                })
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                }
            } else {
                const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatar",
                    width: 150,
                })
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                }
            }

        }
        await user?.save();

        await redis.set(userid, JSON.stringify(user));

        res.status(200).json({
            success: "true",
            user,
        })

    } catch (error: any) {
        return next(new ErrorHandling(error.message, 400));
    }

});

//get all users -- for admin only

export const getAllUsers = ChacheError(async (res: Response, req: Request, next: NextFunction) => {
    try {
        getAllUserService(res);
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 404));
    }
})


//update user role -- only for Admin

export const updateAllUsers = ChacheError(async (res: Response, req: Request, next: NextFunction) => {
    try {
        const { id, role } = req.body;

        updateUserRoleService(res, id, role);
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 404));
    }
})


//Delete user -- Only for Admin

export const DeleteUser = ChacheError(async (res: Response, req: Request, next: NextFunction) => {
    try {
        const { id } = req.body;

        const users = await userModel.findById(id);

        if (!users) {
            return next(new ErrorHandling("User not found", 404));
        }

        await users.deleteOne({ id });

        await redis.del(id);

        res.status(200).json({
            success: "true",
            message: "User deleted successfully"
        })
    } catch (error: any) {
        return next(new ErrorHandling(error.message, 404));
    }
})