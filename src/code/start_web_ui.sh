#!/bin/bash

# Plant Talker Web UI Startup Script
# This script starts both the Flask API server and React development server

echo "=========================================="
echo "Plant Talker Web UI Startup"
echo "=========================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "api_server.py" ]; then
    echo "ERROR: api_server.py not found!"
    echo "Please run this script from the code directory:"
    echo "cd /home/rasp5/Documents/Final_Project/PlantTalker/src/code"
    exit 1
fi

# Check Python dependencies
echo "[1/6] Checking Python dependencies..."
python3 -c "import flask, flask_socketio, flask_cors" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing Python dependencies..."
    pip install flask flask-socketio flask-cors
fi
echo "✓ Python dependencies OK"
echo ""

# Check if UI directory exists
if [ ! -d "ui" ]; then
    echo "ERROR: ui directory not found!"
    exit 1
fi

# Check/Install nvm and Node.js 24
echo "[2/6] Checking Node.js installation..."

# Check if nvm is installed
if [ ! -d "$HOME/.nvm" ]; then
    echo "nvm not found. Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    
    # Load nvm immediately
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    echo "✓ nvm installed successfully"
else
    echo "✓ nvm is already installed"
    # Load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing Node.js 24..."
    nvm install 24
    nvm use 24
elif [[ "$(node -v)" != v24* ]]; then
    echo "Current Node.js version: $(node -v)"
    echo "Installing Node.js 24..."
    nvm install 24
    nvm use 24
else
    echo "✓ Node.js 24 is already installed"
    nvm use 24
fi

# Verify Node.js version
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "✓ Node.js version: $NODE_VERSION"
echo "✓ npm version: $NPM_VERSION"

# Verify we have Node 24
if [[ "$NODE_VERSION" != v24* ]]; then
    echo "ERROR: Node.js 24 is required but got $NODE_VERSION"
    echo "Please run: nvm install 24 && nvm use 24"
    exit 1
fi
echo ""

cd ui

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[3/6] Installing Node.js dependencies (this may take a few minutes)..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: npm install failed!"
        exit 1
    fi
else
    echo "[3/6] Node.js dependencies already installed"
fi
echo "✓ Node.js dependencies OK"
echo ""

cd ..

# Create log directory
mkdir -p logs

echo "[4/6] Starting Flask API Server..."
echo "API will be available at: http://0.0.0.0:5000"
python3 api_server.py > logs/api_server.log 2>&1 &
API_PID=$!
echo "✓ API Server started (PID: $API_PID)"
echo ""

# Wait for API to start
echo "[5/6] Waiting for API server to initialize..."
sleep 3

# Check if API is running
if ! kill -0 $API_PID 2>/dev/null; then
    echo "ERROR: API server failed to start!"
    echo "Check logs/api_server.log for details"
    exit 1
fi
echo "✓ API Server is running"
echo ""

cd ui

echo "[6/6] Starting React Development Server..."
echo "Web UI will be available at: http://localhost:3000"
echo ""
echo "=========================================="
echo "System is starting up..."
echo "=========================================="
echo ""
echo "Node.js: $NODE_VERSION"
echo "npm: $NPM_VERSION"
echo ""
echo "Please wait for the browser to open automatically."
echo "If it doesn't open, navigate to: http://localhost:3000"
echo ""
echo "To stop the servers:"
echo "  - Press Ctrl+C in this terminal"
echo "  - Or run: kill $API_PID"
echo ""
echo "Logs are saved in: logs/"
echo "  - API Server: logs/api_server.log"
echo ""

# Start the React dev server (this will block)
npm run dev

# Cleanup on exit
echo ""
echo "Shutting down servers..."
kill $API_PID 2>/dev/null
echo "Done!"