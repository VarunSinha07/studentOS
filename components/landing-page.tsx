"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Terminal,
  CheckSquare,
  BookOpen,
  Calendar,
  Layers,
  BarChart2,
  Cpu,
  LogIn,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";

gsap.registerPlugin(ScrollTrigger);

// Helper for Dock Tooltips
function DockItem({
  icon: Icon,
  label,
  color,
  href,
}: {
  icon: any;
  label: string;
  color: string;
  href?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const content = (
    <div
      className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 shadow-inner group transition-all cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon
        className={`w-6 h-6 ${color} group-hover:scale-110 transition-transform`}
      />
      <div
        className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-slate-500 opacity-50 block group-hover:opacity-100 group-hover:bg-current transition-colors"
        style={{ color }}
      />

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute -top-12 px-3 py-1.5 bg-[#1c1c24] border border-white/10 text-slate-200 text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

// Helper for Mac Traffic Lights
function MacDots() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
      <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
      <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
    </div>
  );
}

export function OSLandingPage() {
  const [booted, setBooted] = useState(false);
  const [bootText, setBootText] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<string>("");
  const container = useRef<HTMLDivElement>(null);

  const { data: session, isPending } = authClient.useSession();

  // Clock Update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Boot Sequence Effect
  useEffect(() => {
    const sequence = [
      "Loading StudentOS kernel...",
      "Mounting academic databases...",
      "Initializing AI copilot models...",
      "Starting task daemons...",
      "Setting up workspace UI...",
      "Boot sequence complete.",
    ];
    let step = 0;
    const interval = setInterval(() => {
      setBootText((prev) => [...prev, sequence[step]]);
      step++;
      if (step === sequence.length) {
        clearInterval(interval);
        setTimeout(() => setBooted(true), 600);
      }
    }, 250);
    return () => clearInterval(interval);
  }, []);

  // Main Page GSAP Animations
  useGSAP(
    () => {
      if (!booted) return;

      // Hero Window Intro
      gsap.fromTo(
        ".main-window",
        { opacity: 0, scale: 0.9, y: 50, rotateX: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          duration: 1.2,
          ease: "power4.out",
          delay: 0.1,
          transformPerspective: 1000,
        },
      );

      // Dock Intro
      gsap.fromTo(
        ".os-dock",
        { y: 100, opacity: 0, scale: 0.8 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "elastic.out(1, 0.7)",
          delay: 0.5,
        },
      );

      // Feature Windows Parallax & Entrance
      gsap.utils.toArray(".feature-row").forEach((row: any, i) => {
        const text = row.querySelector(".feature-text");
        const windowElem = row.querySelector(".feature-window");
        const isEven = i % 2 === 0;

        // Extreme Slide/fade text in
        gsap.fromTo(
          text,
          { opacity: 0, x: isEven ? -80 : 80, filter: "blur(10px)" },
          {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top 80%",
            },
          },
        );

        // Advanced Parallax & 3D tilt on scroll
        gsap.fromTo(
          windowElem,
          {
            opacity: 0,
            y: 150,
            rotateY: isEven ? -15 : 15,
            rotateX: 10,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: -80, // Upward scrub
            rotateY: 0,
            rotateX: 0,
            scale: 1,
            ease: "none",
            transformPerspective: 1200,
            scrollTrigger: {
              trigger: row,
              start: "top 95%",
              end: "bottom top",
              scrub: 1.5, // Smoother scrub
            },
          },
        );
      });
    },
    { scope: container, dependencies: [booted] },
  );

  return (
    <div
      ref={container}
      className="relative min-h-screen w-full max-w-[100vw] bg-[#07070a] text-slate-200 overflow-x-hidden font-sans selection:bg-emerald-500/30"
    >
      {/* ---------------- BOOT SCREEN ---------------- */}
      <AnimatePresence>
        {!booted && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07070a] text-emerald-500 font-mono text-sm sm:text-base p-6"
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <div className="w-full max-w-2xl">
              {bootText.map((text, i) => (
                <div key={i} className="mb-2">
                  <span className="opacity-70">
                    [{new Date().toISOString().split("T")[1].slice(0, 11)}]
                  </span>{" "}
                  {text}
                </div>
              ))}
              <div className="mt-4 animate-pulse text-xl">_</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- DESKTOP BACKGROUND ---------------- */}
      {booted && (
        <>
          <div className="fixed inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
            {/* Dark, Futuristic Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-emerald-900/10 blur-[150px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-900/10 blur-[150px]" />

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
          </div>

          {/* Top Menu Bar - MacOS Styled */}
          <div className="fixed top-0 left-0 right-0 h-8 bg-[#111116]/80 flex items-center px-4 justify-between z-50 text-xs backdrop-blur-xl border-b border-white/5 transition-all">
            <div className="flex items-center gap-5 font-semibold text-slate-300">
              <span className="flex items-center gap-2 text-emerald-400">
                <Layers className="w-3.5 h-3.5" /> <span>StudentOS</span>
              </span>
              <span className="hidden sm:block hover:text-white cursor-default transition-colors">
                File
              </span>
              <span className="hidden sm:block hover:text-white cursor-default transition-colors">
                Edit
              </span>
              <span className="hidden sm:block hover:text-white cursor-default transition-colors">
                View
              </span>
              <span className="hidden sm:block hover:text-white cursor-default transition-colors">
                Go
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-300 font-medium">
              <span className="hidden sm:flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> 12%
              </span>
              <span className="hidden sm:inline">100% 🔋</span>
              <span>{currentTime}</span>
            </div>
          </div>

          {/* ---------------- SCROLLABLE DOCUMENT ---------------- */}
          <div className="relative z-10 flex flex-col items-center pt-32 pb-64 px-6 sm:px-12 mx-auto max-w-7xl w-full">
            {/* HERO SECTION */}
            <div className="main-window w-full bg-[#111116]/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)] mb-40 md:mb-56 opacity-0">
              <div className="h-12 bg-[#1a1a24]/90 flex items-center px-4 justify-between select-none border-b border-white/5 backdrop-blur-md">
                <MacDots />
                <div className="absolute left-1/2 -translate-x-1/2 text-xs text-slate-400 font-mono font-medium tracking-wide">
                  ~/desktop/StudentOS
                </div>
                <div className="w-10"></div> {/* Spacer for balance */}
              </div>
              <div className="p-12 sm:p-20 text-center flex flex-col items-center justify-center relative overflow-hidden">
                {/* Subtle spotlight effect inside window */}
                <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

                <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 mt-4 leading-tight opacity-95 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                  The Operating System <br className="hidden sm:block" />
                  for{" "}
                  <span className="text-emerald-400 bg-none inline-block font-mono">
                    Students.
                  </span>
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed mb-12">
                  Upgrade your academic workflow. Notes, tasks, study materials,
                  and AI assistants seamlessly integrated into one powerful
                  digital workspace.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-5 z-10">
                  {!isPending && session ? (
                    <Link
                      href="/dashboard"
                      className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] text-black font-bold rounded-xl transition-all active:scale-95"
                    >
                      Enter Workspace
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/sign-up"
                        className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] text-black font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2"
                      >
                        <UserPlus className="w-5 h-5" /> Boot Workspace
                      </Link>
                      <Link
                        href="/sign-in"
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center gap-2"
                      >
                        <LogIn className="w-5 h-5" /> Login
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* FEATURES SEQUENCE */}
            <div className="w-full flex flex-col gap-40 md:gap-72">
              {/* Feature 1: Tasks */}
              <div className="feature-row flex flex-col md:flex-row items-center gap-12 md:gap-24 relative">
                <div className="absolute top-1/2 left-1/4 w-[40rem] h-[20rem] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />

                <div className="feature-text w-full md:w-5/12 spec-text space-y-5">
                  <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold tracking-wide">
                    <CheckSquare className="w-4 h-4 mr-2" /> Action Layer
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                    Master Your Deadlines
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    A universal task manager built for the chaotic student life.
                    Categorize assignments by course, set priorities, and never
                    miss a critical submission again.
                  </p>
                </div>
                <div className="feature-window w-full md:w-7/12 rounded-2xl border border-white/10 bg-[#16161c]/90 backdrop-blur-xl overflow-hidden shadow-2xl overflow-y-hidden">
                  <div className="h-10 bg-[#1a1a24]/80 flex items-center px-4 border-b border-white/5 relative">
                    <MacDots />
                    <div className="absolute left-1/2 -translate-x-1/2 text-xs text-slate-500 font-mono">
                      ~/tasks/active
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      {
                        title: "Read Chapter 4 for Bio",
                        tag: "Biology",
                        due: "Today",
                        done: true,
                      },
                      {
                        title: "Finish CS Project Draft",
                        tag: "CS101",
                        due: "Tomorrow",
                        done: false,
                      },
                      {
                        title: "Submit Calc Homework",
                        tag: "Math",
                        due: "Friday",
                        done: false,
                        urgent: true,
                      },
                    ].map((task, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${task.done ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-[#1a1a24]/60 hover:bg-[#1a1a24]"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center ${task.done ? "border-emerald-500 bg-emerald-500 text-black" : "border-slate-600"}`}
                          >
                            {task.done && <CheckSquare className="w-4 h-4" />}
                          </div>
                          <span
                            className={`font-medium ${task.done ? "text-slate-500 line-through" : "text-slate-200"}`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <div className="flex gap-3 text-xs font-medium tracking-wide">
                          <span className="px-2.5 py-1 rounded bg-white/5 text-slate-400">
                            {task.tag}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded ${task.urgent ? "bg-red-500/10 text-red-400" : "bg-white/5 text-slate-400"}`}
                          >
                            {task.due}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature 2: Notes */}
              <div className="feature-row flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24 relative">
                <div className="absolute top-1/2 right-1/4 w-[40rem] h-[20rem] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />

                <div className="feature-text w-full md:w-5/12 spec-text space-y-5">
                  <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold tracking-wide">
                    <BookOpen className="w-4 h-4 mr-2" /> Knowledge Base
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                    A Second Brain
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Write rich-text notes with blazing speed using Markdown.
                    Organize them into notebooks natively linked to your
                    subjects, creating a unified academic wiki.
                  </p>
                </div>
                <div className="feature-window w-full md:w-7/12 rounded-2xl border border-white/10 bg-[#16161c]/90 backdrop-blur-xl overflow-hidden shadow-2xl">
                  <div className="h-10 bg-[#1a1a24]/80 flex items-center px-4 border-b border-white/5 relative">
                    <MacDots />
                    <div className="absolute left-1/2 -translate-x-1/2 text-xs text-slate-500 font-mono">
                      notes.exe - System Architecture
                    </div>
                  </div>
                  <div className="flex h-72">
                    <div className="w-1/3 bg-[#13131a]/60 p-5 text-sm space-y-3 border-r border-white/5 hidden sm:block">
                      <div className="text-slate-500 mb-5 font-mono text-xs uppercase tracking-widest font-semibold">
                        Directory
                      </div>
                      <div className="text-indigo-400 flex flex-col gap-3 font-medium">
                        <span className="bg-indigo-500/10 px-2 py-1 -mx-2 rounded text-indigo-300">
                          📄 File Systems.md
                        </span>
                        <span className="text-slate-400 hover:text-slate-300 transition-colors cursor-pointer">
                          📄 Memory Mgmt.md
                        </span>
                        <span className="text-slate-400 hover:text-slate-300 transition-colors cursor-pointer">
                          📄 Processes.md
                        </span>
                      </div>
                    </div>
                    <div className="w-full sm:w-2/3 p-8 text-slate-300">
                      <h1 className="text-3xl font-bold mb-4 text-white font-serif">
                        File Systems
                      </h1>
                      <p className="mb-6 text-slate-400 text-[15px] leading-relaxed">
                        A file system is a method and data structure that the
                        operating system uses to control how data is stored and
                        retrieved.
                      </p>
                      <ul className="list-none space-y-3 text-[15px] text-slate-300">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />{" "}
                          Space Management
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />{" "}
                          Filenames and Directories
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />{" "}
                          Access Control Lists
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3: Analytics / Progress */}
              <div className="feature-row flex flex-col md:flex-row items-center gap-12 md:gap-24 relative">
                <div className="absolute top-1/2 left-1/4 w-[40rem] h-[20rem] bg-orange-500/5 blur-[120px] rounded-full -z-10" />

                <div className="feature-text w-full md:w-5/12 spec-text space-y-5">
                  <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold tracking-wide">
                    <BarChart2 className="w-4 h-4 mr-2" /> Telemetry
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                    Track Your Ascents
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Visual study streaks, grade projections, and productivity
                    charts help you understand where your time is going and how
                    to optimize your output.
                  </p>
                </div>
                <div className="feature-window w-full md:w-7/12 rounded-2xl border border-white/10 bg-[#16161c]/90 backdrop-blur-xl overflow-hidden shadow-2xl">
                  <div className="h-10 bg-[#1a1a24]/80 flex items-center px-4 border-b border-white/5 relative">
                    <MacDots />
                    <div className="absolute left-1/2 -translate-x-1/2 text-xs text-slate-500 font-mono">
                      dashboard_metrics.app
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-4 h-72">
                    <div className="bg-[#1a1a24]/80 rounded-xl border border-white/5 p-5 flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 text-9xl text-white/[0.02] font-black pointer-events-none -mr-4 -mb-8">
                        14
                      </div>
                      <div className="text-slate-400 text-sm mb-2 font-medium tracking-wide">
                        Study Streak
                      </div>
                      <div className="text-5xl font-black text-orange-400 flex items-end gap-2">
                        14{" "}
                        <span className="text-base font-semibold text-slate-500 mb-1">
                          Days
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#1a1a24]/80 rounded-xl border border-white/5 p-5 flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 text-9xl text-white/[0.02] font-black pointer-events-none -mr-4 -mb-8">
                        86
                      </div>
                      <div className="text-slate-400 text-sm mb-2 font-medium tracking-wide">
                        Tasks Completed
                      </div>
                      <div className="text-5xl font-black text-white flex items-end gap-2">
                        86%{" "}
                        <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded ml-1 mb-1">
                          ↑ 12%
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 bg-[#1a1a24]/80 rounded-xl border border-white/5 p-5 flex items-end gap-3 px-8">
                      {/* Mock futuristic bar chart */}
                      {[30, 45, 20, 80, 60, 90, 100, 75].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 w-full bg-gradient-to-t from-white/5 to-white/20 rounded-t-md hover:from-orange-500/20 hover:to-orange-400/80 transition-all duration-300"
                          style={{ height: `${h}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 4: AI Context */}
              <div className="feature-row flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24 relative">
                <div className="absolute top-1/2 right-1/4 w-[40rem] h-[20rem] bg-blue-500/5 blur-[120px] rounded-full -z-10" />

                <div className="feature-text w-full md:w-5/12 spec-text space-y-5">
                  <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-wide">
                    <Cpu className="w-4 h-4 mr-2" /> Neural Engine
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                    Your AI Co-pilot
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Chat with your own notes. Automatically draft study plans
                    before midterms, summarize long PDFs, and fetch explanations
                    inline on tough topics.
                  </p>
                </div>
                <div className="feature-window w-full md:w-7/12 rounded-2xl border border-white/10 bg-[#16161c]/90 backdrop-blur-xl overflow-hidden shadow-2xl">
                  <div className="h-10 bg-[#1a1a24]/80 flex items-center px-4 border-b border-white/5 relative">
                    <MacDots />
                    <div className="absolute left-1/2 -translate-x-1/2 text-xs text-slate-500 font-mono">
                      ./sys/ai_daemon
                    </div>
                  </div>
                  <div className="p-6 h-72 flex flex-col gap-4 font-mono text-[13px] leading-relaxed">
                    <div className="text-slate-400">
                      <span className="text-blue-400 font-semibold">
                        user@studentos
                      </span>
                      <span className="text-white">:</span>
                      <span className="text-slate-300">~</span>$
                      generate-study-plan --subject &ldquo;Physics&rdquo;
                    </div>
                    <div className="text-slate-300 bg-[#0c0c11] p-5 rounded-xl border border-white/5 font-mono shadow-inner">
                      <div className="text-xs text-slate-500 mb-3 opacity-70">
                        {"// Executing plan generation..."}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-blue-400">[{`Day 1`}]</span>{" "}
                        Review Kinematics & Motion
                      </div>
                      <div className="text-slate-300">
                        <span className="text-blue-400">[{`Day 2`}]</span> Force
                        and Newton&apos;s Laws
                      </div>
                      <div className="text-slate-300">
                        <span className="text-blue-400">[{`Day 3`}]</span> Work,
                        Energy, and Power
                      </div>
                      <div className="text-emerald-400 mt-4 flex items-center gap-2">
                        <span>✨</span> Plan created and added to Tasks.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- BOTTOM DOCK ---------------- */}
          <div className="os-dock fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center p-2.5 rounded-3xl bg-[#111116]/60 border border-white/10 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {!isPending && session ? (
              <div className="flex gap-2 items-center px-2">
                <DockItem
                  icon={Terminal}
                  label="Dashboard"
                  color="#10b981"
                  href="/dashboard"
                />
                <DockItem
                  icon={CheckSquare}
                  label="Tasks"
                  color="#6366f1"
                  href="/dashboard/tasks"
                />
                <DockItem
                  icon={BookOpen}
                  label="Notes"
                  color="#a855f7"
                  href="/dashboard/notes"
                />
                <DockItem
                  icon={Calendar}
                  label="Schedule"
                  color="#f59e0b"
                  href="/dashboard/schedule"
                />
              </div>
            ) : (
              <div className="flex gap-4 items-center px-4 py-1">
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <div className="w-[1px] h-4 bg-white/20" />
                <Link
                  href="/sign-up"
                  className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Divider if we are showing core icons and action */}
            {!isPending && session && (
              <>
                <div className="w-[1px] h-10 bg-white/10 mx-3" />
                <div className="px-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center px-5 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-sm transition-colors"
                  >
                    Enter
                  </Link>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
