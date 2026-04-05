"use client";

import { useState, useEffect } from "react";
import {
  Terminal,
  CheckSquare,
  BookOpen,
  Calendar,
  Settings,
  Cpu,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TasksApp } from "@/components/os-windows/TasksApp";
import { NotesApp } from "@/components/os-windows/NotesApp";
import { SystemLogApp } from "@/components/os-windows/SystemLogApp";
import { StudyPlannerApp } from "@/components/os-windows/StudyPlannerApp";
import { SettingsApp } from "@/components/os-windows/SettingsApp";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// Floating Dock Item Component
function DockItem({
  icon: Icon,
  label,
  color,
  onClick,
  isOpen,
}: {
  icon: LucideIcon;
  label: string;
  color: string;
  onClick: () => void;
  isOpen: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 shadow-inner group transition-all cursor-pointer active:scale-95"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon
        className={`w-6 h-6 ${color} group-hover:scale-110 transition-transform ${isOpen ? "opacity-100" : "opacity-80"}`}
      />

      {/* Activity Indicator */}
      {isOpen && (
        <div className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-slate-300 opacity-100 shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all" />
      )}
      {!isOpen && (
        <div
          className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-slate-500 opacity-0 group-hover:opacity-50 transition-opacity"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute -top-12 px-3 py-1.5 bg-[#1c1c24]/90 backdrop-blur-md border border-white/10 text-slate-200 text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Desktop() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [openApps, setOpenApps] = useState<{ id: string; zIndex: number }[]>(
    [],
  );
  const [highestZIndex, setHighestZIndex] = useState(10);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [greeting, setGreeting] = useState("");

  const [prefs, setPrefs] = useState({
    showRam: true,
    showBattery: true,
    use24Hour: false,
    showFocusHub: true,
    wallpaper: "",
  });

  useEffect(() => {
    const loadPrefs = () => {
      const savedPrefs = localStorage.getItem("studentos_prefs");
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          setPrefs({
            showRam: parsed.showRam ?? true,
            showBattery: parsed.showBattery ?? true,
            use24Hour: parsed.use24Hour ?? false,
            showFocusHub: parsed.showFocusHub ?? true,
            wallpaper: parsed.wallpaper ?? "",
          });
        } catch {}
      }
    };

    loadPrefs();
    window.addEventListener("preferences-updated", loadPrefs);
    return () => window.removeEventListener("preferences-updated", loadPrefs);
  }, []);

  // Guard routing and Top bar Clock
  useEffect(() => {
    if (!isPending && !session) router.push("/sign-in");

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour12: !prefs.use24Hour,
          hour: "2-digit",
          minute: "2-digit",
        }),
      );

      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
      );

      const hour = now.getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [session, isPending, prefs.use24Hour, router]);

  // Window Manager Logic
  const openApp = (appId: string) => {
    if (!openApps.find((a) => a.id === appId)) {
      setOpenApps((prev) => [
        ...prev,
        { id: appId, zIndex: highestZIndex + 1 },
      ]);
      setHighestZIndex((prev) => prev + 1);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("os-process", {
            detail: { action: "START", app: appId },
          }),
        );
      }
    } else {
      focusApp(appId);
    }
  };

  const closeApp = (appId: string) => {
    setOpenApps((prev) => prev.filter((a) => a.id !== appId));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("os-process", {
          detail: { action: "TERM", app: appId },
        }),
      );
    }
  };

  const focusApp = (appId: string) => {
    setHighestZIndex((prev) => prev + 1);
    setOpenApps((prev) =>
      prev.map((a) =>
        a.id === appId ? { ...a, zIndex: highestZIndex + 1 } : a,
      ),
    );
  };

  if (isPending || !session) return null; // Wait for auth

  return (
    <div
      className="relative w-full h-full flex flex-col bg-cover bg-center bg-no-repeat transition-all duration-700"
      style={{
        backgroundImage: prefs.wallpaper ? `url(${prefs.wallpaper})` : "none",
      }}
    >
      {/* Background Overlay for Legibility */}
      <div
        className={`absolute inset-0 z-0 pointer-events-none transition-all duration-700 ${
          prefs.wallpaper
            ? prefs.showFocusHub
              ? "bg-black/40 backdrop-blur-md"
              : "bg-black/10 backdrop-blur-none"
            : "bg-transparent"
        }`}
      />

      {/* Top Menu Bar - MacOS Styled */}
      <div className="fixed top-0 left-0 right-0 h-8 bg-[#111116]/60 flex items-center px-4 justify-between z-[100] text-[13px] backdrop-blur-2xl border-b border-white/5 transition-all outline-none select-none">
        <div className="flex items-center gap-5 font-semibold text-slate-300 tracking-wide">
          <span className="flex items-center gap-2 text-emerald-400 mix-blend-screen shadow-emerald-500/50">
            <Layers className="w-4 h-4" /> <span>StudentOS</span>
          </span>
          <span className="hidden sm:block hover:text-white cursor-default transition-colors">
            {openApps.length > 0
              ? openApps.sort((a, b) => b.zIndex - a.zIndex)[0].id
              : "Desktop"}
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
        </div>
        <div className="flex items-center gap-4 text-slate-300 font-medium tracking-wide">
          {prefs.showRam && (
            <span className="hidden sm:flex items-center gap-1.5 animate-in fade-in duration-300">
              <Cpu className="w-3.5 h-3.5 opacity-80" /> 14%
            </span>
          )}
          {prefs.showBattery && (
            <span className="hidden sm:inline animate-in fade-in duration-300">
              100% 🔋
            </span>
          )}
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Workspace Area - Apps render here */}
      <div className="flex-1 w-full h-full relative overflow-hidden pt-8 pb-32">
        {/* Desktop Focus Hub (Empty State) */}
        <AnimatePresence>
          {openApps.length === 0 && prefs.showFocusHub && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <h1 className="text-6xl md:text-8xl font-bold text-white/90 tracking-tighter mix-blend-overlay drop-shadow-2xl">
                {currentTime.split(" ")[0]}
              </h1>
              <p className="mt-4 text-xl md:text-2xl text-white/70 font-medium tracking-wide">
                {greeting}, {session.user.name?.split(" ")[0] || "Student"}.
              </p>
              <p className="mt-2 text-md text-white/50 tracking-wide uppercase text-sm font-semibold">
                {currentDate}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Render Apps conditionally based on State */}
        <AnimatePresence>
          {openApps.find((a) => a.id === "Tasks") && (
            <TasksApp
              key="tasks-app"
              onClose={() => closeApp("Tasks")}
              zIndex={openApps.find((a) => a.id === "Tasks")!.zIndex}
              onFocus={() => focusApp("Tasks")}
            />
          )}

          {/* Placeholders for future Phase modules */}
          {openApps.find((a) => a.id === "Notes") && (
            <NotesApp
              key="notes-app"
              onClose={() => closeApp("Notes")}
              zIndex={openApps.find((a) => a.id === "Notes")!.zIndex}
              onFocus={() => focusApp("Notes")}
            />
          )}

          {openApps.find((a) => a.id === "Dashboard") && (
            <SystemLogApp
              key="dashboard-app"
              onClose={() => closeApp("Dashboard")}
              zIndex={openApps.find((a) => a.id === "Dashboard")!.zIndex}
              onFocus={() => focusApp("Dashboard")}
            />
          )}

          {openApps.find((a) => a.id === "Calendar") && (
            <StudyPlannerApp
              key="planner-app"
              onClose={() => closeApp("Calendar")}
              zIndex={openApps.find((a) => a.id === "Calendar")!.zIndex}
              onFocus={() => focusApp("Calendar")}
            />
          )}

          {openApps.find((a) => a.id === "Settings") && (
            <SettingsApp
              key="settings-app"
              onClose={() => closeApp("Settings")}
              zIndex={openApps.find((a) => a.id === "Settings")!.zIndex}
              onFocus={() => focusApp("Settings")}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Floating App Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center p-2.5 rounded-3xl bg-[#0c0c11]/80 border border-white/10 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        <div className="flex gap-2 items-center px-2">
          {/* Dashboard App Icon */}
          <DockItem
            icon={Terminal}
            label="System Log"
            color="text-slate-400"
            isOpen={openApps.some((a) => a.id === "Dashboard")}
            onClick={() => openApp("Dashboard")}
          />

          {/* Tasks App Icon */}
          <DockItem
            icon={CheckSquare}
            label="Agenda"
            color="text-emerald-400"
            isOpen={openApps.some((a) => a.id === "Tasks")}
            onClick={() => openApp("Tasks")}
          />

          {/* Notes App Icon */}
          <DockItem
            icon={BookOpen}
            label="Knowledge Base"
            color="text-indigo-400"
            isOpen={openApps.some((a) => a.id === "Notes")}
            onClick={() => openApp("Notes")}
          />

          {/* Calendar App Icon */}
          <DockItem
            icon={Calendar}
            label="Scheduler"
            color="text-orange-400"
            isOpen={openApps.some((a) => a.id === "Calendar")}
            onClick={() => openApp("Calendar")}
          />
        </div>

        <div className="w-[1px] h-10 bg-white/10 mx-3" />

        <div className="px-2">
          <DockItem
            icon={Settings}
            label="Preferences"
            color="text-slate-300"
            isOpen={openApps.some((a) => a.id === "Settings")}
            onClick={() => openApp("Settings")}
          />
        </div>
      </div>
    </div>
  );
}
