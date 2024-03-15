import Express from "express";
import { CreateLayout, EditLayout, GetLayout } from "../Controller/layout.controller";
import { AuthorizeRole, isAutheticated } from "../Middleware/ProtectedAuth";
import { UpadteAccessToken } from "../Controller/user.controller"

const LayoutRouter= Express.Router();

LayoutRouter.post('Create-Layout',UpadteAccessToken, isAutheticated,AuthorizeRole("admin"),CreateLayout);

LayoutRouter.put('Edit-Layout',UpadteAccessToken, isAutheticated,AuthorizeRole("admin"),EditLayout);

LayoutRouter.get('get-Layout',UpadteAccessToken, isAutheticated,GetLayout);
export default LayoutRouter;
