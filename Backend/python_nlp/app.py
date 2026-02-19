from flask import Flask, request, jsonify
import os

app = Flask(__name__)

try:
    # Optional: use sentence-transformers if available for better similarity
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np
    EMBED_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
    USE_EMBEDDINGS = True
except Exception:
    EMBED_MODEL = None
    USE_EMBEDDINGS = False


severity_keywords = {
    "high": [
        "harassment", "ragging", "bullying", "assault", "abuse", "threat",
        "violence", "urgent", "critical", "severe", "emergency", "dangerous",
        "sexual", "discrimination", "immediate", "safety", "health risk",
    ],
    "medium": [
        "delay", "problem", "broken", "issue", "not working", "faulty",
        "complaint", "unhappy", "uncomfortable", "poor", "bad condition",
    ],
    "low": [
        "suggestion", "minor", "small", "feedback", "improvement", "enhancement",
        "could be better", "request",
    ],
}

# Division categorization keywords
division_keywords = {
    "cleanliness": [
        "clean", "dirty", "garbage", "trash", "waste", "dustbin", "sweep",
        "sanitation", "hygiene", "mess", "smell", "stink", "toilet", "washroom",
        "bathroom", "litter", "filth",
    ],
    "water": [
        "water", "tap", "pipe", "leak", "drinking water", "supply", "tank",
        "shortage", "pressure", "contaminated", "purifier", "filter", "overflow",
    ],
    "electricity": [
        "electricity", "power", "light", "bulb", "fan", "ac", "air condition",
        "socket", "plug", "switch", "outage", "blackout", "voltage", "wiring",
        "electrical", "generator",
    ],
    "hostel": [
        "hostel", "room", "bed", "mattress", "furniture", "cupboard", "wardrobe",
        "roommate", "accommodation", "dorm", "warden", "mess", "dining",
    ],
    "transport": [
        "transport", "bus", "vehicle", "driver", "route", "timing", "schedule",
        "late", "delay", "shuttle", "pick", "drop", "parking",
    ],
    "library": [
        "library", "book", "journal", "reading", "study", "librarian",
        "borrowing", "return", "silence", "computer", "internet",
    ],
    "food": [
        "food", "canteen", "cafeteria", "meal", "breakfast", "lunch", "dinner",
        "quality", "taste", "unhygienic", "cook", "menu", "eating", "plate",
    ],
    "infrastructure": [
        "building", "infrastructure", "construction", "repair", "maintenance",
        "wall", "ceiling", "floor", "door", "window", "paint", "leak", "crack",
    ],
}


@app.route('/api/categorize', methods=['POST'])
def categorize():
    data = request.get_json() or {}
    title = (data.get('title') or '') + ' ' + (data.get('description') or '')
    text = title.lower()

    # Determine priority
    priority = 'medium'
    for kw in severity_keywords['high']:
        if kw in text:
            priority = 'high'
            break
    if priority != 'high':
        for kw in severity_keywords['medium']:
            if kw in text:
                priority = 'medium'
                break
        for kw in severity_keywords['low']:
            if kw in text:
                priority = 'low'
                break

    # Determine division
    division_scores = {}
    for div, keywords in division_keywords.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            division_scores[div] = score
    
    # Select division with highest score
    if division_scores:
        division = max(division_scores, key=division_scores.get)
    else:
        division = 'other'

    return jsonify({'priority': priority, 'division': division})


@app.route('/api/find_duplicates', methods=['POST'])
def find_duplicates():
    payload = request.get_json() or {}
    complaints = payload.get('complaints', [])
    threshold = float(payload.get('similarityThreshold', 0.6))

    texts = [((c.get('title') or '') + ' ' + (c.get('description') or '')).lower() for c in complaints]

    if USE_EMBEDDINGS and EMBED_MODEL is not None:
        embs = EMBED_MODEL.encode(texts, convert_to_numpy=True)
        sim = cosine_similarity(embs)
        groups = []
        processed = set()
        for i in range(len(texts)):
            if i in processed:
                continue
            group = [i]
            processed.add(i)
            for j in range(i + 1, len(texts)):
                if j in processed:
                    continue
                if sim[i, j] >= threshold:
                    group.append(j)
                    processed.add(j)
            if len(group) > 1:
                groups.append(group)

        unique = [i for i in range(len(texts)) if not any(i in g for g in groups)]
        # return indices; backend will map to ids
        return jsonify({'groups': groups, 'unique': unique})
    else:
        # fallback: jaccard on word sets
        def words(s):
            return set([w for w in s.split() if len(w) > 3])

        sets = [words(t) for t in texts]
        groups = []
        processed = set()
        for i in range(len(sets)):
            if i in processed:
                continue
            group = [i]
            processed.add(i)
            for j in range(i + 1, len(sets)):
                if j in processed:
                    continue
                inter = len(sets[i].intersection(sets[j]))
                union = len(sets[i].union(sets[j]))
                sim = (inter / union) if union > 0 else 0
                if sim >= threshold:
                    group.append(j)
                    processed.add(j)
            if len(group) > 1:
                groups.append(group)

        unique = [i for i in range(len(sets)) if not any(i in g for g in groups)]
        return jsonify({'groups': groups, 'unique': unique})


if __name__ == '__main__':
    port = int(os.environ.get('PY_NLP_PORT', 5000))
    app.run(host='0.0.0.0', port=port)
