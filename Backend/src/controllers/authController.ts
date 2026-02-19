import { Request, Response } from "express";
import { createUser, findUserByEmail, verifyPassword, signJwt } from "../services/authService";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, department, role, division } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await createUser(name, email, password, department, role, division);
    return res.status(201).json({ user });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Signup failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signJwt({ id: user.id, email: user.email, role: user.role, name: user.name, division: user.division });

    const publicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      division: user.division,
      created_at: user.created_at,
    };

    return res.json({ user: publicUser, token });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Login failed" });
  }
};

export const me = async (req: Request, res: Response) => {
  // authMiddleware will attach user to req
  return res.json({ user: (req as any).user });
};
