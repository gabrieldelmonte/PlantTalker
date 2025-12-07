import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Trash2, Loader, Bot, User, Info } from 'lucide-react'

export default function ChatInterface({ onChat, onResetChat, systemData, connected }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading || !connected) return

    const userMessage = input.trim()
    setInput('')

    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    }])

    setLoading(true)

    try {
      const response = await onChat(userMessage)
      
      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        timestamp: Date.now(),
      }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Failed to get response. Please try again.',
        timestamp: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!connected) return
    
    try {
      await onResetChat()
      setMessages([])
    } catch (error) {
      console.error('Reset error:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQuestions = [
    "How is my plant doing?",
    "Should I water my plant?",
    "What's the current temperature?",
    "When was the last irrigation?",
  ]

  const handleSuggestion = (question) => {
    setInput(question)
  }

  return (
    <div className="card h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg border border-primary-500/20">
            <Bot className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Assistant</h2>
            <p className="text-xs text-dark-muted">Powered by Ollama llama3.2:1b</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          disabled={!connected || messages.length === 0}
          className="btn-secondary flex items-center gap-2 text-sm"
          title="Clear conversation"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* System Context Info */}
      {systemData && (
        <div className="mb-4 p-3 bg-primary-500/5 border border-primary-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-dark-muted">
              The AI has access to real-time sensor data including temperature, humidity, and soil moisture levels.
            </p>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <MessageCircle className="w-16 h-16 text-dark-muted mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
            <p className="text-sm text-dark-muted mb-6 max-w-md">
              Ask me anything about your plant's health, sensor readings, or care recommendations.
            </p>
            
            {/* Suggested Questions */}
            <div className="w-full max-w-md space-y-2">
              <p className="text-xs text-dark-muted mb-3">Suggested questions:</p>
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestion(question)}
                  className="w-full text-left px-4 py-2 bg-dark-bg hover:bg-dark-border rounded-lg border border-dark-border transition-colors text-sm"
                  disabled={!connected}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-500/10 rounded-lg border border-primary-500/20">
                  <Bot className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 p-3 bg-dark-bg rounded-lg border border-dark-border">
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-primary-400" />
                    <span className="text-sm text-dark-muted">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-dark-border pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={connected ? "Ask about your plant..." : "System offline"}
            disabled={loading || !connected}
            className="flex-1 input-field"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || !connected}
            className="btn-primary px-6 flex items-center gap-2"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>
        {!connected && (
          <p className="text-xs text-danger-400 mt-2">
            Chat is unavailable. Please check system connection.
          </p>
        )}
      </div>
    </div>
  )
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const isError = message.role === 'error'

  return (
    <div className={`flex items-start gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`p-2 rounded-lg border ${
        isUser 
          ? 'bg-primary-500/10 border-primary-500/20' 
          : isError
          ? 'bg-danger-500/10 border-danger-500/20'
          : 'bg-primary-500/10 border-primary-500/20'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-primary-400" />
        ) : (
          <Bot className={`w-5 h-5 ${isError ? 'text-danger-400' : 'text-primary-400'}`} />
        )}
      </div>
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block p-3 rounded-lg border ${
          isUser
            ? 'bg-primary-600 border-primary-500 text-white'
            : isError
            ? 'bg-danger-500/10 border-danger-500/30 text-danger-400'
            : 'bg-dark-bg border-dark-border'
        }`}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p className="text-xs text-dark-muted mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}