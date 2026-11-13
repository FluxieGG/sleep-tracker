import { ChevronLeft, ChevronRight, Clock, TrendingUp } from 'lucide-react'
import { formatDuration } from '../utils/timeUtils'
import GanttChart from '../components/GanttChart'

export default function InsightsPage({
  selectedWeekOffset = 0,
  onSelectWeekOffset,
  currentWeekObj,
  weekWithTotals,
  totalWeeklyHours,
  avgDailyHours,
  totalWeeklyDisruptions,
  selectedDay,
  onSelectDay,
  sleepGoalHours = 8,
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelectWeekOffset(selectedWeekOffset + 1)}
          className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 active:scale-95 transition cursor-pointer"
          title="Previous Week"
          aria-label="Previous Week"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center min-w-0">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <p className="text-xs font-semibold text-white">
              {currentWeekObj.label}{' '}
              <span className="text-[var(--accent-text)] font-normal">
                ({currentWeekObj.dateRange})
              </span>
            </p>
            {selectedWeekOffset > 0 && (
              <button
                type="button"
                onClick={() => onSelectWeekOffset(0)}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] hover:opacity-85 transition cursor-pointer"
              >
                Today
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-400">
            {totalWeeklyDisruptions}{' '}
            {totalWeeklyDisruptions === 1 ? 'disruption' : 'disruptions'} across 7 nights
          </p>
        </div>

        <button
          type="button"
          disabled={selectedWeekOffset <= 0}
          onClick={() => onSelectWeekOffset(Math.max(0, selectedWeekOffset - 1))}
          className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition cursor-pointer"
          title="Next Week"
          aria-label="Next Week"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>Weekly Total</span>
          </div>
          <p className="text-xl font-bold text-white tabular-nums">
            {formatDuration(totalWeeklyHours)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {currentWeekObj.dateRange}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Daily Average</span>
          </div>
          <p className="text-xl font-bold text-white tabular-nums">
            {formatDuration(avgDailyHours)}
          </p>
          <p
            className={`text-[11px] mt-0.5 font-medium ${
              Number(avgDailyHours) >= Number(sleepGoalHours)
                ? 'text-emerald-400'
                : 'text-amber-400'
            }`}
          >
            {Number(avgDailyHours) >= Number(sleepGoalHours)
              ? `Met ${sleepGoalHours}h target average`
              : `Below ${sleepGoalHours}h target`}
          </p>
        </div>
      </div>

      <GanttChart
        weekLabel={currentWeekObj.label}
        weekWithTotals={weekWithTotals}
        selectedDay={selectedDay}
        onSelectDay={onSelectDay}
        sleepGoalHours={sleepGoalHours}
      />
    </div>
  )
}
