"use client";

import { useState } from "react";
import { authClient } from "../../../lib/auth-client";
import Link from "next/link";
import {
  Mail,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Droplet,
} from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await authClient.requestPasswordReset(
        {
          email,
          redirectTo: "/reset-password",
        },
        {
          onSuccess: () => {
            setSuccess(true);
            setLoading(false);
          },
          onError: (ctx) => {
            setError(ctx.error.message);
            setLoading(false);
          },
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5">
          <div className="p-8 md:p-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <Droplet className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Reset password
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Include the email address associated with your account
              </p>
            </div>

            {success ? (
              <div className="rounded-xl bg-green-50 p-6 border border-green-100 text-center animate-in zoom-in duration-300">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-base font-semibold text-green-800">
                  Check your inbox
                </h3>
                <p className="mt-2 text-sm text-green-700">
                  We have sent a password reset link to{" "}
                  <span className="font-medium">{email}</span>.
                </p>
                <div className="mt-6">
                  <Link
                    href="/sign-in"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </Link>
                </div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full rounded-xl border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500 text-center border border-red-100">
                    {error}
                  </div>
                )}

                <div className="flex flex-col space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                  <div className="text-center">
                    <Link
                      href="/sign-in"
                      className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to sign in
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
