import { useState, useMemo } from 'react'
import {
  Moon,
  Sun,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  Zap,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import {
  formatDuration,
  getWeekMondayKey,
  shiftWeekMondayKey,
  getWeekMetadata,
  getLogWeekKey,
} from '../utils/timeUtils'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import LogNapModal from '../components/LogNapModal'

export default function LogPage({
  sleepLogs = [],
  allWeeks = [],
  logWeekFilter = 'all',
  onChangeFilter,
  onDeleteLog,
  napLogs = [],
  onDeleteNap,
  onAddNap,
  sleepGoalHours = 8,
}) {
  const [activeSubTab, setActiveSubTab] = useState('sleep')
  const [sessionPendingDelete, setSessionPendingDelete] = useState(null)
  const [isLogNapModalOpen, setIsLogNapModalOpen] = useState(false)

  const isSleepTab = activeSubTab === 'sleep'
  const rawList = isSleepTab ? sleepLogs : napLogs
  const currentMondayKey = getWeekMondayKey(new Date())

  const pickerWeeks = useMemo(() => {
    if (
      logWeekFilter === 'all' ||
      allWeeks.some((w) => w.mondayKey === logWeekFilter)
    ) {
      return allWeeks
    }
    return [...allWeeks, getWeekMetadata(logWeekFilter)].sort((a, b) =>
      b.mondayKey.localeCompare(a.mondayKey)
    )
  }, [allWeeks, logWeekFilter])

  const filteredList =
    logWeekFilter === 'all'
      ? rawList
      : rawList.filter((item) => getLogWeekKey(item) === logWeekFilter)

  const handlePrevWeek = () => {
    if (logWeekFilter === 'all') {
      onChangeFilter(currentMondayKey)
    } else {
      onChangeFilter(shiftWeekMondayKey(logWeekFilter, -1))
    }
  }

  const handleNextWeek = () => {
    if (logWeekFilter === 'all' || logWeekFilter >= currentMondayKey) return
    const nextKey = shiftWeekMondayKey(logWeekFilter, 1)
    onChangeFilter(nextKey > currentMondayKey ? currentMondayKey : nextKey)
  }

  const handleConfirmDelete = (id) => {
    if (sessionPendingDelete?.napType) {
      if (onDeleteNap) onDeleteNap(id)
    } else {
      if (onDeleteLog) onDeleteLog(id)
    }
    setSessionPendingDelete(null)
  }

  const handleSaveNap = (newNap) => {
    if (onAddNap) {
      onAddNap(newNap)
    }
  }

  return (
    <div className="space-y-4">
      {/* Sub-Tabs: Sleep Log History (left) vs Nap Log History (right) */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800/80">
        <button
          type="button"
          onClick={() => setActiveSubTab('sleep')}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer select-none ${
            isSleepTab
              ? 'bg-[var(--accent)] text-[var(--accent-btn-text)] shadow-md shadow-[var(--accent-shadow)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Sleep Logs</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              isSleepTab
                ? 'bg-black/20 text-current font-bold'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {sleepLogs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('nap')}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer select-none ${
            !isSleepTab
              ? 'bg-[var(--accent)] text-[var(--accent-btn-text)] shadow-md shadow-[var(--accent-shadow)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Nap Logs</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              !isSleepTab
                ? 'bg-black/20 text-current font-bold'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {napLogs.length}
          </span>
        </button>
      </div>

      {/* Header Info Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span>{isSleepTab ? 'Sleep Log History' : 'Nap Log History'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {isSleepTab
              ? 'Manage recorded overnight sessions & disruptions'
              : 'Manage recorded daytime naps & refresh sessions'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isSleepTab && (
            <button
              type="button"
              onClick={() => setIsLogNapModalOpen(true)}
              className="py-1 px-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-btn-text)] font-semibold text-xs flex items-center gap-1 shadow-sm shadow-[var(--accent-shadow)] transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Nap</span>
            </button>
          )}

          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
            {filteredList.length} {isSleepTab ? 'nights' : 'naps'}
          </span>
        </div>
      </div>

      {/* Week Picker (Monday–Sunday Calendar Weeks) */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChangeFilter('all')}
          className={`px-2.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
            logWeekFilter === 'all'
              ? 'bg-[var(--accent)] text-[var(--accent-btn-text)] shadow-sm'
              : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({rawList.length})
        </button>

        <div className="flex-1 flex items-center gap-1 min-w-0 bg-slate-950/70 border border-slate-800 rounded-xl p-1">
          <button
            type="button"
            onClick={handlePrevWeek}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 active:scale-95 transition cursor-pointer shrink-0"
            title="Previous Week"
            aria-label="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative flex-1 min-w-0 flex items-center">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0 ml-1 pointer-events-none" />
            <select
              value={logWeekFilter}
              onChange={(e) => onChangeFilter(e.target.value)}
              aria-label="Select Week"
              className="w-full min-w-0 bg-transparent text-xs font-semibold text-white pl-1.5 pr-2 py-1 outline-none cursor-pointer truncate [color-scheme:dark]"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                All Weeks ({rawList.length})
              </option>
              {pickerWeeks.map((w) => {
                const count = rawList.filter(
                  (item) => getLogWeekKey(item) === w.mondayKey
                ).length
                return (
                  <option
                    key={w.mondayKey}
                    value={w.mondayKey}
                    className="bg-slate-900 text-slate-200"
                  >
                    {w.label} ({w.dateRange}){count > 0 ? ` • ${count}` : ''}
                  </option>
                )
              })}
            </select>
          </div>

          <button
            type="button"
            disabled={logWeekFilter === 'all' || logWeekFilter >= currentMondayKey}
            onClick={handleNextWeek}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition cursor-pointer shrink-0"
            title="Next Week"
            aria-label="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log Cards List (Identical High-Quality Structure) */}
      {filteredList.length === 0 ? (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-8 text-center text-xs text-slate-400 space-y-2">
          {isSleepTab ? (
            <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          ) : (
            <Sun className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          )}
          <p className="font-medium text-slate-300">
            {isSleepTab
              ? 'No sleep logs in this view'
              : 'No nap logs in this view'}
          </p>
          <p className="text-[11px] text-slate-500">
            {isSleepTab
              ? 'Start a sleep session on Tonight or restore demo data in Settings.'
              : 'Tap "+ Log Nap" above to record an afternoon nap or rest session.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredList.map((log) => {
            const isNap = Boolean(log.napType)
            const disList = log.disruptions || []
            const hasDisruptions = disList.length > 0

            return (
              <div
                key={log.id}
                className={`rounded-2xl bg-slate-900/90 p-4 space-y-3 transition relative group ${
                  hasDisruptions
                    ? 'border-2 border-rose-500/40 shadow-lg shadow-rose-950/20'
                    : isNap
                    ? 'border border-slate-800/80 hover:border-[var(--accent-border)]'
                    : 'border border-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                {/* Header Row: Date & Duration */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white">
                        {log.fullDay}, {log.dateString}
                      </h3>

                      {/* Sleep Disruption Pill */}
                      {!isNap && hasDisruptions && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          {disList.length}{' '}
                          {disList.length === 1 ? 'Disruption' : 'Disruptions'}
                        </span>
                      )}

                      {/* Nap Type Badge */}
                      {isNap && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)]">
                          <Zap className="w-2.5 h-2.5" />
                          {log.napType}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>
                        {log.start12} → {log.end12}
                      </span>
                      {isNap && (
                        <span className="text-slate-500 text-[10px]">• Daytime Rest</span>
                      )}
                    </p>
                  </div>

                  {/* Duration Pill and Step-1 Delete "X" Trigger */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-[var(--accent-text)] bg-[var(--accent-subtle)] px-2.5 py-1 rounded-xl border border-[var(--accent-border)] tabular-nums">
                      {formatDuration(log.duration)}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSessionPendingDelete(log)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition cursor-pointer"
                      title={isNap ? 'Remove nap log' : 'Remove sleep session'}
                      aria-label={`Remove log for ${log.fullDay}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body Details Block */}
                {isNap ? (
                  /* Nap Specific Content Block */
                  <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                        <span className="text-slate-400">Post-Nap Feeling:</span>
                        <span className="font-semibold text-white px-2 py-0.5 rounded-md bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] text-[11px]">
                          {log.quality || 'Refreshed'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {log.weekLabel || 'This Week'}
                      </span>
                    </div>

                    {log.note && (
                      <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/60">
                        "{log.note}"
                      </p>
                    )}
                  </div>
                ) : (
                  /* Sleep Logs Details Block */
                  <div className="space-y-2.5">
                    {hasDisruptions ? (
                      /* Sleep Disruptions List */
                      <div className="rounded-xl bg-rose-950/20 border border-rose-500/30 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                            Logged Sleep Disruptions
                          </p>
                          <span className="text-[10px] text-rose-400 font-mono">
                            {disList.reduce((acc, d) => acc + (Number(d.durationMinutes) || 0), 0)}m awake total
                          </span>
                        </div>
                        <div className="space-y-2">
                          {disList.map((d) => (
                            <div
                              key={d.id}
                              className="rounded-lg bg-slate-950/80 border border-rose-500/30 p-2.5 flex items-start justify-between gap-2 text-xs"
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-base leading-none mt-0.5">
                                  {d.icon || '🔴'}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-rose-200">
                                      {d.type}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-medium">
                                      {d.durationMinutes || 5}m awake
                                    </span>
                                  </div>
                                  {d.note && (
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      {d.note}
                                    </p>
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
                    ) : null}

                    {/* Bottom Status & Goal Evaluation Bar (Always visible for all nights) */}
                    {(() => {
                      const goalNum = Number(sleepGoalHours) || 8
                      const durationNum = Number(log.duration) || 0
                      const meetsGoal = durationNum >= goalNum
                      const totalAwakeMins = disList.reduce((acc, d) => acc + (Number(d.durationMinutes) || 0), 0)
                      const actualSleepHours = Math.max(0, durationNum - totalAwakeMins / 60)

                      return (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                          {hasDisruptions ? (
                            <span className="text-slate-400 flex items-center gap-1">
                              <span>In Bed: <strong className="text-white font-medium">{formatDuration(durationNum)}</strong></span>
                              <span className="text-slate-600">•</span>
                              <span className="text-emerald-400 font-medium">
                                Actual: {formatDuration(actualSleepHours)}
                              </span>
                            </span>
                          ) : (
                            <span className="text-emerald-400/90 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Uninterrupted rest
                            </span>
                          )}

                          <span
                            className={`font-semibold px-2 py-0.5 rounded-md border ${
                              meetsGoal
                                ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                                : 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                            }`}
                          >
                            {meetsGoal
                              ? `${goalNum}h Goal Met`
                              : `Under ${goalNum}h Goal`}
                          </span>
                        </div>
                      )
                    })()}
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

      {/* Modal for recording a new nap */}
      <LogNapModal
        isOpen={isLogNapModalOpen}
        onClose={() => setIsLogNapModalOpen(false)}
        onSaveNap={handleSaveNap}
      />
    </div>
  )
}
