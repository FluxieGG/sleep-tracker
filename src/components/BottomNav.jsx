import { TABS } from '../constants/sleepConstants'

export default function BottomNav({ activeTab, onChangeTab }) {
  return (
    <nav className="sticky bottom-0 z-20 backdrop-blur-md bg-slate-900/90 border-t border-slate-800/80 px-3 py-2">
      <ul className="grid grid-cols-4 gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`w-full py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  isActive
                    ? 'text-[var(--accent-text)] bg-[var(--accent-subtle)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
