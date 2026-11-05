import { useState } from 'react'
import {
  Wrench,
  X,
  FastForward,
  RotateCcw,
  PlusCircle,
  Zap,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

const DAY_OPTIONS = [
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
  { short: 'Sun', full: 'Sunday' },
]

const PRESET_SESSIONS = [
  {
    title: '8h 15m Optimal Night',
    day: 'Tonight',
    start: '22:45',
    end: '07:00',
    desc: '10:45 PM – 7:00 AM',
  },
  {
    title: '9h 00m Deep Weekend Rest',
    day: 'Sat',
    start: '23:00',
    end: '08:00',
    desc: '11:00 PM – 8:00 AM',
  },
  {
    title: '5h 30m Short Sleep',
    day: 'Thu',
    start: '00:30',
    end: '06:00',
    desc: '12:30 AM – 6:00 AM',
  },
  {
    title: '7h 15m Regular Workday',
    day: 'Tue',
    start: '23:30',
    end: '06:45',
    desc: '11:30 PM – 6:45 AM',
  },
]

function formatTime12(time24) {
  const [hStr, mStr] = time24.split(':')
  const h = parseInt(hStr, 10)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${mStr} ${suffix}`
}

function parseTimeToContinuous(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const hourDecimal = h + m / 60
  // Times before 12:00 PM (e.g., 07:00 AM) are next morning = +24 hours
  return hourDecimal < 12 ? hourDecimal + 24 : hourDecimal
}

export default function DevWidget({
  activeSession,
  setActiveSession,
  setSleepLogs,
  setWeekSchedule,
  setLastFinishedSummary,
  onResetData,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState('presets') // 'presets' | 'custom' | 'session'

  // Custom Form State
  const [customDay, setCustomDay] = useState('Mon')
  const [customStart, setCustomStart] = useState('22:30')
  const [customEnd, setCustomEnd] = useState('07:00')

  // Inject a completed session
  const injectSession = (dayShort, fullDayName, start24, end24) => {
    const startHour = parseTimeToContinuous(start24)
    const endHour = parseTimeToContinuous(end24)
    const duration = Math.max(0.1, endHour - startHour)

    const now = new Date()
    const session = {
      id: `dev-session-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      startTime: now.getTime() - duration * 3600 * 1000,
      endTime: now.getTime(),
      dateString: now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      day: dayShort,
      fullDay: fullDayName,
      start: start24,
      end: end24,
      start12: formatTime12(start24),
      end12: formatTime12(end24),
      startHour,
      endHour,
      duration,
      disruptions: [],
      isDevInjected: true,
    }

    // Add to history
    setSleepLogs((prev) => [session, ...prev])

    // Update Gantt schedule row
    setWeekSchedule((prev) =>
      prev.map((item) =>
        item.day.toLowerCase() === dayShort.toLowerCase()
          ? {
              ...item,
              start: session.start,
              end: session.end,
              startHour: session.startHour,
              endHour: session.endHour,
              duration: session.duration,
              isRealSession: true,
            }
          : item
      )
    )

    setLastFinishedSummary(session)
  }

  // Fast-forward active session by shifting its start time into the past
  const fastForwardActive = (hours) => {
    if (!activeSession) return
    const shifted = activeSession.startTime - hours * 3600 * 1000
    setActiveSession({
      ...activeSession,
      startTime: shifted,
    })
  }

  // Instantly start an active session 8 hours in the past
  const startSimulatedActive = () => {
    const eightHoursAgo = Date.now() - 8 * 3600 * 1000
    setActiveSession({
      startTime: eightHoursAgo,
      disruptions: [],
    })
    setLastFinishedSummary(null)
  }

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    const matched = DAY_OPTIONS.find((d) => d.short === customDay)
    injectSession(customDay, matched?.full || customDay, customStart, customEnd)
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 max-w-[calc(100vw-32px)]">
      {/* Dev Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 border border-indigo-400/40 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          <Wrench className="w-3.5 h-3.5 text-indigo-200" />
          <span>🧪 Dev Widget</span>
          {activeSession && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>
      )}

      {/* Expanded Dev Panel */}
      {isOpen && (
        <div className="w-80 rounded-2xl bg-slate-950/95 border border-indigo-500/40 shadow-2xl backdrop-blur-xl p-4 text-slate-100 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-semibold text-white">Dev Test Sandbox</h4>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subtabs */}
          <div className="grid grid-cols-3 gap-1 my-3 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveSubTab('presets')}
              className={`py-1 rounded-lg text-center font-medium transition ${
                activeSubTab === 'presets'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ Presets
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('custom')}
              className={`py-1 rounded-lg text-center font-medium transition ${
                activeSubTab === 'custom'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ✍️ Custom
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('session')}
              className={`py-1 rounded-lg text-center font-medium transition ${
                activeSubTab === 'session'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⏩ Live Sim
            </button>
          </div>

          {/* TAB 1: QUICK PRESETS */}
          {activeSubTab === 'presets' && (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400">
                1-tap to insert full sleep sessions into Log and Gantt chart:
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {PRESET_SESSIONS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => {
                      const today = new Date().toLocaleDateString('en-US', {
                        weekday: 'short',
                      })
                      const day = preset.day === 'Tonight' ? today : preset.day
                      const match = DAY_OPTIONS.find((d) => d.short === day)
                      injectSession(
                        day,
                        match?.full || 'Night',
                        preset.start,
                        preset.end
                      )
                    }}
                    className="w-full text-left p-2 rounded-xl bg-slate-900/90 hover:bg-indigo-950/40 border border-slate-800/80 hover:border-indigo-500/40 transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 group-hover:text-indigo-300">
                        {preset.title}
                      </span>
                      <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        + Add
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {preset.desc} ({preset.day})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM SESSION */}
          {activeSubTab === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-2.5">
              <div>
                <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Day of Week
                </label>
                <select
                  value={customDay}
                  onChange={(e) => setCustomDay(e.target.value)}
                  className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                >
                  {DAY_OPTIONS.map((d) => (
                    <option key={d.short} value={d.short}>
                      {d.full} ({d.short})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Bedtime (Start)
                  </label>
                  <input
                    type="time"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Wake Up (End)
                  </label>
                  <input
                    type="time"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition mt-1 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add to Week & Log
              </button>
            </form>
          )}

          {/* TAB 3: LIVE SESSION TIME-TRAVEL */}
          {activeSubTab === 'session' && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-400">
                Simulate time passing without waiting hours:
              </p>

              {activeSession ? (
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    <p className="font-semibold text-[11px]">Active Session Running</p>
                    <p className="text-[10px] text-amber-300/80 mt-0.5">
                      Fast-forward elapsed time so you can test ending it:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => fastForwardActive(1)}
                      className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium flex items-center justify-center gap-1"
                    >
                      <FastForward className="w-3 h-3 text-indigo-400" />
                      +1h Elapsed
                    </button>
                    <button
                      type="button"
                      onClick={() => fastForwardActive(4)}
                      className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium flex items-center justify-center gap-1"
                    >
                      <FastForward className="w-3 h-3 text-indigo-400" />
                      +4h Elapsed
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={startSimulatedActive}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                    Start Session Set to 8h Ago
                  </button>
                  <p className="text-[10px] text-slate-500">
                    Immediately puts the app in "In Bed Now" with 8 hours already elapsed so you can test ending it.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer controls */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={onResetData}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Sample Data
            </button>
            <span className="text-slate-500 font-mono text-[10px]">Testing Tool</span>
          </div>
        </div>
      )}
    </div>
  )
}
