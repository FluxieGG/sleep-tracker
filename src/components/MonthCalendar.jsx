import { useState, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Flame,
} from 'lucide-react'
import {
  formatDateKey,
  parseDateKey,
  getLogDateKey,
  getCalendarGrid,
  formatDuration,
} from '../utils/timeUtils'

const DAYS_OF_WEEK = [
  { short: 'Mon', initial: 'M' },
  { short: 'Tue', initial: 'T' },
  { short: 'Wed', initial: 'W' },
  { short: 'Thu', initial: 'T' },
  { short: 'Fri', initial: 'F' },
  { short: 'Sat', initial: 'S' },
  { short: 'Sun', initial: 'S' },
]

export default function MonthCalendar({
  sleepLogs = [],
  isSleeping = false,
  activeSession = null,
  onViewLog,
  streakStats = {},
  onOpenStreakModal,
  sleepGoalHours = 8,
}) {
  const today = useMemo(() => new Date(), [])
  const todayKey = useMemo(() => formatDateKey(today), [today])

  // Map all logs by 'YYYY-MM-DD' key for instant lookup
  const logsByDateKey = useMemo(() => {
    const map = {}
    for (const log of sleepLogs) {
      const key = getLogDateKey(log)
      if (key) {
        if (!map[key]) {
          map[key] = []
        }
        map[key].push(log)
      }
    }
    return map
  }, [sleepLogs])

  // Find most relevant initial date: today, or latest logged session date
  const initialDate = useMemo(() => {
    if (logsByDateKey[todayKey]) return today
    if (sleepLogs.length > 0) {
      const latestKey = getLogDateKey(sleepLogs[0])
      if (latestKey) return parseDateKey(latestKey)
    }
    return today
  }, [logsByDateKey, sleepLogs, today, todayKey])

  // Current month being viewed
  const [viewDate, setViewDate] = useState(() => {
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  })

  // Selected date key for details view & ring highlight
  const [selectedDateKey, setSelectedDateKey] = useState(() => {
    return formatDateKey(initialDate)
  })

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthLabel = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  // 7-column calendar grid
  const calendarDays = useMemo(() => {
    return getCalendarGrid(year, month)
  }, [year, month])

  // Count how many logged days are in the currently viewed month
  const monthlyLogsCount = useMemo(() => {
    let count = 0
    for (const item of calendarDays) {
      if (item.isCurrentMonth && logsByDateKey[item.dateKey]?.length > 0) {
        count += 1
      }
    }
    return count
  }, [calendarDays, logsByDateKey])

  // Selected date details
  const selectedDateObj = useMemo(() => {
    return parseDateKey(selectedDateKey)
  }, [selectedDateKey])

  const selectedDayLogs = logsByDateKey[selectedDateKey] || []
  const selectedSession = selectedDayLogs[0] || null

  const isSelectedToday = selectedDateKey === todayKey
  const isViewingCurrentMonth =
    year === today.getFullYear() && month === today.getMonth()

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const handleGoToToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDateKey(todayKey)
  }

  const handleSelectDay = (day) => {
    setSelectedDateKey(day.dateKey)
    // If user clicked a day from previous/next month overflow, shift month view
    if (!day.isCurrentMonth) {
      setViewDate(new Date(day.date.getFullYear(), day.date.getMonth(), 1))
    }
  }

  return (
    <div className="rounded-2xl bg-slate-900/90 border to-slate-900 border-[var(--accent-border)] p-4 to-slate-900 border-[var(--accent-border)] shadow-xl space-y-4">
      {/* Calendar Header with Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-text)]">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white leading-tight">
              Sleep Calendar
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span>{monthlyLogsCount} {monthlyLogsCount === 1 ? 'night' : 'nights'} in {viewDate.toLocaleDateString('en-US', { month: 'short' })}</span>
              {streakStats.currentStreak > 0 && (
                <>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={onOpenStreakModal}
                    className="text-[var(--accent-text)] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    title="View sleep streak log"
                  >
                    <Flame className="w-3 h-3 fill-current" />
                    <span>{streakStats.currentStreak}d streak</span>
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Month Navigator Controls */}
        <div className="flex items-center gap-1">
          {!isViewingCurrentMonth && (
            <button
              type="button"
              onClick={handleGoToToday}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition cursor-pointer mr-1"
              title="Return to today"
            >
              Today
            </button>
          )}

          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Previous month"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-slate-200 min-w-[105px] text-center select-none">
            {monthLabel}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Next month"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Column Headers (Mon - Sun) */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAYS_OF_WEEK.map((d, idx) => (
          <span
            key={idx}
            className="text-[11px] font-semibold text-slate-400 py-1 select-none"
            title={d.short}
          >
            {d.short}
          </span>
        ))}
      </div>

      {/* Month-by-Month Calendar Day Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const dayLogs = logsByDateKey[day.dateKey] || []
          const hasSession = dayLogs.length > 0
          const firstSession = dayLogs[0]
          const isSelected = selectedDateKey === day.dateKey
          const isCurrentToday = day.dateKey === todayKey
          const hasDisruptions = firstSession?.disruptions?.length > 0

          // Determine button style classes:
          // 1. Session Logged: Filled in with accented theme
          // 2. Selected: Highlighted with a ring in colour of the theme
          // 3. Unlogged & Unselected: Neutral slate
          let cellStyle = ''

          if (hasSession) {
            // Logged session: Filled with the theme accent color
            cellStyle =
              'bg-[var(--accent)] text-[var(--accent-btn-text)] font-bold shadow-sm shadow-[var(--accent-shadow)]'
          } else if (isSelected) {
            // Selected without a logged session
            cellStyle = 'bg-slate-800/80 text-white font-semibold'
          } else if (day.isCurrentMonth) {
            // Current month regular unlogged day
            cellStyle = 'text-slate-300 hover:bg-slate-800/60'
          } else {
            // Overflow days from adjacent months
            cellStyle = 'text-slate-600 opacity-40 hover:opacity-75'
          }

          // Ring highlight on selection (works on both filled and unfilled cells)
          const ringStyle = isSelected
            ? 'ring-2 ring-[var(--accent-ring,var(--accent))] ring-offset-2 ring-offset-slate-900 z-10 scale-[1.05]'
            : ''

          // Subtle indicator if this day is today but has no session logged yet
          const todayBorder =
            isCurrentToday && !hasSession && !isSelected
              ? 'border border-[var(--accent-border)] font-semibold text-[var(--accent-text)]'
              : ''

          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => handleSelectDay(day)}
              className={`h-9 sm:h-10 rounded-xl text-xs flex flex-col items-center justify-center relative transition-transform cursor-pointer select-none ${cellStyle} ${ringStyle} ${todayBorder}`}
              aria-label={`${day.date.toDateString()}${
                hasSession ? `, ${formatDuration(firstSession.duration)} sleep logged` : ''
              }${isSelected ? ', selected' : ''}`}
            >
              <span>{day.dayNumber}</span>

              {/* Active tracking ping for current live session on today */}
              {isCurrentToday && isSleeping && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping absolute top-1 right-1"
                  title="Tracking in progress"
                />
              )}

              {/* Red Disruption Dot indicator */}
              {hasDisruptions && (
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                    hasSession
                      ? 'bg-rose-500 border border-slate-900/60'
                      : 'bg-rose-500'
                  }`}
                  title={`${firstSession.disruptions.length} disruption(s) logged`}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend Indicator Bar */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/70">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-md bg-[var(--accent)] shadow-sm inline-block" />
          <span>Theme Fill (Logged)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-md border-2 border-[var(--accent-ring,var(--accent))] inline-block" />
          <span>Theme Ring (Selected)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          <span>Disruption</span>
        </div>
      </div>

      {/* Selected Date Summary Card */}
      <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5 space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">
              {selectedDateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {isSelectedToday && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)]">
                Today
              </span>
            )}
          </div>

          {selectedSession && (
            <span className="font-bold text-[var(--accent-text)] bg-[var(--accent-subtle)] px-2.5 py-0.5 rounded-lg border border-[var(--accent-border)] tabular-nums">
              {formatDuration(selectedSession.duration)}
            </span>
          )}
        </div>

        {selectedSession ? (
          <div className="space-y-2">
            {streakStats.streakDates?.includes(selectedDateKey) && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent-text)] text-[10px] font-semibold">
                <Flame className="w-3 h-3 fill-current" />
                <span>Part of your {streakStats.currentStreak}-day sleep streak</span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                <span>
                  {selectedSession.start12} → {selectedSession.end12}
                </span>
              </span>
              {(() => {
                const goalNum = Number(sleepGoalHours) || 8
                const durationNum = Number(selectedSession.duration) || 0
                const meetsGoal = durationNum >= goalNum
                return (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                      meetsGoal
                        ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                        : 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                    }`}
                  >
                    {meetsGoal
                      ? `${goalNum}h Goal Met`
                      : `Under ${goalNum}h Goal`}
                  </span>
                )
              })()}
            </div>

            {/* Time in Bed vs Actual Sleep Breakdown if disruptions occurred */}
            {selectedSession.disruptions?.length > 0 && (
              <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400">
                <span>In Bed: <strong className="text-white font-medium">{formatDuration(selectedSession.duration)}</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-rose-400 font-medium">
                  {selectedSession.disruptions.reduce((sum, d) => sum + (Number(d.durationMinutes) || 0), 0)}m awake
                </span>
                <span className="text-slate-600">•</span>
                <span>Actual: <strong className="text-emerald-400 font-semibold">{formatDuration(Math.max(0, Number(selectedSession.duration) - selectedSession.disruptions.reduce((sum, d) => sum + (Number(d.durationMinutes) || 0), 0) / 60))}</strong></span>
              </div>
            )}

            {/* Disruptions or Uninterrupted Status */}
            {selectedSession.disruptions?.length > 0 ? (
              <div className="rounded-lg bg-rose-950/20 border border-rose-500/30 p-2 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 text-[11px] font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>
                    {selectedSession.disruptions.length}{' '}
                    {selectedSession.disruptions.length === 1
                      ? 'Disruption Logged'
                      : 'Disruptions Logged'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSession.disruptions.map((d) => (
                    <span
                      key={d.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px]"
                    >
                      <span>{d.icon || '🔴'}</span>
                      <span className="font-medium">{d.type}</span>
                      <span className="text-rose-400/90 font-mono">({d.time12})</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-400/90 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Uninterrupted rest throughout the night</span>
              </div>
            )}

            {onViewLog && (
              <button
                type="button"
                onClick={onViewLog}
                className="w-full mt-1 pt-2 border-t border-slate-800/80 text-[11px] text-[var(--accent-text)] hover:opacity-85 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View Full Record in Log</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-slate-400 text-xs py-1">
            {isSelectedToday && isSleeping ? (
              <p className="text-amber-400/90 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Rest session currently in progress tonight.
              </p>
            ) : isSelectedToday ? (
              <p className="text-slate-400">
                No session logged yet for tonight. Tap{' '}
                <span className="text-white font-medium">
                  "Start Sleep Session"
                </span>{' '}
                above when ready for bed.
              </p>
            ) : (
              <p className="text-slate-500">
                No sleep session recorded for this date.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
