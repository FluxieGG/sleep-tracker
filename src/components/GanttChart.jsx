import { Calendar } from 'lucide-react'
import {
  CHART_START_HOUR,
  CHART_TOTAL_HOURS,
  TIME_MARKERS,
} from '../constants/sleepConstants'
import { formatDuration, parseTimeToContinuous } from '../utils/timeUtils'

export default function GanttChart({
  weekLabel,
  weekWithTotals,
  selectedDay,
  onSelectDay,
}) {
  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-400" />
            {weekLabel} Schedule
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            7:00 PM – 10:00 AM • Red lines mark disruptions
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
            <span className="w-2 h-0.5 bg-rose-500 inline-block" /> Disruption
          </span>
        </div>
      </div>

      {/* Time Axis Header */}
      <div className="grid grid-cols-[38px_1fr_54px] items-center gap-2 mb-2">
        <span className="text-[10px] font-medium uppercase text-slate-500">Day</span>
        <div className="relative h-4">
          {TIME_MARKERS.map((marker) => {
            const leftPct = (marker.offsetHours / CHART_TOTAL_HOURS) * 100
            return (
              <span
                key={marker.label}
                style={{ left: `${leftPct}%` }}
                className="absolute -translate-x-1/2 text-[10px] font-medium text-slate-500"
              >
                {marker.label}
              </span>
            )
          })}
        </div>
        <span className="text-[10px] font-medium uppercase text-slate-500 text-right">
          Total
        </span>
      </div>

      {/* Gantt Rows (Monday - Sunday) */}
      <div className="space-y-2.5">
        {weekWithTotals.map((item) => {
          const startOffset = Math.max(0, item.startHour - CHART_START_HOUR)
          const endOffset = Math.min(CHART_TOTAL_HOURS, item.endHour - CHART_START_HOUR)
          const leftPct = (startOffset / CHART_TOTAL_HOURS) * 100
          const widthPct =
            item.duration > 0
              ? Math.max(3, ((endOffset - startOffset) / CHART_TOTAL_HOURS) * 100)
              : 0
          const isSelected = selectedDay?.day === item.day
          const meetsGoal = item.duration >= 8
          const dayDisruptions = item.disruptions || []

          return (
            <button
              key={item.day}
              type="button"
              onClick={() => onSelectDay(item)}
              className={`w-full grid grid-cols-[38px_1fr_54px] items-center gap-2 py-1 px-1.5 -mx-1.5 rounded-xl text-left transition cursor-pointer ${
                isSelected ? 'bg-slate-800/70 ring-1 ring-indigo-500/40' : 'hover:bg-slate-800/40'
              }`}
            >
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                {item.day}
                {dayDisruptions.length > 0 && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-rose-500"
                    title={`${dayDisruptions.length} disruption(s)`}
                  />
                )}
              </span>

              <div className="relative h-7 rounded-lg bg-slate-950/90 border border-slate-800/80 overflow-hidden">
                {TIME_MARKERS.map((marker) => {
                  const lineLeft = (marker.offsetHours / CHART_TOTAL_HOURS) * 100
                  return (
                    <div
                      key={marker.label}
                      style={{ left: `${lineLeft}%` }}
                      className="absolute top-0 bottom-0 w-px bg-slate-800/60"
                    />
                  )
                })}

                {/* Midnight Dashed Line */}
                <div
                  style={{ left: `${(5 / CHART_TOTAL_HOURS) * 100}%` }}
                  className="absolute top-0 bottom-0 w-px border-l border-dashed border-indigo-500/30"
                  title="Midnight"
                />

                {/* Sleep Session Bar */}
                {widthPct > 0 && (
                  <div
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                    className={`absolute top-1 bottom-1 rounded-md shadow-sm transition-all flex items-center justify-center overflow-hidden ${
                      meetsGoal
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 shadow-indigo-500/20'
                        : 'bg-gradient-to-r from-indigo-500/80 to-sky-500/80'
                    }`}
                  >
                    <span className="text-[9px] font-semibold text-white/95 truncate px-1.5">
                      {item.start}–{item.end}
                    </span>
                  </div>
                )}

                {/* RED LINES FOR DISRUPTIONS */}
                {dayDisruptions.map((dis) => {
                  const disContinuous =
                    dis.hourContinuous ?? parseTimeToContinuous(dis.time24)
                  const disOffset = Math.max(
                    0,
                    Math.min(CHART_TOTAL_HOURS, disContinuous - CHART_START_HOUR)
                  )
                  const disLeftPct = (disOffset / CHART_TOTAL_HOURS) * 100

                  return (
                    <div
                      key={dis.id}
                      style={{ left: `${disLeftPct}%` }}
                      title={`${dis.type} at ${dis.time12}`}
                      className="absolute top-0 bottom-0 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 border border-rose-950 shrink-0" />
                      <div className="w-[2.5px] flex-1 bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,1)]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 border border-rose-950 shrink-0" />
                    </div>
                  )
                })}
              </div>

              <span
                className={`text-xs font-semibold text-right tabular-nums ${
                  meetsGoal ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                {item.duration > 0 ? formatDuration(item.duration) : '—'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected Day Footer with Outlined Disruptions */}
      {selectedDay && (
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-slate-400">Selected: </span>
              <span className="font-semibold text-white">
                {selectedDay.fullDay}
                {selectedDay.dateString ? ` (${selectedDay.dateString})` : ''}
              </span>
              <span className="text-slate-400 ml-2">
                {selectedDay.start} – {selectedDay.end}
              </span>
            </div>
            <span className="font-semibold text-indigo-400 tabular-nums">
              {formatDuration(selectedDay.duration ?? selectedDay.endHour - selectedDay.startHour)}
            </span>
          </div>

          {selectedDay.disruptions && selectedDay.disruptions.length > 0 ? (
            <div className="rounded-xl bg-rose-950/25 border border-rose-500/30 p-2.5 space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                Disruptions on {selectedDay.fullDay}:
              </p>
              {selectedDay.disruptions.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between text-[11px] bg-slate-950/60 border border-rose-500/20 rounded-lg px-2.5 py-1.5"
                >
                  <span className="text-rose-200 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {d.icon} {d.type}
                    {d.note ? <span className="text-slate-400 font-normal">— {d.note}</span> : null}
                  </span>
                  <span className="text-rose-400 font-mono font-semibold shrink-0 ml-2">
                    {d.time12}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">
              No disruptions logged for {selectedDay.fullDay}.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
