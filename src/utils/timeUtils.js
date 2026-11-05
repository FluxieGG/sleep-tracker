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
