import { useState, useMemo } from 'react'
import {
  Clock,
  Calendar,
  Flame,
  AlertCircle,
  Target,
  Sparkles,
  Moon,
  TrendingUp,
  Activity,
  CheckCircle2,
} from 'lucide-react'
import { formatDuration } from '../utils/timeUtils'

export default function SleepMetricWidgets({
  sleepLogs = [],
  streakStats = {},
  sleepGoalHours = 8,
  onOpenStreakModal,
  onViewLog,
}) {
  const [activeCategory, setActiveCategory] = useState('core') // 'core' | 'quality' | 'all'

  // 1. Most recent 7 nights (or current week's nights)
  const weekLogs = useMemo(() => {
    if (!sleepLogs || sleepLogs.length === 0) return []
    const currentWeek = sleepLogs.filter((l) => l.weekId === 'week-current')
    if (currentWeek.length > 0) return currentWeek
    return sleepLogs.slice(0, 7)
  }, [sleepLogs])

  // 2. Average hours slept over the week
  const weeklyAvgHours = useMemo(() => {
    if (weekLogs.length === 0) return 0
    const total = weekLogs.reduce((acc, l) => acc + (Number(l.duration) || 0), 0)
    return total / weekLogs.length
  }, [weekLogs])

  const weeklyGoalDiffMins = useMemo(() => {
    if (weeklyAvgHours === 0) return null
    return Math.round((weeklyAvgHours - Number(sleepGoalHours)) * 60)
  }, [weeklyAvgHours, sleepGoalHours])

  // 3. Average hours slept over the month (up to 30 days)
  const monthlyLogs = useMemo(() => {
    if (!sleepLogs || sleepLogs.length === 0) return []
    return sleepLogs.slice(0, 30)
  }, [sleepLogs])

  const monthlyAvgHours = useMemo(() => {
    if (monthlyLogs.length === 0) return 0
    const total = monthlyLogs.reduce((acc, l) => acc + (Number(l.duration) || 0), 0)
    return total / monthlyLogs.length
  }, [monthlyLogs])

  // 4. Highest sleep log streak
  const bestStreak = streakStats.bestStreak || 0
  const currentStreak = streakStats.currentStreak || 0

  // 5. Average disruptions over the week
  const weeklyDisruptionsData = useMemo(() => {
    if (weekLogs.length === 0) return { avgCount: '0.0', totalCount: 0, avgAwakeMins: 0 }
    const totalCount = weekLogs.reduce((acc, l) => acc + (l.disruptions?.length || 0), 0)
    const totalAwakeMins = weekLogs.reduce(
      (acc, l) =>
        acc +
        (l.disruptions || []).reduce((dSum, d) => dSum + (Number(d.durationMinutes) || 0), 0),
      0
    )
    return {
      avgCount: (totalCount / weekLogs.length).toFixed(1),
      totalCount,
      avgAwakeMins: Math.round(totalAwakeMins / weekLogs.length),
    }
  }, [weekLogs])

  // 6. Bonus Metric 1: Sleep Goal Hit Rate (% of nights >= goal)
  const goalHitRateData = useMemo(() => {
    if (weekLogs.length === 0) return { rate: 0, metCount: 0, total: 0 }
    const goal = Number(sleepGoalHours) || 8
    const metCount = weekLogs.filter((l) => (Number(l.duration) || 0) >= goal).length
    const rate = Math.round((metCount / weekLogs.length) * 100)
    return { rate, metCount, total: weekLogs.length }
  }, [weekLogs, sleepGoalHours])

  // 7. Bonus Metric 2: Restful Sleep Efficiency (Actual sleep vs total time in bed)
  const sleepEfficiency = useMemo(() => {
    if (weekLogs.length === 0) return 0
    const totalInBedHours = weekLogs.reduce((acc, l) => acc + (Number(l.duration) || 0), 0)
    if (totalInBedHours <= 0) return 0
    const totalAwakeHours =
      weekLogs.reduce(
        (acc, l) =>
          acc +
          (l.disruptions || []).reduce((dSum, d) => dSum + (Number(d.durationMinutes) || 0), 0),
        0
      ) / 60
    const actualSleepHours = Math.max(0, totalInBedHours - totalAwakeHours)
    return Math.min(100, Math.round((actualSleepHours / totalInBedHours) * 100))
  }, [weekLogs])

  // 8. Bonus Metric 3: Bedtime Regularity / Average Bedtime
  const bedtimeConsistency = useMemo(() => {
    if (weekLogs.length === 0) return { avgTime: '—', status: 'No logs yet' }
    const startHours = weekLogs
      .map((l) => {
        if (typeof l.startHour === 'number') return l.startHour
        if (l.start) {
          const [h, m] = l.start.split(':').map(Number)
          const val = h + m / 60
          return val < 12 ? val + 24 : val
        }
        return null
      })
      .filter((v) => v !== null)

    if (startHours.length === 0) return { avgTime: '—', status: 'No logs yet' }
    const avgHour = startHours.reduce((a, b) => a + b, 0) / startHours.length
    const normalizedHour = avgHour >= 24 ? avgHour - 24 : avgHour
    const h = Math.floor(normalizedHour)
    const m = Math.round((normalizedHour - h) * 60)
    const h12 = h % 12 === 0 ? 12 : h % 12
    const suffix = h >= 12 ? 'PM' : 'AM'
    const padM = m.toString().padStart(2, '0')
    const avgTime = `${h12}:${padM} ${suffix}`

    const diffs = startHours.map((v) => Math.abs(v - avgHour) * 60)
    const avgVarianceMins = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length)

    return {
      avgTime,
      status: `±${avgVarianceMins}m variance`,
    }
  }, [weekLogs])

  // 9. Bonus Metric 4: Sleep Bank (Surplus or Debt over rolling week)
  const sleepBankData = useMemo(() => {
    if (weekLogs.length === 0) return { formatted: '0h', status: 'On track', isPositive: true }
    const goal = Number(sleepGoalHours) || 8
    const totalHours = weekLogs.reduce((acc, l) => acc + (Number(l.duration) || 0), 0)
    const expectedHours = goal * weekLogs.length
    const diff = +(totalHours - expectedHours).toFixed(1)
    const diffAbs = Math.abs(diff)
    const hrs = Math.floor(diffAbs)
    const mins = Math.round((diffAbs - hrs) * 60)
    const timeStr = hrs > 0 ? (mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`) : `${mins}m`

    if (diff >= 0) {
      return {
        formatted: `+${timeStr}`,
        status: 'Surplus Banked',
        isPositive: true,
      }
    } else {
      return {
        formatted: `-${timeStr}`,
        status: 'Sleep Debt',
        isPositive: false,
      }
    }
  }, [weekLogs, sleepGoalHours])

  // Core 4 Square Widgets (User-requested)
  const coreWidgets = [
    {
      id: 'week-avg',
      title: 'Week Sleep Avg',
      tag: 'Last 7 Days',
      icon: <Clock className="w-4 h-4 text-[var(--accent-text)]" />,
      value: weeklyAvgHours > 0 ? formatDuration(weeklyAvgHours) : '—',
      subtitle:
        weeklyGoalDiffMins !== null
          ? weeklyGoalDiffMins >= 0
            ? `+${weeklyGoalDiffMins}m vs ${sleepGoalHours}h goal`
            : `${weeklyGoalDiffMins}m vs ${sleepGoalHours}h goal`
          : 'No logs recorded yet',
      badgeClass:
        weeklyGoalDiffMins !== null && weeklyGoalDiffMins >= 0
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          : 'text-[var(--accent-text)] bg-[var(--accent-subtle)] border-[var(--accent-border)]',
      onClick: onViewLog,
    },
    {
      id: 'month-avg',
      title: 'Month Sleep Avg',
      tag: 'Last 30 Days',
      icon: <Calendar className="w-4 h-4 text-[var(--accent-text)]" />,
      value: monthlyAvgHours > 0 ? formatDuration(monthlyAvgHours) : '—',
      subtitle:
        monthlyLogs.length > 0
          ? `${monthlyLogs.length} ${monthlyLogs.length === 1 ? 'night' : 'nights'} logged`
          : 'No monthly logs yet',
      badgeClass:
        'text-[var(--accent-text)] bg-[var(--accent-subtle)] border-[var(--accent-border)]',
      onClick: onViewLog,
    },
    {
      id: 'best-streak',
      title: 'Highest Streak',
      tag: 'Personal Best',
      icon: <Flame className="w-4 h-4 text-[var(--accent-text)]" />,
      value: `${bestStreak} ${bestStreak === 1 ? 'Day' : 'Days'}`,
      subtitle:
        currentStreak === bestStreak && bestStreak > 0
          ? 'Active Personal Best 🔥'
          : bestStreak > 0
          ? `Current streak: ${currentStreak}d`
          : 'Start streak tonight',
      badgeClass:
        bestStreak > 0
          ? 'text-[var(--accent-text)] bg-[var(--accent-subtle)] border-[var(--accent-border)]'
          : 'text-slate-400 bg-slate-800 border-slate-700',
      onClick: onOpenStreakModal,
    },
    {
      id: 'weekly-disruptions',
      title: 'Night Disruptions',
      tag: '7-Day Avg',
      icon: <AlertCircle className="w-4 h-4 text-[var(--accent-text)]" />,
      value: `${weeklyDisruptionsData.avgCount} / night`,
      subtitle:
        weeklyDisruptionsData.totalCount === 0
          ? '100% Uninterrupted rest'
          : `~${weeklyDisruptionsData.avgAwakeMins}m awake avg`,
      badgeClass:
        weeklyDisruptionsData.totalCount === 0
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          : 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      onClick: onViewLog,
    },
  ]

  // Bonus High-Value Sleep Metrics
  const qualityWidgets = [
    {
      id: 'goal-hit-rate',
      title: 'Goal Hit Rate',
      tag: 'Success %',
      icon: <Target className="w-4 h-4 text-[var(--accent-text)]" />,
      value: goalHitRateData.total > 0 ? `${goalHitRateData.rate}%` : '—',
      subtitle:
        goalHitRateData.total > 0
          ? `${goalHitRateData.metCount} of ${goalHitRateData.total} nights met target`
          : `Goal: ${sleepGoalHours}h nightly`,
      badgeClass:
        goalHitRateData.rate >= 80
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          : 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      onClick: onViewLog,
    },
    {
      id: 'sleep-efficiency',
      title: 'Sleep Efficiency',
      tag: 'Rest Ratio',
      icon: <Sparkles className="w-4 h-4 text-[var(--accent-text)]" />,
      value: sleepEfficiency > 0 ? `${sleepEfficiency}%` : '—',
      subtitle:
        sleepEfficiency > 0
          ? 'Actual sleep vs time in bed'
          : 'Subtracts disruption time',
      badgeClass:
        sleepEfficiency >= 90
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          : 'text-[var(--accent-text)] bg-[var(--accent-subtle)] border-[var(--accent-border)]',
      onClick: onViewLog,
    },
    {
      id: 'bedtime-regularity',
      title: 'Bedtime Regularity',
      tag: 'Circadian',
      icon: <Moon className="w-4 h-4 text-[var(--accent-text)]" />,
      value: bedtimeConsistency.avgTime,
      subtitle: bedtimeConsistency.status,
      badgeClass:
        'text-[var(--accent-text)] bg-[var(--accent-subtle)] border-[var(--accent-border)]',
      onClick: onViewLog,
    },
    {
      id: 'sleep-bank',
      title: 'Weekly Sleep Bank',
      tag: sleepBankData.isPositive ? 'Surplus' : 'Debt',
      icon: <TrendingUp className="w-4 h-4 text-[var(--accent-text)]" />,
      value: sleepBankData.formatted,
      subtitle: sleepBankData.status,
      badgeClass: sleepBankData.isPositive
        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        : 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      onClick: onViewLog,
    },
  ]

  const displayedWidgets =
    activeCategory === 'core'
      ? coreWidgets
      : activeCategory === 'quality'
      ? qualityWidgets
      : [...coreWidgets, ...qualityWidgets]

  return (
    <div className="space-y-3">
      {/* Section Header with Segmented Category Filter */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-text)]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white leading-tight">
              Sleep Insights
            </h3>
            <p className="text-[11px] text-slate-400">
              Key performance & rest metrics
            </p>
          </div>
        </div>

        {/* Category Pills Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveCategory('core')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer select-none ${
              activeCategory === 'core'
                ? 'bg-[var(--accent)] text-[var(--accent-btn-text)] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Core (4)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('quality')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer select-none ${
              activeCategory === 'quality'
                ? 'bg-[var(--accent)] text-[var(--accent-btn-text)] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Habits (4)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer select-none ${
              activeCategory === 'all'
                ? 'bg-[var(--accent)] text-[var(--accent-btn-text)] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All (8)
          </button>
        </div>
      </div>

      {/* 2 Square Widgets Side by Side Grid */}
      <div className="grid grid-cols-2 gap-3">
        {displayedWidgets.map((widget) => (
          <button
            key={widget.id}
            type="button"
            onClick={widget.onClick}
            className="aspect-square w-full rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-900/95 border border-[var(--accent-border)] hover:border-[var(--accent)] p-3.5 flex flex-col justify-between text-left transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[var(--accent-shadow)] group active:scale-[0.98]"
          >
            {/* Top Row: Icon + Badge */}
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {widget.icon}
              </div>
              <span
                className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${widget.badgeClass} truncate max-w-[85px]`}
              >
                {widget.tag}
              </span>
            </div>

            {/* Middle: Big Hero Stat */}
            <div className="py-1">
              <div className="text-xl sm:text-2xl font-black text-[var(--accent-text)] tracking-tight tabular-nums truncate">
                {widget.value}
              </div>
            </div>

            {/* Bottom: Title & Context Subtitle */}
            <div className="w-full">
              <h4 className="text-xs font-semibold text-white truncate">
                {widget.title}
              </h4>
              <p className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                {widget.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}