import React from "react";
import { Subject } from "../types";
import { Calculator, FlaskConical, BookOpen, Globe2 } from "lucide-react";

interface SubjectBarProps {
  selectedSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
  disabled?: boolean;
}

interface SubjectConfig {
  id: Subject;
  label: string;
  icon: React.ReactNode;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  badge: string;
}

const subjects: SubjectConfig[] = [
  {
    id: "Maths",
    label: "Maths",
    icon: <Calculator className="w-4 h-4" />,
    activeBg: "bg-blue-500 dark:bg-blue-600 text-white shadow-md shadow-blue-500/25",
    activeBorder: "border-blue-500",
    activeText: "text-blue-600 dark:text-blue-400",
    badge: "📐",
  },
  {
    id: "Science",
    label: "Science",
    icon: <FlaskConical className="w-4 h-4" />,
    activeBg: "bg-emerald-500 dark:bg-emerald-600 text-white shadow-md shadow-emerald-500/25",
    activeBorder: "border-emerald-500",
    activeText: "text-emerald-600 dark:text-emerald-400",
    badge: "🔬",
  },
  {
    id: "English",
    label: "English",
    icon: <BookOpen className="w-4 h-4" />,
    activeBg: "bg-violet-500 dark:bg-violet-600 text-white shadow-md shadow-violet-500/25",
    activeBorder: "border-violet-500",
    activeText: "text-violet-600 dark:text-violet-400",
    badge: "📚",
  },
  {
    id: "Social",
    label: "Social",
    icon: <Globe2 className="w-4 h-4" />,
    activeBg: "bg-amber-500 dark:bg-amber-600 text-white shadow-md shadow-amber-500/25",
    activeBorder: "border-amber-500",
    activeText: "text-amber-600 dark:text-amber-400",
    badge: "🌍",
  },
];

export const SubjectBar: React.FC<SubjectBarProps> = ({
  selectedSubject,
  onSelectSubject,
  disabled = false,
}) => {
  return (
    <div className="bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 py-2.5 px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline whitespace-nowrap pl-1">
          Subject:
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          {subjects.map((sub) => {
            const isSelected = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubject(sub.id)}
                disabled={disabled}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold transition-all transform active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none ${
                  isSelected
                    ? `${sub.activeBg} font-heading scale-102`
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
                }`}
              >
                <span>{sub.badge}</span>
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
