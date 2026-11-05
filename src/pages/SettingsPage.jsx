import { Database, Palette, Check } from 'lucide-react'
import { THEMES } from '../constants/themeConstants'

export default function SettingsPage({
  currentTheme,
  onSelectTheme,
  sleepLogsCount,
  onRestoreDemoData,
  onClearForRelease,
}) {
  return (
    <div className="space-y-4">
      {/* Themes Customizer Area */}
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
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-[var(--accent-text)] border border-slate-700/60">
            {THEMES.find((t) => t.id === currentTheme)?.name || 'Custom'}
          </span>
        </div>

        {/* 4 Theme Selectors */}
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
        <h3 className="text-sm font-semibold text-white">App Settings</h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-300">Sleep Goal</span>
            <span className="font-medium text-[var(--accent-text)]">8 hours</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-300">Gantt Window</span>
            <span className="text-slate-400">7:00 PM – 10:00 AM</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-300">Seeded Nights</span>
            <span className="text-slate-400">{sleepLogsCount} sessions loaded</span>
          </div>
        </div>
      </div>

      {/* Pre-Release Mock Data Controls */}
      <div className="rounded-2xl bg-slate-900/90 border border-[var(--accent-border)] p-5 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-[var(--accent-text)] font-semibold">
          <Database className="w-4 h-4 text-[var(--accent-text)]" />
          <h4>Pre-Release Demo Data</h4>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Currently populated with 3 weeks (21 nights) of sample sleep & disruption data from{' '}
          <code className="text-[var(--accent-text)]">src/data/mockSeedData.js</code>.
        </p>
        <div className="grid grid-cols-1 gap-2 pt-1">
          <button
            type="button"
            onClick={onRestoreDemoData}
            className="w-full py-2.5 px-3 rounded-xl bg-[var(--accent-subtle)] hover:opacity-90 text-[var(--accent-text)] border border-[var(--accent-border)] font-medium transition cursor-pointer"
          >
            Reload 3 Weeks Mock Data (21 Nights)
          </button>
          <button
            type="button"
            onClick={handleClearClick(onClearForRelease)}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-medium transition cursor-pointer"
          >
            Wipe Mock Data (Preview Clean Release State)
          </button>
        </div>
      </div>
    </div>
  )
}

function handleClearClick(cb) {
  return () => cb()
}
