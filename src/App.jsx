import { useState, useEffect } from 'react'
import DevWidget from './DevWidget'
import {
  Moon,
  Sun,
  BarChart2,
  Clock,
  Settings,
  Plus,
  Sparkles,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  BedDouble,
  ChevronRight,
} from 'lucide-react'

const TABS = [
  { id: 'tonight', label: 'Tonight', icon: Moon },
  { id: 'history', label: 'Log', icon: Clock },
  { id: 'stats', label: 'Insights', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

// 7:00 PM (19.0) to 10:00 AM (+15 hours = 34.0 continuous scale)
const CHART_START_HOUR = 19
const CHART_TOTAL_HOURS = 15

const TIME_MARKERS = [
  { label: '7p', offsetHours: 0 },
  { label: '10p', offsetHours: 3 },
  { label: '1a', offsetHours: 6 },
  { label: '4a', offsetHours: 9 },
  { label: '7a', offsetHours: 12 },
  { label: '10a', offsetHours: 15 },
]

const INITIAL_WEEK_DATA = [
  { id: 'mon', day: 'Mon', fullDay: 'Monday', start: '22:30', end: '06:45', startHour: 22.5, endHour: 30.75, disruptions: [] },
  { id: 'tue', day: 'Tue', fullDay: 'Tuesday', start: '23:15', end: '07:15', startHour: 23.25, endHour: 31.25, disruptions: [] },
  { id: 'wed', day: 'Wed', fullDay: 'Wednesday', start: '22:00', end: '06:30', startHour: 22.0, endHour: 30.5, disruptions: [] },
  { id: 'thu', day: 'Thu', fullDay: 'Thursday', start: '23:45', end: '07:30', startHour: 23.75, endHour: 31.5, disruptions: [] },
  { id: 'fri', day: 'Fri', fullDay: 'Friday', start: '00:30', end: '08:45', startHour: 24.5, endHour: 32.75, disruptions: [] },
  { id: 'sat', day: 'Sat', fullDay: 'Saturday', start: '01:00', end: '09:30', startHour: 25.0, endHour: 33.5, disruptions: [] },
  { id: 'sun', day: 'Sun', fullDay: 'Sunday', start: '21:45', end: '06:15', startHour: 21.75, endHour: 30.25, disruptions: [] },
]

// Helper formatters
function padZero(num) {
  return num.toString().padStart(2, '0')
}

function formatTime24(date) {
  return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`
}

function formatTime12(date) {
  const hours = date.getHours()
  const minutes = padZero(date.getMinutes())
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const h12 = hours % 12 === 0 ? 12 : hours % 12
  return `${h12}:${minutes} ${suffix}`
}

function formatDuration(hoursDecimal) {
  const totalMinutes = Math.round(hoursDecimal * 60)
  if (totalMinutes < 1) {
    const totalSeconds = Math.round(hoursDecimal * 3600)
    return totalSeconds > 0 ? `${totalSeconds}s` : '< 1m'
  }
  const hrs = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  if (hrs === 0) return `${mins}m`
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h 00m`
}

function formatElapsed(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  return `${padZero(hrs)}:${padZero(mins)}:${padZero(secs)}`
}

function getContinuousHours(startDate, endDate) {
  const startHour = startDate.getHours() + startDate.getMinutes() / 60 + startDate.getSeconds() / 3600
  const durationHours = Math.max(0, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))
  const endHour = startHour + durationHours
  return { startHour, endHour, durationHours }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('tonight')

  // Active sleep session: null or { startTime: number, disruptions: [] }
  const [activeSession, setActiveSession] = useState(() => {
    try {
      const saved = localStorage.getItem('slumber_active_session')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Completed sleep logs history
  const [sleepLogs, setSleepLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('slumber_sleep_logs')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Week schedule for the Gantt chart (falls back to initial template)
  const [weekSchedule, setWeekSchedule] = useState(() => {
    try {
      const saved = localStorage.getItem('slumber_week_schedule')
      return saved ? JSON.parse(saved) : INITIAL_WEEK_DATA
    } catch {
      return INITIAL_WEEK_DATA
    }
  })

  // Selected day for the Gantt detail view
  const [selectedDay, setSelectedDay] = useState(INITIAL_WEEK_DATA[0])

  // Just-finished session banner
  const [lastFinishedSummary, setLastFinishedSummary] = useState(null)

  // Live timer tick for active session
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    if (!activeSession?.startTime) {
      setElapsedMs(0)
      return
    }

    setElapsedMs(Date.now() - activeSession.startTime)
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - activeSession.startTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [activeSession])

  // Save activeSession state changes
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('slumber_active_session', JSON.stringify(activeSession))
    } else {
      localStorage.removeItem('slumber_active_session')
    }
  }, [activeSession])

  // Save logs changes
  useEffect(() => {
    localStorage.setItem('slumber_sleep_logs', JSON.stringify(sleepLogs))
  }, [sleepLogs])

  // Save weekSchedule changes
  useEffect(() => {
    localStorage.setItem('slumber_week_schedule', JSON.stringify(weekSchedule))
  }, [weekSchedule])

  // START SLEEP SESSION: Take timestamp
  const handleStartSleep = () => {
    const now = Date.now()
    const newSession = {
      startTime: now,
      disruptions: [], // ready for disruption logging
    }
    setActiveSession(newSession)
    setLastFinishedSummary(null)
  }

  // END SLEEP SESSION: Take end timestamp & fill in data in between
  const handleEndSleep = () => {
    if (!activeSession) return
    const endTime = Date.now()
    const startTime = activeSession.startTime
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)

    const { startHour, endHour, durationHours } = getContinuousHours(startDate, endDate)
    const dayShort = startDate.toLocaleDateString('en-US', { weekday: 'short' })
    const dayFull = startDate.toLocaleDateString('en-US', { weekday: 'long' })

    const newLog = {
      id: `session-${Date.now()}`,
      startTime,
      endTime,
      dateString: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      day: dayShort,
      fullDay: dayFull,
      start: formatTime24(startDate),
      end: formatTime24(endDate),
      start12: formatTime12(startDate),
      end12: formatTime12(endDate),
      startHour,
      endHour,
      duration: durationHours,
      disruptions: activeSession.disruptions || [],
    }

    // Prepend to logs
    setSleepLogs((prev) => [newLog, ...prev])

    // Update the week schedule entry if matching day exists
    setWeekSchedule((prev) =>
      prev.map((item) =>
        item.day.toLowerCase() === dayShort.toLowerCase()
          ? {
              ...item,
              start: newLog.start,
              end: newLog.end,
              startHour: newLog.startHour,
              endHour: newLog.endHour,
              duration: newLog.duration,
              isRealSession: true,
            }
          : item
      )
    )

    // Clear active session and display summary card
    setActiveSession(null)
    setLastFinishedSummary(newLog)
  }

  // Calculate Gantt week totals
  const weekWithTotals = weekSchedule.map((item) => {
    const duration = item.duration ?? Math.max(0, item.endHour - item.startHour)
    return { ...item, duration }
  })
  const totalWeeklyHours = weekWithTotals.reduce((acc, cur) => acc + cur.duration, 0)
  const avgDailyHours = totalWeeklyHours / weekWithTotals.length

  const isSleeping = Boolean(activeSession)

  return (
    <div className="min-h-dvh bg-slate-950 flex justify-center text-slate-100">
      {/* Mobile Shell Container */}
      <div className="w-full max-w-md min-h-dvh bg-slate-900/60 border-x border-slate-800/60 flex flex-col justify-between relative shadow-2xl">

        {/* Top Header */}
        <header className="sticky top-0 z-20 backdrop-blur-md bg-slate-900/80 border-b border-slate-800/80 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              isSleeping
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
            }`}>
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
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('tonight')}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 active:scale-95 transition"
            aria-label="Tonight"
          >
            <BedDouble className="w-4 h-4 text-indigo-300" />
          </button>
        </header>

        {/* Main Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto px-5 py-6 space-y-5 no-scrollbar">

          {/* Just Finished Session Banner */}
          {lastFinishedSummary && (
            <div className="rounded-2xl bg-emerald-950/60 border border-emerald-500/30 p-4 shadow-lg text-emerald-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Sleep Session Saved
                  </p>
                  <span className="text-xs font-bold text-white bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    {formatDuration(lastFinishedSummary.duration)}
                  </span>
                </div>
                <p className="text-xs text-emerald-200/80 mt-1">
                  Recorded from <span className="font-semibold text-white">{lastFinishedSummary.start12}</span> to{' '}
                  <span className="font-semibold text-white">{lastFinishedSummary.end12}</span> ({lastFinishedSummary.fullDay}).
                </p>
              </div>
            </div>
          )}

          {/* TONIGHT TAB */}
          {activeTab === 'tonight' && (
            <div className="space-y-5">
              {/* Dynamic Sleep Tracking Hero Card */}
              <div
                className={`rounded-2xl border p-5 shadow-xl transition-all ${
                  isSleeping
                    ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950/30 border-amber-500/30'
                    : 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-900 border-indigo-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 ${
                      isSleeping ? 'text-amber-400' : 'text-indigo-400'
                    }`}
                  >
                    {isSleeping ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        In Bed Now
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Ready for Rest
                      </>
                    )}
                  </span>
                  <span className="text-xs text-slate-400">Goal: 8h 00m</span>
                </div>

                {!isSleeping ? (
                  /* IDLE STATE: Start Sleep Session */
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Good Night</h2>
                    <p className="text-sm text-slate-300/90 mb-6 leading-relaxed">
                      Tap below when you turn the lights off. We'll record your start time and track your sleep session.
                    </p>

                    <button
                      type="button"
                      onClick={handleStartSleep}
                      className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Moon className="w-4 h-4 fill-white" />
                      Start Sleep Session
                    </button>
                  </div>
                ) : (
                  /* ACTIVE TRACKING STATE: End Sleep Session */
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Elapsed Rest</p>
                      <div className="text-4xl font-extrabold text-white tracking-tight tabular-nums mt-1 font-mono">
                        {formatElapsed(elapsedMs)}
                      </div>
                      <p className="text-xs text-indigo-300 mt-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Started at{' '}
                        <span className="font-semibold text-white">
                          {formatTime12(new Date(activeSession.startTime))}
                        </span>
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 text-xs text-slate-400 flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                      <span>Tracking active. Ready to log wake-ups and disruptions.</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleEndSleep}
                      className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-semibold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sun className="w-4 h-4 text-slate-950" />
                      End Sleep Session
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Nights List on Tonight */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Recent Sleep Sessions
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                  >
                    View Log <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {sleepLogs.length === 0 ? (
                  <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-xs text-slate-500">
                    No sleep sessions logged yet. Tap "Start Sleep Session" when ready!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {sleepLogs.slice(0, 3).map((item) => (
                      <div key={item.id} className="py-3 first:pt-1 last:pb-1 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{item.fullDay}</span>
                            <span className="text-[11px] text-slate-400">{item.dateString}</span>
                          </div>
                          <p className="text-slate-400 mt-0.5">
                            {item.start12} → {item.end12}
                          </p>
                        </div>
                        <span className="font-semibold text-indigo-300 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 tabular-nums">
                          {formatDuration(item.duration)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LOG (HISTORY) TAB */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">Sleep Log History</h2>
                  <p className="text-xs text-slate-400">All recorded sessions and sleep entries</p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                  {sleepLogs.length} total
                </span>
              </div>

              {sleepLogs.length === 0 ? (
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-8 text-center text-xs text-slate-400">
                  <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="font-medium text-slate-300 mb-1">No logs recorded yet</p>
                  <p>Start and end your first sleep session on the Tonight tab!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sleepLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            {log.fullDay}, {log.dateString}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {log.start12} to {log.end12}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20 tabular-nums">
                          {formatDuration(log.duration)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-400">
                        <span>Disruptions: {log.disruptions?.length ?? 0}</span>
                        <span className={log.duration >= 8 ? 'text-emerald-400' : 'text-amber-400'}>
                          {log.duration >= 8 ? 'Goal Met' : 'Under 8h Goal'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* INSIGHTS (STATS) TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-5">
              {/* Weekly Summary Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Weekly Total</span>
                  </div>
                  <p className="text-xl font-bold text-white tabular-nums">
                    {formatDuration(totalWeeklyHours)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mon – Sun (7 nights)</p>
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
                    {avgDailyHours >= 8 ? 'Met target average' : 'Below 8h target'}
                  </p>
                </div>
              </div>

              {/* Gantt Chart Card (Mon - Sun, 7 PM - 10 AM) */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      Current Week Schedule
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Sleep window: 7:00 PM – 10:00 AM
                    </p>
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Gantt View
                  </span>
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
                    const widthPct = Math.max(3, ((endOffset - startOffset) / CHART_TOTAL_HOURS) * 100)
                    const isSelected = selectedDay?.day === item.day
                    const meetsGoal = item.duration >= 8

                    return (
                      <button
                        key={item.day}
                        type="button"
                        onClick={() => setSelectedDay(item)}
                        className={`w-full grid grid-cols-[38px_1fr_54px] items-center gap-2 py-1 px-1.5 -mx-1.5 rounded-xl text-left transition ${
                          isSelected ? 'bg-slate-800/70 ring-1 ring-indigo-500/40' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                          {item.day}
                          {item.isRealSession && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" title="Recorded by you" />
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

                          <div
                            style={{ left: `${(5 / CHART_TOTAL_HOURS) * 100}%` }}
                            className="absolute top-0 bottom-0 w-px border-l border-dashed border-indigo-500/30"
                            title="Midnight"
                          />

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
                        </div>

                        <span
                          className={`text-xs font-semibold text-right tabular-nums ${
                            meetsGoal ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          {formatDuration(item.duration)}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Selected Day Footer */}
                {selectedDay && (
                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Selected: </span>
                      <span className="font-semibold text-white">{selectedDay.fullDay}</span>
                      <span className="text-slate-400 ml-2">
                        ({selectedDay.start} – {selectedDay.end})
                      </span>
                    </div>
                    <span className="font-semibold text-indigo-400 tabular-nums">
                      {formatDuration(selectedDay.duration ?? selectedDay.endHour - selectedDay.startHour)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">App Settings</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                  <span className="text-slate-300">Sleep Goal</span>
                  <span className="font-medium text-indigo-400">8 hours</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                  <span className="text-slate-300">Gantt Window</span>
                  <span className="text-slate-400">7:00 PM – 10:00 AM</span>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Reset all saved logs and active session?')) {
                        localStorage.clear()
                        setSleepLogs([])
                        setActiveSession(null)
                        setWeekSchedule(INITIAL_WEEK_DATA)
                      }
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                  >
                    Clear All Practice Data
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Bottom Navigation Bar */}
        <nav className="sticky bottom-0 z-20 backdrop-blur-md bg-slate-900/90 border-t border-slate-800/80 px-3 py-2">
          <ul className="grid grid-cols-4 gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      isActive
                        ? 'text-indigo-400 bg-indigo-500/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-medium">{tab.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Developer Testing Widget */}
        <DevWidget
          activeSession={activeSession}
          setActiveSession={setActiveSession}
          setSleepLogs={setSleepLogs}
          setWeekSchedule={setWeekSchedule}
          setLastFinishedSummary={setLastFinishedSummary}
          onResetData={() => {
            localStorage.clear()
            setSleepLogs([])
            setActiveSession(null)
            setWeekSchedule(INITIAL_WEEK_DATA)
            setLastFinishedSummary(null)
          }}
        />

      </div>
    </div>
  )
}
