import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import ConnectionStatus from './components/ConnectionStatus'

// Use the current host instead of localhost for API connections
// This allows the UI to work when accessed from any device on the network
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`

function App() {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [systemData, setSystemData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    })

    socketInstance.on('connect', () => {
      console.log('[WebSocket] Connected to server')
      setConnected(true)
      setLoading(false)
    })

    socketInstance.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from server')
      setConnected(false)
    })

    socketInstance.on('status_update', (data) => {
      console.log('[WebSocket] Status update received')
      setSystemData(data)
    })

    socketInstance.on('irrigation_event', (data) => {
      console.log('[WebSocket] Irrigation event:', data)
      // Handle irrigation notifications
    })

    socketInstance.on('error', (error) => {
      console.error('[WebSocket] Error:', error)
    })

    setSocket(socketInstance)

    // Fetch initial data
    fetchStatus()

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/status`)
      if (response.data.success) {
        setSystemData(response.data.data)
        setLoading(false)
      }
    } catch (error) {
      console.error('[API] Error fetching status:', error)
      setLoading(false)
    }
  }

  const triggerIrrigation = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/irrigate`)
      console.log('[API] Irrigation triggered:', response.data)
      return response.data
    } catch (error) {
      console.error('[API] Error triggering irrigation:', error)
      throw error
    }
  }

  const sendChatMessage = async (message) => {
    try {
      const response = await axios.post(`${API_URL}/api/chat`, { message })
      return response.data
    } catch (error) {
      console.error('[API] Error sending chat message:', error)
      throw error
    }
  }

  const resetChat = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/chat/reset`)
      return response.data
    } catch (error) {
      console.error('[API] Error resetting chat:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-muted text-lg">Loading Plant Talker...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <ConnectionStatus connected={connected} />
      
      <main className="container mx-auto px-4 py-6">
        <Dashboard
          systemData={systemData}
          connected={connected}
          onIrrigate={triggerIrrigation}
          onChat={sendChatMessage}
          onResetChat={resetChat}
        />
      </main>

      <footer className="mt-12 py-6 border-t border-dark-border">
        <div className="container mx-auto px-4 text-center text-dark-muted text-sm">
          <p>Plant Talker IoT System - Real-time Plant Monitoring</p>
          <p className="mt-1">Built with React, Flask, and Raspberry Pi 5</p>
        </div>
      </footer>
    </div>
  )
}

export default App