import { Moon, Clock, BarChart2, Settings } from 'lucide-react'

export const TABS = [
  { id: 'tonight', label: 'Tonight', icon: Moon },
  { id: 'history', label: 'Log', icon: Clock },
  { id: 'stats', label: 'Insights', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

// 7:00 PM (19.0) to 10:00 AM (+15 hours = 34.0 continuous scale)
export const CHART_START_HOUR = 19
export const CHART_TOTAL_HOURS = 15

export const TIME_MARKERS = [
  { label: '7p', offsetHours: 0 },
  { label: '10p', offsetHours: 3 },
  { label: '1a', offsetHours: 6 },
  { label: '4a', offsetHours: 9 },
  { label: '7a', offsetHours: 12 },
  { label: '10a', offsetHours: 15 },
]

export const DISRUPTION_TYPES = [
  { id: 'toilet', label: 'Toilet Break', icon: '🚽' },
  { id: 'nightmare', label: 'Nightmare', icon: '😱' },
  { id: 'noise', label: 'Noise', icon: '🔊' },
  { id: 'temp', label: 'Too Hot / Cold', icon: '🌡️' },
  { id: 'thirst', label: 'Thirsty', icon: '💧' },
  { id: 'restless', label: 'Restless Mind', icon: '🧠' },
]

export const AWAKE_DURATIONS = [5, 10, 20, 30]
