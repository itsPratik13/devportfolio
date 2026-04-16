export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 relative overflow-hidden">
      
      {/* TOP LIGHT */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.08),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.07),transparent_40%)]" />

      {/* CENTER GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05),transparent_55%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_55%)]" />

      {/* BOTTOM SHADE */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(0,0,0,0.10),transparent_45%)] dark:bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.09),transparent_45%)]" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-[666px] w-full mx-auto flex flex-col gap-6 min-h-screen px-4 py-6">
        {children}
      </div>
    </div>
  );
}