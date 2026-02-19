import { supabase } from "../config/supabaseClient";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PublicUser, UserDB, UserRole } from "../models/userModel";

const JWT_SECRET = process.env.JWT_SECRET || "replace-me";

export const findUserByEmail = async (email: string): Promise<UserDB | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data as UserDB | null;
};

export const createUser = async (
  name: string,
  email: string,
  password: string,
  department: string | undefined,
  role: UserRole,
  division?: string,
): Promise<PublicUser> => {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("Email already registered");

  const hash = await bcrypt.hash(password, 10);

  const payload: Partial<UserDB> = {
    name,
    email,
    department,
    role,
    password_hash: hash,
  };

  if (role === "division_head" && division) {
    payload.division = division as any;
  }

  const { data, error } = await supabase
    .from("users")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  const created = data as UserDB;

  return {
    id: created.id,
    name: created.name,
    email: created.email,
    department: created.department,
    role: created.role,
    division: created.division,
    created_at: created.created_at,
  };
};

export const verifyPassword = (plain: string, hash: string) =>
  bcrypt.compare(plain, hash);

export const signJwt = (payload: object) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

export const verifyJwt = (token: string) =>
  jwt.verify(token, JWT_SECRET) as any;
