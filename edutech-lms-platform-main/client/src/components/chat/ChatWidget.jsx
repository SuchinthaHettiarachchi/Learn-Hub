import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquare, Send, Sparkles, X } from "lucide-react";

import api from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const uid = () => {
  if (typeof crypto !== "undefined" && crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const makeAssistantSeed = () => ({
  id: uid(),
  role: "assistant",
  content:
    "Hi! I’m Learn Hub. Ask me course-related questions (for best results, include the module/topic you’re working on).",
});

export function ChatWidget() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const courseId = useMemo(() => {
    // Parse courseId directly from URL.
    // Examples:
    // - /course/:id
    // - /course/:id/learn
    // We do this instead of `useParams()` because this widget lives in `Layout`
    // (outside of the `<Routes>` tree), where route params may not be available.
    const pathname = location?.pathname || "";
    const match = pathname.match(/^\/course\/([^/]+)/);
    return match?.[1];
  }, [location?.pathname]);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const listRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [makeAssistantSeed()];
    });
  }, [loading, user]);

  useEffect(() => {
    if (!isOpen) return;
    // Scroll to the bottom when opening and on new messages.
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [isOpen, messages]);

  if (loading || !user) return null;

  const canAsk = Boolean(courseId) && !sending;

  const submit = async (e) => {
    e?.preventDefault?.();
    setError("");

    if (!courseId) {
      setError("Open a course page to ask course-related questions.");
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = {
      id: uid(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setText("");
    setSending(true);

    try {
      const response = await api.post("/chat/ask", {
        message: trimmed,
        courseId,
      });

      const reply = response.data?.reply;
      if (!reply) {
        throw new Error("Empty reply");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to generate a chatbot response.";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content:
            "Sorry—something went wrong while generating the answer. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {!isOpen ? (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full bg-white/90 dark:bg-slate-950/80 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-lg hover:bg-white dark:hover:bg-slate-900"
            title="Learn Hub (course chat)"
          >
            <MessageSquare className="h-5 w-5 text-primary" />
          </Button>
        </div>
      ) : (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[90vw]">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    Learn Hub
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                    Course-focused assistant
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-slate-700 dark:text-slate-200"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div
              ref={listRef}
              className="p-4 h-80 overflow-y-auto space-y-3 bg-gradient-to-b from-blue-50/60 to-transparent dark:from-blue-900/20"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 text-sm text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                      <span>Thinking…</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={submit} className="p-3 border-t border-slate-200 dark:border-slate-800">
              {error && (
                <div className="mb-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-200">
                  {error}
                </div>
              )}

              {!courseId && (
                <div className="mb-2 text-xs text-slate-600 dark:text-slate-300">
                  Open a course page to ask course-related questions.
                </div>
              )}

              <div className="flex items-end gap-2">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={courseId ? "Ask about your course..." : "Course page required"}
                  rows={2}
                  disabled={!courseId || sending}
                  className="min-h-[44px] max-h-[120px] resize-none"
                />

                <Button
                  type="submit"
                  disabled={!canAsk || !text.trim()}
                  className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:hover:bg-blue-600"
                  title="Send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

