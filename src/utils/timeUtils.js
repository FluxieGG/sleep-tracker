export function padZero(num) {
  return num.toString().padStart(2, '0')
}

export function formatTime24(date) {
  return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`
}

export function formatTime12(date) {
  const hours = date.getHours()
  const minutes = padZero(date.getMinutes())
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const h12 = hours % 12 === 0 ? 12 : hours % 12
  return `${h12}:${minutes} ${suffix}`
}

export function formatTime24To12(time24) {
  const [hStr, mStr] = time24.split(':')
  const h = parseInt(hStr, 10)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${mStr} ${suffix}`
}

export function parseTimeToContinuous(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const hourDecimal = h + m / 60
  return hourDecimal < 12 ? hourDecimal + 24 : hourDecimal
}

export function formatDuration(hoursDecimal) {
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

export function formatElapsed(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  return `${padZero(hrs)}:${padZero(mins)}:${padZero(secs)}`
}

export function getContinuousHours(startDate, endDate) {
  const startHour = startDate.getHours() + startDate.getMinutes() / 60 + startDate.getSeconds() / 3600
  const durationHours = Math.max(0, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))
  const endHour = startHour + durationHours
  return { startHour, endHour, durationHours }
}

export function calculateSleepDuration(startTime24, endTime24) {
  if (!startTime24 || !endTime24) return { duration: 0, startHour: 22, endHour: 22 }
  const [sH, sM] = startTime24.split(':').map(Number)
  const [eH, eM] = endTime24.split(':').map(Number)

  let startCont = sH + sM / 60
  let endCont = eH + eM / 60

  if (startCont < 12) startCont += 24
  if (endCont < 12) endCont += 24

  if (endCont <= startCont) {
    endCont += 24
  }

  const duration = +(endCont - startCont).toFixed(2)
  return { duration, startHour: startCont, endHour: endCont }
}

export function formatDateKey(date) {
  const y = date.getFullYear()
  const m = padZero(date.getMonth() + 1)
  const d = padZero(date.getDate())
  return `${y}-${m}-${d}`
}

export function parseDateKey(key) {
  if (!key) return new Date()
  const parts = key.split('-').map(Number)
  if (parts.length === 3 && !isNaN(parts[0])) {
    return new Date(parts[0], parts[1] - 1, parts[2])
  }
  return new Date()
}

const MONTH_MAP = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

export function getLogDateKey(log) {
  if (!log) return null
  if (log.dateKey) return log.dateKey
  if (log.startTime) {
    const d = new Date(log.startTime)
    if (!isNaN(d.getTime())) return formatDateKey(d)
  }
  if (log.dateString) {
    const d = new Date(log.dateString)
    if (!isNaN(d.getTime())) return formatDateKey(d)
    const match = log.dateString.match(/([A-Za-z]+)\s+(\d+),\s+(\d{4})/)
    if (match) {
      const monthNum = MONTH_MAP[match[1].toLowerCase().slice(0, 3)]
      if (monthNum) {
        return `${match[3]}-${padZero(monthNum)}-${padZero(parseInt(match[2], 10))}`
      }
    }
  }
  return null
}

export function getCalendarGrid(year, month) {
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  // Monday-based indexing: Mon = 0, ..., Sun = 6
  let startDayOfWeek = firstDayOfMonth.getDay() - 1
  if (startDayOfWeek === -1) startDayOfWeek = 6

  const days = []
  const prevMonthLastDay = new Date(year, month, 0).getDate()

  // Days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i
    const date = new Date(year, month - 1, dayNum)
    days.push({
      date,
      dateKey: formatDateKey(date),
      dayNumber: dayNum,
      isCurrentMonth: false,
    })
  }

  // Days of current month
  for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
    const date = new Date(year, month, d)
    days.push({
      date,
      dateKey: formatDateKey(date),
      dayNumber: d,
      isCurrentMonth: true,
    })
  }

  // Days from next month to complete the row
  const remaining = (7 - (days.length % 7)) % 7
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
    days.push({
      date,
      dateKey: formatDateKey(date),
      dayNumber: d,
      isCurrentMonth: false,
    })
  }

  return days
}

export function diffInCalendarDays(dateStrA, dateStrB) {
  const [yA, mA, dA] = dateStrA.split('-').map(Number)
  const [yB, mB, dB] = dateStrB.split('-').map(Number)
  const utcA = Date.UTC(yA, mA - 1, dA)
  const utcB = Date.UTC(yB, mB - 1, dB)
  return Math.round((utcA - utcB) / (1000 * 60 * 60 * 24))
}

export function calculateStreakStats(sleepLogs = []) {
  if (!sleepLogs || sleepLogs.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      totalDays: 0,
      streakDates: [],
    }
  }

  // Extract unique date keys
  const dateKeys = []
  for (const log of sleepLogs) {
    const key = getLogDateKey(log)
    if (key) dateKeys.push(key)
  }

  const uniqueDates = Array.from(new Set(dateKeys)).sort().reverse()
  const totalDays = uniqueDates.length

  if (totalDays === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      totalDays: 0,
      streakDates: [],
    }
  }

  // Current streak (consecutive days backward from the most recent logged date)
  let currentStreak = 1
  const streakDates = [uniqueDates[0]]
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    if (diffInCalendarDays(uniqueDates[i], uniqueDates[i + 1]) === 1) {
      currentStreak++
      streakDates.push(uniqueDates[i + 1])
    } else {
      break
    }
  }

  // Longest streak in history
  let bestStreak = 1
  let tempStreak = 1
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    if (diffInCalendarDays(uniqueDates[i], uniqueDates[i + 1]) === 1) {
      tempStreak++
      if (tempStreak > bestStreak) bestStreak = tempStreak
    } else {
      tempStreak = 1
    }
  }

  return {
    currentStreak,
    bestStreak,
    totalDays,
    streakDates,
  }
}

export function getMondayOfWeek(input = new Date()) {
  const d = typeof input === 'string' ? parseDateKey(input) : new Date(input)
  const dayOfWeek = d.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffToMonday)
}

export function getWeekMondayKey(input = new Date()) {
  return formatDateKey(getMondayOfWeek(input))
}

export function getLogWeekKey(log) {
  const dateKey = getLogDateKey(log)
  return dateKey ? getWeekMondayKey(dateKey) : null
}

export function shiftWeekMondayKey(mondayKey, deltaWeeks) {
  const d = parseDateKey(mondayKey)
  d.setDate(d.getDate() + deltaWeeks * 7)
  return formatDateKey(d)
}

export function getWeekMetadata(mondayKey, referenceDate = new Date()) {
  const currentMondayKey = getWeekMondayKey(referenceDate)
  const weeksAgo = Math.round(diffInCalendarDays(currentMondayKey, mondayKey) / 7)

  let label = 'This Week'
  if (weeksAgo === 1) label = 'Last Week'
  else if (weeksAgo > 1) label = `${weeksAgo} Weeks Ago`
  else if (weeksAgo < 0) label = 'Upcoming Week'

  const monday = parseDateKey(mondayKey)
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return {
    id: mondayKey,
    mondayKey,
    label,
    dateRange: `${fmt(monday)} – ${fmt(sunday)}`,
    weeksAgo,
  }
}

export function buildWeekSchedule(mondayKey, sleepLogs = [], referenceDate = new Date()) {
  const meta = getWeekMetadata(mondayKey, referenceDate)
  const monday = parseDateKey(mondayKey)

  const logsByDate = new Map()
  for (const log of sleepLogs) {
    const key = getLogDateKey(log)
    if (!key) continue
    const list = logsByDate.get(key) || []
    list.push(log)
    logsByDate.set(key, list)
  }

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
    const dateKey = formatDateKey(d)
    const day = d.toLocaleDateString('en-US', { weekday: 'short' })
    const fullDay = d.toLocaleDateString('en-US', { weekday: 'long' })
    const dateString = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    const dayLogs = logsByDate.get(dateKey) || []
    if (dayLogs.length > 0) {
      const primary = dayLogs[0]
      const totalDuration =
        dayLogs.length === 1
          ? Number(primary.duration) || 0
          : +dayLogs.reduce((acc, item) => acc + (Number(item.duration) || 0), 0).toFixed(2)
      const mergedDisruptions = dayLogs.flatMap((item) => item.disruptions || [])

      days.push({
        id: primary.id || `${mondayKey}-${day.toLowerCase()}`,
        dateKey,
        day,
        fullDay,
        dateString,
        start: primary.start || '00:00',
        end: primary.end || '00:00',
        start12: primary.start12,
        end12: primary.end12,
        startHour: primary.startHour ?? parseTimeToContinuous(primary.start || '22:00'),
        endHour: primary.endHour ?? (primary.startHour ?? 22) + totalDuration,
        duration: totalDuration,
        disruptions: mergedDisruptions,
        isRealSession: true,
      })
    } else {
      days.push({
        id: `${mondayKey}-${day.toLowerCase()}`,
        dateKey,
        day,
        fullDay,
        dateString,
        start: '00:00',
        end: '00:00',
        startHour: 22,
        endHour: 22,
        duration: 0,
        disruptions: [],
        isRealSession: false,
      })
    }
  }

  return {
    ...meta,
    days,
  }
}

export function buildAvailableWeeks(
  sleepLogs = [],
  napLogs = [],
  minWeeksCount = 8,
  referenceDate = new Date()
) {
  const currentMondayKey = getWeekMondayKey(referenceDate)
  const keys = new Set()

  for (let i = 0; i < minWeeksCount; i++) {
    keys.add(shiftWeekMondayKey(currentMondayKey, -i))
  }

  for (const log of [...sleepLogs, ...napLogs]) {
    const weekKey = getLogWeekKey(log)
    if (weekKey && weekKey <= currentMondayKey) {
      keys.add(weekKey)
    }
  }

  return Array.from(keys)
    .sort()
    .reverse()
    .map((key) => getWeekMetadata(key, referenceDate))
}
