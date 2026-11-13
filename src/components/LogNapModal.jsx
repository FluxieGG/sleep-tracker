import { useState, useEffect } from 'react'
import { Sun, X, Zap } from 'lucide-react'
import {
  formatTime24,
  formatTime24To12,
  formatDateKey,
  getWeekMondayKey,
  getWeekMetadata,
} from '../utils/timeUtils'

const NAP_TYPES = [
  { id: 'power', label: 'Power Nap', icon: '⚡' },
  { id: 'afternoon', label: 'Afternoon Rest', icon: '🌅' },
  { id: 'recovery', label: 'Recovery Nap', icon: '🌿' },
  { id: 'coffee', label: 'Coffee Nap', icon: '☕' },
]

const NAP_DURATIONS = [
  { mins: 20, label: '20m' },
  { mins: 30, label: '30m' },
  { mins: 45, label: '45m' },
  { mins: 60, label: '60m' },
  { mins: 90, label: '90m' },
]

const QUALITY_OPTIONS = ['Refreshed', 'Energized', 'Relaxed', 'Groggy']

export default function LogNapModal({ isOpen, onClose, onSaveNap }) {
  const [napType, setNapType] = useState(NAP_TYPES[0].label)
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [startTime24, setStartTime24] = useState('14:00')
  const [quality, setQuality] = useState('Refreshed')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (isOpen) {
      setNapType(NAP_TYPES[0].label)
      setDurationMinutes(30)
      setStartTime24(formatTime24(new Date()))
      setQuality('Refreshed')
      setNote('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()

    // Calculate end time
    const [h, m] = startTime24.split(':').map(Number)
    const totalStartMins = h * 60 + m
    const totalEndMins = totalStartMins + durationMinutes
    const endH = Math.floor(totalEndMins / 60) % 24
    const endM = totalEndMins % 60
    const end24 = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

    const now = new Date()
    const dayShort = now.toLocaleDateString('en-US', { weekday: 'short' })
    const dayFull = now.toLocaleDateString('en-US', { weekday: 'long' })
    const dateString = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    const weekMondayKey = getWeekMondayKey(now)
    const weekMeta = getWeekMetadata(weekMondayKey)

    const newNap = {
      id: `nap-${Date.now()}`,
      day: dayShort,
      fullDay: dayFull,
      dateString,
      dateKey: formatDateKey(now),
      start: startTime24,
      end: end24,
      start12: formatTime24To12(startTime24),
      end12: formatTime24To12(end24),
      duration: durationMinutes / 60,
      napType,
      quality,
      note: note.trim(),
      weekId: weekMondayKey,
      weekLabel: weekMeta.label,
    }

    onSaveNap(newNap)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-[var(--accent-border)] shadow-2xl shadow-[var(--accent-shadow)] p-5 text-slate-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-text)]">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Log Daytime Nap</h3>
              <p className="text-[11px] text-slate-400">Record a quick rest or recharge</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Nap Type */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
              Nap Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {NAP_TYPES.map((t) => {
                const isSelected = napType === t.label
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setNapType(t.label)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-white ring-1 ring-[var(--accent)]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span className="font-medium truncate text-[11px]">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-3 min-w-0">
            <div className="min-w-0">
              <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                Nap Start Time
              </label>
              <input
                type="time"
                value={startTime24}
                onChange={(e) => setStartTime24(e.target.value)}
                className="block w-full min-w-0 max-w-full box-border appearance-none p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[var(--accent)]"
                required
              />
            </div>

            <div className="min-w-0">
              <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                Duration
              </label>
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {NAP_DURATIONS.map((d) => (
                  <button
                    key={d.mins}
                    type="button"
                    onClick={() => setDurationMinutes(d.mins)}
                    className={`py-2 px-2 rounded-lg border text-[11px] font-semibold transition cursor-pointer shrink-0 ${
                      durationMinutes === d.mins
                        ? 'bg-[var(--accent)] text-[var(--accent-btn-text)] border-[var(--accent)] shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* How Did You Feel? */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
              How did you feel upon waking?
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {QUALITY_OPTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={`py-1.5 rounded-lg border text-[10px] font-medium transition cursor-pointer text-center ${
                    quality === q
                      ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent-text)]'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Felt a bit sluggish after lunch, power rest"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 text-xs focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-btn-text)] font-semibold shadow-md shadow-[var(--accent-shadow)] transition cursor-pointer"
            >
              Save Nap Log
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
