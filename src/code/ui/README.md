# Plant Talker Web UI

A modern, real-time web interface for the Plant Talker IoT system built with React and Flask.

## Features

- **Real-time Monitoring**: WebSocket-based live updates every 2 seconds
- **Interactive Dashboard**: Visual plant status with health indicators
- **AI Chat Interface**: Talk to your plant using Ollama LLM
- **Analytics Charts**: Historical sensor data visualization
- **Dark Mode UI**: Beautiful dark theme optimized for extended viewing
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Manual Controls**: Trigger irrigation from the web interface

## Technology Stack

### Frontend
- React 18
- Vite (Build tool)
- Tailwind CSS (Styling)
- Socket.IO Client (Real-time communication)
- Recharts (Data visualization)
- Axios (HTTP requests)
- Lucide React (Icons)

### Backend
- Flask (Web framework)
- Flask-SocketIO (WebSocket support)
- Flask-CORS (Cross-origin support)
- Python 3.x

## Installation

### Prerequisites

1. Node.js (v24 or higher)
2. Python 3.7+
3. Running Plant Talker hardware system

### Backend Setup

1. Install Python dependencies:
```bash
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code
pip install flask flask-socketio flask-cors
```

### Frontend Setup

1. Install Node.js 24 via nvm:
```bash
# Download and install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Load nvm (in lieu of restarting the shell)
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js 24
nvm install 24

# Verify the Node.js version
node -v  # Should print "v24.11.1"

# Verify npm version
npm -v  # Should print "11.6.2"
```

2. Navigate to the UI directory:
```bash
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code/ui
```

3. Install Node.js dependencies:
```bash
npm install
```

## Running the Application

### Method 1: Development Mode (Recommended for testing)

**Terminal 1 - Start the API Server:**
```bash
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code
python3 api_server.py
```

The API will start on `http://0.0.0.0:5000`

**Terminal 2 - Start the React Development Server:**
```bash
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code/ui
npm run dev
```

The web UI will start on `http://localhost:3000`

**Access the UI:**
Open your browser and go to: `http://localhost:3000`

### Method 2: Production Build

1. Build the React app:
```bash
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code/ui
npm run build
```

2. The build will be created in the `dist` folder

3. Serve the build with a static server or configure Flask to serve it

## Usage

### Dashboard Overview

The main dashboard shows:
- **Status Cards**: Real-time sensor readings (Temperature, Humidity, Soil Moisture, Irrigations)
- **Plant Status**: Visual plant health indicator with animated graphics
- **Control Panel**: Manual irrigation button and system statistics
- **Connection Status**: WebSocket connection indicator

### Analytics Tab

- View historical sensor data in interactive charts
- Temperature, humidity, and soil moisture trends
- Last 20 data points with automatic updates

### AI Assistant Tab

- Chat with your plant using natural language
- AI has access to real-time sensor data
- Ask questions like:
  - "How is my plant doing?"
  - "Should I water my plant?"
  - "What's the current temperature?"
  - "When was the last irrigation?"

### System Info Tab

- Complete system configuration details
- Hardware pin mappings
- Software versions
- API endpoint documentation
- Current readings summary

## API Endpoints

### REST API

- `GET /api/status` - Get current system status
- `POST /api/irrigate` - Trigger manual irrigation
- `POST /api/chat` - Send message to AI (body: `{"message": "your message"}`)
- `POST /api/chat/reset` - Reset conversation history
- `GET /api/health` - Health check endpoint

### WebSocket Events

**Client → Server:**
- `connect` - Establish connection
- `request_status` - Request current status

**Server → Client:**
- `connected` - Connection confirmation
- `status_update` - Real-time status updates (every 2s)
- `irrigation_event` - Irrigation notifications

## Configuration

### Environment Variables (Optional)

The UI automatically detects the API server location, but you can override it if needed.

Create a `.env.local` file in the UI directory (copy from `.env.example`):

```env
# Only needed if automatic detection doesn't work for your setup
VITE_API_URL=http://192.168.1.100:5000
```

By default, the app uses `http://${window.location.hostname}:5000` which works in most scenarios.

### Changing Ports

**API Server (api_server.py):**
```python
socketio.run(app, host='0.0.0.0', port=5000)
```

**React Dev Server (vite.config.js):**
```javascript
server: {
  port: 3000,
}
```

## Troubleshooting

### Quick Diagnostic

Run the connection diagnostic script to check if everything is configured correctly:

```bash
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code
./check_connection.sh
```

This will verify:
- API server is running
- Ports are open and listening
- Health endpoints are responding
- Network configuration

For detailed troubleshooting, see `WEBSOCKET_TROUBLESHOOTING.md`

### Connection Issues

**Problem:** "Connection Lost" message appears

**Solutions:**
1. Ensure API server is running on port 5000
2. Check firewall settings
3. Verify CORS is enabled in Flask
4. Check browser console for errors
5. Run the connection diagnostic: `./check_connection.sh`

**Important:** The UI now automatically detects the correct API host based on your browser's location. If you access the UI at `http://192.168.1.100:3000`, it will automatically connect to the API at `http://192.168.1.100:5000`. No manual configuration needed!

### WebSocket Not Connecting

**Solutions:**
1. Ensure Flask-SocketIO is installed: `pip install flask-socketio`
2. Check the proxy configuration in `vite.config.js`
3. Verify the API URL in the environment

### Charts Not Showing

**Problem:** Charts show "Collecting data..."

**Solutions:**
1. Wait for at least 2 data points (4+ seconds)
2. Ensure sensors are sending data
3. Check browser console for errors

### AI Chat Not Working

**Problem:** Chat returns errors or mock responses

**Solutions:**
1. Ensure Ollama is running: `ollama serve`
2. Verify llama3.2:1b model is installed: `ollama list`
3. Check API server logs for LLM errors

### Build Errors

**Problem:** npm run build fails

**Solutions:**
1. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear npm cache: `npm cache clean --force`
3. Ensure Node.js 24 is installed: `nvm install 24 && nvm use 24`

## Network Access

### Automatic Host Detection (NEW!)

The UI now automatically uses the correct host for API connections:

- **Accessing locally on Pi:** `http://localhost:3000` → connects to `http://localhost:5000`
- **Accessing from another device:** `http://192.168.1.100:3000` → connects to `http://192.168.1.100:5000`

No manual configuration needed! The app uses `window.location.hostname` to determine the API URL.

### Access from Other Devices

To access the UI from other devices on your network:

1. Find your Raspberry Pi's IP address:
```bash
hostname -I
```

2. Start the servers as usual:
```bash
./start_web_ui.sh
```

3. Access from another device's browser:
   - Web UI: `http://<raspberry-pi-ip>:3000`
   - The API connection will be automatic!

### Manual Override (Optional)

If you need to override the automatic detection, create a `.env.local` file:

```bash
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code/ui
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_URL=http://192.168.1.100:5000
```

Replace `192.168.1.100` with your actual Raspberry Pi IP address.

### Production Deployment

For production, use a reverse proxy like nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/ui/dist;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Development

### File Structure

```
ui/
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Top navigation bar
│   │   ├── Dashboard.jsx        # Main dashboard container
│   │   ├── StatusCards.jsx      # Sensor reading cards
│   │   ├── PlantStatus.jsx      # Visual plant health
│   │   ├── ControlPanel.jsx     # Irrigation controls
│   │   ├── ChatInterface.jsx    # AI chat UI
│   │   ├── SensorChart.jsx      # Analytics charts
│   │   ├── SystemInfo.jsx       # System details
│   │   └── ConnectionStatus.jsx # Connection indicator
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
├── public/                       # Static assets
├── index.html                    # HTML template
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

### Adding New Features

1. Create new component in `src/components/`
2. Import and use in `Dashboard.jsx`
3. Add API endpoint in `api_server.py` if needed
4. Update this README

### Customization

**Colors:** Edit `tailwind.config.js` theme section

**Update Interval:** Change in `App.jsx`:
```javascript
time.sleep(2)  // Backend broadcast interval
```

**Chart Data Points:** Change in `SensorChart.jsx`:
```javascript
updated.slice(-20)  // Keep last 20 points
```

## Performance

- WebSocket updates: 2 seconds
- Chart updates: Real-time with new data
- API response time: < 100ms (local)
- Bundle size: ~300KB (gzipped)

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## License

Part of the Plant Talker IoT System project.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API server logs
3. Check browser console for errors
4. Verify hardware connections