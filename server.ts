import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Safe JSON parser: strips code fences, falls back to plain text
function safeParseGeminiResponse(raw: string): { explanation: string; followUps: string[] } {
  let cleaned = raw.trim();
  // Strip ```json ... ``` or ``` ... ```
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/i, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed.explanation === "string" && parsed.explanation.trim()) {
      const followUps =
        Array.isArray(parsed.followUps) && parsed.followUps.length >= 2
          ? parsed.followUps.slice(0, 2)
          : [
              "Can you give me another everyday example?",
              "Why is this concept important to learn?",
            ];
      return {
        explanation: parsed.explanation.trim(),
        followUps,
      };
    }
  } catch (err) {
    console.warn("JSON parsing failed, falling back to plain text:", err);
  }

  // If parsing fails, show the plain text reply as the explanation instead of failing!
  return {
    explanation: cleaned || raw,
    followUps: [
      "Can you give me another everyday example?",
      "Can we try a practice question on this?",
    ],
  };
}

// Model helper with primary and fallback models
const PRIMARY_MODEL = "gemini-3.5-flash-lite";
const FALLBACK_MODELS = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];

async function generateWithTimeout(
  ai: GoogleGenAI,
  prompt: string,
  systemInstruction: string,
  timeoutMs = 19000
): Promise<string> {
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];

  for (const model of modelsToTry) {
    try {
      console.log(`[DoubtBuddy] Calling model: ${model}`);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      );

      const generatePromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const text = response.text;
      if (text) {
        console.log(`[DoubtBuddy] Received response from ${model}`);
        return text;
      }
    } catch (err) {
      console.warn(`[DoubtBuddy] Attempt with ${model} failed:`, err);
    }
  }

  throw new Error("All Gemini model attempts failed or timed out.");
}

// POST /api/ask
app.post("/api/ask", async (req, res) => {
  try {
    const { question, subject = "General", mode = "normal", previousContext = "" } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Please type a question first." });
    }

    const ai = getAiClient();
    if (!ai) {
      console.warn("GEMINI_API_KEY not configured");
      return res.status(500).json({ error: "Oops, I couldn’t answer that. Please try again." });
    }

    const systemInstruction = `You are DoubtBuddy, a patient and cheerful tutor for Class 6 to 8. The chosen subject is ${subject}. Explain in simple words, step by step, with one small example, in under 150 words. Never just give the final answer. Return JSON only in this format: {"explanation": "...", "followUps": ["...", "..."]}`;

    let userPrompt = "";
    if (mode === "simpler") {
      userPrompt = `The student asked: "${question}".
Previous explanation: "${previousContext}".
Please re-explain this concept in an even simpler way using a fun everyday analogy (like pizza, sports, a video game, or pets). Under 150 words. Return JSON only: {"explanation": "...", "followUps": ["...", "..."]}`;
    } else if (mode === "challenge") {
      userPrompt = `The student asked: "${question}".
Topic context: "${previousContext}".
Please present one fun, slightly harder related challenge question to stretch their thinking. Include a friendly encouraging note and a tiny hint so they can solve it! Under 150 words. Return JSON only: {"explanation": "...", "followUps": ["...", "..."]}`;
    } else if (mode === "alternative") {
      userPrompt = `The student asked: "${question}".
Previous explanation: "${previousContext}".
Please re-explain this in a completely different way! Use an alternative mental model or a visual real-world experiment. Under 150 words. Return JSON only: {"explanation": "...", "followUps": ["...", "..."]}`;
    } else {
      userPrompt = `Student question: "${question}".
Explain step-by-step with one small example. Keep it cheerful, patient, under 150 words, and never just give the final answer. Return JSON only: {"explanation": "...", "followUps": ["...", "..."]}`;
    }

    const rawText = await generateWithTimeout(ai, userPrompt, systemInstruction, 19000);
    const parsed = safeParseGeminiResponse(rawText);

    return res.json({
      explanation: parsed.explanation,
      followUps: parsed.followUps,
      rawResponse: rawText,
    });
  } catch (error: any) {
    console.error("[DoubtBuddy Server Error in /api/ask]:", error);
    return res.status(500).json({
      error: "Oops, I couldn’t answer that. Please try again.",
      details: error?.message || String(error),
    });
  }
});

// POST /api/quiz
app.post("/api/quiz", async (req, res) => {
  try {
    const { topic, subject = "General", context = "" } = req.body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({ error: "Please specify a topic for the quiz." });
    }

    const ai = getAiClient();
    if (!ai) {
      console.warn("GEMINI_API_KEY not configured");
      return res.status(500).json({ error: "Oops, I couldn’t answer that. Please try again." });
    }

    const systemInstruction = `You are DoubtBuddy, an encouraging quizmaster for Class 6 to 8 students. Create 3 engaging multiple-choice questions on ${subject} regarding "${topic}". Each question must have exactly 4 choices, an answerIndex (0, 1, 2, or 3), and a cheerful 'why' explanation. Return JSON only.`;

    const prompt = `Create a 3-question multiple choice quiz for Class 6-8 students based on: "${topic}".
Context: "${context}".
Return JSON only matching:
{
  "questions": [
    {
      "q": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "why": "Brief friendly explanation of why this answer is correct."
    }
  ]
}`;

    const rawText = await generateWithTimeout(ai, prompt, systemInstruction, 19000);

    let cleaned = rawText.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.replace(/^```json\s*/i, "");
    else if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```\s*/i, "");
    if (cleaned.endsWith("```")) cleaned = cleaned.replace(/\s*```$/, "");
    cleaned = cleaned.trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn("Failed to parse quiz JSON:", parseErr);
      throw parseErr;
    }

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error("Invalid questions array");
    }

    const sanitizedQuestions = parsed.questions.slice(0, 3).map((item: any, i: number) => {
      const options =
        Array.isArray(item.options) && item.options.length >= 4
          ? item.options.slice(0, 4)
          : ["Choice 1", "Choice 2", "Choice 3", "Choice 4"];
      let answerIndex = Number(item.answerIndex);
      if (isNaN(answerIndex) || answerIndex < 0 || answerIndex > 3) {
        answerIndex = 0;
      }
      return {
        q: String(item.q || `Question ${i + 1} on ${topic}`),
        options,
        answerIndex,
        why: String(item.why || "Great job exploring this concept!"),
      };
    });

    return res.json({
      questions: sanitizedQuestions,
      rawResponse: rawText,
    });
  } catch (error: any) {
    console.error("[DoubtBuddy Server Error in /api/quiz]:", error);
    return res.status(500).json({
      error: "Oops, I couldn’t answer that. Please try again.",
      details: error?.message || String(error),
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DoubtBuddy server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start DoubtBuddy server:", err);
  process.exit(1);
});
