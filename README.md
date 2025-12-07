# 🌱 PlantTalker

**An intelligent IoT plant monitoring and irrigation system with AI conversational interface for Raspberry Pi 5**

PlantTalker is a comprehensive multi-threaded plant care system that monitors environmental conditions, automates irrigation, and provides an AI-powered chat interface to interact with your plant. Built with modern web technologies and local LLM integration, it combines real-time sensor monitoring with an intuitive web dashboard.

![License](https://img.shields.io/badge/license-AGPL--3.0-blue)
![Python](https://img.shields.io/badge/python-3.7+-brightgreen.svg)
![Node](https://img.shields.io/badge/node-24.x-green.svg)
![Platform](https://img.shields.io/badge/platform-Raspberry%20Pi%205-red.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Hardware Requirements](#-hardware-requirements)
- [Software Stack](#-software-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Web Interface](#-web-interface)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Hardware Integration
- 🌡️ **Temperature & Humidity Monitoring** - DHT22 sensor with real-time readings
- 💧 **Soil Moisture Detection** - ESP32-based soil sensor via UART communication
- 💡 **LED Status Indicators** - Color-coded plant health visualization (Red/Yellow/Green)
- 🔘 **Manual Irrigation Button** - Physical button for on-demand watering
- 🚿 **Automated Irrigation** - Servo-controlled watering mechanism

### Software Features
- 🤖 **AI Chat Interface** - Talk to your plant using local LLM (Ollama + llama3.2:1b)
- 🌐 **Real-time Web Dashboard** - Modern React UI with live WebSocket updates
- 📊 **Analytics & Charts** - Historical sensor data visualization
- 🧵 **Multi-threaded Architecture** - Independent sensor threads with thread-safe operations
- 🔄 **Auto-reconnection** - Robust error handling and automatic recovery
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🌙 **Dark Mode UI** - Beautiful dark theme optimized for extended viewing

### Intelligence
- 🧠 **Context-Aware AI** - LLM receives real-time sensor data with every query
- 💬 **Natural Language Interaction** - Ask questions in plain English
- 📈 **Smart Recommendations** - AI-powered watering and care suggestions
- 🔍 **System Diagnostics** - Built-in health checks and diagnostic tools

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Web Browser (Client)                    │
│              React + Vite + Tailwind + Socket.IO            │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/WebSocket
                        │ Port 3000 → 5000
┌───────────────────────▼─────────────────────────────────────┐
│                   Flask API Server                          │
│              REST API + Socket.IO (Port 5000)               │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                  System State Manager                       │
│            (Thread-safe data coordination)                  │
└─┬─────┬─────┬──────┬──────┬──────┬───────────────────────┬──┘
  │     │     │      │      │      │                       │
  ▼     ▼     ▼      ▼      ▼      ▼                       ▼
┌───┐ ┌───┐ ┌────┐ ┌───┐ ┌────┐ ┌────┐              ┌──────────┐
│DHT│ │LED│ │UART│ │BTN│ │SERV│ │ LLM│              │  Ollama  │
│ 22│ │Ctl│ │ESP │ │HDL│ │ O  │ │ IF │◄────────────►│  Service │
└─┬─┘ └─┬─┘ └──┬─┘ └─┬─┘ └──┬─┘ └────┘              │llama3.2  │
  │     │      │     │      │                       └──────────┘
  ▼     ▼      ▼     ▼      ▼
┌──────────────────────────────────┐
│     Raspberry Pi 5 GPIO          │
│  (Hardware Pins & Interfaces)    │
└──────────────────────────────────┘
```

### Component Overview

**Backend (Python)**
- `api_server.py` - Flask + Socket.IO REST API and WebSocket server
- `main.py` - Main system orchestrator with interactive mode
- `iot/libs/` - Modular hardware and software components:
  - `dht_sensor.py` - Temperature/humidity sensor thread
  - `uart_handler.py` - ESP32 soil sensor communication thread
  - `led_controller.py` - LED status indicator controller
  - `button_handler.py` - Button press event handler thread
  - `servo_controller.py` - Irrigation servo control
  - `system_state.py` - Thread-safe state manager
  - `llm_interface.py` - Local LLM integration (Ollama)

**Frontend (React)**
- Modern single-page application with real-time updates
- Components: Dashboard, Status Cards, Charts, Chat Interface, System Info
- WebSocket connection for live sensor data
- REST API for commands (irrigation, chat)

---

## 🔧 Hardware Requirements

### Core Components
- **Raspberry Pi 5** (4GB+ RAM recommended)
- **DHT22 Sensor** - Temperature and humidity (GPIO 16)
- **ESP32** - Soil moisture sensor controller (UART connection)
- **Capacitive Soil Moisture Sensor** - Connected to ESP32
- **3x LEDs** - Status indicators:
  - Red LED (GPIO 13) - Dry soil
  - Yellow LED (GPIO 19) - Medium moisture
  - Green LED (GPIO 26) - Ideal moisture
- **Push Button** - Manual irrigation trigger (GPIO 20)
- **Servo Motor** - Water pump control (GPIO 12)
- **Power Supply** - 5V 3A+ for Raspberry Pi
- **Breadboard and Jumper Wires**

### Optional Components
- Water reservoir/container
- Tubing for irrigation
- 3x 220Ω resistors for LEDs
- 10kΩ pull-up resistor for button

### Pin Connections

| Component | GPIO Pin | Notes |
|-----------|----------|-------|
| DHT22 Data | GPIO 16 (Pin 36) | 3.3V/5V power |
| Red LED | GPIO 13 (Pin 33) | Via 220Ω resistor |
| Yellow LED | GPIO 19 (Pin 35) | Via 220Ω resistor |
| Green LED | GPIO 26 (Pin 37) | Via 220Ω resistor |
| Button | GPIO 20 (Pin 38) | Internal pull-up |
| Servo PWM | GPIO 12 (Pin 32) | 5V power recommended |
| ESP32 UART | `/dev/ttyAMA0` | TX→RX, RX→TX, GND |

---

## 💻 Software Stack

### Backend
- **Python 3.7+**
- **Flask** - Web framework
- **Flask-SocketIO** - WebSocket support
- **Flask-CORS** - Cross-origin resource sharing
- **gpiozero** - GPIO control
- **adafruit-circuitpython-dht** - DHT22 sensor library
- **pyserial** - UART communication
- **ollama** - Local LLM integration

### Frontend
- **Node.js 24.x**
- **React 18** - UI framework
- **Vite 5** - Build tool and dev server
- **Tailwind CSS 3** - Styling framework
- **Socket.IO Client 4** - WebSocket client
- **Recharts 2** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icon library

### AI/LLM
- **Ollama** - Local LLM runtime
- **llama3.2:1b** - Small, efficient language model

---

## 🚀 Quick Start

### 1. Automated Setup (Recommended)

```bash
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code
./start_web_ui.sh
```

This script will:
- ✅ Check and install Python dependencies
- ✅ Install nvm and Node.js 24 automatically
- ✅ Install Node.js dependencies
- ✅ Start the Flask API server
- ✅ Start the React development server
- ✅ Open the web UI automatically

### 2. Access the Web Interface

**From the Raspberry Pi:**
```
http://localhost:3000
```

**From another device on the same network:**
```
http://<raspberry-pi-ip>:3000
```

Find your Pi's IP address:
```bash
hostname -I
```

---

## 📦 Installation

### Prerequisites

1. **Update System**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Python 3 and pip**
   ```bash
   sudo apt install python3 python3-pip python3-venv -y
   ```

3. **Install System Dependencies**
   ```bash
   sudo apt install git libgpiod2 -y
   ```

### Step 1: Clone the Repository

```bash
cd /home/rasp5/Documents/Final_Project
git clone <your-repo-url> PlantTalker
cd PlantTalker
```

### Step 2: Python Environment Setup

```bash
cd src
python3 -m venv venv_planttalker
source venv_planttalker/bin/activate
pip install -r requirements.txt
```

**requirements.txt** should contain:
```
flask
flask-socketio
flask-cors
gpiozero
adafruit-circuitpython-dht
pyserial
ollama
```

### Step 3: Install Node.js 24

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 24
nvm install 24
nvm use 24

# Verify installation
node -v  # Should show v24.x.x
npm -v   # Should show 11.x.x
```

### Step 4: Install Frontend Dependencies

```bash
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code/ui
npm install
```

### Step 5: Install Ollama (Optional but Recommended)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve &

# Pull the language model
ollama pull llama3.2:1b

# Verify installation
python3 ../check_ollama.py
```

**Note:** Without Ollama, the AI chat will use mock responses based on sensor data.

### Step 6: Hardware Setup

1. Connect all components according to the pin diagram above
2. Verify connections with test scripts:
   ```bash
   cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code
   python3 diagnose.py
   ```

---

## 📖 Usage

### Method 1: Web Interface (Recommended)

**Start Everything:**
```bash
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code
./start_web_ui.sh
```

**Access Dashboard:**
- Navigate to `http://<your-pi-ip>:3000`
- View real-time sensor data
- Chat with AI assistant
- Trigger manual irrigation
- View analytics charts

**Stop Servers:**
- Press `Ctrl+C` in the terminal
- Or kill the API server process: `pkill -f api_server.py`

### Method 2: Command Line Interface

**Interactive System Mode:**
```bash
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code/iot
python3 main.py
```

Features:
- Real-time sensor monitoring
- Status updates every 30 seconds
- Button-triggered irrigation
- Automatic LED indicators
- LLM chat interface (type 'chat' in interactive mode)

**Standalone Chat Mode:**
```bash
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code/iot/libs
python3 chat.py
```

Chat commands:
- `status` - Display current system state
- `reset` - Clear conversation history
- `exit` or `quit` - Exit chat mode

### Method 3: API Server Only

```bash
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code
python3 api_server.py
```

Then access via REST API or WebSocket (see API Documentation below).

---

## 📁 Project Structure

```
PlantTalker/
├── README.md                          # This file
├── LICENSE                            # License file
├── .gitignore                         # Git ignore rules
│
├── src/
│   ├── requirements.txt               # Python dependencies
│   ├── venv_planttalker/             # Python virtual environment
│   │
│   ├── code/                          # Main application code
│   │   ├── start_web_ui.sh           # Automated startup script
│   │   ├── check_connection.sh       # Connection diagnostic tool
│   │   ├── api_server.py             # Flask API + Socket.IO server
│   │   │
│   │   ├── iot/                       # IoT system core
│   │   │   ├── main.py               # Main system orchestrator
│   │   │   └── libs/                 # Component libraries
│   │   │       ├── dht_sensor.py     # DHT22 temperature/humidity
│   │   │       ├── uart_handler.py   # ESP32 UART communication
│   │   │       ├── led_controller.py # LED status indicators
│   │   │       ├── button_handler.py # Button event handling
│   │   │       ├── servo_controller.py # Servo irrigation control
│   │   │       ├── system_state.py   # State coordination
│   │   │       ├── llm_interface.py  # LLM chat interface
│   │   │       ├── chat.py           # Standalone chat mode
│   │   │       └── check_ollama.py   # Ollama verification
│   │   │
│   │   ├── ui/                        # React web interface
│   │   │   ├── src/
│   │   │   │   ├── App.jsx           # Main React app
│   │   │   │   ├── main.jsx          # React entry point
│   │   │   │   ├── index.css         # Global styles
│   │   │   │   └── components/       # React components
│   │   │   │       ├── Header.jsx
│   │   │   │       ├── Dashboard.jsx
│   │   │   │       ├── StatusCards.jsx
│   │   │   │       ├── PlantStatus.jsx
│   │   │   │       ├── ControlPanel.jsx
│   │   │   │       ├── ChatInterface.jsx
│   │   │   │       ├── SensorChart.jsx
│   │   │   │       ├── SystemInfo.jsx
│   │   │   │       └── ConnectionStatus.jsx
│   │   │   ├── public/               # Static assets
│   │   │   ├── index.html            # HTML template
│   │   │   ├── package.json          # Node.js dependencies
│   │   │   ├── vite.config.js        # Vite configuration
│   │   │   ├── tailwind.config.js    # Tailwind CSS config
│   │   │   ├── .env.example          # Environment template
│   │   │   ├── .gitignore            # UI-specific ignores
│   │   │   └── README.md             # UI documentation
│   │   │
│   │   └── logs/                      # Application logs
│   │       └── api_server.log
│   │
│   └── docs/
│       └── README.md                  # System architecture docs
│
└── [Additional configuration files]
```

---

## 🌐 Web Interface

### Dashboard Features

**1. Status Cards**
- Real-time temperature (°C and °F)
- Air humidity percentage
- Soil moisture percentage
- Total irrigation count

**2. Plant Status Visualization**
- Animated plant graphic
- Color-coded health indicator
- Status message (Dry/Medium/Ideal)
- Visual moisture representation

**3. Control Panel**
- Manual irrigation button
- Irrigation statistics
- Last irrigation timestamp
- System uptime

**4. Analytics Tab**
- Historical sensor data charts
- Temperature trend line
- Humidity trend line
- Soil moisture trend line
- Last 20 data points with real-time updates

**5. AI Assistant Tab**
- Natural language chat interface
- Context-aware responses
- Conversation history
- Reset conversation option
- Real-time sensor context

**6. System Info Tab**
- Hardware configuration details
- Pin mappings and specifications
- Software versions and stack
- API endpoint documentation
- Current sensor readings summary

### Connection Status

- **Green indicator** - Connected and receiving updates
- **Red indicator** - Connection lost, attempting to reconnect
- Automatic reconnection with exponential backoff
- Visual feedback for connection state

---

## 🔌 API Documentation

### Base URL
```
http://<raspberry-pi-ip>:5000
```

### REST Endpoints

#### GET /api/health
**Health check endpoint**

**Response:**
```json
{
  "status": "healthy",
  "running": true,
  "timestamp": 1234567890.123
}
```

#### GET /api/status
**Get current system status**

**Response:**
```json
{
  "success": true,
  "data": {
    "temperature_c": 22.5,
    "temperature_f": 72.5,
    "humidity": 65.3,
    "soil_moisture": 45.8,
    "plant_status": "medium",
    "led_status": "yellow",
    "irrigation_count": 12,
    "last_irrigation": "2024-01-15 14:30:22",
    "button_presses": 8
  },
  "timestamp": 1234567890.123
}
```

#### POST /api/irrigate
**Trigger manual irrigation**

**Response:**
```json
{
  "success": true,
  "message": "Irrigation completed"
}
```

#### POST /api/chat
**Send message to AI assistant**

**Request Body:**
```json
{
  "message": "How is my plant doing?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Your plant is doing well! The current conditions are...",
  "timestamp": 1234567890.123
}
```

#### POST /api/chat/reset
**Reset conversation history**

**Response:**
```json
{
  "success": true,
  "message": "Conversation history cleared"
}
```

### WebSocket Events

**Connect to:** `ws://<raspberry-pi-ip>:5000`

#### Client → Server Events

**connect**
```javascript
socket.on('connect', () => {
  console.log('Connected to server');
});
```

**request_status**
```javascript
socket.emit('request_status');
```

#### Server → Client Events

**connected**
```javascript
socket.on('connected', (data) => {
  console.log(data.message);
});
```

**status_update** (every 2 seconds)
```javascript
socket.on('status_update', (data) => {
  console.log('Temperature:', data.temperature_c);
  console.log('Humidity:', data.humidity);
  console.log('Soil Moisture:', data.soil_moisture);
});
```

**irrigation_event**
```javascript
socket.on('irrigation_event', (data) => {
  console.log('Irrigation at:', data.timestamp);
  console.log('Success:', data.success);
  console.log('Manual:', data.manual);
});
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Web UI Shows "Connection Lost"

**Symptoms:** Web page loads but shows disconnection message

**Solutions:**
```bash
# Run connection diagnostic
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code
./check_connection.sh

# Check if API server is running
ps aux | grep api_server.py

# Check API logs
cat logs/api_server.log

# Verify API is responding
curl http://localhost:5000/api/health
```

**See:** `src/code/WEBSOCKET_TROUBLESHOOTING.md` for detailed steps

#### 2. DHT22 Sensor Read Errors

**Symptoms:** Temperature/humidity showing as "N/A" or None

**Solutions:**
- Check GPIO 16 connection
- Verify 3.3V/5V power supply
- Increase read interval in code (default: 10 seconds)
- DHT22 sensors can be temperamental - occasional timeouts are normal

#### 3. ESP32 Not Sending Data

**Symptoms:** Soil moisture always shows "N/A" or 0%

**Solutions:**
```bash
# Check UART connection
ls -l /dev/ttyAMA0

# Test UART manually
sudo cat /dev/ttyAMA0

# Verify ESP32 is powered and programmed
# Check ESP32 baud rate matches (115200)
```

#### 4. LEDs Not Working

**Symptoms:** LEDs don't light up or wrong LED is lit

**Solutions:**
```bash
# Test LEDs individually
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code
python3 test_leds.py

# Check GPIO connections (13, 19, 26)
# Verify 220Ω resistors are in place
# Test LED polarity (long leg = +, short leg = -)
```

#### 5. Servo Jitter or Not Moving

**Symptoms:** Servo vibrates, doesn't move, or moves erratically

**Solutions:**
- Ensure adequate 5V power supply (not from Pi's 5V pin if other devices drawing power)
- Verify GPIO 12 connection
- Check pulse width settings in code
- Servo PWM is disabled after movement to prevent jitter

#### 6. AI Chat Returns Mock Responses

**Symptoms:** Chat works but responses seem generic

**Solutions:**
```bash
# Check Ollama status
python3 check_ollama.py

# Start Ollama service
ollama serve

# Verify model is installed
ollama list

# Pull model if missing
ollama pull llama3.2:1b
```

#### 7. Node.js / npm Issues

**Symptoms:** UI won't start, npm errors

**Solutions:**
```bash
# Check Node.js version (need 24.x)
node -v

# Install correct version
nvm install 24
nvm use 24

# Clear npm cache and reinstall
cd src/code/ui
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Diagnostic Tools

**System Diagnostics:**
```bash
cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code
python3 diagnose.py
```

**Connection Check:**
```bash
./check_connection.sh
```

**Hardware Test:**
```bash
python3 test_hardware.py
```

**Ollama Verification:**
```bash
python3 check_ollama.py
```

**Node.js Check:**
```bash
./check_node.sh
```

### Getting Help

1. Check the troubleshooting guides:
   - `WEBSOCKET_TROUBLESHOOTING.md` - Web UI connection issues
   - `TROUBLESHOOTING_STEPS.md` - General system issues
   - `ui/README.md` - Frontend-specific issues

2. Check logs:
   - API Server: `logs/api_server.log`
   - Browser Console: Press F12 → Console tab

3. Verify hardware connections and power supply

4. Ensure all dependencies are installed correctly

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs** - Open an issue with detailed information
2. **Suggest Features** - Share your ideas for improvements
3. **Submit Pull Requests** - Fix bugs or add features
4. **Improve Documentation** - Help make the docs clearer

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- **Python:** Follow PEP 8 guidelines
- **JavaScript/React:** Use ES6+ features, functional components with hooks
- **Comments:** Document complex logic and hardware interactions
- **Thread Safety:** Use locks for shared data access

---

## 📄 License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Adafruit** - DHT sensor library
- **gpiozero** - Simple GPIO control
- **Ollama** - Local LLM runtime
- **React Team** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Flask Team** - Lightweight web framework

---

## 📞 Contact & Support

- **Documentation:** See `src/docs/` and `src/code/ui/` READMEs
- **Issues:** Use the issue tracker on GitHub
- **Discussions:** Join the community discussions

---

## 🎯 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Multi-plant support
- [ ] Historical data storage (SQLite/PostgreSQL)
- [ ] Email/SMS notifications
- [ ] Weather API integration
- [ ] Automated watering schedules
- [ ] Camera integration for plant photos
- [ ] Machine learning for plant health prediction
- [ ] Voice control integration
- [ ] Cloud dashboard option

---

## 📊 System Status

Current Version: **1.0.0**

**Tested On:**
- Raspberry Pi 5 (4GB RAM)
- Raspberry Pi OS (Bookworm, 64-bit)
- Python 3.11.2
- Node.js 24.11.1
- Ollama 0.1.x

---

**Made with ❤️  for plants and technology enthusiasts**

*Happy planting! 🌱*
