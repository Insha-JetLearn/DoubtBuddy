import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SubjectBar } from "./components/SubjectBar";
import { ChatArea } from "./components/ChatArea";
import { ChatInput } from "./components/ChatInput";
import { QuizModal } from "./components/QuizModal";
import { Message, Subject, QuizQuestion } from "./types";
import { triggerStarBurst } from "./utils/confetti";

const WELCOME_MESSAGES: Record<Subject, string> = {
  Maths:
    "Hello there! 🦉 I'm DoubtBuddy, your patient math tutor for Class 6-8. Stuck on fractions, algebra, geometry, or word problems? Ask me anything, and we'll break it down step by step!",
  Science:
    "Welcome to Science! 🔬 I'm DoubtBuddy! Curious about cells, forces, electricity, or why things happen in nature? Tell me your doubt—no question is too small!",
  English:
    "Hi bookworm! 📚 I'm DoubtBuddy, here to help with grammar, tenses, figures of speech, or creative writing. What doubt can we solve together?",
  Social:
    "Greetings explorer! 🌍 DoubtBuddy here to uncover history, maps, geography, and how our government works. What doubt are you curious about today?",
};

// Safe client-side JSON parser: strips code fences, falls back to plain text
function safeExtractExplanation(data: any): { explanation: string; followUps: string[] } {
  // If already parsed object with explanation
  if (data && typeof data.explanation === "string" && data.explanation.trim()) {
    const followUps =
      Array.isArray(data.followUps) && data.followUps.length >= 2
        ? data.followUps.slice(0, 2)
        : [
            "Can you give me another everyday example?",
            "Why is this concept important to learn?",
          ];
    return {
      explanation: data.explanation.trim(),
      followUps,
    };
  }

  // If raw string returned
  const raw = typeof data === "string" ? data : data?.rawResponse || JSON.stringify(data);
  let cleaned = String(raw).trim();
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
      return {
        explanation: parsed.explanation.trim(),
        followUps:
          Array.isArray(parsed.followUps) && parsed.followUps.length >= 2
            ? parsed.followUps.slice(0, 2)
            : ["Can you explain more?", "Give me another example!"],
      };
    }
  } catch (err) {
    console.warn("[DoubtBuddy] Client JSON parse fallback to plain text:", err);
  }

  // Fallback: If parsing fails, show the plain text reply as the explanation instead of failing!
  return {
    explanation: cleaned || "Here is what I found for you!",
    followUps: ["Tell me more about this", "Can you give me a real-life example?"],
  };
}

export default function App() {
  const [stars, setStars] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("doubtbuddy_stars");
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [starGainedTrigger, setStarGainedTrigger] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem("doubtbuddy_theme");
      if (savedTheme) return savedTheme === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  const [selectedSubject, setSelectedSubject] = useState<Subject>("Maths");
  const [isLoading, setIsLoading] = useState(false);

  // Initial welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "tutor",
      text: WELCOME_MESSAGES.Maths,
      timestamp: Date.now(),
      subject: "Maths",
      followUps: [
        "Why is a negative × negative = positive?",
        "What is the easiest way to solve fractions?",
      ],
    },
  ]);

  // Quiz state
  const [activeQuiz, setActiveQuiz] = useState<{
    topic: string;
    subject: string;
    questions: QuizQuestion[];
  } | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("doubtbuddy_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("doubtbuddy_theme", "light");
    }
  }, [isDarkMode]);

  // Save stars to localStorage
  const awardStars = (count: number) => {
    setStars((prev) => {
      const next = prev + count;
      try {
        localStorage.setItem("doubtbuddy_stars", String(next));
      } catch (err) {
        console.error("Storage error:", err);
      }
      return next;
    });
    setStarGainedTrigger((prev) => prev + 1);
    triggerStarBurst();
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Handle subject switch
  const handleSelectSubject = (subject: Subject) => {
    if (subject === selectedSubject) return;
    setSelectedSubject(subject);

    setMessages((prev) => [
      ...prev,
      {
        id: `subject-switch-${Date.now()}`,
        sender: "tutor",
        text: WELCOME_MESSAGES[subject],
        timestamp: Date.now(),
        subject,
        followUps:
          subject === "Maths"
            ? ["How to find perimeter of rectangle?", "What are prime numbers?"]
            : subject === "Science"
            ? ["Why do plants need sunlight?", "What is gravity?"]
            : subject === "English"
            ? ["What is an adjective?", "Explain metaphor vs simile"]
            : ["Why do we have seasons?", "Why do we need a Constitution?"],
      },
    ]);
  };

  // Send a question or prompt to the Gemini API with a 20-second timeout
  const handleSendMessage = async (
    questionText: string,
    mode: "normal" | "simpler" | "challenge" | "alternative" = "normal",
    previousContext = ""
  ) => {
    if (!questionText.trim() || isLoading) return;

    // Show student's question as a bubble on the right
    const userMessageId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      sender: "user",
      text: questionText,
      timestamp: Date.now(),
      subject: selectedSubject,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // 1 star for every question asked!
    awardStars(1);

    // 20-second timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new Error("Timeout: Gemini request exceeded 20 seconds"));
    }, 20000);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          question: questionText,
          subject: selectedSubject,
          mode,
          previousContext,
        }),
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      // Log the raw Gemini response to the browser console
      console.log("[DoubtBuddy] Raw Gemini response:", data.rawResponse || data);

      if (!response.ok) {
        throw new Error(data?.error || `Server returned ${response.status}`);
      }

      // Safe JSON parsing: strip code fences & fallback to plain text if needed
      const parsed = safeExtractExplanation(data);

      const tutorMessage: Message = {
        id: `tutor-${Date.now()}`,
        sender: "tutor",
        text: parsed.explanation,
        timestamp: Date.now(),
        subject: selectedSubject,
        followUps: parsed.followUps,
        mode,
      };

      setMessages((prev) => [...prev, tutorMessage]);
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Log error to browser console
      console.error("[DoubtBuddy] Error calling Gemini API:", error);

      // Show "Oops, I couldn’t answer that. Please try again."
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "tutor",
          text: "Oops, I couldn’t answer that. Please try again.",
          timestamp: Date.now(),
          subject: selectedSubject,
          isError: true,
          followUps: ["Try asking in simpler words", "Ask a different question"],
        },
      ]);
    } finally {
      // ALWAYS reset typing bubble and disabled button state, even on error!
      setIsLoading(false);
    }
  };

  // Action: "Explain simpler"
  const handleExplainSimpler = (msg: Message) => {
    const msgIndex = messages.findIndex((m) => m.id === msg.id);
    let originalQuestion = "this topic";
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === "user") {
        originalQuestion = messages[i].text;
        break;
      }
    }
    handleSendMessage(
      `Can you explain simpler using an everyday analogy?`,
      "simpler",
      `Topic question: ${originalQuestion}. Previous answer: ${msg.text}`
    );
  };

  // Action: "Challenge me"
  const handleChallengeMe = (msg: Message) => {
    handleSendMessage(
      `Challenge me with a related question!`,
      "challenge",
      `Topic context: ${msg.text}`
    );
  };

  // Action: "Quiz me" with 20-second timeout
  const handleQuizMe = async (msg: Message) => {
    if (isLoading || isQuizLoading) return;

    const msgIndex = messages.findIndex((m) => m.id === msg.id);
    let topic = msg.text.slice(0, 80);
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === "user") {
        topic = messages[i].text;
        break;
      }
    }

    setIsQuizLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new Error("Timeout: Quiz request exceeded 20 seconds"));
    }, 20000);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          topic,
          subject: selectedSubject,
          context: msg.text,
        }),
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      // Log raw response
      console.log("[DoubtBuddy Quiz] Raw Gemini response:", data.rawResponse || data);

      if (!response.ok) {
        throw new Error(data?.error || "Quiz request failed");
      }

      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("Invalid quiz data format");
      }

      setActiveQuiz({
        topic,
        subject: selectedSubject,
        questions: data.questions,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("[DoubtBuddy Quiz] Error generating quiz:", err);

      setMessages((prev) => [
        ...prev,
        {
          id: `quiz-err-${Date.now()}`,
          sender: "tutor",
          text: "Oops, I couldn’t answer that. Please try again.",
          timestamp: Date.now(),
          subject: selectedSubject,
          isError: true,
        },
      ]);
    } finally {
      // ALWAYS reset quiz loading state
      setIsQuizLoading(false);
    }
  };

  // Action: Thumbs Up
  const handleThumbsUp = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback: "up" } : m))
    );
  };

  // Action: Thumbs Down -> re-explains in a completely different way
  const handleThumbsDown = (msg: Message) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, feedback: "down" } : m))
    );

    const msgIndex = messages.findIndex((m) => m.id === msg.id);
    let originalQuestion = "the previous doubt";
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === "user") {
        originalQuestion = messages[i].text;
        break;
      }
    }

    handleSendMessage(
      `I didn't quite get that. Could you explain it in a completely different way?`,
      "alternative",
      `Original question: ${originalQuestion}. Previous confusing explanation: ${msg.text}`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Header with App Name, Stars Counter, Dark Mode Toggle */}
      <Header
        stars={stars}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        starGainedTrigger={starGainedTrigger}
      />

      {/* Row of Subject Chips: Maths, Science, English, Social */}
      <SubjectBar
        selectedSubject={selectedSubject}
        onSelectSubject={handleSelectSubject}
        disabled={isLoading}
      />

      {/* Main Chat Area */}
      <ChatArea
        messages={messages}
        isLoading={isLoading || isQuizLoading}
        activeSubject={selectedSubject}
        onFollowUpClick={(chipText) => handleSendMessage(chipText)}
        onExplainSimpler={handleExplainSimpler}
        onChallengeMe={handleChallengeMe}
        onQuizMe={handleQuizMe}
        onThumbsUp={handleThumbsUp}
        onThumbsDown={handleThumbsDown}
      />

      {/* Bottom Text Box & Ask Button with Empty Validation */}
      <ChatInput
        onSendMessage={(text) => handleSendMessage(text)}
        isLoading={isLoading || isQuizLoading}
        selectedSubject={selectedSubject}
      />

      {/* Interactive 3-Question Quiz Modal */}
      {activeQuiz && (
        <QuizModal
          topic={activeQuiz.topic}
          subject={activeQuiz.subject}
          questions={activeQuiz.questions}
          onClose={() => setActiveQuiz(null)}
          onAwardStars={(amount) => awardStars(amount)}
        />
      )}
    </div>
  );
}
