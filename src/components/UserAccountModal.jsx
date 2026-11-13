import { useState, useEffect } from 'react'
import { X, Check, Users, Smile } from 'lucide-react'
import { USER_ACCOUNTS } from '../constants/userConstants'

/**
 * Netflix-style user profile selection modal.
 */
export default function UserAccountModal({
  isOpen,
  onClose,
  activeUser = 'Nyall',
  onSelectUser,
}) {
  const [justSelected, setJustSelected] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSelect = (user) => {
    setJustSelected(user.name)
    if (onSelectUser) {
      onSelectUser(user.name)
    }
    setTimeout(() => {
      setJustSelected(null)
      onClose()
    }, 250)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="select-account-title"
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-[var(--accent)]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Users className="w-4 h-4 text-[var(--accent-text)]" />
            <span>Profile Switcher</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h2
            id="select-account-title"
            className="text-2xl font-bold text-white tracking-tight"
          >
            Who's sleeping?
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Select a profile to log sleep habits and personalize your sleep companion.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2 pb-1 justify-items-center">
          {USER_ACCOUNTS.map((account) => {
            const isSelected = (justSelected || activeUser) === account.name

            return (
              <button
                key={account.id}
                type="button"
                onClick={() => handleSelect(account)}
                className="group flex flex-col items-center gap-3 cursor-pointer select-none transition-all outline-none focus:outline-none"
              >
                <div className="relative">
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${account.gradient} flex flex-col items-center justify-center text-white font-extrabold text-2xl shadow-lg transition-all duration-300 group-hover:scale-105 group-active:scale-95 ${
                      isSelected
                        ? 'ring-4 ring-white ring-offset-4 ring-offset-slate-900 shadow-2xl scale-105'
                        : 'opacity-80 group-hover:opacity-100 group-hover:ring-2 group-hover:ring-white/40'
                    }`}
                  >
                    <span className="drop-shadow-md select-none tracking-tight">
                      {account.initial}
                    </span>
                    <Smile className="w-3.5 h-3.5 opacity-60 -mt-0.5 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md animate-in zoom-in-75 duration-200">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span
                    className={`block text-sm font-semibold tracking-wide transition-colors ${
                      isSelected
                        ? 'text-white font-bold'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {account.name}
                  </span>

                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] text-slate-500 group-hover:text-slate-400">
                      {account.tagline}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500">
            Current account: <span className="text-white font-medium">{activeUser}</span>. Tap any circle to switch instantly.
          </p>
        </div>
      </div>
    </div>
  )
}
