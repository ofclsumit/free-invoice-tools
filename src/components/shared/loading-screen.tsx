export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="relative h-12 w-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-100 dark:border-emerald-900/30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{message}</p>
    </div>
  )
}
