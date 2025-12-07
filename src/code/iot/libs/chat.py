#!/usr/bin/env python3
import time
from dht_sensor import DHTSensor
from uart_handler import UARTHandler
from led_controller import LEDController
from button_handler import ButtonHandler
from servo_controller import ServoController
from system_state import SystemState
from llm_interface import LLMInterface


def main():
    print("Initializing Plant Talker Chat Interface...")
    print("Starting system components...")
    
    dht_sensor = DHTSensor(read_interval=10)
    uart_handler = UARTHandler(read_interval=1)
    led_controller = LEDController()
    button_handler = ButtonHandler()
    servo_controller = ServoController()
    system_state = SystemState()
    
    system_state.set_components(
        dht_sensor,
        uart_handler,
        led_controller,
        button_handler,
        servo_controller
    )
    
    dht_sensor.start()
    uart_handler.start()
    
    print("Waiting for initial sensor data (5 seconds)...")
    time.sleep(5)
    
    llm_interface = LLMInterface(system_state)
    
    print("\n" + "=" * 60)
    print("Plant Talker Chat Interface")
    print("=" * 60)
    print("Commands:")
    print("  'exit' or 'quit' - Exit the chat")
    print("  'reset' - Clear conversation history")
    print("  'status' - Show current system state")
    print("=" * 60 + "\n")
    
    try:
        while True:
            user_input = input("You: ").strip()
            
            if user_input.lower() in ['exit', 'quit']:
                print("Goodbye!")
                break
            
            if user_input.lower() == 'reset':
                llm_interface.reset_conversation()
                continue
            
            if user_input.lower() == 'status':
                print("\n" + system_state.get_context_string() + "\n")
                continue
            
            if not user_input:
                continue
            
            response = llm_interface.chat(user_input)
            print(f"\nAssistant: {response}\n")
    
    except KeyboardInterrupt:
        print("\nInterrupted by user.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        print("Stopping system components...")
        dht_sensor.stop()
        uart_handler.stop()
        print("Done.")


if __name__ == "__main__":
    main()