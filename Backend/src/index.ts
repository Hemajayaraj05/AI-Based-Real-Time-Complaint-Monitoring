import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import complaintRoutes from "./routes/complaintRoutes";
import debugRouter from "./routes/debugRoutes";
import { updateStatusesBasedOnAge } from "./services/complaintService";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, message: "Complaint backend running" }));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api", debugRouter);

// Periodic status update based on complaint age (every 1 hour)
const STATUS_UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour
setInterval(async () => {
  console.log("Running scheduled status update based on complaint age...");
  try {
    await updateStatusesBasedOnAge();
  } catch (err) {
    console.error("Error in scheduled status update:", err);
  }
}, STATUS_UPDATE_INTERVAL);

// Run once on startup
updateStatusesBasedOnAge()
  .then(result => console.log(`Initial status update: ${result.updated} complaints updated`))
  .catch(err => console.error("Error in initial status update:", err));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Status auto-update scheduled every ${STATUS_UPDATE_INTERVAL / 1000 / 60} minutes`);
});
