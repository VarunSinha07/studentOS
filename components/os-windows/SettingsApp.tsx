"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  X,
  Minus,
  Square,
  User,
  Settings,
  Palette,
  LogOut,
  Info,
  ShieldAlert,
  Loader2,
  Save,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import gsap from "gsap";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

function GsapToggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description: string;
}) {
  const knobRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (knobRef.current && trackRef.current) {
      gsap.to(knobRef.current, {
        x: checked ? 18 : 0,
        backgroundColor: "#ffffff",
        duration: 0.4,
        ease: "back.out(2)",
      });
      gsap.to(trackRef.current, {
        backgroundColor: checked ? "#3b82f6" : "#334155",
        duration: 0.3,
      });
    }
  }, [checked]);

  return (
    <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <button
        ref={trackRef}
        onClick={() => onChange(!checked)}
        className="w-10 h-5 rounded-full relative focus:outline-none bg-slate-700"
      >
        <div
          ref={knobRef}
          className="w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] left-[4px]"
        />
      </button>
    </div>
  );
}

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

type Tab = "account" | "general" | "appearance" | "about";

export function SettingsApp({
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
  const router = useRouter();

  // Window Controls State
  const isMinimizedRef = useRef(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const prevZIndex = useRef(zIndex);

  // App State
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // UI Preferences
  const [use24Hour, setUse24Hour] = useState(false);
  const [showRam, setShowRam] = useState(true);
  const [showBattery, setShowBattery] = useState(true);
  const [showFocusHub, setShowFocusHub] = useState(true);
  const [wallpaper, setWallpaper] = useState("");

  useEffect(() => {
    const p = localStorage.getItem("studentos_prefs");
    if (p) {
      try {
        const parsed = JSON.parse(p);
        if (parsed.use24Hour !== undefined) setUse24Hour(parsed.use24Hour);
        if (parsed.showRam !== undefined) setShowRam(parsed.showRam);
        if (parsed.showBattery !== undefined)
          setShowBattery(parsed.showBattery);
        if (parsed.showFocusHub !== undefined)
          setShowFocusHub(parsed.showFocusHub);
        if (parsed.wallpaper !== undefined) setWallpaper(parsed.wallpaper);
      } catch (e) {}
    }
  }, []);

  const updatePref = (key: string, val: boolean | string) => {
    const p = localStorage.getItem("studentos_prefs");
    const parsed = p
      ? JSON.parse(p)
      : {
          use24Hour: false,
          showRam: true,
          showBattery: true,
          showFocusHub: true,
          wallpaper: "",
        };
    parsed[key] = val;
    localStorage.setItem("studentos_prefs", JSON.stringify(parsed));
    window.dispatchEvent(new Event("preferences-updated"));

    if (key === "use24Hour") setUse24Hour(val as boolean);
    if (key === "showRam") setShowRam(val as boolean);
    if (key === "showBattery") setShowBattery(val as boolean);
    if (key === "showFocusHub") setShowFocusHub(val as boolean);
    if (key === "wallpaper") setWallpaper(val as string);
  };

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);

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
        top: "6rem",
        left: "6rem",
        width: "100%",
        maxWidth: "750px",
        height: "70vh",
        maxHeight: "700px",
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

  const handleUpdateProfile = async () => {
    if (!name.trim() || name === session?.user?.name) return;
    setSaving(true);
    try {
      await authClient.updateUser({ name });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update user", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Failed to sign out", error);
      setSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await authClient.deleteUser();
      router.push("/sign-in");
    } catch (error) {
      console.error("Failed to delete account", error);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Public Profile
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Manage your personal information.
              </p>

              <div className="space-y-4 max-w-sm">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={session?.user?.email || ""}
                    disabled
                    className="w-full bg-white/5 border border-white/5 text-slate-500 text-sm rounded-lg px-3 py-2 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Email cannot be changed.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white focus:ring-1 focus:ring-blue-500/50 text-sm rounded-lg px-3 py-2 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <button
                  onClick={handleUpdateProfile}
                  disabled={
                    saving || name === session?.user?.name || !name.trim()
                  }
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : saveSuccess ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving
                    ? "Saving..."
                    : saveSuccess
                      ? "Saved!"
                      : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="h-px bg-white/10 w-full" />

            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Session Management
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                You will be required to log back in.
              </p>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {signingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                ) : (
                  <LogOut className="w-4 h-4 text-slate-400" />
                )}
                {signingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>

            <div className="h-px bg-white/10 w-full" />

            <div>
              <h3 className="text-lg font-semibold text-red-500 mb-1 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Danger Zone
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>

              {confirmDelete ? (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex flex-col gap-3">
                  <p className="text-sm text-red-200">
                    Are you absolutely sure you want to delete your account?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="flex items-center justify-center min-w-[120px] gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      {deleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Yes, Delete"
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                      className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="border border-red-500/50 text-red-500 hover:bg-red-500/10 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Delete Account
                </button>
              )}
            </div>
          </div>
        );

      case "general":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                General Settings
              </h3>
              <div className="space-y-3">
                <GsapToggle
                  checked={use24Hour}
                  onChange={(val) => updatePref("use24Hour", val)}
                  label="24-Hour Time"
                  description="Use 24-hour format for all clocks"
                />
                <GsapToggle
                  checked={showRam}
                  onChange={(val) => updatePref("showRam", val)}
                  label="Show RAM Usage"
                  description="Display system CPU/RAM metrics in the taskbar"
                />
                <GsapToggle
                  checked={showBattery}
                  onChange={(val) => updatePref("showBattery", val)}
                  label="Show Battery Status"
                  description="Display battery level in the taskbar"
                />
                <GsapToggle
                  checked={showFocusHub}
                  onChange={(val) => updatePref("showFocusHub", val)}
                  label="Show Desktop Clock"
                  description="Display the clock and greeting when no apps are open"
                />
              </div>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Appearance
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-200 mb-2">
                    System Theme
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded-xl border-2 border-blue-500 bg-white/5 cursor-pointer relative overflow-hidden">
                      <div className="w-24 h-16 rounded-lg bg-[#111116] border border-white/10 flex flex-col overflow-hidden relative z-10">
                        <div className="h-3 w-full bg-white/10" />
                        <div className="flex-1 flex p-1 gap-1">
                          <div className="w-4 h-full bg-white/5 rounded-sm" />
                          <div className="flex-1 space-y-1 py-1">
                            <div className="w-8 h-1 bg-blue-500/50 rounded-sm" />
                            <div className="w-12 h-1 bg-white/10 rounded-sm" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500/20 blur-[10px] rounded-full z-0" />
                      <p className="text-[10px] text-center mt-1 text-slate-300 font-medium">
                        Dark Default
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-balance leading-relaxed">
                    StudentOS is currently optimized exclusively for Dark Mode
                    to minimize eye strain during late-night studying.
                  </p>
                </div>
                <div className="h-px bg-white/10 w-full my-6" />

                <div>
                  <p className="text-sm font-medium text-slate-200 mb-4">
                    Desktop Wallpaper
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { id: "", label: "Default Dark" },
                      {
                        id: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=2029&auto=format&fit=crop",
                        label: "Gradient Red",
                      },
                      {
                        id: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
                        label: "Abstract Blue",
                      },
                      {
                        id: "https://images.unsplash.com/photo-1495570687352-7b5264b3da59?q=80&w=2670&auto=format&fit=crop",
                        label: "Lofi Night",
                      },
                      {
                        id: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop",
                        label: "Space Space",
                      },
                    ].map((bg, idx) => (
                      <button
                        key={idx}
                        onClick={() => updatePref("wallpaper", bg.id)}
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                          wallpaper === bg.id
                            ? "border-blue-500 scale-105"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        {bg.id ? (
                          <img
                            src={bg.id}
                            alt={bg.label}
                            className="object-cover w-full h-full opacity-80"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#0a0a0f]" />
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-1 bg-black/60 backdrop-blur-sm">
                          <p className="text-[10px] text-center text-white font-medium">
                            {bg.label}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Custom Image URL
                    </label>
                    <input
                      type="url"
                      value={wallpaper}
                      onChange={(e) => updatePref("wallpaper", e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white focus:ring-1 focus:ring-blue-500/50 text-sm rounded-lg px-3 py-2 outline-none transition-all placeholder:text-slate-600"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "about":
        return (
          <div className="flex flex-col items-center justify-center h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center shadow-2xl mb-4 relative">
              <Terminal className="w-10 h-10 text-white/50" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-[1px] border-blue-500/30 border-t-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-spin-slow" />
            </div>
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                StudentOS
              </h2>
              <p className="text-sm text-slate-400">
                Version 1.0 (Build 24A32b)
              </p>
            </div>
            <div className="text-xs text-slate-500 text-center max-w-xs leading-relaxed px-4 py-3 bg-black/20 rounded-xl border border-white/5">
              <span className="block text-slate-300 font-medium mb-1">
                A minimal operating system experience
              </span>
              Built with Next.js, Postgres, Tiptap, Framer Motion, and Gemini
              AI.
            </div>
          </div>
        );
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
          typeof window !== "undefined" ? window.innerWidth - 750 : 0,
        ),
        bottom: Math.max(
          0,
          typeof window !== "undefined" ? window.innerHeight - 550 : 0,
        ),
      }}
      // @ts-expect-error dragHandle valid prop
      dragHandle=".title-bar"
      onPointerDown={onFocus}
      style={{ zIndex }}
      className="absolute top-28 left-40 w-full max-w-[750px] bg-[#111116]/85 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6),_0_0_0_1px_rgba(255,255,255,0.05)] ring-1 ring-white/5 flex flex-col h-[70vh] max-h-[700px] min-h-[450px]"
    >
      {/* Title Bar */}
      <div className="title-bar h-12 bg-[#1a1a24]/60 flex items-center px-4 justify-between border-b border-white/5 backdrop-blur-xl cursor-grab active:cursor-grabbing shrink-0 transition-colors">
        <MacDots
          onClose={onClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
        />
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono font-medium tracking-wide pointer-events-none">
          <Settings className="w-3.5 h-3.5 text-slate-400" /> ~/preferences.exe
        </div>
        <div className="w-[50px]"></div>
      </div>

      {/* Two-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-black/20 border-r border-white/5 p-3 flex flex-col gap-1 shrink-0 select-none">
          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${activeTab === "account" ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}
          >
            <User className="w-3.5 h-3.5" /> Account
          </button>
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${activeTab === "general" ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}
          >
            <Settings className="w-3.5 h-3.5" /> General
          </button>
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${activeTab === "appearance" ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}
          >
            <Palette className="w-3.5 h-3.5" /> Appearance
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${activeTab === "about" ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}
          >
            <Info className="w-3.5 h-3.5" /> About
          </button>
        </div>

        {/* Content Pane */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          <div className="max-w-md mx-auto relative h-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
