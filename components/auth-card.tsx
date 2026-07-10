export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100 px-4 py-16">
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-yellow-300 shadow-[0_0_100px_35px_rgba(253,224,71,0.7)]" />
      <div className="absolute left-6 top-16 h-14 w-36 rounded-full bg-white/80 shadow-md before:absolute before:-top-5 before:left-5 before:h-14 before:w-14 before:rounded-full before:bg-white/80" />

      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white/90 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 text-center">
          <span className="text-4xl">⛅</span>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-sky-900">
            {title}
          </h1>
          <p className="mt-1 text-sm text-sky-700/80">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
