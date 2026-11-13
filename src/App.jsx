import { useState, useEffect, useMemo } from 'react'
import {
  INITIAL_SLEEP_LOGS,
  INITIAL_NAP_LOGS,
  DEMO_SLEEP_LOGS,
  DEMO_NAP_LOGS,
} from './data/mockSeedData'
import {
  formatTime24,
  formatTime12,
  formatTime24To12,
  formatDateKey,
  parseTimeToContinuous,
  getContinuousHours,
  calculateStreakStats,
  getWeekMondayKey,
  getWeekMetadata,
  shiftWeekMondayKey,
  buildWeekSchedule,
  buildAvailableWeeks,
} from './utils/timeUtils'

// Layout & Shared Components
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import SessionConfirmedBanner from './components/SessionConfirmedBanner'
import DisruptionModal from './components/DisruptionModal'
import StreakModal from './components/StreakModal'
import LogForgottenSleepModal from './components/LogForgottenSleepModal'
import SleepTrendModal from './components/SleepTrendModal'
import UserAccountModal from './components/UserAccountModal'

// Separated Page Views
import TonightPage from './pages/TonightPage'
import LogPage from './pages/LogPage'
import InsightsPage from './pages/InsightsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const [activeTab, setActiveTab] = useState('tonight')

  // Accent theme: 'amber' (Bright Amber), 'ember' (Autumn Ember), 'teal' (Pine Teal), 'indigo' (Slumber Indigo)
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      return localStorage.getItem('slumber_theme') || 'amber'
    } catch {
      return 'amber'
    }
  })

  // Synchronize active theme attribute on <html> element and save preference
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme)
    try {
      localStorage.setItem('slumber_theme', currentTheme)
    } catch {
      // ignore
    }
  }, [currentTheme])

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

  // Daytime nap logs history (seeded with sample naps)
  const [napLogs, setNapLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('slumber_nap_logs_v1')
      return saved ? JSON.parse(saved) : INITIAL_NAP_LOGS
    } catch {
      return INITIAL_NAP_LOGS
    }
  })

  // Week offset for Insights schedule (0 = current Mon–Sun week, 1 = last week, etc.)
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0)
  const currentMondayKey = getWeekMondayKey(new Date())
  const activeMondayKey = shiftWeekMondayKey(currentMondayKey, -selectedWeekOffset)

  const currentWeekObj = useMemo(
    () => buildWeekSchedule(activeMondayKey, sleepLogs),
    [activeMondayKey, sleepLogs]
  )
  const weekSchedule = currentWeekObj.days

  const allWeeks = useMemo(
    () => buildAvailableWeeks(sleepLogs, napLogs, 8),
    [sleepLogs, napLogs]
  )

  const [selectedDayShort, setSelectedDayShort] = useState(() => {
    const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' })
    return todayShort || 'Mon'
  })

  // Sleep goal target in hours (default: 8.0 hours)
  const [sleepGoalHours, setSleepGoalHours] = useState(() => {
    try {
      const saved = localStorage.getItem('slumber_sleep_goal')
      return saved ? parseFloat(saved) : 8.0
    } catch {
      return 8.0
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('slumber_sleep_goal', sleepGoalHours.toString())
    } catch {
      // ignore
    }
  }, [sleepGoalHours])

  // Log tab week filter
  const [logWeekFilter, setLogWeekFilter] = useState('all')

  // Just-finished session banner
  const [lastFinishedSummary, setLastFinishedSummary] = useState(null)

  // Live timer tick for active session
  const [elapsedMs, setElapsedMs] = useState(0)

  const [activeUser, setActiveUser] = useState(() => {
    try {
      return localStorage.getItem('slumber_active_user') || 'Nyall'
    } catch {
      return 'Nyall'
    }
  })

  const handleSelectUser = (name) => {
    setActiveUser(name)
    try {
      localStorage.setItem('slumber_active_user', name)
    } catch {
      // ignore
    }
  }

  const [isDisruptionModalOpen, setIsDisruptionModalOpen] = useState(false)
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false)
  const [isLogPastSleepModalOpen, setIsLogPastSleepModalOpen] = useState(false)
  const [isSleepTrendModalOpen, setIsSleepTrendModalOpen] = useState(false)
  const [isUserAccountModalOpen, setIsUserAccountModalOpen] = useState(false)

  // Sleep streak stats synchronized with sleepLogs
  const streakStats = useMemo(() => calculateStreakStats(sleepLogs), [sleepLogs])

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

  // Save nap logs changes
  useEffect(() => {
    localStorage.setItem('slumber_nap_logs_v1', JSON.stringify(napLogs))
  }, [napLogs])

  // Switch weeks in Insights & select the most informative day in that week
  const handleSelectWeekOffset = (nextOffset) => {
    const clampedOffset = Math.max(0, nextOffset)
    setSelectedWeekOffset(clampedOffset)
    const targetMondayKey = shiftWeekMondayKey(currentMondayKey, -clampedOffset)
    const targetWeek = buildWeekSchedule(targetMondayKey, sleepLogs)
    const withDisruption = targetWeek.days.find((d) => d.disruptions?.length > 0)
    const withSession = targetWeek.days.find((d) => d.duration > 0)
    setSelectedDayShort((withDisruption || withSession || targetWeek.days[0]).day)
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
    const weekMondayKey = getWeekMondayKey(startDate)
    const weekMeta = getWeekMetadata(weekMondayKey)

    const newLog = {
      id: `session-${Date.now()}`,
      startTime,
      endTime,
      dateString: startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      dateKey: formatDateKey(startDate),
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
      weekId: weekMondayKey,
      weekLabel: weekMeta.label,
    }

    setSleepLogs((prev) => [newLog, ...prev])
    setSelectedWeekOffset(0)
    setSelectedDayShort(dayShort)
    setActiveSession(null)
    setLastFinishedSummary(newLog)
  }

  // DELETE A LOG (2-step confirmed)
  const handleDeleteLog = (logId) => {
    setSleepLogs((prev) => prev.filter((l) => l.id !== logId))

    if (lastFinishedSummary?.id === logId) {
      setLastFinishedSummary(null)
    }
  }

  // DELETE A NAP
  const handleDeleteNap = (napId) => {
    setNapLogs((prev) => prev.filter((n) => n.id !== napId))
  }

  // ADD A NEW NAP
  const handleAddNap = (newNap) => {
    setNapLogs((prev) => [newNap, ...prev])
  }

  // MANUAL / FORGOTTEN SLEEP SESSION HANDLER (PROTECT STREAK)
  const handleLogForgottenSleep = (newLog) => {
    setSleepLogs((prev) => {
      const updated = [newLog, ...prev.filter((l) => l.id !== newLog.id)]
      return updated.sort((a, b) => (b.startTime || 0) - (a.startTime || 0))
    })

    setLastFinishedSummary(newLog)
  }

  // Restore all 3 weeks of demo seed data
  const handleRestoreDemoData = () => {
    setSleepLogs(DEMO_SLEEP_LOGS)
    setNapLogs(DEMO_NAP_LOGS)
    setSelectedWeekOffset(0)
    setSelectedDayShort('Mon')
    setActiveSession(null)
    setLastFinishedSummary(null)
    try {
      localStorage.setItem('slumber_sleep_logs_v2', JSON.stringify(DEMO_SLEEP_LOGS))
      localStorage.setItem('slumber_nap_logs_v1', JSON.stringify(DEMO_NAP_LOGS))
      localStorage.removeItem('slumber_active_session')
    } catch {
      // ignore
    }
  }

  // Wipe all mock data to preview clean production state
  const handleClearForRelease = () => {
    setSleepLogs([])
    setNapLogs([])
    setSelectedWeekOffset(0)
    setSelectedDayShort('Mon')
    setActiveSession(null)
    setLastFinishedSummary(null)
    try {
      localStorage.setItem('slumber_sleep_logs_v2', JSON.stringify([]))
      localStorage.setItem('slumber_nap_logs_v1', JSON.stringify([]))
      localStorage.removeItem('slumber_active_session')
    } catch {
      // ignore
    }
  }

  // Calculate Gantt week totals
  const weekWithTotals = weekSchedule.map((item) => {
    const duration = item.duration ?? Math.max(0, item.endHour - item.startHour)
    return { ...item, duration }
  })
  const selectedDay =
    weekWithTotals.find((d) => d.day === selectedDayShort) || weekWithTotals[0]
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
        <Header
          isSleeping={isSleeping}
          onNavigateTonight={() => setActiveTab('tonight')}
          activeTab={activeTab}
          streakStats={streakStats}
          onOpenStreakModal={() => setIsStreakModalOpen(true)}
          onOpenLogPastSleepModal={() => setIsLogPastSleepModalOpen(true)}
          onOpenSleepTrendModal={() => setIsSleepTrendModalOpen(true)}
          onOpenUserAccountModal={() => setIsUserAccountModalOpen(true)}
          activeUser={activeUser}
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
              streakStats={streakStats}
              onOpenStreakModal={() => setIsStreakModalOpen(true)}
              sleepGoalHours={sleepGoalHours}
            />
          )}

          {activeTab === 'history' && (
            <LogPage
              sleepLogs={sleepLogs}
              allWeeks={allWeeks}
              logWeekFilter={logWeekFilter}
              onChangeFilter={setLogWeekFilter}
              onDeleteLog={handleDeleteLog}
              napLogs={napLogs}
              onDeleteNap={handleDeleteNap}
              onAddNap={handleAddNap}
              sleepGoalHours={sleepGoalHours}
            />
          )}

          {activeTab === 'stats' && (
            <InsightsPage
              selectedWeekOffset={selectedWeekOffset}
              onSelectWeekOffset={handleSelectWeekOffset}
              currentWeekObj={currentWeekObj}
              weekWithTotals={weekWithTotals}
              totalWeeklyHours={totalWeeklyHours}
              avgDailyHours={avgDailyHours}
              totalWeeklyDisruptions={totalWeeklyDisruptions}
              selectedDay={selectedDay}
              onSelectDay={(dayObj) => setSelectedDayShort(dayObj.day)}
              sleepGoalHours={sleepGoalHours}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              currentTheme={currentTheme}
              onSelectTheme={setCurrentTheme}
              sleepGoalHours={sleepGoalHours}
              onUpdateSleepGoal={setSleepGoalHours}
              sleepLogsCount={sleepLogs.length}
              napLogsCount={napLogs.length}
              onRestoreDemoData={handleRestoreDemoData}
              onClearForRelease={handleClearForRelease}
              activeUser={activeUser}
              onOpenUserAccountModal={() => setIsUserAccountModalOpen(true)}
            />
          )}
        </main>

        <DisruptionModal
          isOpen={isDisruptionModalOpen}
          onClose={() => setIsDisruptionModalOpen(false)}
          onSave={handleSaveDisruption}
        />

        <StreakModal
          isOpen={isStreakModalOpen}
          onClose={() => setIsStreakModalOpen(false)}
          streakStats={streakStats}
        />

        <LogForgottenSleepModal
          isOpen={isLogPastSleepModalOpen}
          onClose={() => setIsLogPastSleepModalOpen(false)}
          onSave={handleLogForgottenSleep}
          sleepGoalHours={sleepGoalHours}
        />

        <SleepTrendModal
          isOpen={isSleepTrendModalOpen}
          onClose={() => setIsSleepTrendModalOpen(false)}
          sleepLogs={sleepLogs}
          sleepGoalHours={sleepGoalHours}
        />

        <UserAccountModal
          isOpen={isUserAccountModalOpen}
          onClose={() => setIsUserAccountModalOpen(false)}
          activeUser={activeUser}
          onSelectUser={handleSelectUser}
        />

        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>
    </div>
  )
}
