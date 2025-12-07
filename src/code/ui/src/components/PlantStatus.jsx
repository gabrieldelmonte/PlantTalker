import { Sprout, Droplets, AlertTriangle, CheckCircle } from 'lucide-react'

export default function PlantStatus({ data }) {
  const soilMoisture = data.soil_moisture
  const ledState = data.led_state
  
  const getStatusInfo = () => {
    if (soilMoisture === null) {
      return {
        status: 'unknown',
        message: 'Waiting for sensor data',
        color: 'gray',
        icon: AlertTriangle,
        plantHealth: 50,
      }
    }
    
    if (soilMoisture === 0) {
      return {
        status: 'error',
        message: 'Sensor not in soil',
        color: 'gray',
        icon: AlertTriangle,
        plantHealth: 0,
      }
    }
    
    if (soilMoisture < 35) {
      return {
        status: 'critical',
        message: 'Plant is dehydrated - Water needed',
        color: 'red',
        icon: AlertTriangle,
        plantHealth: 30,
      }
    }
    
    if (soilMoisture <= 63) {
      return {
        status: 'warning',
        message: 'Soil moisture is medium',
        color: 'yellow',
        icon: Droplets,
        plantHealth: 70,
      }
    }
    
    return {
      status: 'healthy',
      message: 'Plant is healthy - Optimal moisture',
      color: 'green',
      icon: CheckCircle,
      plantHealth: 100,
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className="card card-hover">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Plant Status</h2>
        <div className={`badge badge-${statusInfo.color}`}>
          {statusInfo.status.toUpperCase()}
        </div>
      </div>

      {/* Visual Plant Representation */}
      <div className="relative flex flex-col items-center justify-center py-8">
        {/* Plant Container */}
        <div className="relative">
          {/* Plant Stem and Leaves */}
          <div className="flex flex-col items-center">
            {/* Leaves */}
            <div className="relative mb-4">
              <svg
                width="120"
                height="100"
                viewBox="0 0 120 100"
                className={`transition-all duration-500 ${
                  statusInfo.plantHealth > 70 ? 'opacity-100' : 'opacity-60'
                }`}
              >
                {/* Left leaf */}
                <ellipse
                  cx="30"
                  cy="50"
                  rx="25"
                  ry="35"
                  fill={statusInfo.plantHealth > 70 ? '#22c55e' : statusInfo.plantHealth > 30 ? '#f59e0b' : '#ef4444'}
                  opacity="0.8"
                  transform="rotate(-30 30 50)"
                />
                {/* Right leaf */}
                <ellipse
                  cx="90"
                  cy="50"
                  rx="25"
                  ry="35"
                  fill={statusInfo.plantHealth > 70 ? '#22c55e' : statusInfo.plantHealth > 30 ? '#f59e0b' : '#ef4444'}
                  opacity="0.8"
                  transform="rotate(30 90 50)"
                />
                {/* Center leaf */}
                <ellipse
                  cx="60"
                  cy="30"
                  rx="20"
                  ry="30"
                  fill={statusInfo.plantHealth > 70 ? '#16a34a' : statusInfo.plantHealth > 30 ? '#d97706' : '#dc2626'}
                  opacity="0.9"
                />
                {/* Stem */}
                <rect
                  x="57"
                  y="50"
                  width="6"
                  height="50"
                  fill={statusInfo.plantHealth > 70 ? '#15803d' : statusInfo.plantHealth > 30 ? '#a16207' : '#991b1b'}
                  rx="3"
                />
              </svg>
              
              {/* Status icon overlay */}
              <div className={`absolute -top-2 -right-2 p-2 rounded-full bg-${statusInfo.color === 'red' ? 'danger' : statusInfo.color === 'yellow' ? 'warning' : 'primary'}-500/20 border border-${statusInfo.color === 'red' ? 'danger' : statusInfo.color === 'yellow' ? 'warning' : 'primary'}-500/50`}>
                <StatusIcon className={`w-5 h-5 text-${statusInfo.color === 'red' ? 'danger' : statusInfo.color === 'yellow' ? 'warning' : 'primary'}-400`} />
              </div>
            </div>

            {/* Pot */}
            <div className="relative w-32 h-24 bg-gradient-to-b from-dark-border to-dark-card rounded-b-full border-2 border-dark-border shadow-lg">
              {/* Soil indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-900/40 to-amber-800/20 rounded-b-full">
                {/* Moisture level indicator */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-1000 bg-gradient-to-t ${
                    statusInfo.color === 'green' ? 'from-primary-600/30 to-primary-500/20' :
                    statusInfo.color === 'yellow' ? 'from-warning-600/30 to-warning-500/20' :
                    'from-danger-600/30 to-danger-500/20'
                  }`}
                  style={{ height: `${Math.max(0, Math.min(100, soilMoisture || 0))}%` }}
                >
                  {/* Water droplets animation when moisture is good */}
                  {soilMoisture && soilMoisture > 35 && (
                    <>
                      <Droplets className="absolute top-2 left-4 w-3 h-3 text-primary-400 animate-pulse" />
                      <Droplets className="absolute top-4 right-6 w-3 h-3 text-primary-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </>
                  )}
                </div>
              </div>
              
              {/* Pot rim decoration */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-dark-border rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Moisture percentage display */}
        {soilMoisture !== null && (
          <div className="mt-6 text-center">
            <div className="text-4xl font-bold">
              {soilMoisture}%
            </div>
            <div className="text-sm text-dark-muted mt-1">Soil Moisture</div>
          </div>
        )}
      </div>

      {/* Status Message */}
      <div className={`mt-6 p-4 rounded-lg border ${
        statusInfo.color === 'green' ? 'bg-primary-500/10 border-primary-500/30' :
        statusInfo.color === 'yellow' ? 'bg-warning-500/10 border-warning-500/30' :
        statusInfo.color === 'red' ? 'bg-danger-500/10 border-danger-500/30' :
        'bg-dark-border/30 border-dark-border'
      }`}>
        <div className="flex items-center gap-3">
          <StatusIcon className={`w-5 h-5 ${
            statusInfo.color === 'green' ? 'text-primary-400' :
            statusInfo.color === 'yellow' ? 'text-warning-400' :
            statusInfo.color === 'red' ? 'text-danger-400' :
            'text-dark-muted'
          }`} />
          <p className="text-sm font-medium">{statusInfo.message}</p>
        </div>
        
        {/* LED Indicator */}
        {ledState && (
          <div className="mt-3 pt-3 border-t border-dark-border/50 flex items-center justify-between">
            <span className="text-xs text-dark-muted">LED Indicator</span>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                ledState === 'dry' || ledState === 'sensor_out' ? 'bg-danger-500 animate-pulse' :
                ledState === 'medium' ? 'bg-warning-500 animate-pulse' :
                ledState === 'ideal' ? 'bg-primary-500 animate-pulse' :
                'bg-dark-border'
              }`}></div>
              <span className="text-xs font-medium capitalize">{ledState || 'Unknown'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Health Score Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-dark-muted">Health Score</span>
          <span className="text-sm font-semibold">{statusInfo.plantHealth}%</span>
        </div>
        <div className="w-full h-3 bg-dark-border rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              statusInfo.plantHealth > 70 ? 'bg-gradient-to-r from-primary-500 to-primary-600' :
              statusInfo.plantHealth > 30 ? 'bg-gradient-to-r from-warning-500 to-warning-600' :
              'bg-gradient-to-r from-danger-500 to-danger-600'
            }`}
            style={{ width: `${statusInfo.plantHealth}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}