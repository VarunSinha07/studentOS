"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Square,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import gsap from "gsap";
import { getSubjects, createSubject } from "@/actions/subjects";
import { createNote, updateNote } from "@/actions/notes";
import { authClient } from "@/lib/auth-client";
import { generateStudyPlan } from "@/actions/ai";

// Mac OS Window Control Buttons Component
function MacDots({
  onClose,
  onMinimize,
  onMaximize,
}: {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}) {
  return (
    <div className="flex items-center gap-2 group shrink-0">
      <button
        onClick={onClose}
        className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center relative overflow-hidden transition-colors hover:bg-red-500"
      >
        <X className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      <button
        onClick={onMinimize}
        className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center relative overflow-hidden transition-colors hover:bg-yellow-500"
      >
        <Minus className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      <button
        onClick={onMaximize}
        className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center relative overflow-hidden transition-colors hover:bg-green-500"
      >
        <Square className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
}

// Temporary Mock Data for AI Generation
type MockPlanItem = {
  day: number;
  title: string;
  description: string;
};

export function StudyPlannerApp({
  onClose,
  zIndex,
  onFocus,
}: {
  onClose: () => void;
  zIndex: number;
  onFocus: () => void;
}) {
  const windowRef = useRef<HTMLDivElement>(null);
  const { data: session } = authClient.useSession();

  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [newSubjectName, setNewSubjectName] = useState<string>("");
  const [examDate, setExamDate] = useState<string>("");
  // File Context Upload
  const [syllabusBase64, setSyllabusBase64] = useState<string>("");
  const [syllabusMimeType, setSyllabusMimeType] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<MockPlanItem[] | null>(null);
  const [error, setError] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("File is too large (Max 2MB).");
      return;
    }

    setSyllabusMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      setSyllabusBase64(base64String);
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  // Window Controls State
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const prevZIndex = useRef(zIndex);

  // Fetch subjects on mount
  useEffect(() => {
    if (session?.user?.id) {
      getSubjects(session.user.id).then((result) => {
        if (result.success && result.subjects) {
          const data = result.subjects;
          setSubjects(data);
          if (data.length > 0) setSelectedSubject(data[0].id);
        }
        setLoading(false);
      });
    }
  }, [session?.user?.id]);

  // Un-minimize when focused from dock
  useEffect(() => {
    if (zIndex > prevZIndex.current && isMinimized) {
      setIsMinimized(false);
      gsap.to(windowRef.current, {
        scale: 1,
        opacity: 1,
        y: isMaximized ? 0 : 0, // Reset Y if not maximized, handled seamlessly by GSAP
        duration: 0.5,
        ease: "back.out(1.7)",
      });
    }
    prevZIndex.current = zIndex;
  }, [zIndex, isMinimized, isMaximized]);

  const handleMinimize = () => {
    setIsMinimized(true);
    gsap.to(windowRef.current, {
      scale: 0.8,
      opacity: 0,
      y: "+=300",
      duration: 0.4,
      ease: "power3.inOut",
    });
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      gsap.to(windowRef.current, {
        top: "6rem",
        left: "6rem",
        width: "100%",
        maxWidth: "700px",
        height: "75vh",
        maxHeight: "750px",
        borderRadius: "1rem",
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power3.inOut",
      });
    } else {
      setIsMaximized(true);
      gsap.to(windowRef.current, {
        top: "32px",
        left: 0,
        width: "100vw",
        maxWidth: "100vw",
        height: "calc(100vh - 32px)",
        maxHeight: "none",
        borderRadius: 0,
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power3.inOut",
      });
    }
  };

  // Entrance Animation
  useEffect(() => {
    gsap.fromTo(
      windowRef.current,
      { opacity: 0, scale: 0.85, rotateX: 10, y: 50 },
      {
        opacity: 1,
        scale: 1,
        rotateX: 0,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        transformPerspective: 1200,
      },
    );
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) {
      setError("Please select a subject or create one.");
      return;
    }
    if (selectedSubject === "create_new" && !newSubjectName.trim()) {
      setError("Please enter a name for the new subject.");
      return;
    }
    if (!examDate) {
      setError("Please provide an exam date.");
      return;
    }

    const examD = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (examD <= today) {
      setError("Exam date must be in the future.");
      return;
    }

    const timeDiff = examD.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysLeft > 60) {
      setError(
        "Exam date is too far away. Limit is 60 days to ensure a focused plan.",
      );
      return;
    }

    setError("");
    setGenerating(true);
    setPlan(null);
    setSaveSuccess(false);

    try {
      let targetSubjectId = selectedSubject;
      let targetSubjectName = newSubjectName;

      if (selectedSubject === "create_new" && session?.user?.id) {
        const createSubRes = await createSubject(
          session.user.id,
          newSubjectName,
        );
        if (createSubRes.success && createSubRes.subject) {
          targetSubjectId = createSubRes.subject.id;
          targetSubjectName = createSubRes.subject.name;
          setSubjects((prev) => [...prev, createSubRes.subject!]);
          setSelectedSubject(targetSubjectId);
        } else {
          setError(createSubRes.error || "Failed to create subject.");
          setGenerating(false);
          return;
        }
      } else {
        targetSubjectName =
          subjects.find((s) => s.id === selectedSubject)?.name || "the subject";
      }

      const res = await generateStudyPlan(
        targetSubjectName,
        examD.toLocaleDateString(),
        daysLeft,
        targetSubjectId,
        session?.user?.id,
        syllabusBase64 || undefined,
        syllabusMimeType || undefined,
      );

      if (res.success && res.plan) {
        setPlan(res.plan);

        // Auto-save the plan as a new note in the Knowledge Base
        const noteRes = await createNote(
          session?.user?.id as string,
          targetSubjectId,
        );
        if (noteRes.success && noteRes.note) {
          const planHtml = `
            <h1>Study Plan: ${targetSubjectName}</h1>
            <p><strong>Exam Date:</strong> ${examD.toLocaleDateString()} (${daysLeft} Days)</p>
            <br />
            ${res.plan
              .map(
                (item: { day: number; title: string; description: string }) => `
              <h2>Day ${item.day}: ${item.title}</h2>
              <p>${item.description}</p>
            `,
              )
              .join("")}
          `;

          await updateNote(
            noteRes.note.id,
            `Study Plan - ${examD.toLocaleDateString()}`,
            planHtml,
            targetSubjectId,
          );
          setSaveSuccess(true);

          // Dispatch global event for the Notes app to auto-refresh its data
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("notes-updated"));
          }
        }
      } else {
        setError(res.error || "Failed to generate plan.");
      }
    } catch (err: Error | unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div
      ref={windowRef}
      drag={!isMaximized}
      dragConstraints={{
        top: 0,
        left: 0,
        right: Math.max(
          0,
          typeof window !== "undefined" ? window.innerWidth - 700 : 0,
        ),
        bottom: Math.max(
          0,
          typeof window !== "undefined" ? window.innerHeight - 550 : 0,
        ),
      }}
      // @ts-expect-error valid undocumented prop
      dragHandle=".title-bar"
      onPointerDown={onFocus}
      style={{ zIndex }}
      className="absolute top-24 left-32 w-full max-w-[700px] bg-[#111116]/85 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6),_0_0_0_1px_rgba(255,255,255,0.05)] ring-1 ring-white/5 flex flex-col h-[75vh] max-h-[750px] min-h-[500px]"
    >
      {/* OS Title Bar */}
      <div className="title-bar h-12 bg-[#1a1a24]/60 flex items-center px-4 justify-between border-b border-white/5 backdrop-blur-xl cursor-grab active:cursor-grabbing shrink-0 transition-colors">
        <MacDots
          onClose={onClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
        />

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono font-medium tracking-wide pointer-events-none">
          <Calendar className="w-3.5 h-3.5 text-orange-400" /> ~/scheduler.exe
        </div>

        <div className="w-[50px]">
          <span className="opacity-0">spacer</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 p-6">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-xl mx-auto relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1 flex items-center gap-3">
              Study Planner <Sparkles className="w-6 h-6 text-orange-400" />
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Generate an AI-powered revision timeline for a subject.
            </p>
          </div>

          <form
            onSubmit={handleGenerate}
            className="bg-[#1c1c24]/80 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-md mb-8"
          >
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                  Subject
                </label>
                {loading ? (
                  <div className="h-10 bg-white/5 animate-pulse rounded-lg border border-white/5"></div>
                ) : (
                  <div className="relative flex flex-col gap-2">
                    <div className="relative">
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 appearance-none [color-scheme:dark]"
                      >
                        {subjects.length === 0 && (
                          <option value="">No subjects found...</option>
                        )}
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                        <option value="create_new">
                          + Create New Subject...
                        </option>
                      </select>
                      <BookOpen className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                    {selectedSubject === "create_new" && (
                      <input
                        type="text"
                        placeholder="New Subject Name"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                        autoFocus
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                  Exam Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 appearance-none [color-scheme:dark]"
                  />
                  <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                  Syllabus Context (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-500/10 file:text-orange-400 hover:file:bg-orange-500/20 bg-black/40 border border-white/10 rounded-lg p-1.5"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating || loading}
              className="w-full h-10 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 tracking-wide shadow-[0_0_20px_rgba(249,115,22,0.2)]"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating
                  Timeline...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate AI Plan
                </>
              )}
            </button>
          </form>

          {/* Generated Timeline UI */}
          <AnimatePresence>
            {plan && !generating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                {saveSuccess && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-1 shadow-lg">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <Sparkles className="w-5 h-5" />
                      Plan Generated & Saved!
                    </div>
                    <p className="text-sm text-emerald-400/80 ml-7">
                      This study plan has been securely saved to your Knowledge
                      Base as a new note.
                    </p>
                  </div>
                )}
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Your Preparation Timeline
                  </h2>
                  <div className="text-xs px-2 py-1 bg-orange-500/10 text-orange-400 rounded-md border border-orange-500/20">
                    Total: {plan.length} Days
                  </div>
                </div>

                {/* Timeline Line */}
                <div className="absolute left-6 top-16 bottom-10 w-px bg-gradient-to-b from-orange-500/50 to-transparent" />

                <div className="space-y-6 relative">
                  {plan.map((item, i) => (
                    <motion.div
                      key={item.day}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4"
                    >
                      {/* Node */}
                      <div className="shrink-0 w-12 h-12 bg-[#1c1c24] border border-orange-500/30 rounded-xl flex flex-col items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.1)] relative z-10">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                          Day
                        </span>
                        <span className="text-orange-400 font-black leading-none mt-0.5">
                          {item.day}
                        </span>
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-black/20 border border-white/5 rounded-xl p-4 hover:bg-black/40 transition-colors group">
                        <h3 className="text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
