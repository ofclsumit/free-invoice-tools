export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl animate-fade-in">
      <div className="flex flex-col items-center gap-5 p-10 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 shadow-glow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 via-violet-500 to-blue-600 animate-spin" />
          <div className="absolute inset-0.5 rounded-full bg-white dark:bg-gray-900" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-pulse">
            {message}
          </p>
          <p className="text-[10px] font-medium text-muted-foreground/60 tracking-widest uppercase">
            QuoteFlow
          </p>
        </div>
      </div>
    </div>
  )
}
