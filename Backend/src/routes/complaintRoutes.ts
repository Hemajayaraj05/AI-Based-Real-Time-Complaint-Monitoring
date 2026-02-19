import { Router } from "express";
import {
  raiseComplaint,
  myComplaints,
  assignedToMe,
  updateStatus,
  allComplaints,
  getSimilarComplaints,
  monthlyComplaintAnalysis,
  dashboardStats,
  divisionStats,
  priorityStatsEndpoint,
  reclusterComplaints,
  reassignComplaints,
  updateComplaintStatusesByAge,
  debugAssignments,
} from "../controllers/complaintController";
import authMiddleware from "../middleware/authMiddleware";
import { requireAdmin, requireAdminOrDivisionHead } from "../middleware/roleMiddleware";

const router = Router();

// Complaint CRUD operations
router.post("/", authMiddleware, raiseComplaint);
router.get("/my", authMiddleware, myComplaints);
router.get("/assigned", authMiddleware, assignedToMe);
router.get("/all", authMiddleware, allComplaints);
router.get("/cluster/:clusterId", authMiddleware, getSimilarComplaints);
router.get("/debug/assignments", authMiddleware, debugAssignments);
router.patch("/:complaintId/status", authMiddleware, updateStatus);

// Analytics endpoints
router.get("/stats/dashboard", authMiddleware, dashboardStats);
router.get("/stats/division", authMiddleware, requireAdmin, divisionStats);
router.get("/stats/priority", authMiddleware, priorityStatsEndpoint);
router.get("/analysis/monthly", authMiddleware, monthlyComplaintAnalysis);

// Utility endpoints (Admin only)
router.post("/utils/recluster", authMiddleware, requireAdmin, reclusterComplaints);
router.post("/utils/reassign", authMiddleware, requireAdmin, reassignComplaints);
router.post("/utils/update-statuses", authMiddleware, requireAdmin, updateComplaintStatusesByAge);

export default router;
