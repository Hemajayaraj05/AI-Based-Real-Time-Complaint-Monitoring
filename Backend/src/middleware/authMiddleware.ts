import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../services/authService";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing authorization header" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ message: "Invalid authorization format" });

  const token = parts[1];
  try {
    const payload = verifyJwt(token);
    (req as any).user = payload;
    next();
  } catch (err: any) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
