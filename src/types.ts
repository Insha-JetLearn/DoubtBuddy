export type Subject = "Maths" | "Science" | "English" | "Social";

export interface QuizQuestion {
  q: string;
  options: string[];
  answerIndex: number;
  why: string;
}

export interface QuizSession {
  topic: string;
  questions: QuizQuestion[];
  currentIndex: number;
  selectedAnswers: (number | null)[];
  isAnswerSubmitted: boolean;
  score: number;
  completed: boolean;
}

export interface Message {
  id: string;
  sender: "user" | "tutor";
  text: string;
  timestamp: number;
  subject?: Subject;
  followUps?: string[];
  feedback?: "up" | "down" | null;
  mode?: "normal" | "simpler" | "challenge" | "alternative";
  isError?: boolean;
}
