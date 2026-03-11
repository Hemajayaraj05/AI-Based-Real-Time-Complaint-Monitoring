import { supabase } from "../config/supabaseClient";
import {
  ComplaintDB,
  ComplaintDivision,
  PublicComplaint,
  StudentComplaint,
  ComplaintPriority,
  ComplaintStatus,
} from "../models/complaintModel";
import { UserDB, Division } from "../models/userModel";
import { findDuplicateComplaints, categorizeComplaint } from "./nlpService";
import crypto from "crypto";

export type MonthlyComplaintAnalysisPoint = {
  month: string;
  resolved: number;
  pending: number;
  in_progress: number;
  predicted?: boolean;
};

export type DivisionStats = {
  division: string;
  count: number;
};

export type PriorityStats = {
  priority: string;
  count: number;
};

export type DashboardStats = {
  total: number;
  resolved: number;
  pending: number;
  inProgress: number;
};

// Helper function to determine status based on complaint age
const determineStatusByAge = (created_at: string, current_status: ComplaintStatus): ComplaintStatus => {
  // If already resolved, don't change it
  if (current_status === "resolved") {
    return "resolved";
  }

  const createdDate = new Date(created_at);
  const now = new Date();
  const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  // If unresolved for 7+ days, set to pending
  if (daysSinceCreation >= 7) {
    return "pending";
  }

  // If unresolved for < 7 days, set to in_progress
  return "in_progress";
};

// Mapping of specialist roles to their divisions
const roleDivisionMap: Record<string, string> = {
  "electrician": "electricity",
  "cleanliness_manager": "cleanliness",
  "hostel_manager": "hostel",
  "librarian": "library",
  "cafeteria_manager": "food",
  "transport_manager": "transport",
  // Note: "water", "infrastructure" map to admin if no specific role
};

// Keywords that indicate hostel-related context (override division categorization)
const hostelContextKeywords = ["hostel", "room", "dormitory", "dorm", "accommodation", "bed", "residence"];
const foodInHostelKeywords = ["food", "meal", "canteen", "dining"];

// Smart categorization: if complaint mentions both hostel AND food context, it's hostel's issue
const shouldAssignToHostelManager = (title: string, description: string, categorizedDivision: string): boolean => {
  const text = `${title} ${description}`.toLowerCase();
  const hasHostelContext = hostelContextKeywords.some(kw => text.includes(kw));
  const hasFoodContext = foodInHostelKeywords.some(kw => text.includes(kw));
  
  // If both hostel and food are mentioned, it's a hostel issue (food served IN hostel)
  return hasHostelContext && hasFoodContext;
};

// Find the best person to assign a complaint to
const findAssigneeForComplaint = async (
  division: string,
  title?: string,
  description?: string
): Promise<string | null> => {
  // Smart categorization: check if this is a hostel+food context issue
  let actualDivision = division;
  if (title && description && shouldAssignToHostelManager(title, description, division)) {
    actualDivision = "hostel";
    console.log(`🔄 Context-aware routing: food complaint mentions hostel, reassigning to hostel manager`);
  }

  // First, try to find a specialist for this division (electrician, cleanliness_manager, etc.)
  const specialistRole = Object.entries(roleDivisionMap).find(([_, div]) => div === actualDivision)?.[0];
  
  if (specialistRole) {
    const { data: specialist, error } = await supabase
      .from<UserDB>("users")
      .select("id, role, email")
      .eq("role", specialistRole)
      .limit(1);
    
    if (error) {
      console.error(`Error finding ${specialistRole}:`, error);
    }
    
    if (specialist && specialist.length > 0) {
      console.log(`✓ Found ${specialistRole} (${specialist[0].email}) to handle "${actualDivision}" complaint`);
      return specialist[0].id;
    } else {
      console.log(`⚠ No ${specialistRole} found for "${actualDivision}" division, falling back to admin`);
    }
  }

  // Fallback to admin for unassigned divisions (transport, water, infrastructure, other)
  console.log(`⚠ No specialist mapping for division "${actualDivision}", assigning to admin`);
  const { data: adminUsers, error: adminError } = await supabase
    .from<UserDB>("users")
    .select("id, role, email")
    .eq("role", "admin")
    .limit(1);

  if (adminError) {
    console.error(`Error finding admin:`, adminError);
  }

  if (adminUsers && adminUsers.length > 0) {
    console.log(`✓ Found admin (${adminUsers[0].email}) to handle "${actualDivision}" complaint`);
    return adminUsers[0].id;
  }

  console.log(`⚠ No assignee found for "${actualDivision}" division - leaving unassigned`);
  return null;
};

// Create a new complaint with AI categorization
export const createComplaint = async (
  title: string,
  description: string,
  raised_by: string
): Promise<PublicComplaint> => {
  // Use AI to categorize the complaint
  const { priority, division } = await categorizeComplaint(title, description);

  // Find the best person to assign the complaint to (specialist first, then division_head)
  let assigned_to: string | null = null;
  
  try {
    assigned_to = await findAssigneeForComplaint(division as string, title, description);
  } catch (err) {
    console.warn("Error finding assignee:", err);
  }

  // Check for similar complaints to assign cluster_id (exclude resolved ones)
  const { data: existingComplaints } = await supabase
    .from<ComplaintDB>("complaints")
    .select("*")
    .eq("division", division)
    .neq("status", "resolved") // Don't cluster with resolved complaints
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

  let cluster_id: string | null = null;

  if (existingComplaints && existingComplaints.length > 0) {
    console.log(`Found ${existingComplaints.length} active complaints in division "${division}" to check for clusters`);
    
    // Check for similar complaints using NLP
    const complaintsToCheck = [
      { title, description, id: "new", cluster_id: null },
      ...existingComplaints.map((c) => ({ 
        title: c.title, 
        description: c.description, 
        id: c.id,
        cluster_id: c.cluster_id 
      })),
    ];

    const { groups } = await findDuplicateComplaints(complaintsToCheck, 0.5);
    
    console.log(`Clustering found ${groups.length} groups: ${JSON.stringify(groups.map(g => g.map((x: any) => x.id)))}`);


    // Find if new complaint is in any group
    const similarGroup = groups.find((g) => g.some((c: any) => c.id === "new"));

    if (similarGroup && similarGroup.length > 1) {
      // Found similar complaints
      const existingWithCluster = similarGroup.find((c: any) => c.id !== "new" && c.cluster_id);
      if (existingWithCluster) {
        cluster_id = existingWithCluster.cluster_id;
      } else {
        // Create new cluster
        cluster_id = crypto.randomUUID();
      }
      
      // Update ALL similar complaints (both existing and new) with this cluster_id
      const similarIds = similarGroup.filter((c: any) => c.id !== "new").map((c: any) => c.id);
      if (similarIds.length > 0) {
        await supabase
          .from("complaints")
          .update({ cluster_id })
          .in("id", similarIds);
      }
    }
  }

  // Determine initial status based on complaint age (newly created = 0 days, so will be in_progress)
  const created_at = new Date().toISOString();
  const initial_status = determineStatusByAge(created_at, "pending");

  const payload = {
    title,
    description,
    division: division as ComplaintDivision,
    category: division, // Map division to category for database compatibility
    status: initial_status,
    priority: priority as ComplaintPriority,
    raised_by,
    assigned_to,
    cluster_id,
    created_at,
  };

  const { data, error } = await supabase.from("complaints").insert(payload).select().single();
  if (error) throw error;

  const created = data as ComplaintDB;
  return formatComplaintForPublic(created);
};

// Helper to format complaint for public view
const formatComplaintForPublic = (complaint: ComplaintDB, includeRaisedByName?: boolean): PublicComplaint => {
  return {
    id: complaint.id,
    title: complaint.title,
    description: complaint.description,
    division: complaint.division,
    status: complaint.status,
    priority: complaint.priority,
    raised_by: complaint.raised_by,
    assigned_to: complaint.assigned_to ?? null,
    cluster_id: complaint.cluster_id ?? null,
    created_at: complaint.created_at,
    resolved_at: complaint.resolved_at,
  };
};

// Get complaints raised by a specific user
export const getComplaintsForUser = async (userId: string): Promise<ComplaintDB[]> => {
  const { data, error } = await supabase
    .from<ComplaintDB>("complaints")
    .select("*")
    .eq("raised_by", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as ComplaintDB[];
};

// Get complaints assigned to a division head
export const getAssignedToUser = async (userId: string): Promise<ComplaintDB[]> => {
  const { data, error } = await supabase
    .from<ComplaintDB>("complaints")
    .select("*")
    .eq("assigned_to", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as ComplaintDB[];
};

// Get complaints for a specific division (for division heads)
export const getComplaintsByDivision = async (division: Division): Promise<PublicComplaint[]> => {
  const { data, error } = await supabase
    .from<ComplaintDB>("complaints")
    .select("*")
    .eq("division", division)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const complaints = data as ComplaintDB[];
  
  // Get unique user IDs
  const userIds = [...new Set(complaints.map(c => c.raised_by))];
  
  // Fetch user names
  const { data: users, error: userError } = await supabase
    .from<UserDB>("users")
    .select("id, name")
    .in("id", userIds);
  
  if (userError) console.error("Error fetching users:", userError);
  
  // Create a map for quick lookup
  const userMap = new Map(users?.map(u => [u.id, u.name]) || []);
  
  return complaints.map((complaint) => ({
    ...formatComplaintForPublic(complaint),
    raised_by_name: userMap.get(complaint.raised_by),
  }));
};

// Update complaint status (with cascade to all complaints in cluster)
export const updateComplaintStatus = async (
  complaintId: string,
  status: ComplaintStatus,
  userId: string
): Promise<{ complaint: PublicComplaint; cascaded: number }> => {
  // First get the complaint to check if it has a cluster_id
  const { data: complaint, error: fetchError } = await supabase
    .from("complaints")
    .select("*")
    .eq("id", complaintId)
    .single();

  if (fetchError) throw fetchError;

  const updates: Partial<ComplaintDB> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "resolved") {
    updates.resolved_at = new Date().toISOString();
  }

  // Update the primary complaint
  const { data, error } = await supabase
    .from("complaints")
    .update(updates)
    .eq("id", complaintId)
    .select()
    .single();

  if (error) throw error;

  let cascadedCount = 0;

  // CASCADE: If complaint has a cluster_id, update all complaints in the same cluster
  const typedComplaint = complaint as ComplaintDB;
  if (typedComplaint.cluster_id) {
    console.log(`Cascading status "${status}" to all complaints in cluster ${typedComplaint.cluster_id}`);
    
    const { data: cascadedComplaints, error: cascadeError } = await supabase
      .from("complaints")
      .update(updates)
      .eq("cluster_id", typedComplaint.cluster_id)
      .neq("id", complaintId)
      .select("id");
    
    if (!cascadeError && cascadedComplaints) {
      cascadedCount = cascadedComplaints.length;
      console.log(`✓ Cascade complete: updated ${cascadedCount} similar complaints in cluster ${typedComplaint.cluster_id}`);
    }
  }

  return {
    complaint: formatComplaintForPublic(data as ComplaintDB),
    cascaded: cascadedCount,
  };
};

// Get all complaints with role-based visibility
export const getAllComplaints = async (
  userRole: string,
  userId?: string,
  userDivision?: Division
): Promise<PublicComplaint[]> => {
  let query = supabase
    .from<ComplaintDB>("complaints")
    .select("*")
    .order("created_at", { ascending: false });

  // Division heads can only see their division
  if (userRole === "division_head" && userDivision) {
    query = query.eq("division", userDivision);
  }

  const { data, error } = await query;

  if (error) throw error;

  const complaints = data as ComplaintDB[];
  
  // Get unique user IDs
  const userIds = [...new Set(complaints.map(c => c.raised_by))];
  
  // Fetch user details if role allows
  let userMap = new Map<string, { name: string; email: string; department: string }>();
  if (userRole === "admin" || userRole === "division_head") {
    const { data: users, error: userError } = await supabase
      .from<UserDB>("users")
      .select("id, name, email, department")
      .in("id", userIds);
    
    if (userError) console.error("Error fetching users:", userError);
    userMap = new Map(users?.map(u => [u.id, { name: u.name, email: u.email, department: u.department || "N/A" }]) || []);
  }

  // Format based on role
  return complaints.map((complaint) => {
    const formatted = formatComplaintForPublic(complaint);
    
    // Only admins and division heads can see who raised the complaint
    if (userRole === "admin" || userRole === "division_head") {
      const userInfo = userMap.get(complaint.raised_by);
      formatted.raised_by_name = userInfo?.name;
      formatted.raised_by_email = userInfo?.email;
      formatted.raised_by_department = userInfo?.department;
    }

    return formatted;
  });
};

// Get all complaints with clustering information
export const getAllComplaintsWithClusters = async (
  userRole: string,
  userDivision?: Division
): Promise<any[]> => {
  const complaints = await getAllComplaints(userRole, undefined, userDivision);

  // Group by cluster_id
  const clusterMap = new Map<string, PublicComplaint[]>();
  const unclustered: PublicComplaint[] = [];

  complaints.forEach((complaint) => {
    if (complaint.cluster_id) {
      const existing = clusterMap.get(complaint.cluster_id) || [];
      existing.push(complaint);
      clusterMap.set(complaint.cluster_id, existing);
    } else {
      unclustered.push(complaint);
    }
  });

  // Format response
  const grouped = Array.from(clusterMap.entries()).map(([cluster_id, clusterComplaints]) => ({
    cluster_id,
    primary: clusterComplaints[0],
    similar_count: clusterComplaints.length - 1,
    similar_complaints: clusterComplaints.slice(1),
  }));

  // Build result: include all complaints but mark similar ones
  const result: any[] = [];

  // Add primary complaints with similar_ids
  grouped.forEach((g) => {
    result.push({
      ...g.primary,
      cluster_id: g.cluster_id,
      similar_count: g.similar_count,
      similar_ids: g.similar_complaints.map((c) => c.id),
      is_primary: true, // Mark as primary complaint
    });

    // Add similar complaints with is_similar flag (for data lookup, but frontend won't display)
    g.similar_complaints.forEach((complaint) => {
      result.push({
        ...complaint,
        cluster_id: g.cluster_id,
        similar_ids: g.similar_complaints.filter((c) => c.id !== complaint.id).map((c) => c.id),
        is_similar: true, // Mark as similar - frontend should skip in main list
      });
    });
  });

  // Add unclustered complaints
  result.push(...unclustered.map((c) => ({ ...c, is_primary: true })));

  return result;
};

// Update statuses based on complaint age (7+ days = pending, < 7 days = in_progress)
export const updateStatusesBasedOnAge = async (): Promise<{ updated: number }> => {
  // Fetch all unresolved complaints
  const { data: complaints, error } = await supabase
    .from<ComplaintDB>("complaints")
    .select("*")
    .neq("status", "resolved");

  if (error) {
    console.error("Error fetching complaints for status update:", error);
    return { updated: 0 };
  }

  if (!complaints || complaints.length === 0) {
    return { updated: 0 };
  }

  let updatedCount = 0;

  // Process each complaint
  for (const complaint of complaints) {
    const newStatus = determineStatusByAge(complaint.created_at, complaint.status);
    
    // Only update if status has changed
    if (newStatus !== complaint.status) {
      const { error: updateError } = await supabase
        .from("complaints")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", complaint.id);

      if (!updateError) {
        updatedCount++;
        console.log(`Updated complaint ${complaint.id}: ${complaint.status} → ${newStatus}`);
      }
    }
  }

  console.log(`✓ Status update complete: ${updatedCount} complaints updated based on age`);
  return { updated: updatedCount };
};

// Dashboard statistics
export const getDashboardStats = async (
  userRole: string,
  userDivision?: Division
): Promise<DashboardStats> => {
  let query = supabase.from<ComplaintDB>("complaints").select("status");

  if (userRole === "division_head" && userDivision) {
    query = query.eq("division", userDivision);
  }

  const { data, error } = await query;
  if (error) throw error;

  const stats: DashboardStats = {
    total: data?.length || 0,
    resolved: 0,
    pending: 0,
    inProgress: 0,
  };

  data?.forEach((c) => {
    if (c.status === "resolved") stats.resolved++;
    else if (c.status === "in_progress") stats.inProgress++;
    else if (c.status === "pending") stats.pending++;
  });

  return stats;
};

// Division-wise statistics
export const getDivisionStats = async (): Promise<DivisionStats[]> => {
  const { data, error } = await supabase
    .from<ComplaintDB>("complaints")
    .select("division");

  if (error) throw error;

  const divisionCount: Record<string, number> = {};
  data?.forEach((c) => {
    divisionCount[c.division] = (divisionCount[c.division] || 0) + 1;
  });

  return Object.entries(divisionCount).map(([division, count]) => ({
    division,
    count,
  }));
};

// Priority distribution statistics
export const getPriorityStats = async (
  userRole: string,
  userDivision?: Division
): Promise<PriorityStats[]> => {
  let query = supabase.from<ComplaintDB>("complaints").select("priority");

  if (userRole === "division_head" && userDivision) {
    query = query.eq("division", userDivision);
  }

  const { data, error } = await query;
  if (error) throw error;

  const priorityCount: Record<string, number> = {};
  data?.forEach((c) => {
    priorityCount[c.priority] = (priorityCount[c.priority] || 0) + 1;
  });

  return Object.entries(priorityCount).map(([priority, count]) => ({
    priority,
    count,
  }));
};

// Monthly trends
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatMonthLabel = (date: Date) => {
  return MONTH_NAMES[date.getUTCMonth()];
};

export const getMonthlyComplaintTrends = async (
  monthsTotal: number = 10,
  predictMonths: number = 3,
  userRole: string = "admin",
  userDivision?: Division
): Promise<MonthlyComplaintAnalysisPoint[]> => {
  const total = Math.max(3, monthsTotal);
  const predict = Math.min(Math.max(0, predictMonths), total - 1);
  const actualMonths = total - predict;

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (total - 1), 1));

  let query = supabase
    .from<ComplaintDB>("complaints")
    .select("status, created_at, resolved_at")
    .gte("created_at", start.toISOString());

  if (userRole === "division_head" && userDivision) {
    query = query.eq("division", userDivision);
  }

  const { data, error } = await query;
  if (error) throw error;

  console.log(`[Monthly Analysis] Fetched ${data?.length || 0} complaints from ${start.toISOString()}`);

  const bucket: Record<string, { resolved: number; pending: number; in_progress: number }> = {};

  (data || []).forEach((complaint) => {
    if (!complaint.created_at) return;

    let created = new Date(complaint.created_at);
    if (Number.isNaN(created.getTime())) {
      created = new Date(`${complaint.created_at}T00:00:00Z`);
    }
    if (Number.isNaN(created.getTime())) {
      return;
    }

    const createdYearMonth = `${created.getUTCFullYear()}-${String(created.getUTCMonth() + 1).padStart(2, '0')}`;
    
    if (!bucket[createdYearMonth]) {
      bucket[createdYearMonth] = { resolved: 0, pending: 0, in_progress: 0 };
    }

    // Count the complaint by its status
    const status = complaint.status || "in_progress";
    
    if (status === "resolved") {
      bucket[createdYearMonth].resolved++;
    } else if (status === "pending") {
      bucket[createdYearMonth].pending++;
    } else if (status === "in_progress") {
      bucket[createdYearMonth].in_progress++;
    }
  });

  const months: Date[] = [];
  for (let i = 0; i < total; i += 1) {
    months.push(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (total - 1 - i), 1)));
  }

  const points: MonthlyComplaintAnalysisPoint[] = months.map((date, index) => {
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    const counts = bucket[key] || { resolved: 0, pending: 0, in_progress: 0 };

    return {
      month: formatMonthLabel(date),
      resolved: counts.resolved,
      pending: counts.pending,
      in_progress: counts.in_progress,
      predicted: index >= actualMonths,
    };
  });

  // Add predictions
  if (predict > 0) {
    const recentActual = points.slice(Math.max(0, actualMonths - 3), actualMonths);
    const resolvedAvg =
      recentActual.reduce((sum, item) => sum + item.resolved, 0) / Math.max(1, recentActual.length);
    const pendingAvg =
      recentActual.reduce((sum, item) => sum + item.pending, 0) / Math.max(1, recentActual.length);
    const inProgressAvg =
      recentActual.reduce((sum, item) => sum + item.in_progress, 0) / Math.max(1, recentActual.length);

    for (let i = actualMonths; i < points.length; i += 1) {
      points[i].resolved = Math.max(0, Math.round(resolvedAvg));
      points[i].pending = Math.max(0, Math.round(pendingAvg));
      points[i].in_progress = Math.max(0, Math.round(inProgressAvg));
    }
  }

  return points;
};

// Retroactively cluster all existing complaints
export const reclusterAllComplaints = async (): Promise<{ clustered: number; groups: number }> => {
  console.log("Starting retroactive clustering of all complaints...");
  
  // Get all complaints from last 30 days
  const { data: allComplaints, error } = await supabase
    .from<ComplaintDB>("complaints")
    .select("*")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!allComplaints || allComplaints.length === 0) {
    return { clustered: 0, groups: 0 };
  }

  console.log(`Found ${allComplaints.length} total complaints to process`);

  // First, categorize any complaints without divisions
  const complaintsWithoutDivision = allComplaints.filter((c) => !c.division);
  
  if (complaintsWithoutDivision.length > 0) {
    console.log(`Categorizing ${complaintsWithoutDivision.length} complaints without division...`);
    for (const complaint of complaintsWithoutDivision) {
      const { priority, division } = await categorizeComplaint(complaint.title, complaint.description);
      await supabase
        .from("complaints")
        .update({ division, priority })
        .eq("id", complaint.id);
    }
  }

  // Clear all old cluster_ids to start fresh
  console.log("Clearing old cluster assignments...");
  await supabase
    .from("complaints")
    .update({ cluster_id: null })
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  // Refresh the complaints list after categorization
  let { data: refreshedComplaints } = await supabase
    .from<ComplaintDB>("complaints")
    .select("*")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false });

  if (!refreshedComplaints) refreshedComplaints = [];

  // Group by division
  const divisionGroups = refreshedComplaints.reduce((acc, complaint) => {
    const div = complaint.division || "other";
    if (!acc[div]) acc[div] = [];
    acc[div].push(complaint);
    return acc;
  }, {} as Record<string, ComplaintDB[]>);

  let totalClustered = 0;
  let totalGroups = 0;

  // Process each division separately with aggressive clustering
  for (const [division, complaints] of Object.entries(divisionGroups)) {
    if (complaints.length < 2) {
      console.log(`Skipping "${division}" division (only ${complaints.length} complaint)`);
      continue;
    }
    
    console.log(`\n📋 Processing "${division}" division: ${complaints.length} complaints`);
    
    // Include both title and description for better matching
    const complaintsToCheck = complaints.map((c) => ({
      title: c.title,
      description: c.description,
      id: c.id,
    }));

    // Use moderate threshold (0.5) for better clustering - catch similar complaints
    const { groups } = await findDuplicateComplaints(complaintsToCheck, 0.5);

    if (groups.length === 0) {
      console.log(`   No clusters found in ${division}`);
      continue;
    }

    console.log(`   Found ${groups.length} cluster(s)`);

    // Assign cluster IDs to grouped complaints
    for (const [idx, group] of groups.entries()) {
      if (group.length > 1) {
        const clusterId = crypto.randomUUID();
        const ids = group.map((c: any) => c.id);
        
        await supabase
          .from("complaints")
          .update({ cluster_id: clusterId })
          .in("id", ids);
        
        totalClustered += ids.length;
        totalGroups += 1;
        
        const sampleText = group[0].title.substring(0, 50);
        console.log(`   ✓ Cluster ${totalGroups}: ${ids.length} complaints grouped`);
        console.log(`     Sample: "${sampleText}..."`);
      }
    }
  }

  console.log(`\n✅ Retroactive clustering complete: ${totalClustered} complaints in ${totalGroups} groups`);
  return { clustered: totalClustered, groups: totalGroups };
};

// Get similar complaints by cluster_id
export const getSimilarComplaintsByClusterId = async (
  clusterId: string,
  userRole: string
): Promise<PublicComplaint[]> => {
  const { data, error } = await supabase
    .from<ComplaintDB>("complaints")
    .select("*")
    .eq("cluster_id", clusterId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const complaints = data as ComplaintDB[];
  
  // Get unique user IDs
  const userIds = [...new Set(complaints.map(c => c.raised_by))];
  
  // Fetch user names if role allows
  let userMap = new Map<string, string>();
  if (userRole === "admin" || userRole === "division_head") {
    const { data: users, error: userError } = await supabase
      .from<UserDB>("users")
      .select("id, name")
      .in("id", userIds);
    
    if (userError) console.error("Error fetching users:", userError);
    userMap = new Map(users?.map(u => [u.id, u.name]) || []);
  }

  // Format based on role
  return complaints.map((complaint) => {
    const formatted = formatComplaintForPublic(complaint);
    
    // Only admins and division heads can see who raised the complaint
    if (userRole === "admin" || userRole === "division_head") {
      formatted.raised_by_name = userMap.get(complaint.raised_by);
    }

    return formatted;
  });
};

// Get complaints assigned to user with clustering information
export const getAssignedToUserWithClusters = async (userId: string): Promise<any[]> => {
  const complaints = await getAssignedToUser(userId);

  // Group by cluster_id
  const clusterMap = new Map<string, ComplaintDB[]>();
  const unclustered: ComplaintDB[] = [];

  complaints.forEach((complaint) => {
    if (complaint.cluster_id) {
      const existing = clusterMap.get(complaint.cluster_id) || [];
      existing.push(complaint);
      clusterMap.set(complaint.cluster_id, existing);
    } else {
      unclustered.push(complaint);
    }
  });

  // Format response
  const result: any[] = [];

  // Add clustered complaints with similar info
  clusterMap.forEach((clusterComplaints, cluster_id) => {
    clusterComplaints.forEach((complaint, index) => {
      result.push({
        ...complaint,
        cluster_id,
        similar_count: clusterComplaints.length - 1,
        similar_ids: clusterComplaints.filter(c => c.id !== complaint.id).map(c => c.id),
        is_primary: index === 0, // First one is primary
      });
    });
  });

  // Add unclustered complaints
  result.push(...unclustered.map((c) => ({ ...c, is_primary: true })));

  return result;
};

// Reassign existing complaints to specialists and division heads
export const reassignAllComplaints = async (): Promise<{ reassigned: number; details: Record<string, number> }> => {
  console.log("=".repeat(60));
  console.log("🔄 Starting reassignment of all complaints...");
  console.log("=".repeat(60));
  
  // Get all complaints
  const { data: allComplaints, error } = await supabase
    .from<ComplaintDB>("complaints")
    .select("*");

  if (error) throw error;
  if (!allComplaints || allComplaints.length === 0) {
    console.log("No complaints found");
    return { reassigned: 0, details: {} };
  }

  console.log(`📋 Found ${allComplaints.length} total complaints to process\n`);

  let reassignedCount = 0;
  const details: Record<string, number> = {};
  const divisionBreakdown: Record<string, number> = {};

  // Group by division
  allComplaints.forEach(c => {
    const div = c.division || "other";
    divisionBreakdown[div] = (divisionBreakdown[div] || 0) + 1;
  });
  
  console.log("Division breakdown:");
  Object.entries(divisionBreakdown).forEach(([div, count]) => {
    console.log(`  - ${div}: ${count} complaint(s)`);
  });
  console.log("");

  // Process each complaint
  for (const complaint of allComplaints) {
    const newAssignee = await findAssigneeForComplaint(complaint.division || "other", complaint.title, complaint.description);
    
    if (newAssignee && newAssignee !== complaint.assigned_to) {
      // Find who we're assigning to
      const { data: assignee } = await supabase
        .from<UserDB>("users")
        .select("role, division, email")
        .eq("id", newAssignee)
        .single();

      const assignedRole = assignee?.role || "unknown";
      details[assignedRole] = (details[assignedRole] || 0) + 1;

      // Update the complaint
      const { error: updateError } = await supabase
        .from("complaints")
        .update({ assigned_to: newAssignee, updated_at: new Date().toISOString() })
        .eq("id", complaint.id);

      if (!updateError) {
        reassignedCount++;
        console.log(`✅ Complaint: "${complaint.title.substring(0, 40)}..."`);
        console.log(`   Division: ${complaint.division}`);
        console.log(`   Assigned to: ${assignedRole} (${assignee?.email})\n`);
      } else {
        console.error(`❌ Failed to update complaint ${complaint.id}:`, updateError);
      }
    }
  }

  console.log("=".repeat(60));
  console.log(`✅ Reassignment complete: ${reassignedCount}/${allComplaints.length} complaints reassigned`);
  console.log("Distribution by role:", details);
  console.log("=".repeat(60));
  return { reassigned: reassignedCount, details };
};


