import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "./schemas";

// Middleware for JWT authentication
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const jwtSecret = process.env.JWT_SECRET || "defaultsecret";
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Pass the user to the next middleware or route handler using res.locals
    res.locals.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};