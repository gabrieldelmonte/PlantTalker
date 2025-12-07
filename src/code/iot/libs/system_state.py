import time
from threading import Lock


class SystemState:
    def __init__(self):
        print("[STATE] Initializing system state manager")
        self.lock = Lock()
        self.dht_sensor = None
        self.uart_handler = None
        self.led_controller = None
        self.button_handler = None
        self.servo_controller = None

    def set_components(self, dht_sensor, uart_handler, led_controller, button_handler, servo_controller):
        print("[STATE] Registering all system components")
        with self.lock:
            self.dht_sensor = dht_sensor
            self.uart_handler = uart_handler
            self.led_controller = led_controller
            self.button_handler = button_handler
            self.servo_controller = servo_controller
        print("[STATE] All components registered successfully")

    def get_full_state(self):
        with self.lock:
            dht_data = self.dht_sensor.get_data() if self.dht_sensor else {}
            uart_data = self.uart_handler.get_data() if self.uart_handler else {}
            button_data = self.button_handler.get_state() if self.button_handler else {}
            servo_data = self.servo_controller.get_state() if self.servo_controller else {}
            led_state = self.led_controller.get_state() if self.led_controller else None

            soil_moisture = uart_data.get('soil_moisture')

            if soil_moisture is not None:
                if soil_moisture == 0:
                    plant_status = 'sensor_out'
                    plant_message = 'Sensor is not in the soil'
                elif 1 <= soil_moisture < 35:
                    plant_status = 'dry'
                    plant_message = 'Plant is dehydrated and needs water'
                elif 36 <= soil_moisture <= 65:
                    plant_status = 'medium'
                    plant_message = 'Soil moisture is medium, manual watering optional'
                else:
                    plant_status = 'ideal'
                    plant_message = 'Soil moisture is ideal, no watering needed'
            else:
                plant_status = 'unknown'
                plant_message = 'No soil moisture data available'

            return {
                'temperature_c': dht_data.get('temperature_c'),
                'temperature_f': dht_data.get('temperature_f'),
                'humidity': dht_data.get('humidity'),
                'soil_moisture': soil_moisture,
                'plant_status': plant_status,
                'plant_message': plant_message,
                'led_state': led_state,
                'irrigation_count': servo_data.get('irrigation_count', 0),
                'last_irrigation_time': servo_data.get('last_irrigation_time'),
                'button_press_count': button_data.get('press_count', 0),
                'last_update_time': uart_data.get('last_update_time')
            }

    def get_context_string(self):
        state = self.get_full_state()

        context_parts = []
        context_parts.append("Current Plant System State:")

        if state['temperature_c'] is not None:
            context_parts.append(f"Temperature: {state['temperature_c']:.1f}C ({state['temperature_f']:.1f}F)")
        else:
            context_parts.append("Temperature: Not available")

        if state['humidity'] is not None:
            context_parts.append(f"Air Humidity: {state['humidity']:.1f}%")
        else:
            context_parts.append("Air Humidity: Not available")

        if state['soil_moisture'] is not None:
            context_parts.append(f"Soil Moisture: {state['soil_moisture']}%")
        else:
            context_parts.append("Soil Moisture: Not available")

        context_parts.append(f"Plant Status: {state['plant_message']}")
        context_parts.append(f"LED Indicator: {state['led_state'] if state['led_state'] else 'unknown'}")
        context_parts.append(f"Total Irrigations: {state['irrigation_count']}")

        if state['last_irrigation_time']:
            time_since = time.time() - state['last_irrigation_time']
            context_parts.append(f"Last Irrigation: {time_since/60:.1f} minutes ago")
        else:
            context_parts.append("Last Irrigation: Never")

        return "\n".join(context_parts)
