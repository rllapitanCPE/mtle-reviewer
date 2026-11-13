"use client";

import { useState, useMemo } from "react";
import questionsData from "../data/questions.json";

const SUBJECTS = [
  "All Subjects",
  "Clinical Chemistry",
  "Hematology",
  "Microbiology & Parasitology",
  "Blood Banking & Serology",
  "Clinical Microscopy",
  "Histopathology & MedTech Laws",
];

export default function MTLEReviewer() {
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const filteredQuestions = useMemo(() => {
    if (selectedSubject === "All Subjects") return questionsData;
    return questionsData.filter((q) => q.subject === selectedSubject);
  }, [selectedSubject]);

  const currentQuestion = filteredQuestions[currentIndex];

  const handleSelectSubject = (subject: string) => {
    setSelectedSubject(subject);
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setFinished(false);
  };

  const handleAnswer = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    if (index === currentQuestion.correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setFinished(true);
    }
  };

  const percentage = filteredQuestions.length
    ? Math.round((score / filteredQuestions.length) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 border-b border-slate-800 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-teal-400">
            MTLE 2027 Board Exam Reviewer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            PRC Table of Specifications Practice & Rationale Engine
          </p>
        </header>

        {/* Subject Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SUBJECTS.map((subj) => (
            <button
              key={subj}
              onClick={() => handleSelectSubject(subj)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${selectedSubject === subj
                  ? "bg-teal-500 text-slate-950 font-semibold"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Quiz Card */}
        {!finished && currentQuestion ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-4">
              <span className="bg-slate-800 px-2.5 py-1 rounded text-teal-300">
                {currentQuestion.subject} • {currentQuestion.subtopic}
              </span>
              <span>
                Question {currentIndex + 1} of {filteredQuestions.length}
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
                  Rationale:
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
                <button
                  onClick={handleNext}
                  className="mt-4 w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg transition"
                >
                  {currentIndex + 1 < filteredQuestions.length
                    ? "Next Question →"
                    : "View Final Score"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
            <p className="text-4xl font-extrabold text-teal-400 my-4">
              {percentage}%
            </p>
            <p className="text-slate-300 mb-6">
              You scored {score} out of {filteredQuestions.length} (
              {percentage >= 75
                ? "Above PRC 75% RMT Passing Target!"
                : "Keep drilling to hit 75%+"}
              )
            </p>
            <button
              onClick={() => handleSelectSubject(selectedSubject)}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg transition"
            >
              Retake Set
            </button>
          </div>
        )}
      </div>
    </main>
  );
}