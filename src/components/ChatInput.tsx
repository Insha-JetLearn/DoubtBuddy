import React, { useState } from "react";
import { Send, AlertCircle, Sparkles } from "lucide-react";
import { Subject } from "../types";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  selectedSubject: Subject;
}

const subjectSamplePrompts: Record<Subject, string[]> = {
  Maths: [
    "Why is negative × negative = positive?",
    "How to find the perimeter of a rectangle?",
    "What is a prime number?",
  ],
  Science: [
    "Why is the sky blue?",
    "How do plants make their food?",
    "Why do we have different seasons?",
  ],
  English: [
    "What is a metaphor vs simile?",
    "How do I use 'their', 'there', and 'they're'?",
    "What makes a good descriptive essay?",
  ],
  Social: [
    "Why do we need a Constitution?",
    "What causes earthquakes?",
    "How did ancient civilizations trade goods?",
  ],
};

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  selectedSubject,
}) => {
  const [inputText, setInputText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = inputText.trim();
    if (!trimmed) {
      setErrorMessage("Please type a question first.");
      return;
    }

    setErrorMessage("");
    onSendMessage(trimmed);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (prompt: string) => {
    if (isLoading) return;
    setErrorMessage("");
    onSendMessage(prompt);
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 backdrop-blur-md sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Sample Quick Questions */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold flex items-center gap-1 shrink-0 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5" /> Try asking:
          </span>
          {subjectSamplePrompts[selectedSubject]?.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePromptClick(sample)}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-amber-100/70 dark:hover:bg-amber-950/50 hover:text-amber-900 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                onKeyDown={handleKeyDown}
                placeholder={`Ask any doubt in ${selectedSubject}... e.g. "Explain step by step..."`}
                disabled={isLoading}
                className="w-full text-base sm:text-lg px-4 py-3 sm:py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border-2 border-transparent focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all pr-10 shadow-inner"
              />
            </div>

            {/* "Ask" Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-orange-600 text-white font-black font-heading text-base sm:text-lg flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Error Message when empty: "Please type a question first." */}
          {errorMessage && (
            <div className="absolute left-2 -top-9 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
