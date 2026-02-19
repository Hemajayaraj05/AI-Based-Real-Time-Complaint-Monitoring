// NLP service wrapper: prefer Python microservice if available, otherwise fallback to TypeScript implementations

const getFetch = async () => {
  if (typeof (globalThis as any).fetch === "function") return (globalThis as any).fetch.bind(globalThis);
  try {
    const mod = await import("node-fetch");
    return (mod.default || mod) as any;
  } catch (err) {
    throw new Error("No fetch available. Install node-fetch or run on Node 18+");
  }
};

// Original TS fallback implementations
const calculateSimilarityTS = (text1: string, text2: string): number => {
  // Normalize text
  const norm1 = text1.toLowerCase().trim();
  const norm2 = text2.toLowerCase().trim();
  
  // If texts are identical or very similar, return high score
  if (norm1 === norm2) return 1.0;
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.95;
  
  // Split into words (1+ characters for better matching)
  const words1 = norm1.split(/[\s\-,;.!?]+/).filter((w) => w.length > 0);
  const words2 = norm2.split(/[\s\-,;.!?]+/).filter((w) => w.length > 0);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Remove common stop words for better matching
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'by', 'to', 'and', 'or', 'of', 'for']);
  const relevantWords1 = new Set(words1.filter(w => !stopWords.has(w)));
  const relevantWords2 = new Set(words2.filter(w => !stopWords.has(w)));
  
  if (relevantWords1.size === 0 || relevantWords2.size === 0) {
    // Fall back to all words if no relevant words found
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = [...set1].filter((w) => set2.has(w)).length;
    const union = new Set([...set1, ...set2]).size;
    return intersection / union;
  }
  
  // Jaccard similarity on relevant words
  const intersection = [...relevantWords1].filter((w) => relevantWords2.has(w)).length;
  const union = new Set([...relevantWords1, ...relevantWords2]).size;
  const jaccardSimilarity = intersection / union;
  
  // Word match ratio
  const minSize = Math.min(relevantWords1.size, relevantWords2.size);
  const wordMatchRatio = intersection / minSize;
  
  // Aggressive weighted average: prioritize word match ratio
  const similarity = jaccardSimilarity * 0.2 + wordMatchRatio * 0.8;
  
  return Math.min(similarity, 0.95);
};

const severityKeywords: Record<string, string[]> = {
  high: [
    "harassment",
    "ragging",
    "bullying",
    "assault",
    "abuse",
    "threat",
    "violence",
    "urgent",
    "critical",
    "severe",
    "emergency",
    "dangerous",
    "sexual",
    "discrimination",
  ],
  medium: [
    "delay",
    "problem",
    "broken",
    "issue",
    "not working",
    "faulty",
    "complaint",
    "unhappy",
    "uncomfortable",
  ],
  low: ["suggestion", "minor", "small", "feedback", "improvement", "enhancement"],
};

const categorizePriorityTS = (title: string, description: string): string => {
  const text = `${title} ${description}`.toLowerCase();
  for (const keyword of severityKeywords.high) if (text.includes(keyword)) return "high";
  for (const keyword of severityKeywords.medium) if (text.includes(keyword)) return "medium";
  for (const keyword of severityKeywords.low) if (text.includes(keyword)) return "low";
  return "medium";
};

// Division keyword mapping for fallback categorization
const divisionKeywords: Record<string, string[]> = {
  electricity: ["light", "bulb", "socket", "wire", "electrical", "current", "short circuit", "switch", "fan", "heater", "appliance", "plug"],
  water: ["water", "pipe", "leak", "tap", "drain", "sewage", "plumbing", "supply", "pressure", "overflow"],
  cleanliness: ["clean", "dirt", "trash", "dust", "hygiene", "garbage", "waste", "floor", "sweep", "sanitation", "bathroom", "toilet"],
  hostel: ["hostel", "room", "dormitory", "dorm", "accommodation", "bed", "residence", "hall", "warden"],
  food: ["food", "meal", "canteen", "dining", "kitchen", "cook", "taste", "quality", "nutrition", "cafe", "cafeteria"],
  library: ["library", "book", "study", "quiet", "librarian", "shelf", "resource"],
  transport: ["bus", "transport", "vehicle", "ride", "route", "driver", "shuttle"],
  infrastructure: ["building", "roof", "wall", "floor", "structure", "repair", "construction"],
};

const categorizeDivisionTS = (title: string, description: string): string => {
  const text = `${title} ${description}`.toLowerCase();
  
  // Check each division's keywords
  for (const [division, keywords] of Object.entries(divisionKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return division;
      }
    }
  }
  
  return "other";
};

// Attempt to call Python microservice
const PY_NLP_URL = process.env.PY_NLP_URL || "http://localhost:5000";

export const calculateSimilarity = async (text1: string, text2: string): Promise<number> => {
  try {
    const f = await getFetch();
    const res = await f(`${PY_NLP_URL}/api/find_duplicates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaints: [{ title: text1, description: "" }, { title: text2, description: "" }], similarityThreshold: 0.6 }),
    });
    if (!res.ok) throw new Error("py service error");
    const data = await res.json();
    // service returns groups of indices; if group contains both 0 and 1, similarity >= threshold
    const inSame = (data.groups || []).some((g: number[]) => g.includes(0) && g.includes(1));
    return inSame ? 1 : 0;
  } catch (e) {
    return calculateSimilarityTS(text1, text2);
  }
};

export const findDuplicateComplaints = async (
  complaints: any[],
  similarityThreshold: number = 0.6
): Promise<{ groups: any[][]; unique: any[] }> => {
  try {
    const f = await getFetch();
    const res = await f(`${PY_NLP_URL}/api/find_duplicates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaints, similarityThreshold }),
    });
    if (!res.ok) throw new Error("py service error");
    const data = await res.json();
    // data.groups contains arrays of indices -> map to complaint objects
    const groups = (data.groups || []).map((grp: number[]) => grp.map((i: number) => complaints[i]));
    const unique = (data.unique || []).map((i: number) => complaints[i]);
    return { groups, unique };
  } catch (e) {
    // fallback to TS implementation
    const groups: any[][] = [];
    const processed = new Set<string>();

    for (let i = 0; i < complaints.length; i++) {
      if (processed.has(complaints[i].id)) continue;
      const group = [complaints[i]];
      processed.add(complaints[i].id);
      for (let j = i + 1; j < complaints.length; j++) {
        if (processed.has(complaints[j].id)) continue;
        const similarity = calculateSimilarityTS(
          `${complaints[i].title} ${complaints[i].description}`,
          `${complaints[j].title} ${complaints[j].description}`
        );
        if (similarity >= similarityThreshold) {
          group.push(complaints[j]);
          processed.add(complaints[j].id);
        }
      }
      if (group.length > 1) {
        groups.push(group);
      }
    }
    const unique = complaints.filter((c) => !groups.flat().some((gc) => gc.id === c.id));
    return { groups, unique };
  }
};

export const categorizePriority = async (title: string, description: string): Promise<string> => {
  try {
    const f = await getFetch();
    const res = await f(`${PY_NLP_URL}/api/categorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) throw new Error("py service error");
    const data = await res.json();
    return data.priority || categorizePriorityTS(title, description);
  } catch (e) {
    return categorizePriorityTS(title, description);
  }
};

// New function to categorize both priority and division
export const categorizeComplaint = async (
  title: string,
  description: string
): Promise<{ priority: string; division: string }> => {
  try {
    const f = await getFetch();
    const res = await f(`${PY_NLP_URL}/api/categorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) throw new Error("py service error");
    const data = await res.json();
    return {
      priority: data.priority || categorizePriorityTS(title, description),
      division: data.division || categorizeDivisionTS(title, description),
    };
  } catch (e) {
    return {
      priority: categorizePriorityTS(title, description),
      division: categorizeDivisionTS(title, description),
    };
  }
};
