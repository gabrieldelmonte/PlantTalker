#!/usr/bin/env python3
"""
Flask API Server for Plant Talker Web UI
Provides REST API and WebSocket for real-time updates
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import threading
import time
import sys
import os

# Add libs to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'libs'))

from iot.libs.dht_sensor import DHTSensor
from iot.libs.uart_handler import UARTHandler
from iot.libs.led_controller import LEDController
from iot.libs.button_handler import ButtonHandler
from iot.libs.servo_controller import ServoController
from iot.libs.system_state import SystemState
from iot.libs.llm_interface import LLMInterface

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Global system instance
plant_system = None
broadcast_thread = None


class PlantTalkerAPI:
    def __init__(self):
        print("[API] Initializing Plant Talker API...")

        self.dht_sensor = DHTSensor(read_interval=10)
        self.uart_handler = UARTHandler(read_interval=1)
        self.led_controller = LEDController()
        self.button_handler = ButtonHandler()
        self.servo_controller = ServoController()
        self.system_state = SystemState()
        self.llm_interface = LLMInterface(self.system_state)

        self.system_state.set_components(
            self.dht_sensor,
            self.uart_handler,
            self.led_controller,
            self.button_handler,
            self.servo_controller
        )

        self.button_handler.set_callback(self._on_button_pressed)
        self.running = False

        print("[API] System initialized")

    def _on_button_pressed(self):
        print("[API] Button pressed - triggering irrigation check")
        time.sleep(0.2)

        state = self.system_state.get_full_state()
        soil_moisture = state['soil_moisture']

        if soil_moisture is None:
            time.sleep(2)
            state = self.system_state.get_full_state()
            soil_moisture = state['soil_moisture']

        if soil_moisture is not None and soil_moisture > 0:
            result = self.servo_controller.irrigate()
            print(f"[API] Irrigation triggered: {result}")

            # Broadcast irrigation event
            socketio.emit('irrigation_event', {
                'timestamp': time.time(),
                'moisture': soil_moisture,
                'success': result
            })

    def start(self):
        print("[API] Starting system components...")
        self.dht_sensor.start()
        self.uart_handler.start()
        self.button_handler.start()
        self.running = True
        print("[API] All components started")

    def stop(self):
        print("[API] Stopping system components...")
        self.running = False
        self.dht_sensor.stop()
        self.uart_handler.stop()
        self.button_handler.stop()
        self.led_controller.cleanup()
        self.servo_controller.cleanup()
        print("[API] System stopped")

    def get_state(self):
        return self.system_state.get_full_state()

    def irrigate(self):
        return self.servo_controller.irrigate()

    def chat(self, message):
        return self.llm_interface.chat(message)

    def reset_conversation(self):
        self.llm_interface.reset_conversation()


# REST API Endpoints

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current system status"""
    if plant_system is None:
        return jsonify({'error': 'System not initialized'}), 500

    state = plant_system.get_state()
    return jsonify({
        'success': True,
        'data': state,
        'timestamp': time.time()
    })


@app.route('/api/irrigate', methods=['POST'])
def trigger_irrigation():
    """Manually trigger irrigation"""
    if plant_system is None:
        return jsonify({'error': 'System not initialized'}), 500

    print("[API] Manual irrigation requested via API")
    result = plant_system.irrigate()

    # Broadcast to all clients
    socketio.emit('irrigation_event', {
        'timestamp': time.time(),
        'manual': True,
        'success': result
    })

    return jsonify({
        'success': result,
        'message': 'Irrigation completed' if result else 'Irrigation failed'
    })


@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat with LLM"""
    if plant_system is None:
        return jsonify({'error': 'System not initialized'}), 500

    data = request.get_json()
    message = data.get('message', '')

    if not message:
        return jsonify({'error': 'No message provided'}), 400

    print(f"[API] Chat request: {message}")
    response = plant_system.chat(message)

    return jsonify({
        'success': True,
        'response': response,
        'timestamp': time.time()
    })


@app.route('/api/chat/reset', methods=['POST'])
def reset_chat():
    """Reset chat conversation history"""
    if plant_system is None:
        return jsonify({'error': 'System not initialized'}), 500

    plant_system.reset_conversation()

    return jsonify({
        'success': True,
        'message': 'Conversation history cleared'
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'running': plant_system.running if plant_system else False,
        'timestamp': time.time()
    })


# WebSocket Events

@socketio.on('connect')
def handle_connect():
    print('[API] Client connected to WebSocket')
    emit('connected', {'message': 'Connected to Plant Talker API'})


@socketio.on('disconnect')
def handle_disconnect():
    print('[API] Client disconnected from WebSocket')


@socketio.on('request_status')
def handle_status_request():
    """Client requests current status"""
    if plant_system:
        state = plant_system.get_state()
        emit('status_update', state)


def broadcast_status():
    """Broadcast system status to all connected clients periodically"""
    global plant_system

    print("[API] Starting status broadcast thread")

    while plant_system and plant_system.running:
        try:
            state = plant_system.get_state()
            socketio.emit('status_update', state)
            time.sleep(2)  # Update every 2 seconds
        except Exception as e:
            print(f"[API] Broadcast error: {e}")
            time.sleep(5)

    print("[API] Status broadcast thread stopped")


def main():
    global plant_system, broadcast_thread

    print("=" * 70)
    print("Plant Talker API Server")
    print("=" * 70)
    print()

    # Initialize system
    plant_system = PlantTalkerAPI()
    plant_system.start()

    # Wait for initial sensor data
    print("[API] Waiting for initial sensor data (3 seconds)...")
    time.sleep(3)

    # Start broadcast thread
    broadcast_thread = threading.Thread(target=broadcast_status, daemon=True)
    broadcast_thread.start()

    print()
    print("=" * 70)
    print("API Server Starting")
    print("=" * 70)
    print("REST API: http://0.0.0.0:5000")
    print("WebSocket: ws://0.0.0.0:5000")
    print()
    print("Endpoints:")
    print("  GET  /api/status      - Get current system status")
    print("  POST /api/irrigate    - Trigger irrigation")
    print("  POST /api/chat        - Chat with LLM")
    print("  POST /api/chat/reset  - Reset conversation")
    print("  GET  /api/health      - Health check")
    print()
    print("WebSocket Events:")
    print("  status_update        - Real-time status updates")
    print("  irrigation_event     - Irrigation notifications")
    print("=" * 70)
    print()

    try:
        # Start Flask-SocketIO server
        socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)
    except KeyboardInterrupt:
        print("\n[API] Shutting down...")
    finally:
        if plant_system:
            plant_system.stop()


if __name__ == '__main__':
    main()
