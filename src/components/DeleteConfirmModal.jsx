import { AlertTriangle, Trash2, X, Clock } from 'lucide-react'
import { formatDuration } from '../utils/timeUtils'

export default function DeleteConfirmModal({
  isOpen,
  session,
  onCancel,
  onConfirm,
}) {
  if (!isOpen || !session) return null

  const disCount = session.disruptions?.length || 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/70 shadow-2xl shadow-rose-950/30 p-5 text-slate-200 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white leading-tight">
                {session.napType ? 'Delete Nap Log?' : 'Delete Sleep Session?'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Step 2 of 2: Confirm removal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Easy-on-the-eye Session Preview Card */}
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800/90 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">
              {session.fullDay}, {session.dateString}
            </span>
            <span className="font-bold text-[var(--accent-text)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-lg border border-[var(--accent-border)] text-[11px] tabular-nums">
              {formatDuration(session.duration)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              {session.start12} → {session.end12}
            </span>
            {session.napType && (
              <span className="text-[var(--accent-text)] font-medium ml-1">
                • {session.napType}
              </span>
            )}
            {disCount > 0 && (
              <span className="text-rose-300 font-medium ml-1">
                • {disCount} {disCount === 1 ? 'disruption' : 'disruptions'}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {session.napType
            ? 'Are you sure you want to remove this nap log? It will be deleted from your daytime nap history.'
            : 'Are you sure you want to remove this log? It will be deleted from your history and your weekly stats will recalculate.'}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(session.id)}
            className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-semibold text-xs shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}
