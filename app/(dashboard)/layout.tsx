export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen max-w-[100vw] overflow-hidden bg-[#07070a] text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* ---------------- DESKTOP BACKGROUND ---------------- */}
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full object-cover">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-emerald-900/10 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-900/10 blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      {/* Main Workspace Content (Injected by Pages) */}
      <main className="relative z-10 w-full h-full text-foreground overflow-hidden">
        {children}
      </main>
    </div>
  );
}
