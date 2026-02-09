import { DecisionAnalysis, ChatMessage } from "../types";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/* ============================
   SYSTEM PROMPT (CORE BRAIN)
============================ */

const SYSTEM_PROMPT = `
You are ShouldI?, a world-class strategic decision engine.

You MUST return ONLY valid JSON.
NO markdown. NO explanations. NO extra text.

STRICT OUTPUT FORMAT:

{
  "chatResponse": string,

  "panel1": {
    "title": string,
    "narration": string
  },

  "panel2": {
    "title": string,
    "questions": string[]
  },

  "panel3": {
    "title": string,
    "options": [
      {
        "name": string,
        "description": string,
        "pros": string[],
        "cons": string[],
        "tradeOff": string
      }
    ]
  },

  "panel4": {
    "title": string,
    "verdict": string,
    "reasoning": string,
    "assumptions": string[]
  },

  "panel5": {
    "title": string,
    "confidenceScore": number,
    "explanation": string
  }
}

RULES:
- EXACTLY 3 options in panel3
- EXACTLY 3–5 questions in panel2
- confidenceScore must be between 0 and 100
- Use cinematic, visual metaphors (paths, roads, trade-offs)
- Tone: grounded, thoughtful, decisive
- Avoid long paragraphs
`;

/* ============================
   MAIN ANALYSIS FUNCTION
============================ */

export async function analyzeDecision(
  history: ChatMessage[]
): Promise<{ analysis: DecisionAnalysis; usedFallback: boolean }> {
  if (!GROQ_API_KEY) {
    console.error("API key not found");
    throw new Error("KEY_NOT_FOUND");
  }

  console.log("API Key present:", GROQ_API_KEY ? "Yes" : "No");

  // Keep history short for speed + cost
  const trimmedHistory = history.slice(-6);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...trimmedHistory.map((m) => ({
      role: m.role,
      content: m.text,
    })),
  ];

  try {
    console.log("Making API request to Groq...");
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        temperature: 0.7,
        messages,
      }),
    });

    console.log("Response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error:", res.status, errorText);
      if (res.status === 429) throw new Error("QUOTA_LIMIT");
      throw new Error("GROQ_API_ERROR");
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;

    console.log("Response received, length:", text?.length);

    if (!text) {
      console.error("Empty response from API");
      throw new Error("EMPTY_RESPONSE");
    }

    const parsed = JSON.parse(text);

    return {
      analysis: parsed as DecisionAnalysis,
      usedFallback: false,
    };
  } catch (err: any) {
    console.error("Error in analyzeDecision:", err);
    const msg = err?.message?.toLowerCase() || "";

    if (msg.includes("quota") || msg.includes("429")) {
      throw new Error("QUOTA_LIMIT");
    }

    if (msg.includes("key")) {
      throw new Error("KEY_NOT_FOUND");
    }

    throw new Error("DECISION_ENGINE_FAILURE");
  }
}