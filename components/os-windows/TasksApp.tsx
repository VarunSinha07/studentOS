"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Square,
  Plus,
  CheckSquare,
  Clock,
  CalendarDays,
  Loader2,
  Trash2,
  Flag,
  Calendar,
  ChevronDown,
} from "lucide-react";
import gsap from "gsap";
import {
  createTask,
  getAgendaTasks,
  toggleTask,
  deleteTask,
  updateTask,
} from "@/actions/tasks";
import { authClient } from "@/lib/auth-client";

// Mac OS Window Control Buttons
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

type TaskPriority = "Low" | "Medium" | "High";

type AgendaTask = {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: TaskPriority;
  dueDate: string | Date | null;
};

const normalizePriority = (priority: string): TaskPriority => {
  switch (priority) {
    case "Low":
    case "Medium":
    case "High":
      return priority;
    default:
      return "Medium";
  }
};

const normalizeTask = (task: {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: string;
  dueDate: Date | string | null;
}): AgendaTask => ({
  ...task,
  priority: normalizePriority(task.priority),
  dueDate: task.dueDate,
});

export function TasksApp({
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

  const [tasks, setTasks] = useState<AgendaTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New States for Priority, Dates, and Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPriority, setEditPriority] = useState<TaskPriority>("Medium");
  const [editDate, setEditDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] =
    useState<TaskPriority>("Medium");
  const [newTaskDate, setNewTaskDate] = useState("");
  const userId = session?.user?.id;

  // Window Controls State
  const isMinimizedRef = useRef(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const prevZIndex = useRef(zIndex);

  // Un-minimize when focused from dock
  useEffect(() => {
    if (zIndex > prevZIndex.current && isMinimizedRef.current) {
      isMinimizedRef.current = false;
      gsap.to(windowRef.current, {
        scale: 1,
        opacity: 1,
        y: isMaximized ? 0 : 0,
        duration: 0.5,
        ease: "back.out(1.7)",
      });
    }
    prevZIndex.current = zIndex;
  }, [zIndex, isMaximized]);

  const handleMinimize = () => {
    isMinimizedRef.current = true;
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
        top: "5rem",
        left: "5rem",
        width: "100%",
        maxWidth: "600px",
        height: "auto",
        maxHeight: "80vh",
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

  // GSAP 3D Tilt Entrance
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

  useEffect(() => {
    if (!userId) return;

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        const res = await getAgendaTasks(userId);
        if (res?.success) setTasks((res.tasks || []).map(normalizeTask));
        setLoading(false);
      })();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [userId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !session?.user?.id) return;
    setSubmitting(true);
    const res = await createTask(
      session.user.id,
      newTaskTitle,
      newTaskDate ? new Date(newTaskDate) : null,
      newTaskPriority,
    );
    if (res?.success && res.task) {
      setTasks((prev) => [normalizeTask(res.task), ...prev]);
      setNewTaskTitle("");
      setNewTaskDate("");
      setNewTaskPriority("Medium");
    }
    setSubmitting(false);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isCompleted: !currentStatus } : t,
      ),
    );
    await toggleTask(id, !currentStatus);
  };

  const handleDelete = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await deleteTask(id);
  };

  const handleStartEdit = (
    id: string,
    priority: TaskPriority,
    dueDate: string | Date | null,
  ) => {
    setEditingId(id);
    setEditPriority(priority || "Medium");
    setEditDate(dueDate ? new Date(dueDate).toISOString().split("T")[0] : "");
  };

  const handleSaveEdit = async (id: string) => {
    const res = await updateTask(
      id,
      editPriority,
      editDate ? new Date(editDate) : null,
    );
    if (res?.success) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, priority: editPriority, dueDate: editDate || null }
            : t,
        ),
      );
      setEditingId(null);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "High":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "Low":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      default:
        return "text-orange-400 bg-orange-500/10 border-orange-500/30";
    }
  };

  const getPriorityFlag = (priority: TaskPriority) => {
    switch (priority) {
      case "High":
        return "text-red-400";
      case "Low":
        return "text-blue-400";
      default:
        return "text-orange-400";
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <motion.div
      ref={windowRef}
      drag={!isMaximized}
      dragConstraints={{
        top: 0,
        left: 0,
        right: Math.max(0, window.innerWidth - 600),
        bottom: Math.max(0, window.innerHeight - 500),
      }}
      // @ts-expect-error valid undocumented prop
      dragHandle=".title-bar"
      onPointerDown={onFocus}
      style={{ zIndex }}
      className="absolute top-20 left-20 w-full max-w-[600px] bg-[#111116]/85 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.05)] ring-1 ring-white/5 flex flex-col h-[70vh] max-h-[700px] min-h-[450px]"
    >
      <div className="title-bar h-12 bg-[#1a1a24]/60 flex items-center px-4 justify-between border-b border-white/5 backdrop-blur-xl cursor-grab active:cursor-grabbing shrink-0 transition-colors">
        <MacDots
          onClose={onClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
        />
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono font-medium tracking-wide pointer-events-none">
          <Clock className="w-3.5 h-3.5 text-emerald-500" /> ~/agenda.sh
        </div>
        <div className="w-[50px]"></div>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex items-center justify-between mb-8 z-10 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1 font-serif">
              Daily Agenda
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Keep your momentum high.
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex flex-col items-center justify-center shadow-inner">
            <span className="text-xl font-bold text-emerald-400 leading-none">
              {tasks.filter((t) => t.isCompleted).length}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-emerald-500/70 font-semibold mt-1">
              Done
            </span>
          </div>
        </div>

        <form onSubmit={handleCreate} className="mb-6 z-10 shrink-0">
          <div className="bg-[#1a1a24]/60 border border-white/5 rounded-xl transition-all shadow-inner focus-within:border-emerald-500/40 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:bg-[#1a1a24] overflow-hidden flex flex-col group">
            {/* Input Row */}
            <div className="relative flex items-center">
              <div className="pl-4 pr-3 flex items-center pointer-events-none">
                {submitting ? (
                  <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                )}
              </div>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a new task..."
                className="w-full bg-transparent py-3 pr-4 text-sm text-white placeholder:text-slate-500 outline-none"
              />
            </div>

            {/* Metadata Bottom Bar */}
            <div className="flex gap-3 items-center justify-between border-t border-white/5 px-3 py-2 bg-white/[0.02]">
              <div className="flex gap-2 items-center flex-1">
                {/* Compact Priority Select */}
                <div className="relative group/select">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Flag className="w-3.5 h-3.5 text-slate-500 group-focus-within/select:text-emerald-400 transition-colors" />
                  </div>
                  <select
                    value={newTaskPriority}
                    onChange={(e) =>
                      setNewTaskPriority(
                        e.target.value as "Low" | "Medium" | "High",
                      )
                    }
                    className="appearance-none bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg py-1.5 pl-8 pr-6 text-[11px] font-medium text-slate-400 focus:text-slate-200 transition-all outline-none cursor-pointer [color-scheme:dark]"
                  >
                    <option value="Low" className="bg-[#1a1a24] text-slate-200">
                      Low
                    </option>
                    <option
                      value="Medium"
                      className="bg-[#1a1a24] text-slate-200"
                    >
                      Medium
                    </option>
                    <option
                      value="High"
                      className="bg-[#1a1a24] text-slate-200"
                    >
                      High
                    </option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                </div>

                <div className="w-[1px] h-3 bg-white/10" />

                {/* Compact Date Picker */}
                <div className="relative group/date">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 group-focus-within/date:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg py-1.5 pl-8 pr-2 text-[11px] font-medium text-slate-400 focus:text-slate-200 transition-all outline-none cursor-pointer [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Submit Button inside the bar */}
              <button
                type="submit"
                disabled={!newTaskTitle.trim() || submitting}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                Add
              </button>
            </div>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto z-10 pr-2 pb-4 space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500/50" />
              <p className="text-xs font-mono">Fetching datastores...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 opacity-60">
              <CalendarDays className="w-12 h-12 stroke-[1px]" />
              <p className="text-sm font-medium">Your agenda is clear.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group flex flex-col p-3 rounded-xl border transition-all duration-300 ${
                    task.isCompleted
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-white/5 bg-[#1a1a24]/60 hover:bg-[#1a1a24] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => handleToggle(task.id, task.isCompleted)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          task.isCompleted
                            ? "border-emerald-500 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            : "border-slate-500 bg-transparent hover:border-emerald-400/50"
                        }`}
                      >
                        {task.isCompleted && (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-950 stroke-[3px]" />
                        )}
                      </button>

                      <span
                        className={`text-sm font-medium transition-all flex-1 ${
                          task.isCompleted
                            ? "text-slate-500 line-through"
                            : "text-slate-200 group-hover:text-white"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {editingId === task.id ? (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <select
                              value={editPriority}
                              onChange={(e) =>
                                setEditPriority(
                                  e.target.value as "Low" | "Medium" | "High",
                                )
                              }
                              className="appearance-none bg-[#1a1a24] border border-emerald-500/30 rounded-lg py-1.5 pl-3 pr-6 text-xs text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none cursor-pointer [color-scheme:dark]"
                            >
                              <option
                                value="Low"
                                className="bg-[#1a1a24] text-slate-200"
                              >
                                Low
                              </option>
                              <option
                                value="Medium"
                                className="bg-[#1a1a24] text-slate-200"
                              >
                                Med
                              </option>
                              <option
                                value="High"
                                className="bg-[#1a1a24] text-slate-200"
                              >
                                High
                              </option>
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                          </div>

                          <div className="relative">
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="bg-[#1a1a24] border border-emerald-500/30 rounded-lg py-1.5 px-2 text-xs text-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none cursor-pointer [color-scheme:dark]"
                            />
                          </div>

                          <button
                            onClick={() => handleSaveEdit(task.id)}
                            className="px-2.5 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <>
                          {task.dueDate && (
                            <span className="text-[11px] px-2 py-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/20 font-medium flex items-center gap-1.5 whitespace-nowrap">
                              <Calendar className="w-3 h-3" />{" "}
                              {formatDate(task.dueDate)}
                            </span>
                          )}

                          <span
                            className={`text-[11px] px-2 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${getPriorityColor(task.priority)}`}
                          >
                            <Flag
                              className={`w-3 h-3 ${getPriorityFlag(task.priority)}`}
                            />{" "}
                            {task.priority}
                          </span>

                          <button
                            onClick={() =>
                              handleStartEdit(
                                task.id,
                                task.priority,
                                task.dueDate,
                              )
                            }
                            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit task"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
