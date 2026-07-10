export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100 px-6 py-24 text-center">
      {/* Sun */}
      <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-yellow-300 shadow-[0_0_120px_40px_rgba(253,224,71,0.7)]" />

      {/* Clouds */}
      <div className="absolute left-8 top-24 h-16 w-40 rounded-full bg-white/90 shadow-md before:absolute before:-top-6 before:left-6 before:h-16 before:w-16 before:rounded-full before:bg-white/90 after:absolute after:-top-8 after:left-20 after:h-20 after:w-20 after:rounded-full after:bg-white/90" />
      <div className="absolute right-12 bottom-32 h-12 w-32 rounded-full bg-white/80 shadow-md before:absolute before:-top-5 before:left-4 before:h-12 before:w-12 before:rounded-full before:bg-white/80 after:absolute after:-top-6 after:left-16 after:h-16 after:w-16 after:rounded-full after:bg-white/80" />

      <main className="relative z-10 flex flex-col items-center gap-6">
        <span className="text-6xl">🌤️</span>
        <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] sm:text-6xl">
          Weather Twin
        </h1>
        <p className="max-w-md text-lg font-medium text-white/90 drop-shadow-sm">
          Save the weather you love, then find its twin anywhere in the world.
        </p>
        <div className="mt-4 rounded-full bg-white/80 px-6 py-2 text-sm font-semibold text-sky-700 shadow">
          🚧 Under construction — login &amp; matching coming soon
        </div>
      </main>
    </div>
  );
}
