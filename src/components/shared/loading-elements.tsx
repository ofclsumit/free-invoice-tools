export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[920px] mx-auto px-5 py-10 flex flex-col items-center animate-pulse">
        <div className="text-center mb-10 w-full flex flex-col items-center">
          <div className="h-4 w-24 bg-muted rounded-full mb-3" />
          <div className="h-12 w-64 bg-muted/70 rounded-xl mb-4" />
          <div className="h-4 w-80 bg-muted rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          <div className="rounded-[1.75rem] border bg-card p-[1.85rem] h-[400px] flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="h-[1.05rem] w-[3px] rounded-full bg-gradient-to-b from-purple-400 to-blue-400" />
              <div className="h-5 w-24 bg-muted rounded-md" />
            </div>
            <div className="space-y-5">
              {[16, 24, 20].map(w => (
                <div key={w} className="space-y-2">
                  <div className="h-3 w-12 bg-muted rounded" />
                  <div className="h-10 w-full bg-muted/60 rounded-xl" />
                </div>
              ))}
            </div>
            <div className="mt-auto flex gap-3">
              <div className="h-11 flex-[2] bg-muted/70 rounded-xl" />
              <div className="h-11 flex-1 bg-muted/50 rounded-xl" />
            </div>
          </div>

          <div className="rounded-[1.75rem] border bg-card p-[1.85rem] h-[400px] flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="h-[1.05rem] w-[3px] rounded-full bg-gradient-to-b from-purple-400 to-blue-400" />
              <div className="h-5 w-20 bg-muted rounded-md" />
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/30">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div className="h-4 w-48 bg-muted rounded-md" />
              <div className="h-3 w-32 bg-muted/40 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
