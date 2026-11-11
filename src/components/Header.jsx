import { Moon, Flame } from 'lucide-react'

export default function Header({
  isSleeping,
  onNavigateTonight,
  activeTab = 'tonight',
  streakStats = {},
  onOpenStreakModal,
}) {
  const streakCount = streakStats.currentStreak || 0

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-slate-900/80 border-b border-slate-800/80 px-5 py-3.5 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onNavigateTonight}
        className="flex items-center gap-2.5 text-left group active:scale-[0.98] transition cursor-pointer min-w-0"
        aria-label="Go to Tonight (Home)"
      >
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
            isSleeping
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
              : 'bg-[var(--accent-subtle)] border-[var(--accent-border)] text-[var(--accent-text)] group-hover:opacity-90'
          }`}
        >
          <Moon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
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

      {/* Highlighted Theme Streak Box on Tonight Header */}
      {activeTab === 'tonight' && (
        <button
          type="button"
          onClick={onOpenStreakModal}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent-text)] shadow-sm hover:border-[var(--accent)] active:scale-[0.98] transition cursor-pointer select-none group shrink-0"
          title={`Sleep Streak: ${streakCount} consecutive days logged. Click to view streak log.`}
          aria-label={`Sleep streak: ${streakCount} days logged`}
        >
          <div className="w-6 h-6 rounded-lg bg-[var(--accent)] text-[var(--accent-btn-text)] flex items-center justify-center font-bold text-xs shadow-sm shadow-[var(--accent-shadow)] shrink-0 group-hover:scale-105 transition-transform">
            <Flame className="w-3.5 h-3.5 fill-current" />
          </div>
          <div className="flex flex-col text-right leading-none">
            <div className="flex items-center justify-end gap-1">
              <span className="text-xs font-extrabold text-white tabular-nums">
                {streakCount}
              </span>
              <span className="text-[11px] font-semibold text-slate-200">
                {streakCount === 1 ? 'Day' : 'Days'}
              </span>
            </div>
            <span className="text-[9px] font-semibold text-[var(--accent-text)] uppercase tracking-wider mt-0.5">
              Streak Log
            </span>
          </div>
        </button>
      )}
    </header>
  )
}
