import time
from gpiozero import LED
from threading import Lock


class LEDController:
    def __init__(self, red_pin=13, yellow_pin=19, green_pin=26):
        print(f"[LED] Initializing LED controller...")
        print(f"[LED] Red LED on GPIO {red_pin}")
        print(f"[LED] Yellow LED on GPIO {yellow_pin}")
        print(f"[LED] Green LED on GPIO {green_pin}")
        
        try:
            self.led_red = LED(red_pin)
            print(f"[LED] Red LED initialized successfully")
        except Exception as e:
            print(f"[LED] ERROR initializing Red LED: {e}")
            raise
        
        try:
            self.led_yellow = LED(yellow_pin)
            print(f"[LED] Yellow LED initialized successfully")
        except Exception as e:
            print(f"[LED] ERROR initializing Yellow LED: {e}")
            raise
        
        try:
            self.led_green = LED(green_pin)
            print(f"[LED] Green LED initialized successfully")
        except Exception as e:
            print(f"[LED] ERROR initializing Green LED: {e}")
            raise
        
        self.lock = Lock()
        self.current_state = None
        
        # Test all LEDs at startup
        print("[LED] Testing all LEDs at startup...")
        self.led_red.off()
        self.led_yellow.off()
        self.led_green.off()
        print("[LED] All LEDs turned off")
        time.sleep(0.5)
        
        print("[LED] Quick blink test...")
        self.led_red.on()
        time.sleep(0.2)
        self.led_red.off()
        self.led_yellow.on()
        time.sleep(0.2)
        self.led_yellow.off()
        self.led_green.on()
        time.sleep(0.2)
        self.led_green.off()
        print("[LED] Blink test complete")
        print("[LED] LED controller ready")

    def update_leds(self, soil_moisture):
        with self.lock:
            print(f"[LED] Updating LEDs based on soil moisture: {soil_moisture}%")
            if soil_moisture == 0:
                self._set_state('sensor_out')
            elif 1 <= soil_moisture < 35:
                self._set_state('dry')
            elif 36 <= soil_moisture <= 65:
                self._set_state('medium')
            else:
                self._set_state('ideal')

    def _set_state(self, state):
        print(f"[LED] Setting state to: {state}")
        
        try:
            if state == 'sensor_out' or state == 'dry':
                print(f"[LED] Turning RED on, others off")
                self.led_red.on()
                self.led_yellow.off()
                self.led_green.off()
                print(f"[LED] State: RED ON (Status: {state})")
                print(f"[LED] Verification - Red: {self.led_red.is_lit}, Yellow: {self.led_yellow.is_lit}, Green: {self.led_green.is_lit}")
            elif state == 'medium':
                print(f"[LED] Turning YELLOW on, others off")
                self.led_red.off()
                self.led_yellow.on()
                self.led_green.off()
                print(f"[LED] State: YELLOW ON (Status: {state})")
                print(f"[LED] Verification - Red: {self.led_red.is_lit}, Yellow: {self.led_yellow.is_lit}, Green: {self.led_green.is_lit}")
            elif state == 'ideal':
                print(f"[LED] Turning GREEN on, others off")
                self.led_red.off()
                self.led_yellow.off()
                self.led_green.on()
                print(f"[LED] State: GREEN ON (Status: {state})")
                print(f"[LED] Verification - Red: {self.led_red.is_lit}, Yellow: {self.led_yellow.is_lit}, Green: {self.led_green.is_lit}")
            else:
                print(f"[LED] WARNING: Unknown state '{state}'")
            
            self.current_state = state
            
        except Exception as e:
            print(f"[LED] ERROR setting state: {e}")
            import traceback
            traceback.print_exc()

    def get_state(self):
        with self.lock:
            return self.current_state

    def cleanup(self):
        with self.lock:
            print("[LED] Turning off all LEDs")
            self.led_red.off()
            self.led_yellow.off()
            self.led_green.off()
