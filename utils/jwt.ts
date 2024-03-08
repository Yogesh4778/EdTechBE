require('dotenv').config();
import { Response } from "express";
import { redis } from "./Redis";
import { Iuser } from "../Models/user.model";


interface ITokenOption {
    expire: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}
 //parse environment variable to integrates with fallback value

 const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10);
 const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10);

 //options for cookies

 export const accessTokenOption: ITokenOption = {
     expire: new Date(Date.now() + accessTokenExpire * 60 *60* 1000),
     maxAge: accessTokenExpire *60*60* 1000,
     httpOnly: true,
     sameSite: 'lax'

 };
 export const refreshTokenOption: ITokenOption = {
     expire: new Date(Date.now() + refreshTokenExpire *24*60*60* 1000),
     maxAge: refreshTokenExpire *24*60*60* 1000,
     httpOnly: true,
     sameSite: 'lax'

 };
export const sendToken = (user: Iuser, statuscode: number, res: Response) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    //upload session to redis
    redis.set(user._id, JSON.stringify(user) as any);


   

    // secure to be true only in production 
    if (process.env.NODE_ENV === 'production') {
        accessTokenOption.secure = true;
    }
    res.cookie("access_Token", accessToken, accessTokenOption);
    res.cookie("refresh_ Token", refreshToken, refreshTokenOption);

    res.status(statuscode).json({
        success: true,
        user,
        accessToken
    })
}
