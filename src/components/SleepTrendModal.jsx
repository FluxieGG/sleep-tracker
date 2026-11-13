import { useState, useMemo, useEffect } from 'react'
import { X, TrendingUp, Calendar, Clock, Info } from 'lucide-react'
import {
  formatDateKey,
  parseDateKey,
  formatDuration,
  getLogDateKey,
} from '../utils/timeUtils'

/**
 * 7-day moving timeframe sleep trend modal with average baseline across logged nights.
 */
export default function SleepTrendModal({
  isOpen,
  onClose,
  sleepLogs = [],
  sleepGoalHours = 8,
}) {
  const [selectedPointIndex, setSelectedPointIndex] = useState(null)

  useEffect(() => {
    if (!isOpen) {
      setSelectedPointIndex(null)
      return
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const { days, averageHours, loggedCount, bestDay } = useMemo(() => {
    const validLogDates = []
    const logMap = new Map()

    for (const log of sleepLogs) {
      const key = getLogDateKey(log)
      if (key) {
        validLogDates.push(key)
        const existing = logMap.get(key) || []
        existing.push(log)
        logMap.set(key, existing)
      }
    }

    const uniqueDates = Array.from(new Set(validLogDates)).sort()

    // Anchor the 7-day moving window on the latest logged date so historical logs remain inspectable
    const anchorDate =
      uniqueDates.length > 0
        ? parseDateKey(uniqueDates[uniqueDates.length - 1])
        : new Date()

    const windowDays = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(anchorDate)
      d.setDate(d.getDate() - i)
      const dateKey = formatDateKey(d)
      const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' })
      const dateDisplay = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })

      const dayLogs = logMap.get(dateKey) || []
      const totalDuration = dayLogs.reduce(
        (sum, item) => sum + (Number(item.duration) || 0),
        0
      )
      const hasLog = dayLogs.length > 0 && totalDuration > 0

      windowDays.push({
        dateKey,
        dayShort,
        dateDisplay,
        duration: +totalDuration.toFixed(2),
        hasLog,
      })
    }

    // Average only across nights actually logged in this 7-day window
    const loggedDays = windowDays.filter((d) => d.hasLog && d.duration > 0)
    const loggedCount = loggedDays.length
    const totalDuration = loggedDays.reduce((acc, cur) => acc + cur.duration, 0)
    const averageHours =
      loggedCount > 0 ? +(totalDuration / loggedCount).toFixed(2) : 0

    const bestDay =
      loggedDays.length > 0
        ? [...loggedDays].sort((a, b) => b.duration - a.duration)[0]
        : null

    return {
      days: windowDays,
      averageHours,
      loggedCount,
      bestDay,
    }
  }, [sleepLogs])

  if (!isOpen) return null

  const svgWidth = 520
  const svgHeight = 240
  const padLeft = 45
  const padRight = 35
  const padTop = 30
  const padBottom = 45
  const chartWidth = svgWidth - padLeft - padRight
  const chartHeight = svgHeight - padTop - padBottom

  const maxLoggedVal = Math.max(...days.map((d) => d.duration), 0)
  const yMax = Math.max(10, Math.ceil(Math.max(maxLoggedVal, averageHours) + 1.5))

  const getX = (index) => padLeft + (index / 6) * chartWidth
  const getY = (val) => padTop + chartHeight - (val / yMax) * chartHeight

  const points = days.map((day, idx) => ({
    x: getX(idx),
    y: getY(day.duration),
    ...day,
    idx,
  }))

  const linePath = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
    .join(' ')

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${getY(
    0
  )} L ${points[0].x} ${getY(0)} Z`

  const avgY = getY(averageHours)
  const activeDay =
    selectedPointIndex !== null
      ? points[selectedPointIndex]
      : points[points.length - 1]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trend-modal-title"
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shadow-inner shrink-0">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2
                id="trend-modal-title"
                className="text-base font-bold text-white tracking-tight"
              >
                7-Day Sleep Trend
              </h2>
              <p className="text-xs text-slate-400">
                Moving 7-day timeframe with logged average baseline
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
            aria-label="Close trend modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>
              {days[0]?.dateDisplay} – {days[6]?.dateDisplay}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
              <span>Nightly Log</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400 font-semibold">
              <span className="w-3.5 h-0.5 bg-red-500 rounded-full" />
              <span>Average Baseline</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950/80 border border-slate-800/80 p-3 pt-4 relative overflow-hidden">
          {loggedCount === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-950/70 z-10 backdrop-blur-[1px]">
              <Clock className="w-7 h-7 text-slate-500 mb-1.5" />
              <p className="text-xs font-semibold text-slate-300">
                No sleep logs in this 7-day timeframe
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Record a sleep session to view your trend curve & average line
              </p>
            </div>
          )}

          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              <linearGradient id="sleepLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
              </linearGradient>

              <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="2"
                  floodColor="#ef4444"
                  floodOpacity="0.5"
                />
              </filter>
            </defs>

            {[0, 4, 8, yMax].map((tickVal) => {
              const tickY = getY(tickVal)
              return (
                <g key={tickVal}>
                  <line
                    x1={padLeft}
                    y1={tickY}
                    x2={padLeft + chartWidth}
                    y2={tickY}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.4"
                  />
                  <text
                    x={padLeft - 8}
                    y={tickY + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="inherit"
                  >
                    {tickVal}h
                  </text>
                </g>
              )
            })}

            {sleepGoalHours > 0 && sleepGoalHours < yMax && (
              <g>
                <line
                  x1={padLeft}
                  y1={getY(sleepGoalHours)}
                  x2={padLeft + chartWidth}
                  y2={getY(sleepGoalHours)}
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                  opacity="0.5"
                />
                <text
                  x={padLeft + chartWidth}
                  y={getY(sleepGoalHours) - 4}
                  textAnchor="end"
                  fill="#10b981"
                  fontSize="9"
                  fontWeight="600"
                  opacity="0.8"
                >
                  Goal {sleepGoalHours}h
                </text>
              </g>
            )}

            {loggedCount > 0 && (
              <>
                <path d={areaPath} fill="url(#sleepLineGrad)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {loggedCount > 0 && averageHours > 0 && (
              <g filter="url(#redGlow)">
                <line
                  x1={padLeft - 6}
                  y1={avgY}
                  x2={padLeft + chartWidth + 6}
                  y2={avgY}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                />
                <rect
                  x={padLeft + chartWidth - 76}
                  y={avgY - 10}
                  width="78"
                  height="20"
                  rx="6"
                  fill="#ef4444"
                />
                <text
                  x={padLeft + chartWidth - 37}
                  y={avgY + 3.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="inherit"
                >
                  Avg {averageHours}h
                </text>
              </g>
            )}

            {points.map((pt) => {
              const isSelected = selectedPointIndex === pt.idx
              const hasLog = pt.hasLog

              return (
                <g
                  key={pt.dateKey}
                  className="cursor-pointer transition-transform"
                  onClick={() => setSelectedPointIndex(pt.idx)}
                >
                  <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="10"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2"
                      opacity="0.6"
                      className="animate-ping"
                    />
                  )}

                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6 : hasLog ? 4.5 : 3}
                    fill={hasLog ? '#ffffff' : '#475569'}
                    stroke={hasLog ? 'var(--accent)' : '#1e293b'}
                    strokeWidth={hasLog ? 2.5 : 1.5}
                  />

                  {hasLog && (
                    <g transform={`translate(${pt.x}, ${pt.y - 12})`}>
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : '#cbd5e1'}
                        fontSize="9"
                        fontWeight={isSelected ? 'bold' : '600'}
                        fontFamily="inherit"
                      >
                        {pt.duration}h
                      </text>
                    </g>
                  )}

                  <text
                    x={pt.x}
                    y={svgHeight - 20}
                    textAnchor="middle"
                    fill={
                      isSelected
                        ? 'var(--accent-text)'
                        : hasLog
                          ? '#f8fafc'
                          : '#64748b'
                    }
                    fontSize="11"
                    fontWeight={isSelected || hasLog ? '700' : '400'}
                    fontFamily="inherit"
                  >
                    {pt.dayShort}
                  </text>
                  <text
                    x={pt.x}
                    y={svgHeight - 7}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="inherit"
                  >
                    {pt.dateDisplay.split(' ')[1]}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {activeDay && activeDay.hasLog && (
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-text)] shrink-0 font-bold text-xs">
                {activeDay.dayShort}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">
                    {activeDay.dateDisplay}
                  </span>
                  <span className="text-xs font-bold text-white tabular-nums">
                    {formatDuration(activeDay.duration)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {averageHours > 0 ? (
                    activeDay.duration >= averageHours ? (
                      <span className="text-emerald-400 font-medium">
                        +{(activeDay.duration - averageHours).toFixed(1)}h above
                        7-day average
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium">
                        -{(averageHours - activeDay.duration).toFixed(1)}h below
                        7-day average
                      </span>
                    )
                  ) : (
                    'Logged sleep session'
                  )}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                <Clock className="w-3 h-3 text-[var(--accent-text)]" />
                {activeDay.duration} hrs
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-red-300 uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span>7-Day Avg</span>
            </div>
            <p className="text-lg font-extrabold text-red-400 tabular-nums">
              {averageHours > 0 ? formatDuration(averageHours) : '—'}
            </p>
            <p className="text-[10px] text-red-300/70 mt-0.5">
              Red line baseline
            </p>
          </div>

          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-3 text-center">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Recorded
            </p>
            <p className="text-lg font-extrabold text-white tabular-nums">
              {loggedCount} of 7
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Nights in window
            </p>
          </div>

          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-3 text-center">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Peak Night
            </p>
            <p className="text-lg font-extrabold text-emerald-400 tabular-nums">
              {bestDay ? formatDuration(bestDay.duration) : '—'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {bestDay ? `${bestDay.dayShort} (${bestDay.duration}h)` : 'No logs'}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/60 border border-slate-800/70 p-2.5 flex items-start gap-2 text-[11px] text-slate-400">
          <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p>
            The <strong className="text-red-400">red horizontal line</strong>{' '}
            indicates your average sleep duration across all nights logged in
            this 7-day moving timeframe.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer active:scale-[0.98]"
        >
          Close Graph
        </button>
      </div>
    </div>
  )
}
