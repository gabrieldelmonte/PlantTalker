import { useState } from 'react'
import { Droplet, Power, AlertCircle, CheckCircle, Loader } from 'lucide-react'

export default function ControlPanel({ data, onIrrigate, connected }) {
  const [irrigating, setIrrigating] = useState(false)
  const [lastAction, setLastAction] = useState(null)

  const handleIrrigate = async () => {
    if (!connected || irrigating) return

    setIrrigating(true)
    try {
      const result = await onIrrigate()
      setLastAction({
        type: 'success',
        message: 'Irrigation completed successfully',
        timestamp: Date.now(),
      })
    } catch (error) {
      setLastAction({
        type: 'error',
        message: 'Irrigation failed',
        timestamp: Date.now(),
      })
    } finally {
      setIrrigating(false)
    }
  }

  const canIrrigate = connected && !irrigating && data.soil_moisture !== null

  return (
    <div className="card card-hover">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Control Panel</h2>
        <div className={`badge ${connected ? 'badge-green' : 'badge-gray'}`}>
          <Power className="w-3 h-3 mr-1" />
          {connected ? 'ONLINE' : 'OFFLINE'}
        </div>
      </div>

      {/* Irrigation Control */}
      <div className="space-y-4">
        <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-primary-500/10 rounded-lg border border-primary-500/20">
              <Droplet className="w-6 h-6 text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Manual Irrigation</h3>
              <p className="text-sm text-dark-muted mb-3">
                Trigger the irrigation system manually
              </p>
              <button
                onClick={handleIrrigate}
                disabled={!canIrrigate}
                className={`w-full btn-primary flex items-center justify-center gap-2 ${
                  irrigating ? 'opacity-75' : ''
                }`}
              >
                {irrigating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Irrigating...</span>
                  </>
                ) : (
                  <>
                    <Droplet className="w-4 h-4" />
                    <span>Start Irrigation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Current Conditions Warning/Info */}
        {data.soil_moisture !== null && (
          <div className={`p-4 rounded-lg border ${
            data.soil_moisture === 0
              ? 'bg-dark-border/30 border-dark-border'
              : data.soil_moisture < 35
              ? 'bg-danger-500/10 border-danger-500/30'
              : data.soil_moisture <= 63
              ? 'bg-warning-500/10 border-warning-500/30'
              : 'bg-primary-500/10 border-primary-500/30'
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                data.soil_moisture === 0
                  ? 'text-dark-muted'
                  : data.soil_moisture < 35
                  ? 'text-danger-400'
                  : data.soil_moisture <= 63
                  ? 'text-warning-400'
                  : 'text-primary-400'
              }`} />
              <div>
                <p className="text-sm font-medium mb-1">
                  {data.soil_moisture === 0
                    ? 'Sensor Check Required'
                    : data.soil_moisture < 35
                    ? 'Irrigation Recommended'
                    : data.soil_moisture <= 63
                    ? 'Optional Watering'
                    : 'No Action Needed'}
                </p>
                <p className="text-xs text-dark-muted">
                  {data.soil_moisture === 0
                    ? 'The moisture sensor is not in the soil. Please check sensor placement.'
                    : data.soil_moisture < 35
                    ? 'Soil moisture is low. Consider irrigating your plant.'
                    : data.soil_moisture <= 63
                    ? 'Soil moisture is moderate. Monitor regularly or water if needed.'
                    : 'Soil moisture is at optimal level. Your plant is happy!'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Last Action Status */}
        {lastAction && (
          <div className={`p-4 rounded-lg border animate-fade-in ${
            lastAction.type === 'success'
              ? 'bg-primary-500/10 border-primary-500/30'
              : 'bg-danger-500/10 border-danger-500/30'
          }`}>
            <div className="flex items-center gap-3">
              {lastAction.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-primary-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-danger-400" />
              )}
              <div>
                <p className="text-sm font-medium">{lastAction.message}</p>
                <p className="text-xs text-dark-muted mt-1">
                  {new Date(lastAction.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
            <p className="text-xs text-dark-muted mb-1">Total Irrigations</p>
            <p className="text-2xl font-bold">{data.irrigation_count || 0}</p>
          </div>
          <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
            <p className="text-xs text-dark-muted mb-1">Button Presses</p>
            <p className="text-2xl font-bold">{data.button_press_count || 0}</p>
          </div>
        </div>

        {/* Connection Warning */}
        {!connected && (
          <div className="p-4 bg-danger-500/10 border border-danger-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-danger-400" />
              <div>
                <p className="text-sm font-medium text-danger-400">System Offline</p>
                <p className="text-xs text-dark-muted mt-1">
                  Cannot control system. Check API server connection.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}