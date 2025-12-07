import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function SensorChart({ data }) {
  const [historicalData, setHistoricalData] = useState([])

  useEffect(() => {
    if (data) {
      const timestamp = new Date().toLocaleTimeString()
      const newDataPoint = {
        time: timestamp,
        temperature: data.temperature_c,
        humidity: data.humidity,
        soilMoisture: data.soil_moisture,
      }

      setHistoricalData(prev => {
        const updated = [...prev, newDataPoint]
        return updated.slice(-20) // Keep last 20 data points
      })
    }
  }, [data])

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-lg border border-primary-500/20">
              <TrendingUp className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Sensor Analytics</h2>
              <p className="text-sm text-dark-muted">Real-time data visualization</p>
            </div>
          </div>
        </div>

        {historicalData.length < 2 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-dark-muted mx-auto mb-3 opacity-50" />
              <p className="text-dark-muted">Collecting data...</p>
              <p className="text-xs text-dark-muted mt-1">Charts will appear after a few readings</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Temperature Chart */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-dark-muted">Temperature (°C)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3150" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1f35',
                      border: '1px solid #2a3150',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    name="Temperature"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Humidity Chart */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-dark-muted">Air Humidity (%)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3150" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1f35',
                      border: '1px solid #2a3150',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', r: 4 }}
                    name="Humidity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Soil Moisture Chart */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-dark-muted">Soil Moisture (%)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3150" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1f35',
                      border: '1px solid #2a3150',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="soilMoisture"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                    name="Soil Moisture"
                  />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Threshold indicators */}
              <div className="mt-4 flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger-500"></div>
                  <span className="text-dark-muted">Critical (&lt; 35%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning-500"></div>
                  <span className="text-dark-muted">Medium (36-63%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                  <span className="text-dark-muted">Ideal (&gt; 63%)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-sm text-dark-muted mb-2">Current Temperature</h3>
          <p className="text-3xl font-bold">
            {data?.temperature_c !== null ? `${data.temperature_c.toFixed(1)}°C` : '--'}
          </p>
          <p className="text-xs text-dark-muted mt-1">
            {data?.temperature_f !== null ? `${data.temperature_f.toFixed(1)}°F` : '--'}
          </p>
        </div>
        
        <div className="card">
          <h3 className="text-sm text-dark-muted mb-2">Current Humidity</h3>
          <p className="text-3xl font-bold">
            {data?.humidity !== null ? `${data.humidity.toFixed(1)}%` : '--'}
          </p>
          <p className="text-xs text-dark-muted mt-1">Air moisture level</p>
        </div>
        
        <div className="card">
          <h3 className="text-sm text-dark-muted mb-2">Soil Moisture</h3>
          <p className="text-3xl font-bold">
            {data?.soil_moisture !== null ? `${data.soil_moisture}%` : '--'}
          </p>
          <p className="text-xs text-dark-muted mt-1">{data?.plant_status || 'Unknown'}</p>
        </div>
      </div>
    </div>
  )
}