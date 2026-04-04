"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Square,
  Flame,
  TrendingUp,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import gsap from "gsap";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDashboardStats, getWeeklyProgress } from "@/actions/stats";
import { authClient } from "@/lib/auth-client";
import { Draggable } from "gsap/all";

gsap.registerPlugin(Draggable);

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

interface DashboardStats {
  streak: number;
  productivity: number;
  todayTasks: number;
  upcomingDeadlines: number;
}

interface WeeklyData {
  date: string;
  completed: number;
  pending: number;
}

export function DashboardApp({
  onClose,
  zIndex,
  onFocus,
}: {
  onClose: () => void;
  zIndex: number;
  onFocus: () => void;
}) {
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { data: session } = authClient.useSession();

  const [stats, setStats] = useState<DashboardStats>({
    streak: 0,
    productivity: 0,
    todayTasks: 0,
    upcomingDeadlines: 0,
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  // Window Controls State
  const isMinimizedRef = useRef(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const prevZIndex = useRef(zIndex);
  const draggableRef = useRef<InstanceType<typeof Draggable> | null>(null);

  // Fetch stats on mount
  useEffect(() => {
    if (session?.user?.id) {
      const fetchStats = async () => {
        setLoading(true);
        try {
          const [statsRes, progressRes] = await Promise.all([
            getDashboardStats(session.user.id),
            getWeeklyProgress(session.user.id),
          ]);

          if (statsRes.success) {
            setStats(statsRes.stats);
          }
          if (progressRes.success) {
            setWeeklyData(progressRes.data);
          }
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchStats();
    }
  }, [session?.user?.id]);

  // Un-minimize when focused
  useEffect(() => {
    if (zIndex > prevZIndex.current && isMinimizedRef.current) {
      isMinimizedRef.current = false;
      gsap.to(windowRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
      });
    }
    prevZIndex.current = zIndex;
  }, [zIndex]);

  // Setup draggable on mount
  useEffect(() => {
    if (windowRef.current && headerRef.current) {
      if (draggableRef.current) {
        draggableRef.current.kill();
      }

      draggableRef.current = Draggable.create(windowRef.current, {
        trigger: headerRef.current,
        bounds: {
          minX: -window.innerWidth,
          maxX: window.innerWidth,
          minY: 0,
          maxY: window.innerHeight,
        },
        edgeResistance: 0.65,
        inertia: true,
      })[0];
    }

    return () => {
      if (draggableRef.current) {
        draggableRef.current.kill();
      }
    };
  }, []);

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
        width: "600px",
        maxWidth: "600px",
        height: "auto",
        maxHeight: "80vh",
        borderRadius: "1rem",
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
        duration: 0.5,
        ease: "power3.inOut",
      });
    }
  };

  // Entrance animation
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

  return (
    <motion.div
      ref={windowRef}
      onClick={onFocus}
      className="fixed top-20 left-20 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col"
      style={{ zIndex }}
    >
      {/* Header */}
      <div
        ref={headerRef}
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600 cursor-grab active:cursor-grabbing"
      >
        <h1 className="text-sm font-semibold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <MacDots
          onClose={onClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Streak Card */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border border-orange-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Current Streak
                    </p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {stats.streak} days
                    </p>
                  </div>
                  <Flame className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              {/* Productivity Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border border-green-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Productivity
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.productivity}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>

              {/* Today's Tasks Card */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border border-blue-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Today&apos;s Tasks
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.todayTasks}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              {/* Upcoming Deadlines Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border border-purple-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Next 7 Days
                    </p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.upcomingDeadlines}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Weekly Progress
              </h3>
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "0.5rem",
                        color: "#f1f5f9",
                      }}
                    />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No data available
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
