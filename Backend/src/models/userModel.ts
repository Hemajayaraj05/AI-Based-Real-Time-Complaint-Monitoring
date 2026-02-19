export type UserRole = "student" | "admin" | "division_head" | "electrician" | "cleanliness_manager" | "faculty" | "hostel_manager" | "librarian" | "cafeteria_manager" | "exam_coordinator" | "security";

export type Division =
  | "cleanliness"
  | "water"
  | "electricity"
  | "hostel"
  | "transport"
  | "library"
  | "food"
  | "infrastructure"
  | "other";

export interface UserDB {
  id: string;
  name: string;
  email: string;
  department?: string;
  role: UserRole;
  division?: Division; // For division heads
  password_hash: string;
  created_at?: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  department?: string;
  role: UserRole;
  division?: Division;
  created_at?: string;
}
