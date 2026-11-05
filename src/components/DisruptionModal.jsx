import { useState, useEffect } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { DISRUPTION_TYPES, AWAKE_DURATIONS } from '../constants/sleepConstants'
import { formatTime24 } from '../utils/timeUtils'

export default function DisruptionModal({ isOpen, onClose, onSave }) {
  const [disruptionType, setDisruptionType] = useState(DISRUPTION_TYPES[0])
  const [disruptionTime24, setDisruptionTime24] = useState(() => formatTime24(new Date()))
  const [disruptionDuration, setDisruptionDuration] = useState(10)
  const [disruptionNote, setDisruptionNote] = useState('')

  useEffect(() => {
    if (isOpen) {
      setDisruptionTime24(formatTime24(new Date()))
      setDisruptionType(DISRUPTION_TYPES[0])
      setDisruptionDuration(10)
      setDisruptionNote('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      type: disruptionType.label,
      icon: disruptionType.icon,
      time24: disruptionTime24,
      durationMinutes: disruptionDuration,
      note: disruptionNote.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl shadow-rose-950/40 p-5 text-slate-200 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-100">Log Sleep Disruption</h3>
              <p className="text-[11px] text-slate-400">Dim mode • Quick tap to record wake-up</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Disruption Reason Selector */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-2">
              What woke you up?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DISRUPTION_TYPES.map((t) => {
                const isSelected = disruptionType.id === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDisruptionType(t)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'bg-rose-950/60 border-rose-500/60 text-rose-100 ring-1 ring-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span className="font-medium truncate">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time & Awake Duration Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                Time of Wake-up
              </label>
              <input
                type="time"
                value={disruptionTime24}
                onChange={(e) => setDisruptionTime24(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-rose-500/50"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                Time Awake
              </label>
              <div className="grid grid-cols-4 gap-1">
                {AWAKE_DURATIONS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDisruptionDuration(mins)}
                    className={`py-2 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                      disruptionDuration === mins
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
              Brief Note (optional)
            </label>
            <input
              type="text"
              value={disruptionNote}
              onChange={(e) => setDisruptionNote(e.target.value)}
              placeholder="e.g., Bad dream, drank some water..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 text-xs focus:outline-none focus:border-rose-500/50"
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
              className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-600/25 transition cursor-pointer"
            >
              Save Disruption
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
