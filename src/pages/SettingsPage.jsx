import { Database } from 'lucide-react'

export default function SettingsPage({
  sleepLogsCount,
  onRestoreDemoData,
  onClearForRelease,
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">App Settings</h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-300">Sleep Goal</span>
            <span className="font-medium text-indigo-400">8 hours</span>
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
      <div className="rounded-2xl bg-slate-900/90 border border-indigo-500/30 p-5 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-300 font-semibold">
          <Database className="w-4 h-4 text-indigo-400" />
          <h4>Pre-Release Demo Data</h4>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Currently populated with 3 weeks (21 nights) of sample sleep & disruption data from{' '}
          <code className="text-indigo-300">src/data/mockSeedData.js</code>.
        </p>
        <div className="grid grid-cols-1 gap-2 pt-1">
          <button
            type="button"
            onClick={onRestoreDemoData}
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-medium transition cursor-pointer"
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
