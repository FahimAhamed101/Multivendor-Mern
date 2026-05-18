import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../errors/ApiError";
import { TRole } from "../config/role";
import { TokenStore } from "../modules/user/user.model";

export interface IUserPayload extends jwt.JwtPayload {
  id: string;
  role: string;
  email: string;
}

export const guardRole = (roles: TRole | TRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(new ApiError(401, "Access denied. No token provided."));
    }

    try {
      // Check if token is blacklisted
      const isBlacklisted = await TokenStore.findOne({ token });
      if (isBlacklisted) {
        return next(
          new ApiError(
            401,
            "You Use This Token In Another Device. Please Login Your Account & Try Again",
          ),
        );
      }

      // Decode token and cast it to IUserPayload
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY as string,
      ) as IUserPayload;

      // Attach the decoded payload to the request object
      (req as any).user = decoded;
      const userRole = decoded.role;

      if (!roles.includes(userRole as TRole)) {
        throw new ApiError(403, "You are not permitted to access this route!");
      }
      // Check if the user has one of the allowed roles
      if (
        (Array.isArray(roles) && roles.includes(userRole as TRole)) ||
        roles === userRole
      ) {
        return next();
      }

      throw new ApiError(
        403,
        "You are not authorized to access this resource.",
      );
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return next(new ApiError(401, "Access Denied, Token Expired"));
      }
      next(error);
    }
  };
};
