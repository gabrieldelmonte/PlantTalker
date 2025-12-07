import { Server, Cpu, HardDrive, Wifi, Clock, Database } from 'lucide-react'

export default function SystemInfo({ data, connected }) {
  const systemStats = [
    {
      label: 'System Status',
      value: connected ? 'Online' : 'Offline',
      icon: Server,
      color: connected ? 'green' : 'red',
    },
    {
      label: 'Connection',
      value: connected ? 'WebSocket Active' : 'Disconnected',
      icon: Wifi,
      color: connected ? 'green' : 'red',
    },
    {
      label: 'Data Updates',
      value: connected ? 'Real-time' : 'Paused',
      icon: Database,
      color: connected ? 'green' : 'yellow',
    },
  ]

  const sensorInfo = [
    {
      name: 'DHT22 Sensor',
      status: data?.temperature_c !== null ? 'Active' : 'Waiting',
      readings: ['Temperature', 'Humidity'],
      interval: '10 seconds',
    },
    {
      name: 'Soil Moisture Sensor',
      status: data?.soil_moisture !== null ? 'Active' : 'Waiting',
      readings: ['Soil Moisture'],
      interval: '1 second',
    },
    {
      name: 'LED Indicators',
      status: data?.led_state ? 'Active' : 'Unknown',
      readings: ['Red', 'Yellow', 'Green'],
      interval: 'Event-driven',
    },
    {
      name: 'Servo Controller',
      status: 'Ready',
      readings: ['Irrigation Control'],
      interval: 'On-demand',
    },
  ]

  const formatUptime = () => {
    if (!data?.last_update_time) return 'Unknown'
    const now = Date.now() / 1000
    const uptime = now - (data.last_update_time - 60) // Approximate
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">System Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {systemStats.map((stat, index) => (
            <div key={index} className="p-4 bg-dark-bg rounded-lg border border-dark-border">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  stat.color === 'green' ? 'bg-primary-500/10 border border-primary-500/20' :
                  stat.color === 'yellow' ? 'bg-warning-500/10 border border-warning-500/20' :
                  'bg-danger-500/10 border border-danger-500/20'
                }`}>
                  <stat.icon className={`w-5 h-5 ${
                    stat.color === 'green' ? 'text-primary-400' :
                    stat.color === 'yellow' ? 'text-warning-400' :
                    'text-danger-400'
                  }`} />
                </div>
                <span className="text-sm text-dark-muted">{stat.label}</span>
              </div>
              <p className="text-lg font-semibold ml-11">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor Information */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Sensor Information</h2>
        
        <div className="space-y-4">
          {sensorInfo.map((sensor, index) => (
            <div key={index} className="p-4 bg-dark-bg rounded-lg border border-dark-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{sensor.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      sensor.status === 'Active' ? 'bg-primary-500 animate-pulse' : 'bg-warning-500'
                    }`}></div>
                    <span className="text-xs text-dark-muted">{sensor.status}</span>
                  </div>
                </div>
                <span className="text-xs badge badge-gray">{sensor.interval}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {sensor.readings.map((reading, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-dark-card rounded border border-dark-border">
                    {reading}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hardware Configuration */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Hardware Configuration</h2>
        
        <div className="space-y-3">
          <ConfigRow label="Platform" value="Raspberry Pi 5" />
          <ConfigRow label="DHT22 Pin" value="GPIO 16" />
          <ConfigRow label="Red LED Pin" value="GPIO 13" />
          <ConfigRow label="Yellow LED Pin" value="GPIO 19" />
          <ConfigRow label="Green LED Pin" value="GPIO 26" />
          <ConfigRow label="Button Pin" value="GPIO 20" />
          <ConfigRow label="Servo Pin" value="GPIO 12" />
          <ConfigRow label="UART Port" value="/dev/ttyAMA0" />
          <ConfigRow label="Baud Rate" value="115200" />
        </div>
      </div>

      {/* Software Information */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Software Information</h2>
        
        <div className="space-y-3">
          <ConfigRow label="Backend" value="Flask + Socket.IO" />
          <ConfigRow label="Frontend" value="React + Vite" />
          <ConfigRow label="Styling" value="Tailwind CSS" />
          <ConfigRow label="LLM Model" value="llama3.2:1b (Ollama)" />
          <ConfigRow label="Charts" value="Recharts" />
          <ConfigRow label="API Port" value="5000" />
          <ConfigRow label="Web UI Port" value="3000" />
        </div>
      </div>

      {/* System Statistics */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">System Statistics</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox
            label="Total Irrigations"
            value={data?.irrigation_count || 0}
            icon={HardDrive}
          />
          <StatBox
            label="Button Presses"
            value={data?.button_press_count || 0}
            icon={Cpu}
          />
          <StatBox
            label="System Uptime"
            value={formatUptime()}
            icon={Clock}
          />
          <StatBox
            label="Last Update"
            value={data?.last_update_time ? 'Active' : 'Pending'}
            icon={Database}
          />
        </div>
      </div>

      {/* Current Readings Summary */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Current Readings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-dark-muted mb-3">Environmental</h3>
            <div className="space-y-2">
              <ReadingRow
                label="Temperature"
                value={data?.temperature_c !== null ? `${data.temperature_c.toFixed(1)}°C (${data.temperature_f.toFixed(1)}°F)` : 'Not available'}
                status={data?.temperature_c !== null ? 'active' : 'inactive'}
              />
              <ReadingRow
                label="Air Humidity"
                value={data?.humidity !== null ? `${data.humidity.toFixed(1)}%` : 'Not available'}
                status={data?.humidity !== null ? 'active' : 'inactive'}
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-dark-muted mb-3">Plant Health</h3>
            <div className="space-y-2">
              <ReadingRow
                label="Soil Moisture"
                value={data?.soil_moisture !== null ? `${data.soil_moisture}%` : 'Not available'}
                status={data?.soil_moisture !== null ? 'active' : 'inactive'}
              />
              <ReadingRow
                label="Plant Status"
                value={data?.plant_message || 'Unknown'}
                status={data?.soil_moisture !== null ? 'active' : 'inactive'}
              />
              <ReadingRow
                label="LED Indicator"
                value={data?.led_state ? data.led_state.charAt(0).toUpperCase() + data.led_state.slice(1) : 'Unknown'}
                status={data?.led_state ? 'active' : 'inactive'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">API Endpoints</h2>
        
        <div className="space-y-2 font-mono text-sm">
          <EndpointRow method="GET" path="/api/status" description="Get system status" />
          <EndpointRow method="POST" path="/api/irrigate" description="Trigger irrigation" />
          <EndpointRow method="POST" path="/api/chat" description="Chat with AI" />
          <EndpointRow method="POST" path="/api/chat/reset" description="Reset conversation" />
          <EndpointRow method="GET" path="/api/health" description="Health check" />
        </div>
      </div>
    </div>
  )
}

function ConfigRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
      <span className="text-sm text-dark-muted">{label}</span>
      <span className="text-sm font-mono">{value}</span>
    </div>
  )
}

function StatBox({ label, value, icon: Icon }) {
  return (
    <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-dark-muted" />
        <span className="text-xs text-dark-muted">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function ReadingRow({ label, value, status }) {
  return (
    <div className="flex items-center justify-between p-2 bg-dark-bg rounded border border-dark-border">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          status === 'active' ? 'bg-primary-500' : 'bg-dark-muted'
        }`}></div>
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function EndpointRow({ method, path, description }) {
  const methodColors = {
    GET: 'bg-primary-500/10 text-primary-400 border-primary-500/30',
    POST: 'bg-warning-500/10 text-warning-400 border-warning-500/30',
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg border border-dark-border">
      <span className={`px-2 py-1 text-xs font-semibold rounded border ${methodColors[method]}`}>
        {method}
      </span>
      <span className="text-primary-400">{path}</span>
      <span className="text-dark-muted text-xs ml-auto">{description}</span>
    </div>
  )
}