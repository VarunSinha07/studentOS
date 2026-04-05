import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-emerald-500">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-mono tracking-widest uppercase">
          Initializing OS...
        </p>
      </div>
    </div>
  );
}
