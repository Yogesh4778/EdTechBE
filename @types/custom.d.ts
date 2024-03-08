import { Request } from "express";
import { Iuser } from "../Models/user.model";

declare global{
    namespace Express{
        interface Request {
            
            user? : Record<string, any>;
           
          }
    }
}



import { Request } from 'express';


interface AuthenticatedRequest extends Request {
  user?: any; 
}

export { AuthenticatedRequest };

