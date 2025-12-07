# Plant Talker System

A multi-threaded plant monitoring and irrigation system with LLM-based conversational interface for Raspberry Pi 5.

## Overview

This system monitors plant conditions using multiple sensors and provides automated irrigation control. It features a conversational AI interface that allows users to interact with the system and get real-time information about their plant's health.

## System Architecture

The system is built using a modular, multi-threaded architecture where each component runs independently:

- **DHT Sensor Thread**: Reads temperature and humidity data from DHT22 sensor
- **UART Handler Thread**: Receives soil moisture data from ESP32 via serial communication
- **LED Controller**: Updates LED indicators based on soil moisture levels
- **Button Handler Thread**: Monitors button presses for manual irrigation
- **Servo Controller**: Controls irrigation mechanism
- **System State Manager**: Coordinates data between all components
- **LLM Interface**: Provides conversational AI interaction with system context

## Hardware Requirements

- Raspberry Pi 5
- DHT22 Temperature and Humidity Sensor (GPIO 16)
- ESP32 with soil moisture sensor (UART connection)
- 3 LEDs: Red (GPIO 13), Yellow (GPIO 19), Green (GPIO 26)
- Push Button (GPIO 20)
- Servo Motor (GPIO 12)
- Appropriate power supply and wiring

## Software Requirements

```
python3 >= 3.7
adafruit-circuitpython-dht
gpiozero
pyserial
ollama (for LLM functionality)
```

## Installation

1. Install required packages:
```bash
pip install adafruit-circuitpython-dht gpiozero pyserial
```

2. For LLM functionality, install Ollama:
```bash
pip install ollama
```

3. Install and run Ollama with the llama3.2:1b model:
```bash
# Install Ollama from https://ollama.ai
# Pull the model
ollama pull llama3.2:1b
# Start Ollama service
ollama serve
```

## File Structure

```
code/
├── main.py              - Main application orchestrator
├── chat.py              - Standalone chat interface
├── dht_sensor.py        - DHT22 sensor handler
├── uart_handler.py      - ESP32 UART communication
├── led_controller.py    - LED status indicators
├── button_handler.py    - Button event handler
├── servo_controller.py  - Irrigation servo control
├── system_state.py      - System state coordinator
└── llm_interface.py     - LLM conversation handler
```

## Usage

### Running the Main System

```bash
python3 main.py
```

The main system will:
- Start all sensor threads
- Monitor plant conditions continuously
- Update LED indicators automatically
- Enable button-triggered irrigation
- Display status updates every 30 seconds

### Running Chat Mode

```bash
python3 chat.py
```

Chat mode allows you to:
- Ask questions about your plant's current state
- Get recommendations based on sensor data
- View historical irrigation information
- Interact naturally with the system

Available commands in chat mode:
- `status` - Display current system state
- `reset` - Clear conversation history
- `exit` or `quit` - Exit chat mode

## System Behavior

### LED Indicators

- **Red LED**: Soil is dry (moisture < 35%) or sensor not in soil (moisture = 0%)
- **Yellow LED**: Soil moisture is medium (36-63%)
- **Green LED**: Soil moisture is ideal (> 63%)

### Irrigation Logic

The button triggers irrigation based on soil conditions:
- **Dry soil (< 35%)**: Automatic irrigation recommended, press button to activate
- **Medium soil (36-63%)**: Manual irrigation optional
- **Ideal soil (> 63%)**: Irrigation not recommended but can be forced

### Servo Operation

When irrigation is triggered:
1. Servo moves to minimum position (0.5s)
2. Servo moves to maximum position (2s)
3. Servo returns to minimum position (1s)
4. Servo PWM is disabled to prevent jitter

## LLM Integration

The system uses Ollama to run a local small language model (llama3.2:1b) that provides context-aware responses about your plant system. Each user message is automatically prefixed with the current system state, allowing the AI to give relevant, real-time advice. All processing happens locally without requiring external API calls.

### Context Provided to LLM

- Current temperature (Celsius and Fahrenheit)
- Air humidity percentage
- Soil moisture percentage
- Plant status (dry, medium, ideal, or sensor issues)
- LED indicator state
- Total irrigation count
- Time since last irrigation

### Mock Mode

If Ollama is not installed or the service is not running, the system operates in mock mode, providing basic responses based on current sensor readings without requiring the language model.

## Thread Safety

All components use thread-safe operations with locks to prevent race conditions:
- Data reads/writes are protected with locks
- State updates are atomic
- Thread-safe communication between components

## Signal Handling

The system handles shutdown signals gracefully:
- SIGINT (Ctrl+C): Initiates clean shutdown
- SIGTERM: Stops all threads and cleans up GPIO

## Error Handling

Each component includes error handling for:
- Sensor read failures (DHT22 timeout errors)
- UART communication errors
- GPIO access issues
- Ollama connection failures (falls back to mock mode)

## Extending the System

To add new functionality:

1. Create a new class following the existing pattern (thread-safe, lock-protected)
2. Register the component in `SystemState`
3. Update `get_full_state()` and `get_context_string()` methods
4. Integrate in `main.py`

## Troubleshooting

### DHT22 Sensor Errors
- Check GPIO connection (should be on GPIO 16)
- Verify power supply (3.3V or 5V depending on sensor)
- Increase read interval if getting frequent timeouts

### UART Communication Issues
- Verify ESP32 is connected to `/dev/ttyAMA0`
- Check baud rate matches ESP32 (115200)
- Ensure proper ground connection between devices

### Servo Jitter
- Verify power supply is adequate for servo
- Check pulse width settings match your servo specs
- Ensure `servo.value = None` is called after movement

### LED Not Working
- Verify GPIO pin numbers in code match your wiring
- Check LED polarity and current-limiting resistors
- Test GPIO pins with simple blink script

## Safety Notes

- Do not run servo continuously without proper cooling
- Ensure adequate power supply for all components
- Monitor system during initial testing
- Verify water container and tubing are properly secured

## License

This project is provided as-is for educational and personal use.