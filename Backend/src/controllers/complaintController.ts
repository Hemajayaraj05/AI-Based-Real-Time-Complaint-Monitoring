import { Request, Response } from "express";
import {
  createComplaint,
  getComplaintsForUser,
  getAssignedToUser,
  getAssignedToUserWithClusters,
  updateComplaintStatus,
  getAllComplaints,
  getAllComplaintsWithClusters,
  getMonthlyComplaintTrends,
  getDashboardStats,
  getDivisionStats,
  getPriorityStats,
  getComplaintsByDivision,
  reclusterAllComplaints,
  reassignAllComplaints,
  updateStatusesBasedOnAge,
  getSimilarComplaintsByClusterId,
} from "../services/complaintService";
import { supabase } from "../config/supabaseClient";

// Debug endpoint to check assignments
export const debugAssignments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Get user info
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    // Get assigned complaints
    const { data: assignedComplaints } = await supabase
      .from("complaints")
      .select("id, title, division, status, assigned_to")
      .eq("assigned_to", user.id);

    // Get all complaints with this division
    const { data: allDivisionComplaints } = await supabase
      .from("complaints")
      .select("id, title, division, assigned_to");

    return res.json({
      user: userData,
      assignedCount: assignedComplaints?.length || 0,
      assignedComplaints: assignedComplaints || [],
      note: `Looking for complaints assigned to user ${user.id}`,
      allComplaintsWithAssignments: allDivisionComplaints || []
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Debug failed", error: err });
  }
};

export const raiseComplaint = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    // AI will categorize division and priority automatically
    const complaint = await createComplaint(title, description, user.id);
    return res.status(201).json({ complaint });
  } catch (err: any) {
    console.error("Error creating complaint:", err);
    return res.status(500).json({ message: err.message || "Failed to create complaint" });
  }
};

export const myComplaints = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const complaints = await getComplaintsForUser(user.id);
    return res.json({ complaints });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to fetch complaints" });
  }
};

export const assignedToMe = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const complaints = await getAssignedToUserWithClusters(user.id);
    return res.json({ complaints });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to fetch assigned complaints" });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { complaintId } = req.params;
    const { status } = req.body;
    
    if (!complaintId || !status) {
      return res.status(400).json({ message: "Missing complaintId or status" });
    }

    // Validate status
    const validStatuses = ["pending", "in_progress", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be: pending, in_progress, or resolved" });
    }

    const result = await updateComplaintStatus(complaintId, status, user.id);
    return res.json({ 
      complaint: result.complaint, 
      cascaded: result.cascaded,
      message: result.cascaded > 0 
        ? `Status updated for this complaint and ${result.cascaded} similar complaint${result.cascaded > 1 ? 's' : ''}`
        : "Status updated successfully"
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to update complaint status" });
  }
};

export const allComplaints = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Get complaints based on role with clustering
    const complaints = await getAllComplaintsWithClusters(user.role, user.division);

    return res.json({ complaints, total: complaints.length });
  } catch (err: any) {
    console.error("Error fetching complaints:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch complaints" });
  }
};

export const getSimilarComplaints = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { clusterId } = req.params;
    
    if (!clusterId) {
      return res.status(400).json({ message: "Cluster ID is required" });
    }

    const complaints = await getSimilarComplaintsByClusterId(clusterId, user.role);
    return res.json({ complaints, total: complaints.length });
  } catch (err: any) {
    console.error("Error fetching similar complaints:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch similar complaints" });
  }
};

export const monthlyComplaintAnalysis = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const months = Number(req.query.months ?? 10);
    const predict = Number(req.query.predict ?? 3);

    const data = await getMonthlyComplaintTrends(months, predict, user.role, user.division);
    return res.json({ data });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to fetch analysis" });
  }
};

// Dashboard statistics endpoint
export const dashboardStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const stats = await getDashboardStats(user.role, user.division);
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to fetch dashboard stats" });
  }
};

// Division-wise statistics (Admin only)
export const divisionStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Only admins can see division-wise stats
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const stats = await getDivisionStats();
    return res.json({ stats });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to fetch division stats" });
  }
};

// Priority distribution statistics
export const priorityStatsEndpoint = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const stats = await getPriorityStats(user.role, user.division);
    return res.json({ stats });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to fetch priority stats" });
  }
};

// Recluster all existing complaints (Admin only)
export const reclusterComplaints = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Only admins can trigger reclustering
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const result = await reclusterAllComplaints();
    return res.json({ 
      message: "Retroactive clustering complete",
      ...result 
    });
  } catch (err: any) {
    console.error("Error reclustering complaints:", err);
    return res.status(500).json({ message: err.message || "Failed to recluster complaints" });
  }
};

// Update complaint statuses based on age (Admin only)
export const updateComplaintStatusesByAge = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Only admins can trigger status updates
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const result = await updateStatusesBasedOnAge();
    return res.json({ 
      message: "Status update based on age complete",
      ...result 
    });
  } catch (err: any) {
    console.error("Error updating statuses by age:", err);
    return res.status(500).json({ message: err.message || "Failed to update statuses" });
  }
};

// Reassign all complaints to specialists and division heads (Admin only)
export const reassignComplaints = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Only admins can trigger reassignment
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const result = await reassignAllComplaints();
    return res.json({ 
      message: "Complaints reassigned to specialists and division heads",
      ...result 
    });
  } catch (err: any) {
    console.error("Error reassigning complaints:", err);
    return res.status(500).json({ message: err.message || "Failed to reassign complaints" });
  }
};

