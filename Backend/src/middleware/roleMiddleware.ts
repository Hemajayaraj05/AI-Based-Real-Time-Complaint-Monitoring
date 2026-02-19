import { Request, Response, NextFunction } from "express";

// Middleware to check if user has required role(s)
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - no user found" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}` 
      });
    }

    next();
  };
};

// Middleware to check if user is admin
export const requireAdmin = requireRole("admin");

// Middleware to check if user is admin or division head
export const requireAdminOrDivisionHead = requireRole("admin", "division_head");
