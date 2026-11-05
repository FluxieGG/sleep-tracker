import { useState, useEffect } from 'react'
import {
  SEED_WEEKS,
  INITIAL_SLEEP_LOGS,
  INITIAL_WEEK_DATA,
} from './data/mockSeedData'
import {
  formatTime24,
  formatTime12,
  formatTime24To12,
  parseTimeToContinuous,
  getContinuousHours,
} from './utils/timeUtils'

// Layout & Shared Components
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import SessionConfirmedBanner from './components/SessionConfirmedBanner'
import DisruptionModal from './components/DisruptionModal'

// Separated Page Views
import TonightPage from './pages/TonightPage'
import LogPage from './pages/LogPage'
import InsightsPage from './pages/InsightsPage'
import SettingsPage from './pages/SettingsPage'

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

  // Completed sleep logs history (seeded with 3 weeks / 21 nights of data)
  const [sleepLogs, setSleepLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('slumber_sleep_logs_v2')
      return saved ? JSON.parse(saved) : INITIAL_SLEEP_LOGS
    } catch {
      return INITIAL_SLEEP_LOGS
    }
  })

  // Multi-week schedule for the Gantt chart (3 weeks)
  const [allWeeks, setAllWeeks] = useState(() => {
    try {
      const saved = localStorage.getItem('slumber_all_weeks_v2')
      return saved ? JSON.parse(saved) : SEED_WEEKS
    } catch {
      return SEED_WEEKS
    }
  })

  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0)
  const currentWeekObj = allWeeks[selectedWeekIndex] || allWeeks[0]
  const weekSchedule = currentWeekObj?.days || INITIAL_WEEK_DATA

  // Helper to update the currently active week (Week 0) when new sessions are logged
  const setWeekSchedule = (updater) => {
    setAllWeeks((prevWeeks) =>
      prevWeeks.map((w, idx) => {
        if (idx !== 0) return w
        const updatedDays = typeof updater === 'function' ? updater(w.days) : updater
        return { ...w, days: updatedDays }
      })
    )
  }

  // Selected day for the Gantt detail view
  const [selectedDay, setSelectedDay] = useState(() => weekSchedule[3] || weekSchedule[0])

  // Log tab week filter
  const [logWeekFilter, setLogWeekFilter] = useState('all')

  // Just-finished session banner
  const [lastFinishedSummary, setLastFinishedSummary] = useState(null)

  // Live timer tick for active session
  const [elapsedMs, setElapsedMs] = useState(0)

  // Disruption Modal visibility
  const [isDisruptionModalOpen, setIsDisruptionModalOpen] = useState(false)

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
    localStorage.setItem('slumber_sleep_logs_v2', JSON.stringify(sleepLogs))
  }, [sleepLogs])

  // Save multi-week schedule changes
  useEffect(() => {
    localStorage.setItem('slumber_all_weeks_v2', JSON.stringify(allWeeks))
  }, [allWeeks])

  // Keep selectedDay synced when switching weeks
  const handleSelectWeek = (index) => {
    setSelectedWeekIndex(index)
    const targetWeek = allWeeks[index]
    if (targetWeek?.days?.length) {
      const withDisruption = targetWeek.days.find((d) => d.disruptions?.length > 0)
      setSelectedDay(withDisruption || targetWeek.days[0])
    }
  }

  // START SLEEP SESSION: Take timestamp
  const handleStartSleep = () => {
    const now = Date.now()
    setActiveSession({
      startTime: now,
      disruptions: [],
    })
    setLastFinishedSummary(null)
  }

  // SAVE DISRUPTION EVENT TO ACTIVE SESSION
  const handleSaveDisruption = ({ type, icon, time24, durationMinutes, note }) => {
    if (!activeSession) return

    const newDisruption = {
      id: `dis-${Date.now()}`,
      type,
      icon,
      timestamp: Date.now(),
      time24,
      time12: formatTime24To12(time24),
      hourContinuous: parseTimeToContinuous(time24),
      durationMinutes,
      note,
    }

    setActiveSession((prev) => ({
      ...prev,
      disruptions: [...(prev.disruptions || []), newDisruption],
    }))

    setIsDisruptionModalOpen(false)
  }

  // REMOVE A DISRUPTION FROM ACTIVE SESSION
  const handleRemoveActiveDisruption = (id) => {
    if (!activeSession) return
    setActiveSession((prev) => ({
      ...prev,
      disruptions: (prev.disruptions || []).filter((d) => d.id !== id),
    }))
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
      dateString: startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
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
      weekId: 'week-current',
      weekLabel: 'This Week',
    }

    setSleepLogs((prev) => [newLog, ...prev])

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
              disruptions: newLog.disruptions,
              isRealSession: true,
            }
          : item
      )
    )

    setSelectedWeekIndex(0)
    setActiveSession(null)
    setLastFinishedSummary(newLog)
  }

  // DELETE A LOG (2-step confirmed)
  const handleDeleteLog = (logId) => {
    const target = sleepLogs.find((l) => l.id === logId)
    setSleepLogs((prev) => prev.filter((l) => l.id !== logId))

    if (target) {
      setAllWeeks((prevWeeks) =>
        prevWeeks.map((week) => ({
          ...week,
          days: week.days.map((day) => {
            const matchesId = day.id === target.id
            const matchesDayAndWeek =
              day.day.toLowerCase() === target.day?.toLowerCase() &&
              (target.weekId ? week.id === target.weekId : week.id === 'week-current')
            if (matchesId || matchesDayAndWeek) {
              return {
                ...day,
                start: '00:00',
                end: '00:00',
                startHour: 22,
                endHour: 22,
                duration: 0,
                disruptions: [],
                isRealSession: false,
              }
            }
            return day
          }),
        }))
      )
    }

    if (lastFinishedSummary?.id === logId) {
      setLastFinishedSummary(null)
    }
  }

  // Restore all 3 weeks of demo seed data
  const handleRestoreDemoData = () => {
    localStorage.removeItem('slumber_sleep_logs_v2')
    localStorage.removeItem('slumber_all_weeks_v2')
    setSleepLogs(INITIAL_SLEEP_LOGS)
    setAllWeeks(SEED_WEEKS)
    setSelectedWeekIndex(0)
    setSelectedDay(SEED_WEEKS[0].days[3])
    setActiveSession(null)
    setLastFinishedSummary(null)
  }

  // Wipe all mock data to preview clean production state
  const handleClearForRelease = () => {
    const emptyWeek = [
      { id: 'mon', day: 'Mon', fullDay: 'Monday', start: '00:00', end: '00:00', startHour: 22, endHour: 22, duration: 0, disruptions: [] },
      { id: 'tue', day: 'Tue', fullDay: 'Tuesday', start: '00:00', end: '00:00', startHour: 22, endHour: 22, duration: 0, disruptions: [] },
      { id: 'wed', day: 'Wed', fullDay: 'Wednesday', start: '00:00', end: '00:00', startHour: 22, endHour: 22, duration: 0, disruptions: [] },
      { id: 'thu', day: 'Thu', fullDay: 'Thursday', start: '00:00', end: '00:00', startHour: 22, endHour: 22, duration: 0, disruptions: [] },
      { id: 'fri', day: 'Fri', fullDay: 'Friday', start: '00:00', end: '00:00', startHour: 22, endHour: 22, duration: 0, disruptions: [] },
      { id: 'sat', day: 'Sat', fullDay: 'Saturday', start: '00:00', end: '00:00', startHour: 22, endHour: 22, duration: 0, disruptions: [] },
      { id: 'sun', day: 'Sun', fullDay: 'Sunday', start: '00:00', end: '00:00', startHour: 22, endHour: 22, duration: 0, disruptions: [] },
    ]
    setSleepLogs([])
    setAllWeeks([{ id: 'week-current', label: 'This Week', dateRange: 'Current Week', days: emptyWeek }])
    setSelectedWeekIndex(0)
    setSelectedDay(emptyWeek[0])
    setActiveSession(null)
    setLastFinishedSummary(null)
  }

  // Calculate Gantt week totals
  const weekWithTotals = weekSchedule.map((item) => {
    const duration = item.duration ?? Math.max(0, item.endHour - item.startHour)
    return { ...item, duration }
  })
  const totalWeeklyHours = weekWithTotals.reduce((acc, cur) => acc + cur.duration, 0)
  const avgDailyHours = totalWeeklyHours / weekWithTotals.length
  const totalWeeklyDisruptions = weekWithTotals.reduce(
    (acc, cur) => acc + (cur.disruptions?.length || 0),
    0
  )

  const isSleeping = Boolean(activeSession)

  return (
    <div className="min-h-dvh bg-slate-950 flex justify-center text-slate-100">
      {/* Mobile Shell Container */}
      <div className="w-full max-w-md min-h-dvh bg-slate-900/60 border-x border-slate-800/60 flex flex-col justify-between relative shadow-2xl">
        {/* Top Header */}
        <Header
          isSleeping={isSleeping}
          onNavigateTonight={() => setActiveTab('tonight')}
        />

        {/* Main Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto px-5 py-6 space-y-5 no-scrollbar">
          {/* Just Finished Session Banner */}
          <SessionConfirmedBanner summary={lastFinishedSummary} />

          {/* Active Page View */}
          {activeTab === 'tonight' && (
            <TonightPage
              isSleeping={isSleeping}
              elapsedMs={elapsedMs}
              activeSession={activeSession}
              onStartSleep={handleStartSleep}
              onEndSleep={handleEndSleep}
              onOpenDisruptionModal={() => setIsDisruptionModalOpen(true)}
              onRemoveActiveDisruption={handleRemoveActiveDisruption}
              sleepLogs={sleepLogs}
              onViewLog={() => setActiveTab('history')}
            />
          )}

          {activeTab === 'history' && (
            <LogPage
              sleepLogs={sleepLogs}
              allWeeks={allWeeks}
              logWeekFilter={logWeekFilter}
              onChangeFilter={setLogWeekFilter}
              onDeleteLog={handleDeleteLog}
            />
          )}

          {activeTab === 'stats' && (
            <InsightsPage
              allWeeks={allWeeks}
              selectedWeekIndex={selectedWeekIndex}
              onSelectWeek={handleSelectWeek}
              currentWeekObj={currentWeekObj}
              weekWithTotals={weekWithTotals}
              totalWeeklyHours={totalWeeklyHours}
              avgDailyHours={avgDailyHours}
              totalWeeklyDisruptions={totalWeeklyDisruptions}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              sleepLogsCount={sleepLogs.length}
              onRestoreDemoData={handleRestoreDemoData}
              onClearForRelease={handleClearForRelease}
            />
          )}
        </main>

        {/* Nighttime Disruption Modal */}
        <DisruptionModal
          isOpen={isDisruptionModalOpen}
          onClose={() => setIsDisruptionModalOpen(false)}
          onSave={handleSaveDisruption}
        />

        {/* Bottom Navigation Bar */}
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>
    </div>
  )
}
