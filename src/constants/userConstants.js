export const USER_ACCOUNTS = [
  {
    id: 'nyall',
    name: 'Nyall',
    gradient: 'from-blue-600 via-indigo-600 to-purple-800',
    badgeGradient: 'from-blue-600 to-indigo-700',
    ring: 'ring-indigo-400/50',
    tagline: 'Deep Sleeper',
    role: 'Deep Sleeper Profile',
    initial: 'N',
  },
  {
    id: 'chantel',
    name: 'Chantel',
    gradient: 'from-pink-500 via-rose-600 to-red-700',
    badgeGradient: 'from-pink-500 to-rose-600',
    ring: 'ring-rose-400/50',
    tagline: 'Early Riser',
    role: 'Early Riser Profile',
    initial: 'C',
  },
  {
    id: 'dev',
    name: 'Dev',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-800',
    badgeGradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-teal-400/50',
    tagline: 'Night Owl',
    role: 'Night Owl Profile',
    initial: 'D',
  },
]

export function getUserAccount(userName) {
  return USER_ACCOUNTS.find((u) => u.name === userName) || USER_ACCOUNTS[0]
}
