import Express from "express";
import { CreateLayout, EditLayout, GetLayout } from "../Controller/layout.controller";
import { AuthorizeRole, isAutheticated } from "../Middleware/ProtectedAuth";

const LayoutRouter= Express.Router();

LayoutRouter.post('Create-Layout',isAutheticated,AuthorizeRole("admin"),CreateLayout);

LayoutRouter.put('Edit-Layout',isAutheticated,AuthorizeRole("admin"),EditLayout);

LayoutRouter.get('get-Layout',isAutheticated,GetLayout);
export default LayoutRouter;
