import { useState } from 'react'
import StatusCards from './StatusCards'
import PlantStatus from './PlantStatus'
import SensorChart from './SensorChart'
import ChatInterface from './ChatInterface'
import ControlPanel from './ControlPanel'
import SystemInfo from './SystemInfo'

export default function Dashboard({ systemData, connected, onIrrigate, onChat, onResetChat }) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!systemData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-muted">Waiting for sensor data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-primary-600 text-white'
              : 'bg-dark-card text-dark-muted hover:text-dark-text hover:bg-dark-border'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'charts'
              ? 'bg-primary-600 text-white'
              : 'bg-dark-card text-dark-muted hover:text-dark-text hover:bg-dark-border'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'chat'
              ? 'bg-primary-600 text-white'
              : 'bg-dark-card text-dark-muted hover:text-dark-text hover:bg-dark-border'
          }`}
        >
          AI Assistant
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'system'
              ? 'bg-primary-600 text-white'
              : 'bg-dark-card text-dark-muted hover:text-dark-text hover:bg-dark-border'
          }`}
        >
          System Info
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Status Cards Row */}
          <StatusCards data={systemData} connected={connected} />

          {/* Plant Status and Control Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlantStatus data={systemData} />
            <ControlPanel 
              data={systemData} 
              onIrrigate={onIrrigate}
              connected={connected}
            />
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          <SensorChart data={systemData} />
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="space-y-6">
          <ChatInterface 
            onChat={onChat}
            onResetChat={onResetChat}
            systemData={systemData}
            connected={connected}
          />
        </div>
      )}

      {/* System Info Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <SystemInfo data={systemData} connected={connected} />
        </div>
      )}
    </div>
  )
}