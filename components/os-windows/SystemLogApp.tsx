"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Minus, Square, Terminal } from "lucide-react";
import gsap from "gsap";
import { authClient } from "@/lib/auth-client";
import { getDashboardStats } from "@/actions/stats";

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

export function SystemLogApp({
  onClose,
  zIndex,
  onFocus,
}: {
  onClose: () => void;
  zIndex: number;
  onFocus: () => void;
}) {
  const windowRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: session } = authClient.useSession();

  const isMinimizedRef = useRef(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const prevZIndex = useRef(zIndex);

  const [logs, setLogs] = useState<
    { id: number; time: string; prefix: string; msg: string; color: string }[]
  >([]);

  const formatTime = () => {
    const now = new Date();
    return (
      now.toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) +
      "." +
      String(now.getMilliseconds()).padStart(3, "0")
    );
  };

  const appendLog = (
    prefix: string,
    msg: string,
    color: string = "text-slate-300",
  ) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        time: formatTime(),
        prefix,
        msg,
        color,
      },
    ]);
  };

  // Run Boot sequence
  const hasBooted = useRef(false);

  useEffect(() => {
    if (hasBooted.current || !session?.user) return;
    hasBooted.current = true;

    const bootSequence = async () => {
      // Small helper to wait
      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

      await delay(300);
      appendLog("SYSTEM", "Initializing Kernel Simulator...", "text-slate-400");

      await delay(500);
      appendLog(
        "MOUNT",
        "Mounting virtual file system (VFS) to /dev/disk1s1",
        "text-emerald-400",
      );

      await delay(400);
      appendLog("AUTH", "Verifying user session token...", "text-blue-400");

      await delay(400);
      appendLog(
        "AUTH",
        `Session validated for ${session.user.name || "User"}`,
        "text-emerald-400",
      );

      await delay(300);
      appendLog(
        "PROC",
        "studentos_daemon started with PID 1042",
        "text-purple-400",
      );

      await delay(400);
      appendLog(
        "SYS",
        "Checking system vitals and user telemetry...",
        "text-slate-400",
      );

      try {
        const res = await getDashboardStats(session.user.id);
        await delay(600);

        if (res.success && res.stats) {
          appendLog(
            "TELEMETRY",
            `Tasks due today: ${res.stats.todayTasks}`,
            "text-orange-400",
          );
          appendLog(
            "TELEMETRY",
            `Upcoming Deadlines: ${res.stats.upcomingDeadlines}`,
            "text-orange-400",
          );
          appendLog(
            "TELEMETRY",
            `Continuous Activity Streak: ${res.stats.streak} days`,
            "text-emerald-400",
          );
          appendLog(
            "TELEMETRY",
            `Productivity Quota: ${res.stats.productivity}%`,
            "text-blue-400",
          );
          await delay(300);
          appendLog(
            "SYSTEM",
            "Boot sequence complete. Ready for input.",
            "text-emerald-500",
          );
        } else {
          appendLog(
            "ERROR",
            "Failed to retrieve telemetry data.",
            "text-red-500",
          );
        }
      } catch {
        appendLog("ERROR", "Telemetry daemon unavailable.", "text-red-500");
      }
    };

    bootSequence();
  }, [session?.user]);

  // Listeners
  useEffect(() => {
    const handlePref = () =>
      appendLog(
        "SYS",
        "preferences-updated event triggered: local storage synchronized",
        "text-orange-400",
      );
    const handleNotes = () =>
      appendLog(
        "FS",
        "notes-updated event: database synchronized successfully",
        "text-blue-400",
      );
    const handleOsProc = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.action === "START")
        appendLog(
          "PROC",
          `Launched application instance: '${detail.app}'`,
          "text-emerald-400",
        );
      if (detail && detail.action === "TERM")
        appendLog(
          "PROC",
          `Terminated application instance: '${detail.app}'`,
          "text-red-400",
        );
    };

    window.addEventListener("preferences-updated", handlePref);
    window.addEventListener("notes-updated", handleNotes);
    window.addEventListener("os-process", handleOsProc);
    return () => {
      window.removeEventListener("preferences-updated", handlePref);
      window.removeEventListener("notes-updated", handleNotes);
      window.removeEventListener("os-process", handleOsProc);
    };
  }, []);

  // Auto Scroll
  useEffect(() => {
    if (scrollRef.current) {
      gsap.to(scrollRef.current, {
        scrollTop: scrollRef.current.scrollHeight,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [logs]);

  // Maximize / Minimize / Entrance Effect
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
        top: "6rem",
        left: "6rem",
        width: "100%",
        maxWidth: "700px",
        height: "65vh",
        maxHeight: "600px",
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

  useEffect(() => {
    gsap.fromTo(
      windowRef.current,
      { opacity: 0, scale: 0.85, y: 50 },
      {
        opacity: 1,
        scale: 1,
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
      drag={!isMaximized}
      dragConstraints={{
        top: 0,
        left: 0,
        right: typeof window !== "undefined" ? window.innerWidth - 700 : 0,
        bottom: typeof window !== "undefined" ? window.innerHeight - 550 : 0,
      }}
      // @ts-expect-error dragHandle is an internally valid property occasionally complaining in exact types
      dragHandle=".title-bar"
      onPointerDown={onFocus}
      style={{ zIndex }}
      className="absolute top-24 left-24 w-full max-w-[700px] bg-[#0a0a0c]/95 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8),_0_0_0_1px_rgba(255,255,255,0.05)] ring-1 ring-white/5 flex flex-col h-[65vh] max-h-[600px] min-h-[400px]"
    >
      <div className="title-bar h-12 bg-[#14141a]/80 flex items-center px-4 justify-between border-b border-white/5 backdrop-blur-xl cursor-grab active:cursor-grabbing shrink-0 transition-colors">
        <MacDots
          onClose={onClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
        />
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono font-medium tracking-wide pointer-events-none">
          <Terminal className="w-3.5 h-3.5 text-slate-400" /> ~/system_log.exe
        </div>
        <div className="w-[50px]"></div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-[12px] leading-relaxed tracking-tight select-text scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
      >
        <div className="flex flex-col gap-1 pb-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 hover:bg-white/5 px-2 py-0.5 rounded transition-colors group break-words whitespace-pre-wrap"
            >
              <span className="text-slate-500 shrink-0 select-none">
                [{log.time}]
              </span>
              <span
                className={`font-semibold shrink-0 select-none w-14 ${log.color}`}
              >
                [{log.prefix}]
              </span>
              <span className="text-slate-300 ml-1 break-words w-full">
                {log.msg}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 px-2 mt-2">
            <span className="w-2 h-4 bg-slate-300 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
