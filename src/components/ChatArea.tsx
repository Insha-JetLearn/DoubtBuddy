import React, { useRef, useEffect } from "react";
import { Message, Subject } from "../types";
import { Lightbulb, Rocket, HelpCircle, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  activeSubject: Subject;
  onFollowUpClick: (questionText: string) => void;
  onExplainSimpler: (msg: Message) => void;
  onChallengeMe: (msg: Message) => void;
  onQuizMe: (msg: Message) => void;
  onThumbsUp: (messageId: string) => void;
  onThumbsDown: (msg: Message) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  activeSubject,
  onFollowUpClick,
  onExplainSimpler,
  onChallengeMe,
  onQuizMe,
  onThumbsUp,
  onThumbsDown,
}) => {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";

          if (isUser) {
            return (
              <div
                key={msg.id}
                className="flex justify-end items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="max-w-[85%] sm:max-w-[70%] bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl rounded-br-xs px-4 py-3 sm:px-5 sm:py-3.5 shadow-md shadow-amber-500/15">
                  <p className="text-base sm:text-lg font-medium leading-relaxed break-words">
                    {msg.text}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[11px] text-amber-100 font-semibold">
                    <span>You</span>
                    {msg.subject && (
                      <>
                        <span>•</span>
                        <span>{msg.subject}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Tutor message
          return (
            <div
              key={msg.id}
              className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {/* Tutor Mascot Avatar */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800/80 flex items-center justify-center text-xl sm:text-2xl shadow-sm shrink-0 select-none">
                🦉
              </div>

              {/* Message Content Container */}
              <div className="max-w-[90%] sm:max-w-[80%] space-y-3">
                {/* Tutor Bubble */}
                <div
                  className={`rounded-2xl rounded-tl-xs px-4 py-3.5 sm:px-5 sm:py-4 shadow-sm border transition-colors ${
                    msg.isError
                      ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200"
                      : "bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100"
                  }`}
                >
                  {/* Tutor Header Tag */}
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs font-black font-heading text-amber-600 dark:text-amber-400">
                    <span>DoubtBuddy</span>
                    {msg.mode === "simpler" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        Simpler Analogy
                      </span>
                    )}
                    {msg.mode === "challenge" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        Challenge Question
                      </span>
                    )}
                    {msg.mode === "alternative" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Alternative View
                      </span>
                    )}
                  </div>

                  {/* Main Explanation Body */}
                  <div className="text-base sm:text-lg leading-relaxed space-y-2 font-normal whitespace-pre-line">
                    {msg.text}
                  </div>
                </div>

                {/* Follow-up Chips (2 tappable chips that send themselves as new questions) */}
                {msg.followUps && msg.followUps.length > 0 && !msg.isError && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Explore Further:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.followUps.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => onFollowUpClick(chip)}
                          className="text-left text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-slate-750 hover:border-amber-400 active:scale-95 transition-all cursor-pointer shadow-2xs"
                        >
                          💬 {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buttons Under Each Answer: Explain simpler, Challenge me, Quiz me, Thumbs up/down */}
                {!msg.isError && (
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
                    {/* Explain simpler */}
                    <button
                      onClick={() => onExplainSimpler(msg)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 active:scale-95 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
                      <span>Explain simpler</span>
                    </button>

                    {/* Challenge me */}
                    <button
                      onClick={() => onChallengeMe(msg)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 active:scale-95 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                    >
                      <Rocket className="w-3.5 h-3.5 text-purple-500" />
                      <span>Challenge me</span>
                    </button>

                    {/* Quiz me */}
                    <button
                      onClick={() => onQuizMe(msg)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer font-heading"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-white" />
                      <span>Quiz me</span>
                    </button>

                    {/* Thumbs up / down */}
                    <div className="flex items-center gap-1 ml-auto bg-slate-100 dark:bg-slate-800/70 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700/60">
                      <button
                        onClick={() => onThumbsUp(msg.id)}
                        disabled={msg.feedback === "up"}
                        aria-label="Helpful answer"
                        className={`p-1.5 rounded-lg transition-all ${
                          msg.feedback === "up"
                            ? "bg-emerald-500 text-white"
                            : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700"
                        }`}
                        title="Helpful!"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onThumbsDown(msg)}
                        disabled={isLoading}
                        aria-label="Re-explain in a completely different way"
                        className={`p-1.5 rounded-lg transition-all ${
                          msg.feedback === "down"
                            ? "bg-rose-500 text-white"
                            : "text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700"
                        }`}
                        title="Didn't get it? Click to re-explain differently!"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Animated Typing Bubble when Waiting */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-in fade-in duration-300">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800/80 flex items-center justify-center text-xl sm:text-2xl shadow-sm shrink-0 select-none animate-bounce">
              🦉
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-xs px-5 py-4 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mr-2 font-heading">
                Thinking in {activeSubject}...
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-amber-500 typing-dot" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400 typing-dot" />
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 dark:bg-orange-500 typing-dot" />
            </div>
          </div>
        )}

        <div ref={scrollEndRef} />
      </div>
    </div>
  );
};
