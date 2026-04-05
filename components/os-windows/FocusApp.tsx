"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  X,
  Minus,
  Square,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  BrainCircuit,
  Settings2,
} from "lucide-react";
import gsap from "gsap";

// Mac OS Window Control Buttons
function MacDots({
  onClose,
  onMinimize,
  onMaximize,
}: {
  onClose?: () => void;
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

export function FocusApp({
  onClose,
  zIndex = 1,
  onFocus,
}: {
  onClose?: () => void;
  zIndex?: number;
  onFocus?: () => void;
}) {
  const windowRef = useRef<HTMLDivElement>(null);

  // Window Controls State
  const isMinimizedRef = useRef(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const prevZIndex = useRef(zIndex);

  // User Settings
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isEditing, setIsEditing] = useState(false);

  // Focus Timer State
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");

  const playBeep = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + start + dur,
        );
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };

      if (mode === "work") {
        // High pitched double beep for Break Time!
        playTone(800, 0, 0.3);
        playTone(1000, 0.4, 0.5);
      } else {
        // Low pitched for Back to Work!
        playTone(600, 0, 0.3);
        playTone(400, 0.4, 0.5);
      }
    } catch {
      console.log("Audio not supported or disabled");
    }
  }, [mode]);

  // Timer Logic
  useEffect(() => {
    if (!isActive) return;

    const interval: NodeJS.Timeout = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playBeep();
          setMode((prevMode) => (prevMode === "work" ? "break" : "work"));
          setIsActive(false);
          return mode === "work" ? breakDuration * 60 : workDuration * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, mode, workDuration, breakDuration, playBeep]);
  useEffect(() => {
    const event = new CustomEvent("focus-timer-tick", {
      detail: { timeLeft, mode, isActive },
    });
    window.dispatchEvent(event);
  }, [timeLeft, mode, isActive]);

  // Formatting helpers
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return (
      "" + m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0")
    );
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(mode === "work" ? workDuration * 60 : breakDuration * 60);
  };

  const toggleMode = (newMode: "work" | "break") => {
    if (mode === newMode) return;
    setMode(newMode);
    setTimeLeft(newMode === "work" ? workDuration * 60 : breakDuration * 60);
    setIsActive(false);
  };

  // Window animations
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
        maxWidth: "400px",
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
      drag={!isMaximized}
      dragConstraints={{
        top: 0,
        left: 0,
        right:
          typeof window !== "undefined"
            ? Math.max(0, window.innerWidth - 400)
            : 0,
        bottom:
          typeof window !== "undefined"
            ? Math.max(0, window.innerHeight - 500)
            : 0,
      }}
      // @ts-expect-error valid undocumented prop
      dragHandle=".title-bar"
      onPointerDown={onFocus}
      style={{ zIndex }}
      className="absolute top-20 left-[calc(50%-200px)] w-full max-w-[400px] bg-[#111116]/85 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.05)] ring-1 ring-white/5 flex flex-col h-[400px]"
    >
      <div className="title-bar h-12 bg-[#1a1a24]/60 flex items-center px-4 justify-between border-b border-white/5 backdrop-blur-xl cursor-grab active:cursor-grabbing shrink-0 transition-colors z-20">
        <MacDots
          onClose={onClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
        />
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono font-medium tracking-wide pointer-events-none">
          <Clock className="w-3.5 h-3.5 text-slate-400" /> ~/focus.sh
        </div>
        <div className="w-[50px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Animated Background Glow */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[100px] pointer-events-none rounded-full transition-colors duration-1000 ${
            mode === "work" ? "bg-indigo-500/30" : "bg-emerald-500/30"
          }`}
        />

        <div className="z-10 flex flex-col items-center w-full">
          {/* Mode Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-full mb-8 border border-white/10">
            <button
              onClick={() => toggleMode("work")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                mode === "work"
                  ? "bg-indigo-500 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              Focus
            </button>
            <button
              onClick={() => toggleMode("break")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                mode === "break"
                  ? "bg-emerald-500 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Coffee className="w-4 h-4" />
              Break
            </button>
          </div>

          {/* Timer Display */}
          <div className="relative flex flex-col items-center justify-center py-6 group w-full min-h-[140px]">
            {!isEditing ? (
              <div className="text-7xl font-extrabold font-mono tracking-tighter text-white">
                {formatTime(timeLeft)}
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-white/90">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Work (min)
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={workDuration}
                    onChange={(e) => {
                      const nextValue = Number(e.target.value) || 1;
                      setWorkDuration(nextValue);
                      if (!isActive && mode === "work") {
                        setTimeLeft(nextValue * 60);
                      }
                    }}
                    className="w-20 bg-black/30 border border-white/20 rounded-lg px-3 py-1.5 text-xl font-mono text-center outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Break (min)
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={breakDuration}
                    onChange={(e) => {
                      const nextValue = Number(e.target.value) || 1;
                      setBreakDuration(nextValue);
                      if (!isActive && mode === "break") {
                        setTimeLeft(nextValue * 60);
                      }
                    }}
                    className="w-20 bg-black/30 border border-white/20 rounded-lg px-3 py-1.5 text-xl font-mono text-center outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center transition-colors ${
                isEditing
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Settings2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                mode === "work"
                  ? "bg-indigo-500 hover:bg-indigo-400 text-white"
                  : "bg-emerald-500 hover:bg-emerald-400 text-white"
              }`}
            >
              {isActive ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>
            <button
              onClick={handleReset}
              className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default FocusApp;
