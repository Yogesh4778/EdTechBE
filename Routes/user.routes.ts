import express from "express";
import { ActivateUser, DeleteUser, LogoutUser, Registration, SocialAuth, UpadteAccessToken, UpdatePassword, UpdateProfile, UpdateUserInfo, getAllUsers, loginUser, updateAllUsers, userInfo } from "../Controller/user.controller";
import { AuthorizeRole, isAutheticated } from "../Middleware/ProtectedAuth";

const UserRouter = express.Router();

UserRouter.post('/registration', Registration);

UserRouter.post('/activateUser', ActivateUser);

UserRouter.post('/Login', loginUser);

UserRouter.get('/Logout',isAutheticated, LogoutUser);

UserRouter.get('/refresh', UpadteAccessToken);

UserRouter.get('/me',isAutheticated, userInfo);

UserRouter.post('/socialAuth', SocialAuth);

UserRouter.put('/updateUserInfo', isAutheticated,UpdateUserInfo);

UserRouter.put('/updatePassword', isAutheticated,UpdatePassword);

UserRouter.put('/updateProfile', isAutheticated,UpdateProfile);

UserRouter.get('/getAllUser', isAutheticated,AuthorizeRole("admin"),getAllUsers);

UserRouter.put('/updateAllUser', isAutheticated,AuthorizeRole("admin"),updateAllUsers);

UserRouter.delete('/deleteUser/:id', isAutheticated,AuthorizeRole("admin"),DeleteUser);
export default UserRouter;