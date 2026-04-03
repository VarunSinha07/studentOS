"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Calendar,
  LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Notes", href: "/dashboard/notes", icon: BookOpen },
  { name: "Study Planner", href: "/dashboard/study-planner", icon: Calendar },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-emerald-600"
          >
            <Building2 className="h-6 w-6" />
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              StudentOS
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-emerald-600" : "text-gray-400"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm z-10 sticky top-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {navItems.find((item) => item.href === pathname)?.name ||
              "Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
            {/* Future top-nav features like notifications/profile can go here */}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </main>
    </div>
  );
}
