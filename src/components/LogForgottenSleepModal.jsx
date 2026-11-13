import { useState, useEffect, useMemo } from 'react'
import {
  Moon,
  X,
  Flame,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react'
import {
  formatDateKey,
  formatTime24To12,
  formatDuration,
  calculateSleepDuration,
} from '../utils/timeUtils'

const COMMON_DISRUPTIONS = [
  { type: 'Toilet Break', icon: '🚽', defaultMinutes: 5 },
  { type: 'Thirsty', icon: '💧', defaultMinutes: 5 },
  { type: 'Nightmare', icon: '😱', defaultMinutes: 15 },
  { type: 'Noise', icon: '🔊', defaultMinutes: 10 },
  { type: 'Restless', icon: '🔄', defaultMinutes: 20 },
]

export default function LogForgottenSleepModal({
  isOpen,
  onClose,
  onSave,
  sleepGoalHours = 8,
}) {
  const getYesterdayStr = () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return formatDateKey(d)
  }

  const getTodayStr = () => formatDateKey(new Date())

  const getTwoDaysAgoStr = () => {
    const d = new Date()
    d.setDate(d.getDate() - 2)
    return formatDateKey(d)
  }

  const [dateStr, setDateStr] = useState(getYesterdayStr)
  const [startTime, setStartTime] = useState('23:00')
  const [endTime, setEndTime] = useState('07:00')
  const [disruptions, setDisruptions] = useState([])
  const [note, setNote] = useState('')

  // Disruption adding inline state
  const [isAddingDisruption, setIsAddingDisruption] = useState(false)
  const [disType, setDisType] = useState('Toilet Break')
  const [disIcon, setDisIcon] = useState('🚽')
  const [disTime, setDisTime] = useState('03:00')
  const [disMinutes, setDisMinutes] = useState(5)
  const [disNote, setDisNote] = useState('')

  useEffect(() => {
    if (isOpen) {
      setDateStr(getYesterdayStr())
      setStartTime('23:00')
      setEndTime('07:00')
      setDisruptions([])
      setNote('')
      setIsAddingDisruption(false)
    }
  }, [isOpen])

  // Calculated duration
  const { duration, startHour, endHour } = useMemo(() => {
    return calculateSleepDuration(startTime, endTime)
  }, [startTime, endTime])

  // Total awake time
  const totalAwakeMins = useMemo(() => {
    return disruptions.reduce((acc, d) => acc + (Number(d.durationMinutes) || 0), 0)
  }, [disruptions])

  const actualSleepHours = useMemo(() => {
    return Math.max(0, duration - totalAwakeMins / 60)
  }, [duration, totalAwakeMins])

  const meetsGoal = duration >= Number(sleepGoalHours)

  // Formatted date preview
  const formattedDateObj = useMemo(() => {
    if (!dateStr) return new Date()
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
  }, [dateStr])

  const fullDateLabel = formattedDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  if (!isOpen) return null

  const handleAddDisruption = (e) => {
    e.preventDefault()
    const newD = {
      id: `dis-manual-${Date.now()}`,
      type: disType,
      icon: disIcon,
      time24: disTime,
      time12: formatTime24To12(disTime),
      durationMinutes: Number(disMinutes) || 5,
      note: disNote.trim(),
    }
    setDisruptions((prev) => [...prev, newD])
    setIsAddingDisruption(false)
    setDisNote('')
  }

  const handleRemoveDisruption = (id) => {
    setDisruptions((prev) => prev.filter((d) => d.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const [y, m, d] = dateStr.split('-').map(Number)
    const [sH, sM] = startTime.split(':').map(Number)
    const startDate = new Date(y, m - 1, d, sH, sM)
    const startTimeMs = startDate.getTime()

    const endTimeMs = startTimeMs + Math.round(duration * 3600 * 1000)
    const endDate = new Date(endTimeMs)

    const dayShort = startDate.toLocaleDateString('en-US', { weekday: 'short' })
    const dayFull = startDate.toLocaleDateString('en-US', { weekday: 'long' })
    const dateString = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    const newSession = {
      id: `session-manual-${Date.now()}`,
      startTime: startTimeMs,
      endTime: endTimeMs,
      dateString,
      dateKey: dateStr,
      day: dayShort,
      fullDay: dayFull,
      start: startTime,
      end: endTime,
      start12: formatTime24To12(startTime),
      end12: formatTime24To12(endTime),
      startHour,
      endHour,
      duration,
      disruptions,
      note: note.trim(),
      isRealSession: true,
      isManualForgotten: true,
      weekId: 'week-current',
      weekLabel: 'This Week',
    }

    if (onSave) onSave(newSession)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-[var(--accent-border)] shadow-2xl shadow-[var(--accent-shadow)] p-5 text-slate-200 space-y-4 my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-text)]">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Log Forgotten Sleep</h3>
              <p className="text-[11px] text-slate-400">
                Recover past sleep & protect your streak
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Streak Protection Callout Banner */}
        <div className="rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-border)] p-3 flex items-start gap-2.5 text-xs text-[var(--accent-text)]">
          <Flame className="w-4 h-4 shrink-0 fill-current mt-0.5" />
          <div>
            <p className="font-semibold text-white">Streak Protection Active</p>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              Logging this session fills in the missing calendar day, keeping your consecutive daily sleep streak unbroken.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Date Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--accent-text)]" />
              <span>Which night did you sleep?</span>
            </label>

            {/* Quick Date Presets */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setDateStr(getYesterdayStr())}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                  dateStr === getYesterdayStr()
                    ? 'bg-[var(--accent)] text-[var(--accent-btn-text)] border-[var(--accent)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => setDateStr(getTodayStr())}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                  dateStr === getTodayStr()
                    ? 'bg-[var(--accent)] text-[var(--accent-btn-text)] border-[var(--accent)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDateStr(getTwoDaysAgoStr())}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                  dateStr === getTwoDaysAgoStr()
                    ? 'bg-[var(--accent)] text-[var(--accent-btn-text)] border-[var(--accent)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                2 Days Ago
              </button>
            </div>

            <input
              type="date"
              value={dateStr}
              max={getTodayStr()}
              onChange={(e) => setDateStr(e.target.value)}
              required
              className="w-full py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-white font-medium outline-none transition"
            />
            <p className="text-[10px] text-slate-400 italic">
              Selected: <span className="text-white font-semibold">{fullDateLabel}</span>
            </p>
          </div>

          {/* Bedtime & Wake Time Inputs */}
          <div className="grid grid-cols-2 gap-3">
            {/* Start Time (Bedtime) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[var(--accent-text)]" />
                <span>Went to Bed</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full py-2 px-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-white font-mono font-semibold outline-none transition"
              />
              {/* Quick Bedtime Presets */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {['22:00', '22:30', '23:00', '23:30', '00:00'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setStartTime(t)}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono border transition shrink-0 cursor-pointer ${
                      startTime === t
                        ? 'bg-[var(--accent)] text-[var(--accent-btn-text)] border-[var(--accent)]'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* End Time (Wake Up) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Woke Up</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-white font-mono font-semibold outline-none transition"
              />
              {/* Quick Wake Presets */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {['06:00', '06:30', '07:00', '07:30', '08:00'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEndTime(t)}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono border transition shrink-0 cursor-pointer ${
                      endTime === t
                        ? 'bg-[var(--accent)] text-[var(--accent-btn-text)] border-[var(--accent)]'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Calculated Sleep Duration & Goal Status */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Total Calculated Sleep:</span>
              <span className="text-sm font-black text-[var(--accent-text)] bg-[var(--accent-subtle)] px-2.5 py-0.5 rounded-lg border border-[var(--accent-border)] tabular-nums">
                {formatDuration(duration)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
              <span className="text-slate-400">
                {formatTime24To12(startTime)} → {formatTime24To12(endTime)}
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-md border text-[10px] ${
                  meetsGoal
                    ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                    : 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                }`}
              >
                {meetsGoal ? `${sleepGoalHours}h Goal Met` : `Under ${sleepGoalHours}h Goal`}
              </span>
            </div>

            {totalAwakeMins > 0 && (
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                <span>Awake: {totalAwakeMins}m</span>
                <span className="text-emerald-400 font-medium">
                  Actual Sleep: {formatDuration(actualSleepHours)}
                </span>
              </div>
            )}
          </div>

          {/* Optional Night Disruptions Section */}
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-400" />
                <span>Night Disruptions ({disruptions.length})</span>
              </span>

              {!isAddingDisruption && (
                <button
                  type="button"
                  onClick={() => setIsAddingDisruption(true)}
                  className="text-[10px] font-semibold text-[var(--accent-text)] hover:opacity-85 flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Disruption</span>
                </button>
              )}
            </div>

            {/* List of logged disruptions */}
            {disruptions.length > 0 && (
              <div className="space-y-1.5">
                {disruptions.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{d.icon}</span>
                      <span className="font-semibold text-rose-200">{d.type}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({d.time12} • {d.durationMinutes}m)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDisruption(d.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Remove disruption"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Disruption Adder */}
            {isAddingDisruption && (
              <div className="rounded-xl bg-slate-950/90 border border-rose-500/30 p-3 space-y-2.5 animate-in fade-in duration-150">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                  Record Awaken Event
                </p>

                {/* Common Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {COMMON_DISRUPTIONS.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => {
                        setDisType(item.type)
                        setDisIcon(item.icon)
                        setDisMinutes(item.defaultMinutes)
                      }}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium border shrink-0 transition cursor-pointer ${
                        disType === item.type
                          ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {item.icon} {item.type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Time</label>
                    <input
                      type="time"
                      value={disTime}
                      onChange={(e) => setDisTime(e.target.value)}
                      className="w-full py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Minutes Awake</label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={disMinutes}
                      onChange={(e) => setDisMinutes(e.target.value)}
                      className="w-full py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAddDisruption}
                    className="flex-1 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 font-semibold text-[11px] transition cursor-pointer"
                  >
                    Add This Disruption
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingDisruption(false)}
                    className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-400 text-[11px] hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Optional Note Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">
              Optional Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Fell asleep right away, woke up refreshed"
              className="w-full py-2 px-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-white text-xs outline-none transition placeholder:text-slate-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-btn-text)] font-semibold text-xs transition cursor-pointer shadow-md shadow-[var(--accent-shadow)] active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Protect Streak</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}