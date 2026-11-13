"use client";

import { useState, useEffect, useCallback } from "react";
import questionsData from "../data/questions.json";

type Question = {
  id: string;
  subject: string;
  subtopic: string;
  difficulty: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

const SUBJECTS = [
  "All Subjects",
  "Clinical Chemistry",
  "Hematology",
  "Microbiology & Parasitology",
  "Blood Banking & Serology",
  "Clinical Microscopy",
  "Histopathology & MedTech Laws",
  "Missed Questions",
];

const DIFFICULTIES = ["All Levels", "Easy", "Medium", "Hard"];
const QUESTIONS_PER_SESSION = 10;

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function MTLEReviewer() {
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [missedIds, setMissedIds] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  // Load saved missed questions from browser storage
  useEffect(() => {
    const saved = localStorage.getItem("mtle_missed_ids");
    if (saved) {
      try {
        setMissedIds(JSON.parse(saved));
      } catch {
        setMissedIds([]);
      }
    }
  }, []);

  // Build a fresh 10-question shuffled session whenever filters change
  const startNewSession = useCallback(
    (subject: string, difficulty: string, currentMissed: string[]) => {
      let pool = questionsData as Question[];

      if (subject === "Missed Questions") {
        pool = pool.filter((q) => currentMissed.includes(q.id));
      } else if (subject !== "All Subjects") {
        pool = pool.filter((q) => q.subject === subject);
      }

      if (difficulty !== "All Levels") {
        pool = pool.filter((q) => q.difficulty === difficulty);
      }

      const shuffled = shuffleArray(pool).slice(0, QUESTIONS_PER_SESSION);
      setSessionQuestions(shuffled);
      setCurrentIndex(0);
      setSelectedOption(null);
      setScore(0);
      setStreak(0);
      setFinished(false);
    },
    []
  );

  useEffect(() => {
    startNewSession(selectedSubject, selectedDifficulty, missedIds);
  }, [selectedSubject, selectedDifficulty, startNewSession]);

  const currentQuestion = sessionQuestions[currentIndex];

  const handleAnswer = useCallback(
    (index: number) => {
      if (selectedOption !== null || !currentQuestion) return;
      setSelectedOption(index);

      if (index === currentQuestion.correct) {
        setScore((prev) => prev + 1);
        setStreak((prev) => {
          const next = prev + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
        if (missedIds.includes(currentQuestion.id)) {
          const updated = missedIds.filter((id) => id !== currentQuestion.id);
          setMissedIds(updated);
          localStorage.setItem("mtle_missed_ids", JSON.stringify(updated));
        }
      } else {
        setStreak(0);
        if (!missedIds.includes(currentQuestion.id)) {
          const updated = [...missedIds, currentQuestion.id];
          setMissedIds(updated);
          localStorage.setItem("mtle_missed_ids", JSON.stringify(updated));
        }
      }
    },
    [selectedOption, currentQuestion, missedIds]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < sessionQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setFinished(true);
    }
  }, [currentIndex, sessionQuestions.length]);

  // Keyboard shortcuts: A/B/C/D or 1/2/3/4 to answer, Enter for Next
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (finished || !currentQuestion) return;
      const key = e.key.toLowerCase();
      if (selectedOption === null) {
        if (key === "a" || key === "1") handleAnswer(0);
        if (key === "b" || key === "2") handleAnswer(1);
        if (key === "c" || key === "3") handleAnswer(2);
        if (key === "d" || key === "4") handleAnswer(3);
      } else if (key === "enter") {
        handleNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finished, currentQuestion, selectedOption, handleAnswer, handleNext]);

  const percentage = sessionQuestions.length
    ? Math.round((score / sessionQuestions.length) * 100)
    : 0;

  const progressPercent = sessionQuestions.length
    ? Math.round(
      ((currentIndex + (selectedOption !== null ? 1 : 0)) /
        sessionQuestions.length) *
      100
    )
    : 0;

  const difficultyBadgeColor = (diff: string) => {
    if (diff === "Easy") return "bg-emerald-950 text-emerald-300 border-emerald-700";
    if (diff === "Hard") return "bg-rose-950 text-rose-300 border-rose-700";
    return "bg-amber-950 text-amber-300 border-amber-700";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6 border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-teal-400">
              MTLE 2027 Board Reviewer
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5">
              10-Item Active Recall Drills • Press A–D to answer, Enter for Next
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-amber-400">
              🔥 Streak: {streak}
            </span>
            <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-teal-300">
              🏆 Best: {bestStreak}
            </span>
          </div>
        </header>

        {/* Subject Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {SUBJECTS.map((subj) => {
            const isMissedTab = subj === "Missed Questions";
            return (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${selectedSubject === subj
                    ? isMissedTab
                      ? "bg-rose-500 text-white font-semibold"
                      : "bg-teal-500 text-slate-950 font-semibold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
              >
                {subj}
                {isMissedTab && missedIds.length > 0 ? ` (${missedIds.length})` : ""}
              </button>
            );
          })}
        </div>

        {/* Difficulty Filter Pills */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-slate-400">Difficulty:</span>
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${selectedDifficulty === diff
                  ? "bg-slate-200 text-slate-950 font-semibold"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {sessionQuestions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <p className="text-slate-300 mb-4">
              {selectedSubject === "Missed Questions"
                ? "You have zero missed questions right now—great job!"
                : "No questions match this subject + difficulty filter yet."}
            </p>
            <button
              onClick={() => {
                setSelectedSubject("All Subjects");
                setSelectedDifficulty("All Levels");
              }}
              className="px-4 py-2 bg-teal-500 text-slate-950 font-semibold rounded-lg text-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : !finished && currentQuestion ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="w-full bg-slate-800 h-1.5 rounded-full mb-5 overflow-hidden">
              <div
                className="bg-teal-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-slate-400 mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-slate-800 px-2.5 py-1 rounded text-teal-300">
                  {currentQuestion.subject} • {currentQuestion.subtopic}
                </span>
                <span
                  className={`px-2 py-0.5 rounded border text-[11px] font-medium ${difficultyBadgeColor(
                    currentQuestion.difficulty || "Medium"
                  )}`}
                >
                  {currentQuestion.difficulty || "Medium"}
                </span>
              </div>
              <span>
                Question {currentIndex + 1} of {sessionQuestions.length}
              </span>
            </div>

            <h2 className="text-lg md:text-xl font-medium mb-6 leading-relaxed">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                let buttonStyle =
                  "bg-slate-800/70 border-slate-700 hover:border-teal-500";
                if (selectedOption !== null) {
                  if (idx === currentQuestion.correct) {
                    buttonStyle =
                      "bg-emerald-950/80 border-emerald-500 text-emerald-200";
                  } else if (idx === selectedOption) {
                    buttonStyle = "bg-rose-950/80 border-rose-500 text-rose-200";
                  } else {
                    buttonStyle = "bg-slate-900 border-slate-800 opacity-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedOption !== null}
                    className={`w-full text-left p-4 rounded-lg border transition flex items-start gap-3 ${buttonStyle}`}
                  >
                    <span className="font-bold text-slate-400">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            {selectedOption !== null && (
              <div className="mt-6 p-4 rounded-lg bg-slate-800/90 border border-slate-700">
                <p className="text-sm font-semibold text-teal-400 mb-1">
                  {selectedOption === currentQuestion.correct
                    ? "Correct! Rationale:"
                    : "Incorrect — Rationale:"}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
                <button
                  onClick={handleNext}
                  className="mt-4 w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg transition"
                >
                  {currentIndex + 1 < sessionQuestions.length
                    ? "Next Question (Enter) →"
                    : "View Session Summary"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">10-Item Drill Complete!</h2>
            <p className="text-5xl font-extrabold text-teal-400 my-4">
              {percentage}%
            </p>
            <p className="text-slate-300 mb-2">
              You scored {score} out of {sessionQuestions.length}
            </p>
            <p className="text-xs text-slate-400 mb-6">
              {percentage >= 85
                ? "Topnotcher Pace! Ready for Hard-level clinical cases."
                : percentage >= 75
                  ? "Above the 75% PRC RMT passing target!"
                  : "Below 75% — drill your Missed Questions tab to lock in these concepts."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() =>
                  startNewSession(selectedSubject, selectedDifficulty, missedIds)
                }
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg transition"
              >
                New Shuffled Set
              </button>
              {missedIds.length > 0 && (
                <button
                  onClick={() => setSelectedSubject("Missed Questions")}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg transition"
                >
                  Review Missed ({missedIds.length})
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}