import { Sprout } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-dark-card border-b border-dark-border sticky top-0 z-50 backdrop-blur-sm bg-dark-card/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500/10 p-2 rounded-lg border border-primary-500/20">
              <Sprout className="w-8 h-8 text-primary-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">
                Plant Talker
              </h1>
              <p className="text-sm text-dark-muted">
                IoT Plant Monitoring System
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-dark-bg rounded-lg">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-dark-muted">Live Monitoring</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}