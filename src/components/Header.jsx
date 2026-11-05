import { Moon } from 'lucide-react'

export default function Header({ isSleeping, onNavigateTonight }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-slate-900/80 border-b border-slate-800/80 px-5 py-3.5 flex items-center justify-between">
      <button
        type="button"
        onClick={onNavigateTonight}
        className="flex items-center gap-2.5 text-left group active:scale-[0.98] transition cursor-pointer"
        aria-label="Go to Tonight (Home)"
      >
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
            isSleeping
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
              : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-500/30'
          }`}
        >
          <Moon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight text-white leading-none">
              Slumber
            </h1>
            {isSleeping && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Tracking
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Sleep Companion</p>
        </div>
      </button>
    </header>
  )
}
