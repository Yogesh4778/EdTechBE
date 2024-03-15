import express from "express";
import { ActivateUser, DeleteUser, LogoutUser, Registration, SocialAuth, UpadteAccessToken, UpdatePassword, UpdateProfile, UpdateUserInfo, getAllUsers, loginUser, updateAllUsers, userInfo } from "../Controller/user.controller";
import { AuthorizeRole, isAutheticated } from "../Middleware/ProtectedAuth";

const UserRouter = express.Router();

UserRouter.post('/registration', Registration);

UserRouter.post('/activateUser', ActivateUser);

UserRouter.post('/Login', loginUser);

UserRouter.get('/Logout',UpadteAccessToken, isAutheticated, LogoutUser);

UserRouter.get('/refresh', UpadteAccessToken);

UserRouter.get('/me',UpadteAccessToken,isAutheticated, userInfo);

UserRouter.post('/socialAuth', SocialAuth);

UserRouter.put('/updateUserInfo', UpadteAccessToken,isAutheticated,UpdateUserInfo);

UserRouter.put('/updatePassword', UpadteAccessToken,isAutheticated,UpdatePassword);

UserRouter.put('/updateProfile', UpadteAccessToken,isAutheticated,UpdateProfile);

UserRouter.get('/getAllUser', UpadteAccessToken,isAutheticated,AuthorizeRole("admin"),getAllUsers);

UserRouter.put('/updateAllUser', UpadteAccessToken,isAutheticated,AuthorizeRole("admin"),updateAllUsers);

UserRouter.delete('/deleteUser/:id', UpadteAccessToken,isAutheticated,AuthorizeRole("admin"),DeleteUser);
export default UserRouter;