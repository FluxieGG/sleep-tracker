import { useState } from 'react'
import { Clock, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { formatDuration } from '../utils/timeUtils'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

export default function LogPage({
  sleepLogs,
  allWeeks,
  logWeekFilter,
  onChangeFilter,
  onDeleteLog,
}) {
  const [sessionPendingDelete, setSessionPendingDelete] = useState(null)

  const filteredLogs =
    logWeekFilter === 'all'
      ? sleepLogs
      : sleepLogs.filter((l) => l.weekId === logWeekFilter)

  const handleConfirmDelete = (id) => {
    if (onDeleteLog) {
      onDeleteLog(id)
    }
    setSessionPendingDelete(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Sleep Log History</h2>
          <p className="text-xs text-slate-400">Manage recorded sessions & outlined disruptions</p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
          {filteredLogs.length} nights
        </span>
      </div>

      {/* Week Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => onChangeFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition cursor-pointer ${
            logWeekFilter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Weeks ({sleepLogs.length})
        </button>
        {allWeeks.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => onChangeFilter(w.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition cursor-pointer ${
              logWeekFilter === w.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      {filteredLogs.length === 0 ? (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-8 text-center text-xs text-slate-400">
          <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="font-medium text-slate-300 mb-1">No logs in this view</p>
          <p>Start a sleep session or reload the 3-week demo dataset in Settings.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredLogs.map((log) => {
            const disList = log.disruptions || []
            const hasDisruptions = disList.length > 0

            return (
              <div
                key={log.id}
                className={`rounded-2xl bg-slate-900/90 p-4 space-y-3 transition relative group ${
                  hasDisruptions
                    ? 'border-2 border-rose-500/40 shadow-lg shadow-rose-950/20'
                    : 'border border-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white">
                        {log.fullDay}, {log.dateString}
                      </h3>
                      {hasDisruptions && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          {disList.length} {disList.length === 1 ? 'Disruption' : 'Disruptions'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {log.start12} → {log.end12}
                    </p>
                  </div>

                  {/* Duration Pill and Step-1 Delete "X" Trigger */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20 tabular-nums">
                      {formatDuration(log.duration)}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSessionPendingDelete(log)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition cursor-pointer"
                      title="Remove session"
                      aria-label={`Remove sleep session for ${log.fullDay}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Outlined Disruption Events Block */}
                {hasDisruptions ? (
                  <div className="rounded-xl bg-rose-950/20 border border-rose-500/30 p-3 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      Logged Sleep Disruptions
                    </p>
                    <div className="space-y-2">
                      {disList.map((d) => (
                        <div
                          key={d.id}
                          className="rounded-lg bg-slate-950/80 border border-rose-500/30 p-2.5 flex items-start justify-between gap-2 text-xs"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-base leading-none mt-0.5">{d.icon || '🔴'}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-rose-200">{d.type}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-medium">
                                  {d.durationMinutes || 5}m awake
                                </span>
                              </div>
                              {d.note && (
                                <p className="text-[11px] text-slate-400 mt-0.5">{d.note}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] font-mono font-semibold text-rose-400 shrink-0">
                            {d.time12}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <span className="text-emerald-400/90 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Uninterrupted rest
                    </span>
                    <span className={log.duration >= 8 ? 'text-emerald-400' : 'text-amber-400'}>
                      {log.duration >= 8 ? 'Goal Met' : 'Under 8h Goal'}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Step 2: Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(sessionPendingDelete)}
        session={sessionPendingDelete}
        onCancel={() => setSessionPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
