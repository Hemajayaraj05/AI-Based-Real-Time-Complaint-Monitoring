export type ComplaintDivision =
  | "cleanliness"
  | "water"
  | "electricity"
  | "hostel"
  | "transport"
  | "library"
  | "food"
  | "infrastructure"
  | "other";

export type ComplaintStatus = "pending" | "in_progress" | "resolved";

export type ComplaintPriority = "low" | "medium" | "high";

export interface ComplaintDB {
  id: string;
  title: string;
  description: string;
  division: ComplaintDivision;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  raised_by: string; // user id
  assigned_to?: string | null; // user id (division head)
  cluster_id?: string | null; // For grouping similar complaints
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
}

export interface PublicComplaint {
  id: string;
  title: string;
  description: string;
  division: ComplaintDivision;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  raised_by: string;
  raised_by_name?: string; // Only visible to admin
  assigned_to?: string | null;
  cluster_id?: string | null;
  similar_count?: number; // Number of similar complaints in cluster
  created_at?: string;
  resolved_at?: string | null;
}

// For students - hide the raised_by name
export interface StudentComplaint extends Omit<PublicComplaint, 'raised_by_name'> {
  raised_by_name?: never;
}
