import React, { useState } from "react";
import { QuizQuestion } from "../types";
import { triggerPerfectScoreConfetti } from "../utils/confetti";
import { CheckCircle2, XCircle, Award, Sparkles, ArrowRight, RotateCcw, X } from "lucide-react";

interface QuizModalProps {
  topic: string;
  subject: string;
  questions: QuizQuestion[];
  onClose: () => void;
  onAwardStars: (amount: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  topic,
  subject,
  questions,
  onClose,
  onAwardStars,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = questions[currentIndex];
  const total = questions.length;

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.answerIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      // Award 2 stars for every correct quiz answer!
      onAwardStars(2);
    }
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
      // If perfect score, fire confetti!
      const finalScore = score + (selectedOption === currentQ.answerIndex ? 0 : 0); // score was already updated
      if (finalScore === total) {
        triggerPerfectScoreConfetti();
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-white drop-shadow-sm">
                DoubtBuddy Quiz
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                {subject} • {topic.length > 30 ? topic.slice(0, 30) + "..." : topic}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close quiz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiz Progress Bar */}
        {!isCompleted && (
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2">
            <div
              className="bg-amber-500 h-2 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {!isCompleted ? (
            <div className="space-y-4">
              {/* Question Count & Star Reminder */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full">
                  Question {currentIndex + 1} of {total}
                </span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" /> +2 Stars for correct answer!
                </span>
              </div>

              {/* Question Text */}
              <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {currentQ.q}
              </h4>

              {/* Options */}
              <div className="space-y-2.5 pt-1">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.answerIndex;

                  let optionStyle =
                    "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-slate-800";

                  if (isAnswered) {
                    if (isCorrect) {
                      // Correct option always highlighted green
                      optionStyle =
                        "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/40";
                    } else if (isSelected && !isCorrect) {
                      // Incorrectly chosen option highlighted red
                      optionStyle =
                        "bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-300 font-bold ring-2 ring-rose-500/40";
                    } else {
                      optionStyle =
                        "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60";
                    }
                  }

                  const labels = ["A", "B", "C", "D"];

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 text-sm sm:text-base cursor-pointer disabled:cursor-default ${optionStyle}`}
                    >
                      <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-white/70 dark:bg-slate-700 border border-current">
                        {labels[idx] || idx + 1}
                      </span>
                      <span className="flex-1 leading-snug">{opt}</span>
                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and "Why" Explanation */}
              {isAnswered && (
                <div
                  className={`p-4 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
                    selectedOption === currentQ.answerIndex
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                      : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-sm mb-1 font-heading">
                    {selectedOption === currentQ.answerIndex ? (
                      <>
                        <span>🎉 Correct!</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold ml-1">
                          +2 Stars earned! ⭐⭐
                        </span>
                      </>
                    ) : (
                      <>
                        <span>Nice try! Keep learning!</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                    <span className="font-bold">Why:</span> {currentQ.why}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20">
                {score === total ? "🏆" : score > 0 ? "🌟" : "💪"}
              </div>

              <div>
                <h4 className="text-2xl font-black font-heading text-slate-800 dark:text-white">
                  {score === total
                    ? "Perfect Score! 🎉"
                    : score >= 2
                    ? "Great Job! 👏"
                    : "Good Effort! 🌟"}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  You scored <span className="font-bold text-amber-500 text-base">{score}</span> out of{" "}
                  <span className="font-bold text-base">{total}</span>
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 inline-flex items-center gap-2 text-amber-800 dark:text-amber-300 text-sm font-bold">
                <Award className="w-5 h-5 text-amber-500" />
                <span>You earned {score * 2} Stars from this quiz! ⭐</span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {score === total
                  ? "Outstanding mastery! You have a crystal clear understanding of this concept."
                  : "Keep asking doubts and trying questions. Practice makes you a scholar!"}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          {!isCompleted ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Quit Quiz
              </button>
              {isAnswered && (
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold font-heading text-sm sm:text-base flex items-center gap-2 shadow-md shadow-amber-500/25 transition-all"
                >
                  <span>{currentIndex < total - 1 ? "Next Question" : "See Final Score"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex items-center gap-3 justify-center">
              <button
                onClick={handleRestart}
                className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black font-heading text-sm sm:text-base shadow-md shadow-amber-500/30 active:scale-95 transition-all"
              >
                Back to Tutor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
