import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../lib/auth.jsx";
import {
  Layers, BookOpen, Lightbulb, Brain, ChevronLeft,
  Loader2, FileText, CheckCircle
} from "lucide-react";

const difficulties = [
  { level: "beginner", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/30", active: "bg-emerald-100 dark:bg-emerald-400/20 border-emerald-500 dark:border-emerald-400", desc: "Simple language, analogies" },
  { level: "intermediate", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-400/10 border-amber-200 dark:border-amber-400/30", active: "bg-amber-100 dark:bg-amber-400/20 border-amber-500 dark:border-amber-400", desc: "Some technical terms" },
  { level: "advanced", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-400/10 border-rose-200 dark:border-rose-400/30", active: "bg-rose-100 dark:bg-rose-400/20 border-rose-500 dark:border-rose-400", desc: "Expert level, precise" },
];

const tabs = [
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "summary", label: "Summary", icon: BookOpen },
  { id: "explain", label: "Explain Concept", icon: Lightbulb },
];

export default function ContentGenerator() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [docLoading, setDocLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("flashcards");
  const [difficulty, setDifficulty] = useState("beginner");
  const [concept, setConcept] = useState("");
  const [errors, setErrors] = useState({});
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchDoc = async () => {
      setDocLoading(true);
      try {
        const res = await axios.get(`/api/content/documents/${documentId}`);
        setDoc(res.data.document);
      } catch {
        setDoc({ _id: documentId, title: "Sample Document", status: "ready", pageCount: 24 });
      } finally {
        setDocLoading(false);
      }
    };
    fetchDoc();
  }, [documentId]);

  // Reset result when tab or difficulty changes
  useEffect(() => { setResult(null); setErrors({}); }, [activeTab, difficulty]);

  const validate = () => {
    const newErrors = {};
    if (activeTab === "explain" && !concept.trim())
      newErrors.concept = "Please enter a concept to explain.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    setGenerating(true);
    setResult(null);

    try {
      let res;
      if (activeTab === "flashcards") {
        res = await axios.post("/api/content/flashcards", { documentId, difficulty, userId: user._id });
        setResult({ type: "flashcards", cards: res.data.cards, difficulty });
      } else if (activeTab === "summary") {
        res = await axios.post("/api/content/summary", { documentId, difficulty, userId: user._id });
        setResult({ type: "summary", content: res.data.content, difficulty });
      } else if (activeTab === "explain") {
        res = await axios.post("/api/content/explain", { documentId, concept, difficulty, userId: user._id });
        setResult({ type: "explanation", content: res.data.content, concept: res.data.concept, difficulty });
      }
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Generation failed. Please try again." });
    } finally {
      setGenerating(false);
    }
  };

  if (docLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">

        {/* Back + Doc info */}
        <button onClick={() => navigate("/content")} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Documents
        </button>

        <div className="flex items-center gap-4 mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-400/10 border border-blue-200 dark:border-blue-400/20 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-50 text-lg">{doc?.title}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{doc?.pageCount} pages · Ready to generate</p>
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex gap-2 mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === id ? "bg-blue-600 text-white shadow" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Difficulty selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map(({ level, color, bg, active, desc }) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`p-3 rounded-xl border text-left transition-all ${difficulty === level ? active : bg}`}
              >
                <p className={`font-bold capitalize text-sm ${difficulty === level ? "text-slate-900 dark:text-slate-50" : color}`}>{level}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Concept input for explain tab */}
        {activeTab === "explain" && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Concept to Explain
            </label>
            <input
              type="text"
              value={concept}
              onChange={(e) => { setConcept(e.target.value); setErrors(err => ({ ...err, concept: undefined })); }}
              placeholder="e.g. gradient descent, binary tree, neural networks..."
              className={`w-full bg-white dark:bg-slate-800 border rounded-xl px-4 py-3 text-slate-900 dark:text-slate-50 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.concept ? "border-rose-500 dark:border-rose-500" : "border-slate-300 dark:border-slate-600"}`}
            />
            {errors.concept && <p className="text-rose-600 dark:text-rose-400 text-xs mt-1.5">{errors.concept}</p>}
          </div>
        )}

        {errors.api && (
          <p className="text-rose-600 dark:text-rose-400 text-sm mb-4 bg-rose-50 dark:bg-rose-400/10 border border-rose-200 dark:border-rose-400/30 rounded-xl px-4 py-3">{errors.api}</p>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mb-8 text-lg"
        >
          {generating
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating with Gemini AI...</>
            : <><Brain className="w-5 h-5" /> Generate {activeTab === "flashcards" ? "Flashcards" : activeTab === "summary" ? "Summary" : "Explanation"}</>}
        </button>

        {/* Results */}
        {result && (
          <div className="animate-in fade-in">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <p className="font-bold text-slate-900 dark:text-slate-50">Generated successfully</p>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full capitalize">{result.difficulty}</span>
            </div>

            {/* Flashcards result */}
            {result.type === "flashcards" && (
              <div className="grid gap-3">
                {result.cards.map((card, idx) => (
                  <FlashCard key={idx} front={card.front} back={card.back} index={idx} />
                ))}
              </div>
            )}

            {/* Summary / Explanation result */}
            {(result.type === "summary" || result.type === "explanation") && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                {result.type === "explanation" && (
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold mb-3">
                    Explaining: <span className="text-slate-900 dark:text-slate-50">"{result.concept}"</span>
                  </p>
                )}
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{result.content}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Flip card component ─────────────────────────────────────────────────────
function FlashCard({ front, back, index }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      onClick={() => setFlipped((f) => !f)}
      className={`cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
        flipped
          ? "bg-blue-50 dark:bg-blue-600/10 border-blue-200 dark:border-blue-500 text-blue-800 dark:text-blue-200"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700"
      }`}
    >
      <p className="text-xs text-slate-500 dark:text-slate-500 font-semibold uppercase tracking-widest mb-2">
        {flipped ? "Answer" : `Card ${index + 1} · Click to reveal`}
      </p>
      <p className={`font-medium leading-relaxed ${flipped ? "text-blue-800 dark:text-blue-200" : "text-slate-900 dark:text-slate-50"}`}>
        {flipped ? back : front}
      </p>
    </div>
  );
}
