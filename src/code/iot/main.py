#!/usr/bin/env python3
"""
Interactive Plant Talker System
Allows chat commands while monitoring plant conditions
"""

import time
import signal
import sys
import threading
import select
from libs.dht_sensor import DHTSensor
from libs.uart_handler import UARTHandler
from libs.led_controller import LEDController
from libs.button_handler import ButtonHandler
from libs.servo_controller import ServoController
from libs.system_state import SystemState
from libs.llm_interface import LLMInterface


class PlantTalkerSystemInteractive:
    def __init__(self):
        print("=" * 70)
        print("Initializing Plant Talker System (Interactive Mode)...")
        print("=" * 70)

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
        self.in_chat_mode = False
        
        print("=" * 70)
        print("System initialization complete!")
        print("=" * 70)

    def _on_button_pressed(self):
        if self.in_chat_mode:
            return  # Don't interrupt chat
            
        print("\n" + "=" * 70)
        print("[MAIN] Button press detected - checking irrigation conditions")
        print("=" * 70)
        
        time.sleep(0.2)
        
        state = self.system_state.get_full_state()
        soil_moisture = state['soil_moisture']
        
        print(f"[MAIN] Current soil moisture: {soil_moisture}")

        if soil_moisture is None:
            print("[MAIN] Cannot irrigate: No soil moisture data available")
            print("[MAIN] Waiting 2 seconds for data and trying again...")
            time.sleep(2)
            state = self.system_state.get_full_state()
            soil_moisture = state['soil_moisture']
            print(f"[MAIN] After wait, soil moisture: {soil_moisture}")
            
            if soil_moisture is None:
                print("[MAIN] Still no data available. Irrigation cancelled.")
                print("=" * 70 + "\n")
                return

        if soil_moisture == 0:
            print("[MAIN] Cannot irrigate: Sensor is not in the soil")
            print("=" * 70 + "\n")
            return

        print(f"[MAIN] Proceeding with irrigation check for moisture: {soil_moisture}%")
        
        if soil_moisture < 35:
            print(f"[MAIN] Soil is dry ({soil_moisture}%), initiating irrigation...")
            result = self.servo_controller.irrigate()
            print(f"[MAIN] Irrigation result: {result}")
        elif soil_moisture <= 63:
            print(f"[MAIN] Manual irrigation requested (moisture: {soil_moisture}%)...")
            result = self.servo_controller.irrigate()
            print(f"[MAIN] Irrigation result: {result}")
        else:
            print(f"[MAIN] Soil moisture is ideal ({soil_moisture}%). Irrigation not recommended but proceeding...")
            result = self.servo_controller.irrigate()
            print(f"[MAIN] Irrigation result: {result}")
        
        print("=" * 70 + "\n")

    def _print_status(self, loop_count):
        """Print current system status"""
        print("\n" + "-" * 70)
        print(f"[MAIN] Status Update #{loop_count} - {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 70)
        
        state = self.system_state.get_full_state()
        
        print(f"[MAIN] Temperature: {state['temperature_c']:.1f}C ({state['temperature_f']:.1f}F)" if state['temperature_c'] else "[MAIN] Temperature: Not available")
        print(f"[MAIN] Air Humidity: {state['humidity']:.1f}%" if state['humidity'] else "[MAIN] Air Humidity: Not available")
        print(f"[MAIN] Soil Moisture: {state['soil_moisture']}%" if state['soil_moisture'] is not None else "[MAIN] Soil Moisture: Not available")
        print(f"[MAIN] Plant Status: {state['plant_message']}")
        print(f"[MAIN] LED State: {state['led_state']}")
        print(f"[MAIN] Irrigation Count: {state['irrigation_count']}")
        print(f"[MAIN] Button Presses: {state['button_press_count']}")
        
        soil_moisture = state['soil_moisture']

        if soil_moisture is not None:
            self.led_controller.update_leds(soil_moisture)

            if soil_moisture == 0:
                print("[MAIN] ⚠️  WARNING: Sensor is not in the soil!")
            elif soil_moisture < 35:
                print(f"[MAIN] 🔴 ALERT: Plant is dehydrated (Moisture: {soil_moisture}%). Press button to irrigate.")
            elif soil_moisture <= 63:
                print(f"[MAIN] 🟡 INFO: Soil moisture is medium ({soil_moisture}%). Manual watering optional.")
            else:
                print(f"[MAIN] 🟢 OK: Soil moisture is ideal ({soil_moisture}%).")
        else:
            print("[MAIN] ⚠️  Waiting for soil moisture data from ESP32...")
        
        print("-" * 70)

    def chat_mode(self):
        """Enter chat mode to talk with the LLM"""
        self.in_chat_mode = True
        
        print("\n" + "=" * 70)
        print("Entering Chat Mode")
        print("=" * 70)
        print("Commands:")
        print("  'exit' or 'back' - Return to monitoring")
        print("  'status' - Show current system state")
        print("  'reset' - Clear conversation history")
        print("=" * 70)
        print("Ask anything about your plant system!")
        print("=" * 70 + "\n")

        try:
            while self.in_chat_mode:
                user_input = input("You: ").strip()
                
                if user_input.lower() in ['exit', 'back', 'quit']:
                    print("\nReturning to monitoring mode...\n")
                    break
                
                if user_input.lower() == 'reset':
                    self.llm_interface.reset_conversation()
                    continue
                
                if user_input.lower() == 'status':
                    print("\n" + self.system_state.get_context_string() + "\n")
                    continue
                
                if not user_input:
                    continue
                
                print("\nThinking...")
                response = self.llm_interface.chat(user_input)
                print(f"\nAssistant: {response}\n")

        except KeyboardInterrupt:
            print("\nExiting chat mode...\n")
        except Exception as e:
            print(f"Error in chat mode: {e}")
        finally:
            self.in_chat_mode = False

    def start(self):
        print("\n" + "=" * 70)
        print("Starting all system components...")
        print("=" * 70)

        self.dht_sensor.start()
        self.uart_handler.start()
        self.button_handler.start()

        self.running = True
        print("\n" + "=" * 70)
        print("System is running. Monitoring plant conditions...")
        print("=" * 70)
        print("\nAvailable Commands:")
        print("  Type 'chat' - Enter chat mode to talk with AI")
        print("  Type 'status' - Show current system state")
        print("  Type 'help' - Show commands")
        print("  Press Ctrl+C - Stop system")
        print("=" * 70 + "\n")

        try:
            loop_count = 0
            last_status_time = time.time()
            status_interval = 30  # seconds
            
            while self.running:
                # Check for user input (non-blocking)
                if sys.stdin in select.select([sys.stdin], [], [], 0)[0]:
                    command = sys.stdin.readline().strip().lower()
                    
                    if command == 'chat':
                        self.chat_mode()
                    elif command == 'status':
                        loop_count += 1
                        self._print_status(loop_count)
                    elif command == 'help':
                        print("\nCommands:")
                        print("  chat   - Talk with AI about your plant")
                        print("  status - Show current system state")
                        print("  help   - Show this help message")
                        print("  Ctrl+C - Exit program\n")
                    elif command in ['exit', 'quit']:
                        print("Exiting...")
                        break
                    elif command:
                        print(f"Unknown command: '{command}'. Type 'help' for commands.")
                
                # Print status every 30 seconds
                current_time = time.time()
                if current_time - last_status_time >= status_interval:
                    loop_count += 1
                    self._print_status(loop_count)
                    last_status_time = current_time
                
                time.sleep(0.1)  # Small delay to prevent CPU spinning

        except KeyboardInterrupt:
            print("\n" + "=" * 70)
            print("[MAIN] Shutdown signal received...")
            print("=" * 70)
        finally:
            self.stop()

    def stop(self):
        print("\n" + "=" * 70)
        print("[MAIN] Stopping all system components...")
        print("=" * 70)
        self.running = False

        self.dht_sensor.stop()
        self.uart_handler.stop()
        self.button_handler.stop()
        self.led_controller.cleanup()
        self.servo_controller.cleanup()

        print("=" * 70)
        print("[MAIN] System stopped successfully.")
        print("=" * 70)


def signal_handler(sig, frame):
    print("\nInterrupt signal received. Shutting down...")
    sys.exit(0)


def main():
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    system = PlantTalkerSystemInteractive()

    print("\nStarting system in 3 seconds...")
    time.sleep(3)

    try:
        system.start()
    except Exception as e:
        print(f"Fatal error: {e}")
        import traceback
        traceback.print_exc()
        system.stop()
        sys.exit(1)


if __name__ == "__main__":
    main()