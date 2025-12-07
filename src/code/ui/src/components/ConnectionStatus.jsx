import { Wifi, WifiOff } from 'lucide-react'

export default function ConnectionStatus({ connected }) {
  if (connected) {
    return null // Don't show anything when connected
  }

  return (
    <div className="fixed top-20 right-4 z-50 animate-fade-in">
      <div className="bg-danger-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border border-danger-500">
        <WifiOff className="w-5 h-5 animate-pulse" />
        <div>
          <p className="font-semibold text-sm">Connection Lost</p>
          <p className="text-xs opacity-90">Attempting to reconnect...</p>
        </div>
      </div>
    </div>
  )
}