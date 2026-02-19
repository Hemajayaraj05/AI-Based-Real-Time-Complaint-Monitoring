import { Router, Request, Response } from "express";
import { supabase } from "../config/supabaseClient";
import { ComplaintDB } from "../models/complaintModel";

const debugRouter = Router();

// DEBUG: Check clustering status of all complaints
debugRouter.get("/debug/clustering-status", async (req: Request, res: Response) => {
  try {
    const { data: complaints, error } = await (supabase
      .from("complaints")
      .select("id, title, division, cluster_id, created_at") as any)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    // Group by cluster_id
    const clustered: Record<string, any[]> = {};
    const unclustered: any[] = [];

    complaints?.forEach((c: any) => {
      if (c.cluster_id) {
        if (!clustered[c.cluster_id]) clustered[c.cluster_id] = [];
        clustered[c.cluster_id].push(c);
      } else {
        unclustered.push(c);
      }
    });

    const summary = {
      total: complaints?.length || 0,
      clustered_groups: Object.keys(clustered).length,
      unclustered: unclustered.length,
      details: {
        clusters: Object.entries(clustered).map(([cluster_id, complaints]: [string, any[]]) => ({
          cluster_id,
          count: complaints.length,
          complaints: complaints.map((c) => ({
            id: c.id,
            title: c.title,
            division: c.division,
          })),
        })),
        unclustered: unclustered.map((c) => ({
          id: c.id,
          title: c.title,
          division: c.division,
        })),
      },
    };

    return res.json(summary);
  } catch (err: any) {
    console.error("Debug error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// DEBUG: Check similarity between two complaints (test the algorithm)
debugRouter.post("/debug/test-similarity", async (req: Request, res: Response) => {
  try {
    const { text1, text2, threshold = 0.4 } = req.body;

    if (!text1 || !text2) {
      return res.status(400).json({ error: "text1 and text2 required" });
    }

    // Use the same similarity algorithm as nlpService
    const calculateSimilarity = (t1: string, t2: string): number => {
      const norm1 = t1.toLowerCase().trim();
      const norm2 = t2.toLowerCase().trim();

      if (norm1 === norm2) return 1.0;
      if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.9;

      const words1 = norm1.split(/\s+/).filter((w) => w.length > 1);
      const words2 = norm2.split(/\s+/).filter((w) => w.length > 1);

      if (words1.length === 0 || words2.length === 0) return 0;

      const set1 = new Set(words1);
      const set2 = new Set(words2);
      const intersection = [...set1].filter((w) => set2.has(w)).length;
      const union = new Set([...set1, ...set2]).size;
      const jaccardSimilarity = intersection / union;

      const minSize = Math.min(set1.size, set2.size);
      const wordMatchRatio = intersection / minSize;

      const similarity = jaccardSimilarity * 0.3 + wordMatchRatio * 0.7;
      return Math.min(similarity, 0.95);
    };

    const score = calculateSimilarity(text1, text2);
    const matches = score >= threshold;

    return res.json({
      text1,
      text2,
      threshold,
      similarity_score: score.toFixed(4),
      matches,
      words_text1: text1.toLowerCase().split(/\s+/).filter((w: string) => w.length > 1),
      words_text2: text2.toLowerCase().split(/\s+/).filter((w: string) => w.length > 1),
    });
  } catch (err: any) {
    console.error("Test similarity error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default debugRouter;
