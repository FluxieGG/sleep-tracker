import { useState } from 'react'
import {
  Database,
  Palette,
  Check,
  Settings as SettingsIcon,
  Plus,
  Minus,
  Sparkles,
  Terminal,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
  Users,
} from 'lucide-react'
import { THEMES } from '../constants/themeConstants'
import { getUserAccount } from '../constants/userConstants'

export default function SettingsPage({
  currentTheme,
  onSelectTheme,
  sleepGoalHours = 8,
  onUpdateSleepGoal,
  sleepLogsCount = 0,
  napLogsCount = 0,
  onRestoreDemoData,
  onClearForRelease,
  activeUser = 'Nyall',
  onOpenUserAccountModal,
}) {
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [isDevOptionsOpen, setIsDevOptionsOpen] = useState(false)
  const [actionFeedback, setActionFeedback] = useState(null)

  const userConfig = getUserAccount(activeUser)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-full bg-gradient-to-br ${userConfig.badgeGradient} text-white font-extrabold text-base flex items-center justify-center shadow-md ring-2 ring-white/20 shrink-0`}
          >
            {userConfig.initial}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white truncate">
                {activeUser}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {userConfig.role} • 3 profiles available
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenUserAccountModal}
          className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 active:scale-95"
        >
          <Users className="w-3.5 h-3.5 text-[var(--accent-text)]" />
          <span>Switch</span>
        </button>
      </div>

      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-text)]">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Accent Theme</h3>
              <p className="text-[11px] text-slate-400">
                Dark mode remains active with custom highlights
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 pt-1">
          {THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onSelectTheme(theme.id)}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-[var(--accent-border)] ring-1 ring-[var(--accent)] shadow-md shadow-[var(--accent-shadow)]'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700/90'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Color Swatch Circle */}
                  <div
                    style={{ backgroundColor: theme.hex }}
                    className="w-7 h-7 rounded-full shadow-inner border border-white/20 shrink-0 flex items-center justify-center"
                  >
                    {isSelected && (
                      <Check
                        className={`w-4 h-4 stroke-[3] ${
                          theme.id === 'amber' ? 'text-slate-950' : 'text-white'
                        }`}
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">
                        {theme.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                        {theme.badgeText}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {theme.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <div
                    style={{ backgroundColor: theme.hex }}
                    className="w-2.5 h-2.5 rounded-full"
                  />
                  {isSelected ? (
                    <span className="text-[11px] font-semibold text-[var(--accent-text)]">
                      Active
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">Apply</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* General App Settings */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">App Settings</h3>
            <p className="text-[11px] text-slate-400">
              Configure targets and schedule window
            </p>
          </div>

          {/* Cog Icon: fits the active theme when pressed / active */}
          <button
            type="button"
            onClick={() => setIsEditingGoal((prev) => !prev)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isEditingGoal
                ? 'bg-[var(--accent)] text-[var(--accent-btn-text)] border-[var(--accent)] shadow-md shadow-[var(--accent-shadow)] ring-2 ring-[var(--accent-ring,var(--accent))] ring-offset-2 ring-offset-slate-900 scale-105'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-[var(--accent-border)]'
            }`}
            title={isEditingGoal ? 'Close Sleep Goal Editor' : 'Configure Sleep Goal Window'}
            aria-label="Configure Sleep Goal Window"
          >
            <SettingsIcon
              className={`w-4 h-4 transition-transform duration-300 ${
                isEditingGoal ? 'rotate-90' : ''
              }`}
            />
          </button>
        </div>

        {/* Expandable Sleep Goal Window Editor */}
        {isEditingGoal && (
          <div className="rounded-xl bg-slate-950/90 border border-[var(--accent-border)] p-4 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                <span>Adjust Sleep Goal Window</span>
              </div>
              <span className="text-xs font-bold text-[var(--accent-text)] bg-[var(--accent-subtle)] px-2.5 py-0.5 rounded-lg border border-[var(--accent-border)] tabular-nums">
                {sleepGoalHours} {sleepGoalHours === 1 ? 'hour' : 'hours'}
              </span>
            </div>

            {/* Stepper with Minus / Plus buttons */}
            <div className="flex items-center justify-between gap-3 bg-slate-900 rounded-xl p-2.5 border border-slate-800">
              <button
                type="button"
                disabled={sleepGoalHours <= 4}
                onClick={() =>
                  onUpdateSleepGoal &&
                  onUpdateSleepGoal(Math.max(4, +(sleepGoalHours - 0.5).toFixed(1)))
                }
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white font-bold flex items-center justify-center transition cursor-pointer"
                aria-label="Decrease sleep goal by 30 minutes"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="text-center">
                <div className="text-lg font-extrabold text-white tabular-nums leading-none">
                  {sleepGoalHours}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    hrs / night
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Recommended: 7.0 – 9.0 hours for adults
                </p>
              </div>

              <button
                type="button"
                disabled={sleepGoalHours >= 12}
                onClick={() =>
                  onUpdateSleepGoal &&
                  onUpdateSleepGoal(Math.min(12, +(sleepGoalHours + 0.5).toFixed(1)))
                }
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white font-bold flex items-center justify-center transition cursor-pointer"
                aria-label="Increase sleep goal by 30 minutes"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-medium">
                Common Goal Presets
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[6, 7, 7.5, 8, 9].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => onUpdateSleepGoal && onUpdateSleepGoal(hrs)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      sleepGoalHours === hrs
                        ? 'bg-[var(--accent)] text-[var(--accent-btn-text)] border-[var(--accent)] shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {hrs}h
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
              Changes apply instantly to the Tonight view, Gantt chart, log history, and insights goal targets.
            </p>

            <button
              type="button"
              onClick={() => setIsEditingGoal(false)}
              className="w-full py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-btn-text)] font-semibold text-xs transition cursor-pointer shadow-sm shadow-[var(--accent-shadow)]"
            >
              Done
            </button>
          </div>
        )}

        {/* Setting Details Rows */}
        <div className="space-y-3 text-xs">
          <button
            type="button"
            onClick={() => setIsEditingGoal((prev) => !prev)}
            className="w-full flex items-center justify-between py-2 border-b border-slate-800/60 hover:opacity-85 text-left transition cursor-pointer"
            title="Click to adjust sleep goal"
          >
            <span className="text-slate-300">Sleep Goal Window</span>
            <span className="font-semibold text-[var(--accent-text)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-lg border border-[var(--accent-border)] tabular-nums">
              {sleepGoalHours} {sleepGoalHours === 1 ? 'hour' : 'hours'}
            </span>
          </button>
          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-300">Gantt Window</span>
            <span className="text-slate-400">7:00 PM – 10:00 AM</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-300">Seeded Data</span>
            <span className="text-slate-400">
              {sleepLogsCount} nights • {napLogsCount} naps loaded
            </span>
          </div>
        </div>
      </div>

      {/* Collapsed Developer Options Section */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 overflow-hidden transition-all text-xs">
        <button
          type="button"
          onClick={() => setIsDevOptionsOpen((prev) => !prev)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition cursor-pointer"
          aria-expanded={isDevOptionsOpen}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">Developer Options</h4>
                {sleepLogsCount > 0 || napLogsCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)]">
                    Demo Dataset Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Clean Release State
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Seed dataset toggles & pre-release testing tools
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              {isDevOptionsOpen ? 'Collapse' : 'Expand'}
            </span>
            {isDevOptionsOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {isDevOptionsOpen && (
          <div className="p-4 pt-1 border-t border-slate-800/80 space-y-3.5 bg-slate-950/40 animate-in fade-in duration-200">
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Use these controls to switch between the 3-week pre-release demo dataset (21 nights & 7 naps) and a pristine clean release state with zero initial logs.
            </p>

            {/* Quick Summary Pill Row */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Sleep Logs</span>
                <span className="text-xs font-semibold text-white">{sleepLogsCount} nights loaded</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Nap Logs</span>
                <span className="text-xs font-semibold text-white">{napLogsCount} naps loaded</span>
              </div>
            </div>

            {/* Action Feedback Toast */}
            {actionFeedback && (
              <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-2 text-emerald-300 text-[11px] flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{actionFeedback}</span>
              </div>
            )}

            {/* Developer Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onRestoreDemoData()
                  setActionFeedback('Loaded 3-week demo dataset (21 nights & 7 naps)')
                  setTimeout(() => setActionFeedback(null), 3000)
                }}
                className="py-2.5 px-3 rounded-xl bg-[var(--accent-subtle)] hover:opacity-90 text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Load 3-Week Demo Data</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClearForRelease()
                  setActionFeedback('Cleared all data. Clean release state active.')
                  setTimeout(() => setActionFeedback(null), 3000)
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Data (Clean Release)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
