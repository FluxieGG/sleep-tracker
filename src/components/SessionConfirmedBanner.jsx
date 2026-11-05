import { CheckCircle2 } from 'lucide-react'
import { formatDuration } from '../utils/timeUtils'

export default function SessionConfirmedBanner({ summary }) {
  if (!summary) return null

  return (
    <div className="rounded-2xl bg-emerald-950/60 border border-emerald-500/30 p-4 shadow-lg text-emerald-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Sleep Session Confirmed
          </p>
          <span className="text-xs font-bold text-white bg-emerald-500/20 px-2 py-0.5 rounded-full">
            {formatDuration(summary.duration)}
          </span>
        </div>
        <p className="text-xs text-emerald-200/80 mt-1">
          Recorded from <span className="font-semibold text-white">{summary.start12}</span> to{' '}
          <span className="font-semibold text-white">{summary.end12}</span> ({summary.fullDay}).
          {summary.disruptions?.length > 0 && (
            <span className="text-rose-300 font-medium ml-1">
              • {summary.disruptions.length} disruption(s) logged
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
