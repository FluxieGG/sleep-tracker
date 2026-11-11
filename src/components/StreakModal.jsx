import { Flame, Trophy, Calendar, CheckCircle2, X } from 'lucide-react'
import { parseDateKey } from '../utils/timeUtils'

export default function StreakModal({ isOpen, onClose, streakStats = {} }) {
  if (!isOpen) return null

  const {
    currentStreak = 0,
    bestStreak = 0,
    totalDays = 0,
    streakDates = [],
  } = streakStats

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-[var(--accent-border)] shadow-2xl shadow-[var(--accent-shadow)] p-5 text-slate-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-[var(--accent-btn-text)] flex items-center justify-center font-bold shadow-md shadow-[var(--accent-shadow)]">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Sleep Streak Log</h3>
              <p className="text-[11px] text-slate-400">Night-by-night consistency</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2">
          {/* Current Streak */}
          <div className="rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent-border)] p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[var(--accent-text)] uppercase tracking-wider mb-1">
              <Flame className="w-3 h-3 fill-current" />
              <span>Current</span>
            </div>
            <p className="text-2xl font-extrabold text-white tabular-nums">
              {currentStreak}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {currentStreak === 1 ? 'day' : 'days'}
            </p>
          </div>

          {/* Longest Streak */}
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Trophy className="w-3 h-3" />
              <span>Best</span>
            </div>
            <p className="text-2xl font-extrabold text-white tabular-nums">
              {bestStreak}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {bestStreak === 1 ? 'day' : 'days'}
            </p>
          </div>

          {/* Total Logged */}
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Calendar className="w-3 h-3" />
              <span>Total</span>
            </div>
            <p className="text-2xl font-extrabold text-white tabular-nums">
              {totalDays}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {totalDays === 1 ? 'night' : 'nights'}
            </p>
          </div>
        </div>

        {/* Recent Streak Days Preview */}
        {streakDates.length > 0 ? (
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Active Streak Days
              </span>
              <span className="text-[11px] text-[var(--accent-text)] font-semibold">
                {currentStreak} consecutive
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every consecutive night you log a sleep session builds your streak.
              These days are filled with your theme accent on the monthly calendar.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto no-scrollbar">
              {streakDates.map((dateKey) => {
                const dateObj = parseDateKey(dateKey)
                const label = dateObj.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })
                return (
                  <span
                    key={dateKey}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent-text)] text-[11px] font-medium"
                  >
                    <Flame className="w-3 h-3 fill-current" />
                    <span>{label}</span>
                  </span>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-4 text-center text-xs text-slate-400 space-y-1">
            <Flame className="w-6 h-6 mx-auto text-slate-600 mb-1" />
            <p className="font-semibold text-slate-300">No active streak yet</p>
            <p className="text-[11px]">
              Tap "Start Sleep Session" on the Tonight tab to begin your streak!
            </p>
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-btn-text)] font-semibold text-xs shadow-md shadow-[var(--accent-shadow)] transition cursor-pointer"
        >
          Close Streak Log
        </button>
      </div>
    </div>
  )
}
