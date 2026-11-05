import { ChevronLeft, ChevronRight, Clock, TrendingUp } from 'lucide-react'
import { formatDuration } from '../utils/timeUtils'
import GanttChart from '../components/GanttChart'

export default function InsightsPage({
  allWeeks,
  selectedWeekIndex,
  onSelectWeek,
  currentWeekObj,
  weekWithTotals,
  totalWeeklyHours,
  avgDailyHours,
  totalWeeklyDisruptions,
  selectedDay,
  onSelectDay,
}) {
  return (
    <div className="space-y-5">
      {/* Week Selector Bar */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-2 flex items-center justify-between">
        <button
          type="button"
          disabled={selectedWeekIndex >= allWeeks.length - 1}
          onClick={() => onSelectWeek(selectedWeekIndex + 1)}
          className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Older Week"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold text-white">
            {currentWeekObj.label}{' '}
            <span className="text-[var(--accent-text)] font-normal">({currentWeekObj.dateRange})</span>
          </p>
          <p className="text-[10px] text-slate-400">
            {totalWeeklyDisruptions} {totalWeeklyDisruptions === 1 ? 'disruption' : 'disruptions'} across 7 nights
          </p>
        </div>

        <button
          type="button"
          disabled={selectedWeekIndex <= 0}
          onClick={() => onSelectWeek(selectedWeekIndex - 1)}
          className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Newer Week"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekly Summary Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>Weekly Total</span>
          </div>
          <p className="text-xl font-bold text-white tabular-nums">
            {formatDuration(totalWeeklyHours)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{currentWeekObj.dateRange}</p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Daily Average</span>
          </div>
          <p className="text-xl font-bold text-white tabular-nums">
            {formatDuration(avgDailyHours)}
          </p>
          <p className="text-[11px] text-emerald-400/90 mt-0.5">
            {avgDailyHours >= 8 ? 'Met 8h target average' : 'Below 8h target'}
          </p>
        </div>
      </div>

      {/* Gantt Chart Component */}
      <GanttChart
        weekLabel={currentWeekObj.label}
        weekWithTotals={weekWithTotals}
        selectedDay={selectedDay}
        onSelectDay={onSelectDay}
      />
    </div>
  )
}
