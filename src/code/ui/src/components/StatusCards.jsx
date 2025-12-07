import { Thermometer, Droplets, Droplet, Activity } from 'lucide-react'

export default function StatusCards({ data, connected }) {
  const cards = [
    {
      title: 'Temperature',
      value: data.temperature_c !== null ? `${data.temperature_c.toFixed(1)}°C` : '--',
      subtitle: data.temperature_f !== null ? `${data.temperature_f.toFixed(1)}°F` : '--',
      icon: Thermometer,
      color: 'blue',
      trend: data.temperature_c !== null ? (data.temperature_c > 25 ? 'high' : 'normal') : null,
    },
    {
      title: 'Air Humidity',
      value: data.humidity !== null ? `${data.humidity.toFixed(1)}%` : '--',
      subtitle: data.humidity !== null ? (data.humidity > 60 ? 'High' : data.humidity < 40 ? 'Low' : 'Normal') : '--',
      icon: Droplets,
      color: 'cyan',
      trend: data.humidity !== null ? (data.humidity > 60 ? 'high' : data.humidity < 40 ? 'low' : 'normal') : null,
    },
    {
      title: 'Soil Moisture',
      value: data.soil_moisture !== null ? `${data.soil_moisture}%` : '--',
      subtitle: data.plant_message || 'Waiting for data...',
      icon: Droplet,
      color: getMoistureColor(data.soil_moisture),
      trend: getMoistureTrend(data.soil_moisture),
      glow: true,
    },
    {
      title: 'Irrigations',
      value: data.irrigation_count || 0,
      subtitle: getLastIrrigationText(data.last_irrigation_time),
      icon: Activity,
      color: 'green',
      trend: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <StatusCard key={index} {...card} connected={connected} />
      ))}
    </div>
  )
}

function StatusCard({ title, value, subtitle, icon: Icon, color, trend, glow, connected }) {
  const colorClasses = {
    blue: 'border-blue-500/30 bg-blue-500/10',
    cyan: 'border-cyan-500/30 bg-cyan-500/10',
    green: 'border-primary-500/30 bg-primary-500/10',
    yellow: 'border-warning-500/30 bg-warning-500/10',
    red: 'border-danger-500/30 bg-danger-500/10',
    gray: 'border-dark-border bg-dark-border/30',
  }

  const iconColorClasses = {
    blue: 'text-blue-400',
    cyan: 'text-cyan-400',
    green: 'text-primary-400',
    yellow: 'text-warning-400',
    red: 'text-danger-400',
    gray: 'text-dark-muted',
  }

  const glowClasses = {
    green: 'glow-green',
    yellow: 'glow-yellow',
    red: 'glow-red',
  }

  return (
    <div className={`stat-card ${glow && glowClasses[color]} ${!connected ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between w-full">
        <div className="flex-1">
          <p className="text-dark-muted text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className="text-dark-muted text-xs mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
        </div>
      </div>
      
      {trend && (
        <div className="mt-3 pt-3 border-t border-dark-border">
          <TrendIndicator trend={trend} />
        </div>
      )}
    </div>
  )
}

function TrendIndicator({ trend }) {
  const indicators = {
    high: { text: 'Above normal', color: 'text-warning-400' },
    low: { text: 'Below normal', color: 'text-cyan-400' },
    normal: { text: 'Normal range', color: 'text-primary-400' },
    dry: { text: 'Needs water', color: 'text-danger-400' },
    medium: { text: 'Monitor', color: 'text-warning-400' },
    ideal: { text: 'Optimal', color: 'text-primary-400' },
  }

  const indicator = indicators[trend] || { text: '', color: '' }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${indicator.color.replace('text-', 'bg-')} animate-pulse`}></div>
      <span className={`text-xs font-medium ${indicator.color}`}>{indicator.text}</span>
    </div>
  )
}

function getMoistureColor(moisture) {
  if (moisture === null) return 'gray'
  if (moisture === 0) return 'gray'
  if (moisture < 35) return 'red'
  if (moisture <= 63) return 'yellow'
  return 'green'
}

function getMoistureTrend(moisture) {
  if (moisture === null) return null
  if (moisture === 0) return null
  if (moisture < 35) return 'dry'
  if (moisture <= 63) return 'medium'
  return 'ideal'
}

function getLastIrrigationText(timestamp) {
  if (!timestamp) return 'Never'
  
  const now = Date.now() / 1000
  const diff = now - timestamp
  
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)} days ago`
}