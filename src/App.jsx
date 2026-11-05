import { useState } from 'react'
import { Moon, BarChart2, Clock, Settings, Plus, Sparkles, Calendar, TrendingUp } from 'lucide-react'

const TABS = [
  { id: 'tonight', label: 'Tonight', icon: Moon },
  { id: 'history', label: 'Log', icon: Clock },
  { id: 'stats', label: 'Insights', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

// 7:00 PM (19.0) to 10:00 AM (+15 hours = 34.0 on a continuous scale)
const CHART_START_HOUR = 19 // 7 PM
const CHART_TOTAL_HOURS = 15 // 7 PM -> 10 AM (15 hours total)

// Time markers along the top/bottom of the Gantt chart
const TIME_MARKERS = [
  { label: '7p', offsetHours: 0 },
  { label: '10p', offsetHours: 3 },
  { label: '1a', offsetHours: 6 },
  { label: '4a', offsetHours: 9 },
  { label: '7a', offsetHours: 12 },
  { label: '10a', offsetHours: 15 },
]

// Sample current week sleep sessions (Monday - Sunday)
// startHour is in 24h format (e.g. 22.5 = 10:30 PM, 24.5 = 12:30 AM, 7.25 = 7:15 AM)
const INITIAL_WEEK_DATA = [
  { day: 'Mon', fullDay: 'Monday', start: '22:30', end: '06:45', startHour: 22.5, endHour: 30.75 },
  { day: 'Tue', fullDay: 'Tuesday', start: '23:15', end: '07:15', startHour: 23.25, endHour: 31.25 },
  { day: 'Wed', fullDay: 'Wednesday', start: '22:00', end: '06:30', startHour: 22.0, endHour: 30.5 },
  { day: 'Thu', fullDay: 'Thursday', start: '23:45', end: '07:30', startHour: 23.75, endHour: 31.5 },
  { day: 'Fri', fullDay: 'Friday', start: '00:30', end: '08:45', startHour: 24.5, endHour: 32.75 },
  { day: 'Sat', fullDay: 'Saturday', start: '01:00', end: '09:30', startHour: 25.0, endHour: 33.5 },
  { day: 'Sun', fullDay: 'Sunday', start: '21:45', end: '06:15', startHour: 21.75, endHour: 30.25 },
]

function formatDuration(hoursDecimal) {
  const totalMinutes = Math.round(hoursDecimal * 60)
  const hrs = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h 00m`
}

function formatTime12h(time24) {
  const [hStr, mStr] = time24.split(':')
  const h = parseInt(hStr, 10)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${mStr} ${suffix}`
}

export default function App() {
  const [activeTab, setActiveTab] = useState('stats')
  const [selectedDay, setSelectedDay] = useState(INITIAL_WEEK_DATA[0])

  // Calculate weekly totals & averages
  const daysWithTotals = INITIAL_WEEK_DATA.map((item) => {
    const duration = Math.max(0, item.endHour - item.startHour)
    return { ...item, duration }
  })

  const totalWeeklyHours = daysWithTotals.reduce((acc, cur) => acc + cur.duration, 0)
  const avgDailyHours = totalWeeklyHours / daysWithTotals.length

  return (
    <div className="min-h-dvh bg-slate-950 flex justify-center">
      {/* Mobile Shell Container */}
      <div className="w-full max-w-md min-h-dvh bg-slate-900/60 border-x border-slate-800/60 flex flex-col justify-between relative shadow-2xl">
        
        {/* Top Header */}
        <header className="sticky top-0 z-20 backdrop-blur-md bg-slate-900/80 border-b border-slate-800/80 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-white leading-none">
                Slumber
              </h1>
              <p className="text-xs text-slate-400 mt-1">Sleep Companion</p>
            </div>
          </div>

          <button
            type="button"
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 active:scale-95 transition"
            aria-label="Quick log sleep"
          >
            <Plus className="w-4 h-4" />
          </button>
        </header>

        {/* Main Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto px-5 py-6 space-y-6 no-scrollbar">
          {activeTab === 'tonight' && (
            <div className="space-y-5">
              {/* Hero Card */}
              <div className="rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/20 p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Ready for rest
                  </span>
                  <span className="text-xs text-slate-400">Goal: 8h 00m</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Good Evening</h2>
                <p className="text-sm text-slate-400 mb-5">
                  Start tracking when you get into bed, or log last night's sleep manually.
                </p>
                <button
                  type="button"
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-medium text-sm shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
                >
                  <Moon className="w-4 h-4" />
                  Start Sleep Session
                </button>
              </div>

              {/* Practice Placeholder Section */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-1">
                  Recent Nights
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Build out your sleep log list or state management here!
                </p>
                <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-xs text-slate-500">
                  No sleep sessions logged yet.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-5">
              {/* Weekly Summary Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Weekly Total</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {formatDuration(totalWeeklyHours)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mon – Sun (7 nights)</p>
                </div>

                <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Daily Average</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {formatDuration(avgDailyHours)}
                  </p>
                  <p className="text-[11px] text-emerald-400/90 mt-0.5">+15m vs 8h goal</p>
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

                {/* Time Axis Header (7p to 10a) */}
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
                  {daysWithTotals.map((item) => {
                    const startOffset = Math.max(0, item.startHour - CHART_START_HOUR)
                    const endOffset = Math.min(CHART_TOTAL_HOURS, item.endHour - CHART_START_HOUR)
                    const leftPct = (startOffset / CHART_TOTAL_HOURS) * 100
                    const widthPct = Math.max(2, ((endOffset - startOffset) / CHART_TOTAL_HOURS) * 100)
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
                        {/* Day Label */}
                        <span className="text-xs font-semibold text-slate-300">
                          {item.day}
                        </span>

                        {/* Timeline Track (7 PM - 10 AM) */}
                        <div className="relative h-7 rounded-lg bg-slate-950/90 border border-slate-800/80 overflow-hidden">
                          {/* Vertical Grid Lines */}
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

                          {/* Midnight (12 AM) Subtle Highlight Line */}
                          <div
                            style={{ left: `${(5 / CHART_TOTAL_HOURS) * 100}%` }}
                            className="absolute top-0 bottom-0 w-px border-l border-dashed border-indigo-500/30"
                            title="Midnight"
                          />

                          {/* Gantt Sleep Session Bar */}
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

                        {/* Daily Total Duration */}
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

                {/* Selected Day Session Detail Footer */}
                {selectedDay && (
                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Selected: </span>
                      <span className="font-semibold text-white">{selectedDay.fullDay}</span>
                      <span className="text-slate-400 ml-2">
                        ({formatTime12h(selectedDay.start)} – {formatTime12h(selectedDay.end)})
                      </span>
                    </div>
                    <span className="font-semibold text-indigo-400">
                      {formatDuration(selectedDay.endHour - selectedDay.startHour)}
                    </span>
                  </div>
                )}
              </div>

              {/* Daily Session Breakdown List */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Daily Total Log (Mon – Sun)
                </h3>
                <div className="divide-y divide-slate-800/60">
                  {daysWithTotals.map((item) => (
                    <div
                      key={item.day}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 font-semibold text-slate-200">{item.day}</span>
                        <span className="text-slate-400">
                          {formatTime12h(item.start)} → {formatTime12h(item.end)}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-100 tabular-nums px-2 py-0.5 rounded-md bg-slate-800/80">
                        {formatDuration(item.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'tonight' && activeTab !== 'stats' && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-8 text-center my-8">
              <p className="text-sm font-medium text-slate-200 capitalize mb-1">
                {activeTab} View
              </p>
              <p className="text-xs text-slate-400">
                Ready for you to build the <span className="text-indigo-400">{activeTab}</span> screen!
              </p>
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
                    className={`w-full py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
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

      </div>
    </div>
  )
}
