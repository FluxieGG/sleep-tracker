import {
  Moon,
  Sun,
  Clock,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import {
  formatElapsed,
  formatTime12,
  formatDuration,
} from '../utils/timeUtils'

export default function TonightPage({
  isSleeping,
  elapsedMs,
  activeSession,
  onStartSleep,
  onEndSleep,
  onOpenDisruptionModal,
  onRemoveActiveDisruption,
  sleepLogs,
  onViewLog,
}) {
  const activeDisruptions = activeSession?.disruptions || []

  return (
    <div className="space-y-5">
      {/* Dynamic Sleep Tracking Hero Card */}
      <div
        className={`rounded-2xl border p-5 shadow-xl transition-all ${
          isSleeping
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border-amber-500/30'
            : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 border-[var(--accent-border)]'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <span
            className={`text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 ${
              isSleeping ? 'text-amber-400' : 'text-[var(--accent-text)]'
            }`}
          >
            {isSleeping ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                In Bed Now
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Ready for Rest
              </>
            )}
          </span>
          <span className="text-xs text-slate-400">Goal: 8h 00m</span>
        </div>

        {!isSleeping ? (
          /* IDLE STATE: Purple Start Sleep Session Button */
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Good Night</h2>
            <p className="text-sm text-slate-300/90 mb-6 leading-relaxed">
              Tap below when you turn the lights off. We'll record your start time and track your sleep session.
            </p>

            <button
              type="button"
              onClick={onStartSleep}
              className="w-full py-3.5 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98] text-[var(--accent-btn-text)] font-semibold text-sm shadow-lg shadow-[var(--accent-shadow)] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Moon className="w-4 h-4 fill-current" />
              Start Sleep Session
            </button>
          </div>
        ) : (
          /* ACTIVE TRACKING STATE: Two Buttons (Left: Disruption, Right: End & Confirm) */
          <div className="space-y-5">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Elapsed Rest</p>
              <div className="text-4xl font-extrabold text-white tracking-tight tabular-nums mt-1 font-mono">
                {formatElapsed(elapsedMs)}
              </div>
              <p className="text-xs text-[var(--accent-text)] mt-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Started at{' '}
                <span className="font-semibold text-white">
                  {formatTime12(new Date(activeSession.startTime))}
                </span>
              </p>
            </div>

            {/* Live Logged Disruptions Preview (only shown when > 0) */}
            {activeDisruptions.length > 0 && (
              <div className="rounded-xl bg-rose-950/30 border border-rose-500/30 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Disruptions Tonight ({activeDisruptions.length})
                  </span>
                  <span className="text-rose-400/70">Marked on Gantt</span>
                </div>
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {activeDisruptions.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between text-xs bg-slate-950/70 border border-rose-500/20 rounded-lg px-2.5 py-1.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span>{d.icon}</span>
                        <span className="font-medium text-slate-200 truncate">{d.type}</span>
                        <span className="text-[11px] text-rose-300">{d.time12}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveActiveDisruption(d.id)}
                        className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TWO BUTTONS: Left = Disruption, Right = End & Confirm */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onOpenDisruptionModal}
                className="py-3.5 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900/80 border border-rose-500/40 active:scale-[0.98] text-rose-200 font-semibold text-sm shadow-lg shadow-rose-950/40 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Disruption</span>
                {activeDisruptions.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                    {activeDisruptions.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onEndSleep}
                className="py-3.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-semibold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sun className="w-4 h-4 text-slate-950 shrink-0" />
                <span>End & Confirm</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Nights List on Tonight */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Recent Sleep Sessions
            </h3>
            <p className="text-[11px] text-slate-400">
              Showing latest 4 of {sleepLogs.length} recorded nights
            </p>
          </div>
          <button
            type="button"
            onClick={onViewLog}
            className="text-xs text-[var(--accent-text)] hover:opacity-80 flex items-center gap-0.5 cursor-pointer"
          >
            See All ({sleepLogs.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {sleepLogs.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-xs text-slate-500">
            No sleep sessions logged yet. Tap "Start Sleep Session" when ready!
          </div>
        ) : (
          <div className="space-y-2.5">
            {sleepLogs.slice(0, 4).map((item) => {
              const hasDisruptions = item.disruptions && item.disruptions.length > 0
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border text-xs transition ${
                    hasDisruptions
                      ? 'bg-slate-950/60 border-rose-500/40'
                      : 'bg-slate-950/40 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{item.fullDay}</span>
                        <span className="text-[11px] text-slate-400">{item.dateString}</span>
                      </div>
                      <p className="text-slate-400 mt-0.5">
                        {item.start12} → {item.end12}
                      </p>
                    </div>
                    <span className="font-semibold text-[var(--accent-text)] px-2.5 py-1 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-border)] tabular-nums">
                      {formatDuration(item.duration)}
                    </span>
                  </div>

                  {hasDisruptions && (
                    <div className="mt-2 pt-2 border-t border-rose-500/20 flex flex-wrap gap-1.5">
                      {item.disruptions.map((d) => (
                        <span
                          key={d.id}
                          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          {d.icon} {d.type} ({d.time12})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
