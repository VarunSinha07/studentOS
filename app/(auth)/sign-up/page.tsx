"use client";

import { useState, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight, Layers, User } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

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

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const windowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Background and Elements cascade in
      gsap.fromTo(
        windowRef.current,
        { opacity: 0, scale: 0.9, y: 50, rotateX: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          duration: 1.2,
          ease: "power4.out",
          transformPerspective: 1000,
        },
      );
    },
    { scope: windowRef },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authClient.signUp.email(
        {
          email,
          password,
          name,
        },
        {
          onError: (ctx) => {
            setError(ctx.error.message);
            setLoading(false);
          },
          onSuccess: () => {
            // Animate window closing before routing
            gsap.to(windowRef.current, {
              opacity: 0,
              scale: 0.95,
              y: -20,
              duration: 0.4,
              ease: "power3.in",
              onComplete: () => router.push("/dashboard"),
            });
          },
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#07070a] text-slate-200 overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* ---------------- DESKTOP BACKGROUND ---------------- */}
      <div className="fixed inset-0 z-0 pointer-events-none w-full h-full object-cover">
        {/* Dark, Futuristic Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-emerald-900/10 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-900/10 blur-[150px] mix-blend-screen" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      <div
        ref={windowRef}
        className="relative z-10 w-full max-w-[440px] px-6 sm:px-0 opacity-0 my-12"
      >
        {/* Logo Section above window */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all duration-300">
              <Layers className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              StudentOS
            </span>
          </Link>
        </div>

        {/* AUTH OS WINDOW */}
        <div className="w-full bg-[#111116]/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] relative">
          {/* Subtle internal glow */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] pointer-events-none rounded-full" />

          {/* Window Header */}
          <div className="h-10 bg-[#1a1a24]/90 flex items-center px-4 justify-between select-none border-b border-white/5 backdrop-blur-md">
            <MacDots />
            <div className="text-xs text-slate-500 font-mono font-medium tracking-wide">
              ~/sys/enroll.sh
            </div>
            <div className="w-[42px]"></div> {/* Spacer to center the title */}
          </div>

          {/* Window Content */}
          <div className="p-8 sm:p-10 relative">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                System Enrollment
              </h2>
              <p className="text-slate-400 text-sm">
                Create a new digital workspace configuration.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span className="font-medium text-xs">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-[13px] font-medium text-slate-400 ml-1 uppercase tracking-wider font-mono"
                >
                  Alias (Full Name)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="block w-full rounded-xl border border-white/5 bg-[#1a1a24]/60 py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:border-emerald-500/40 focus:bg-[#1a1a24] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 shadow-inner"
                    placeholder="Enter your system alias"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-[13px] font-medium text-slate-400 ml-1 uppercase tracking-wider font-mono"
                >
                  System ID (Email)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-xl border border-white/5 bg-[#1a1a24]/60 py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:border-emerald-500/40 focus:bg-[#1a1a24] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 shadow-inner"
                    placeholder="name@student.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label
                    htmlFor="password"
                    className="text-[13px] font-medium text-slate-400 uppercase tracking-wider font-mono"
                  >
                    Passkey
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-xl border border-white/5 bg-[#1a1a24]/60 py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:border-emerald-500/40 focus:bg-[#1a1a24] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 shadow-inner"
                    placeholder="Create a secure passkey..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="ml-1 text-xs text-slate-600 mt-1">
                  Must be at least 8 generated characters.
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-950" />
                      <span className="tracking-wide">Deploying...</span>
                    </>
                  ) : (
                    <>
                      <span className="tracking-wide">Create Workspace</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer of the window */}
          <div className="px-8 py-5 border-t border-white/5 bg-white/[0.01] flex justify-center text-sm text-slate-400">
            Registered entity?{" "}
            <Link
              href="/sign-in"
              className="ml-2 font-semibold text-white hover:text-emerald-400 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-emerald-400 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-600 font-mono flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"></span>
            Establishing Secure Connection...
          </p>
        </div>
      </div>
    </div>
  );
}
