import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Upload, FileText, X, Zap, Brain, Target,
  ChevronRight, RotateCcw, Trophy, CheckCircle2, XCircle, Lightbulb,
  Loader2, Star, BarChart3, Clock, AlertCircle, Sparkles, History
} from "lucide-react";
import { Button } from "../components/ui/button";
import api from "../lib/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readFileAsBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

const DIFFICULTY_CONFIG = {
  beginner: {
    label: "Beginner",
    icon: Star,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
    borderClass: "border-emerald-200 dark:border-emerald-900/50",
    activeBorder: "border-emerald-500 dark:border-emerald-400",
    hint: "Hints included",
    prompt:
      "Generate 5 multiple-choice quiz questions at BEGINNER level. For each question include a helpful hint. Keep language simple and approachable.",
  },
  intermediate: {
    label: "Intermediate",
    icon: Brain,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-50 dark:bg-blue-900/20",
    borderClass: "border-blue-200 dark:border-blue-900/50",
    activeBorder: "border-blue-500 dark:border-blue-400",
    hint: "No hints",
    prompt:
      "Generate 5 multiple-choice quiz questions at INTERMEDIATE level. No hints. Require deeper understanding.",
  },
  advanced: {
    label: "Advanced",
    icon: Zap,
    colorClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-50 dark:bg-rose-900/20",
    borderClass: "border-rose-200 dark:border-rose-900/50",
    activeBorder: "border-rose-500 dark:border-rose-400",
    hint: "Expert level",
    prompt:
      "Generate 5 multiple-choice quiz questions at ADVANCED level. No hints. Push conceptual depth and critical thinking.",
  },
};

// ─── API ──────────────────────────────────────────────────────────────────────

async function generateQuizFromPDFs(files, quizName, difficulty) {
  const fileData = await Promise.all(
    files.map(async (f) => {
      const b64 = await readFileAsBase64(f);
      return b64;
    })
  );

  const response = await api.post("/quiz/generateCustom", {
    files: fileData,
    quizName,
    difficulty,
  });

  return response.data;
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, total }) {
  const pct = Math.round((score / total) * 100);
  const r = 48;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? "#16a34a" : pct >= 60 ? "#2563eb" : "#dc2626";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="60" cy="60" r={r} fill="none" strokeWidth="8"
          className="stroke-slate-100 dark:stroke-slate-800"
        />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold" style={{ color }}>{pct}%</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{score}/{total}</div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MyQuizzesPage() {
  const [phase, setPhase] = useState("upload");
  const [showConfig, setShowConfig] = useState(false);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [quizName, setQuizName] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(Date.now());

  const inputRef = useRef();

  // Quiz history
  const [quizHistory, setQuizHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await api.get("/quiz/myQuizzes");
        if (res.data?.quizzes) setQuizHistory(res.data.quizzes);
      } catch (e) {
        console.log("Failed to load quiz history", e);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [phase]); // refresh when coming back from results

  const loadHistoryQuiz = (histQuiz) => {
    const questions = histQuiz.questions;
    setQuiz({
      id: histQuiz.id,
      topic: histQuiz.topic,
      questions: questions,
    });
    setQuizName(histQuiz.title);
    setDifficulty(histQuiz.difficulty);
    setCurrentQ(0);
    
    // If it was completed, we can mock the answers to let them see results 
    // or just let them retake it. 
    // To show results phase accurately, we'd need the actual answers stored.
    // For now, if we show "results" without answers, it looks empty.
    // So we'll let them RETAKE or we can mock them as "correct" for review.
    
    if (histQuiz.isCompleted) {
      // Mock answers as "correct" so they can review the explanation/breakdown
      const mockAnswers = questions.map(q => ({
        questionId: q.id,
        selected: q.correct,
        correct: q.correct,
        isCorrect: true
      }));
      setAnswers(mockAnswers);
      setPhase("results");
    } else {
      setAnswers([]);
      setPhase("quiz");
    }
    
    setSelected(null);
    setConfirmed(false);
    setShowHint(false);
  };

  const addFiles = useCallback((incoming) => {
    const valid = [...incoming].filter((f) => f.type === "application/pdf");
    setFiles((prev) => [...prev, ...valid].slice(0, 4));
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (i) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleGenerate = async () => {
    if (!quizName.trim()) {
      setError("Please enter a name for your quiz before generating.");
      return;
    }
    setLoading(true);
    setError(null);
    setPhase("generating"); // Display full screen loading state
    
    try {
      const data = await generateQuizFromPDFs(files, quizName, difficulty);
      if (!data.questions?.length) throw new Error("No questions returned");
      setQuiz(data);
      setCurrentQ(0);
      setAnswers([]);
      setSelected(null);
      setConfirmed(false);
      setPhase("quiz");
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to generate quiz. Please check your PDFs and try again.");
      }
      setPhase("upload"); // Revert back if it failed
      setShowConfig(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmAnswer = () => {
    if (selected === null) return;
    const q = quiz.questions[currentQ];
    setConfirmed(true);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: q.id,
        selected,
        correct: q.correct,
        isCorrect: selected === q.correct,
      },
    ]);
  };

  const nextQuestion = async () => {
    if (currentQ + 1 >= quiz.questions.length) {
      setPhase("results");
      // Save result to backend
      try {
        await api.post("/quiz/updateResult", {
          quizId: quiz.id,
          score: answers.filter((a) => a.isCorrect).length,
          totalQuestions: quiz.questions.length
        });
      } catch (err) {
        console.error("Failed to save quiz result", err);
      }
    } else {
      setCurrentQ((p) => p + 1);
      setSelected(null);
      setConfirmed(false);
      setShowHint(false);
    }
  };

  const restart = () => {
    setPhase("upload");
    setShowConfig(false);
    setFiles([]);
    setQuiz(null);
    setQuizName("");
    setAnswers([]);
    setSelected(null);
    setConfirmed(false);
    setError(null);
  };

  const tryAnotherQuiz = () => {
    // Go back to the config step so the user can choose difficulty/name again
    // The uploaded PDFs are preserved (files state is unchanged)
    setQuiz(null);
    setQuizName("");
    setAnswers([]);
    setSelected(null);
    setConfirmed(false);
    setError(null);
    setShowConfig(true);
    setPhase("upload");
  };

  const score = answers.filter((a) => a.isCorrect).length;
  const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 60000));

  // ── PHASE: Generating ────────────────────────────────────────────────────────
  if (phase === "generating") {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center gap-6">
        <style>{`
          @keyframes dot-bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
            40% { transform: translateY(-10px); opacity: 1; }
          }
        `}</style>

        <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />

        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800 dark:text-white">Generating your quiz…</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">This usually takes a few seconds</p>
        </div>
      </div>
    );
  }

  // ── PHASE: Upload ─────────────────────────────────────────────────────────

  if (phase === "upload") {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pt-2 pb-6 px-6">

        {/* ── History Modal ────────────────────────────────────────────── */}
        {showHistory && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowHistory(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-800"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quiz History</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{quizHistory.length} quiz{quizHistory.length !== 1 ? 'zes' : ''} completed</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto flex-1 px-6 py-4">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
                  </div>
                ) : quizHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full inline-flex mb-4">
                      <History className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No quizzes yet</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Generate your first quiz to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quizHistory.map((hq, idx) => {
                      const pct = hq.isCompleted && hq.totalQuestions > 0
                        ? Math.round((hq.score / hq.totalQuestions) * 100)
                        : null;
                      const scoreColor = pct === null ? '' : pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
                      return (
                        <div
                          key={hq.id}
                          className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all duration-150 group"
                        >
                          {/* Index badge */}
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400">
                            {idx + 1}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {hq.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">{hq.difficulty}</span>
                              <span className="text-xs text-slate-200 dark:text-slate-700">·</span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">{hq.topic}</span>
                              <span className="text-xs text-slate-200 dark:text-slate-700">·</span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(hq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>

                          {/* Score badge */}
                          <div className="text-right shrink-0">
                            {pct !== null ? (
                              <>
                                <p className={`text-base font-bold ${scoreColor}`}>{pct}%</p>
                                <p className="text-xs text-slate-400">{hq.score}/{hq.totalQuestions} correct</p>
                              </>
                            ) : (
                              <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">Not taken</span>
                            )}
                          </div>

                          {/* Action button */}
                          <Button
                            size="sm"
                            onClick={() => { setShowHistory(false); loadHistoryQuiz(hq); }}
                            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg"
                          >
                            {hq.isCompleted ? 'Review' : 'Take Quiz'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-[1800px] mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <>
  <style>{`
    @keyframes borderPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.25); }
      50% { box-shadow: 0 0 0 4px rgba(99,102,241,0.08); }
    }
  `}</style>
  <p className="text-sm font-semibold uppercase tracking-widest mb-1">
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      background: 'linear-gradient(135deg, #eef2ff, #ede9fe)',
      color: '#4338ca',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.08em',
      padding: '2px 7px',
      borderRadius: '4px',
      border: '0.5px solid #c7d2fe',
      animation: 'borderPulse 2.5s ease-in-out infinite',
      verticalAlign: 'middle',
      position: 'relative',
      top: '-1px',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
      AI-Powered
    </span>
    <span className="text-blue-600 dark:text-blue-400"> Quiz Generator</span>
  </p>
</>
              
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowHistory(true)}
                className="gap-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <History className="h-4 w-4" /> View History
              </Button>
              <Link to="/dashboard">
                <Button variant="ghost" className="gap-2 text-slate-600 dark:text-slate-400">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Upload + Config — takes 2 cols */}
            <div className="lg:col-span-2 space-y-6">

              {/* STEP 1: Drop Zone Card */}
              {!showConfig && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-lg">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Step 1: Upload Study Materials
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 ml-12">
                    Upload up to 4 PDF files to generate a personalised quiz
                  </p>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <input
                      ref={inputRef} type="file" accept=".pdf" multiple
                      className="hidden" onChange={(e) => addFiles(e.target.files)}
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                        <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Drop PDF files here</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          or{" "}
                          <span className="text-blue-600 dark:text-blue-400 font-medium">click to browse</span>
                          {" "}· max 4 files
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* File list */}
                  {files.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        {files.map((f, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl"
                          >
                            <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg">
                              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                              {f.name}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                              {(f.size / 1024).toFixed(0)} KB
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <p className="text-xs text-slate-400 dark:text-slate-500 pl-1">
                          {files.length}/4 files uploaded
                        </p>
                      </div>

                      <Button
                        onClick={() => setShowConfig(true)}
                        size="lg"
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        Next Step: Configure Quiz <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Quiz Name + Difficulty — shown after clicking Next */}
              {showConfig && files.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Step 2: Configure Your Quiz
                    </h2>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowConfig(false)}
                      className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" /> Edit PDFs
                    </Button>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 ml-12 -mt-4">
                    Name your quiz and choose a difficulty level
                  </p>

                  {/* Quiz Name */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Quiz Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={quizName}
                      onChange={(e) => { setQuizName(e.target.value); setError(null); }}
                      placeholder="e.g., Chapter 3 Review, Midterm Prep…"
                      className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                      This name will appear on your quiz and results page
                    </p>
                  </div>

                  {/* Difficulty */}
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Difficulty Level <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      const active = difficulty === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setDifficulty(key)}
                          className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                            active
                              ? `${cfg.bgClass} ${cfg.activeBorder}`
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 mx-auto mb-2 ${
                              active ? cfg.colorClass : "text-slate-400 dark:text-slate-500"
                            }`}
                          />
                          <p className={`text-sm font-bold ${active ? cfg.colorClass : "text-slate-700 dark:text-slate-300"}`}>
                            {cfg.label}
                          </p>
                          <p className={`text-xs mt-0.5 ${active ? cfg.colorClass : "text-slate-400 dark:text-slate-500"}`}>
                            {cfg.hint}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {error && (
                    <div className="mb-4 flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                    </div>
                  )}

                  <Button
                    onClick={handleGenerate}
                    disabled={loading || !quizName.trim()}
                    size="lg"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating Quiz…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Generate Quiz
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    How It Works
                  </h3>
                  <ul className="space-y-4">
                    {[
                      { icon: Upload,    title: "Upload PDFs",    desc: "Add up to 4 study documents" },
                      { icon: Brain,     title: "AI Generates",   desc: "Claude reads & crafts questions" },
                      { icon: Target,    title: "Auto-Graded",    desc: "Instant scoring & feedback" },
                      { icon: BarChart3, title: "Review Results", desc: "Detailed explanations per answer" },
                    ].map(({ icon: Icon, title, desc }) => (
                      <li key={title} className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg shrink-0">
                          <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">What You'll Get</h3>
                  <ul className="space-y-3">
                    {[
                      "5 targeted questions per quiz",
                      "3 difficulty levels to choose from",
                      "Hints for beginner level",
                      "Detailed answer explanations",
                      "Instant score & grade",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: Quiz ─────────────────────────────────────────────────────────────

  if (phase === "quiz" && quiz) {
    const q = quiz.questions[currentQ];
    const progress = (currentQ / quiz.questions.length) * 100;
    const diffCfg = DIFFICULTY_CONFIG[difficulty];
    const DiffIcon = diffCfg.icon;

    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pt-2 pb-6 px-6">
        <div className="max-w-[1800px] mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                {quizName}
              </p>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Question {currentQ + 1}
                <span className="text-slate-400 dark:text-slate-600 font-normal">
                  {" "}/ {quiz.questions.length}
                </span>
              </h1>
            </div>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 ${diffCfg.bgClass} border ${diffCfg.borderClass} ${diffCfg.colorClass} rounded-lg text-sm font-semibold`}
            >
              <DiffIcon className="h-4 w-4" />
              {diffCfg.label}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-7 overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Question area */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-lg">

                {q.concept && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold mb-5">
                    <BookOpen className="h-3 w-3" /> {q.concept}
                  </span>
                )}

                <p className="text-lg font-semibold text-slate-900 dark:text-white leading-relaxed mb-6">
                  {q.question}
                </p>

                {/* Hint */}
                {difficulty === "beginner" && q.hint && (
                  <div className="mb-5">
                    {!showHint ? (
                      <button
                        onClick={() => setShowHint(true)}
                        className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors"
                      >
                        <Lightbulb className="h-4 w-4" /> Show Hint
                      </button>
                    ) : (
                      <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700 dark:text-amber-300">{q.hint}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Options */}
                <div className="space-y-3">
                  {q.options.map((opt, i) => {
                    let state = "default";
                    if (confirmed) {
                      if (i === q.correct) state = "correct";
                      else if (i === selected) state = "wrong";
                    } else if (i === selected) state = "selected";

                    const s = {
                      default:  "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10",
                      selected: "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20",
                      correct:  "border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
                      wrong:    "border-rose-500 dark:border-rose-400 bg-rose-50 dark:bg-rose-900/20",
                    };
                    const lbl = {
                      default:  "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
                      selected: "bg-blue-600 text-white",
                      correct:  "bg-emerald-600 text-white",
                      wrong:    "bg-rose-600 text-white",
                    };

                    return (
                      <button
                        key={i}
                        onClick={() => !confirmed && setSelected(i)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${s[state]} ${!confirmed ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${lbl[state]}`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 font-medium">{opt}</span>
                        {confirmed && i === q.correct && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                        {confirmed && i === selected && i !== q.correct && (
                          <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {confirmed && (
                  <div className="mt-5 p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                      Explanation
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  {!confirmed ? (
                    <Button
                      onClick={confirmAnswer}
                      disabled={selected === null}
                      size="lg"
                      className={`w-full h-12 font-semibold rounded-xl text-base ${
                        selected !== null
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      Confirm Answer
                    </Button>
                  ) : (
                    <Button
                      onClick={nextQuestion}
                      size="lg"
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-base flex items-center justify-center gap-2"
                    >
                      {currentQ + 1 >= quiz.questions.length ? (
                        <><Trophy className="h-5 w-5" /> See Results</>
                      ) : (
                        <>Next Question <ChevronRight className="h-5 w-5" /></>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Progress
                  </h3>
                  <div className="space-y-2">
                    {quiz.questions.map((_, i) => {
                      const ans = answers[i];
                      let state = "upcoming";
                      if (i === currentQ) state = "active";
                      else if (ans?.isCorrect) state = "correct";
                      else if (ans) state = "wrong";

                      const rowStyle = {
                        upcoming: "bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800",
                        active:   "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400",
                        correct:  "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400",
                        wrong:    "bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400",
                      };

                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${rowStyle[state]}`}
                        >
                          <span className="font-bold w-5">Q{i + 1}</span>
                          <span className="flex-1">
                            {i < currentQ
                              ? ans?.isCorrect ? "Correct ✓" : "Incorrect ✗"
                              : i === currentQ ? "Current question"
                              : "Upcoming"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">Score So Far</span>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl text-center">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{score}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      of {answers.length} answered
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: Results ──────────────────────────────────────────────────────────

  if (phase === "results" && quiz) {
    const pct = Math.round((score / quiz.questions.length) * 100);
    const grade =
      pct >= 90
        ? { label: "Excellent!",       colorClass: "text-emerald-600 dark:text-emerald-400", borderClass: "border-emerald-200 dark:border-emerald-900/50" }
        : pct >= 75
        ? { label: "Great Job!",       colorClass: "text-blue-600 dark:text-blue-400",       borderClass: "border-blue-100 dark:border-blue-900/50" }
        : pct >= 60
        ? { label: "Good Effort",      colorClass: "text-amber-600 dark:text-amber-400",     borderClass: "border-amber-200 dark:border-amber-900/50" }
        :  { label: "Keep Practicing", colorClass: "text-rose-600 dark:text-rose-400",       borderClass: "border-rose-200 dark:border-rose-900/50" };

    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pt-2 pb-6 px-6">
        <div className="max-w-[1800px] mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                Quiz Complete
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                {quizName}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={restart}
                className="gap-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <RotateCcw className="h-4 w-4" /> Start Over
              </Button>
              <Button
                onClick={tryAnotherQuiz}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              >
                Try Another Quiz <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2 space-y-5">

              {/* Score banner */}
              <div
                className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-lg p-8 flex flex-col sm:flex-row items-center gap-8 ${grade.borderClass}`}
              >
                <ScoreRing score={score} total={quiz.questions.length} />
                <div className="flex-1 text-center sm:text-left">
                  <p className={`text-2xl font-bold ${grade.colorClass}`}>{grade.label}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    {quizName} · {quiz.topic}
                  </p>
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {files.map((f, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-500 dark:text-slate-400 font-medium"
                        >
                          <FileText className="h-3 w-3 shrink-0" />
                          {f.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3 mt-4 justify-center sm:justify-start flex-wrap">
                    {[
                      { icon: Trophy, val: `${score}/${quiz.questions.length}`, label: "Correct" },
                      { icon: Clock,  val: `~${elapsed}m`,                      label: "Time" },
                      { icon: Target, val: DIFFICULTY_CONFIG[difficulty].label, label: "Level" },
                    ].map(({ icon: Ic, val, label }) => (
                      <div
                        key={label}
                        className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-center min-w-[70px]"
                      >
                        <Ic className="h-4 w-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{val}</p>
                        <p className="text-xs text-slate-400">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Answer Breakdown</h3>

              {quiz.questions.map((q, i) => {
                const ans = answers[i];
                const correct = ans?.isCorrect;
                return (
                  <div
                    key={i}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-lg p-6 ${
                      correct
                        ? "border-emerald-200 dark:border-emerald-900/50"
                        : "border-rose-200 dark:border-rose-900/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          correct
                            ? "bg-emerald-50 dark:bg-emerald-900/20"
                            : "bg-rose-50 dark:bg-rose-900/20"
                        }`}
                      >
                        {correct
                          ? <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          : <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                          Q{i + 1}. {q.question}
                        </p>
                        {!correct && (
                          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-3 text-sm">
                            <span>
                              <span className="text-rose-600 dark:text-rose-400 font-medium">Your answer: </span>
                              <span className="text-slate-500 dark:text-slate-400">{q.options[ans?.selected]}</span>
                            </span>
                            <span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Correct: </span>
                              <span className="text-slate-500 dark:text-slate-400">{q.options[q.correct]}</span>
                            </span>
                          </div>
                        )}
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                            Explanation
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Summary
                  </h3>
                  <div className="space-y-3 mb-5">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Final Score</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pct}%</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Correct Answers</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {score}/{quiz.questions.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">What's Next?</h3>
                  <ul className="space-y-3">
                    {[
                      "Review your incorrect answers",
                      "Try a harder difficulty level",
                      "Upload different study materials",
                      "Retake the quiz to improve",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return null;
}
