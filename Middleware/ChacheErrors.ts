import { NextFunction, Request, Response } from "express";

export const ChacheError = (Func: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(Func(req, res, next)).catch(next);
}