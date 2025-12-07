import time
from gpiozero import Servo
from threading import Lock


class ServoController:
    def __init__(self, servo_pin=12, min_pulse_width=0.0005, max_pulse_width=0.0025):
        print(f"[SERVO] Initializing servo on pin {servo_pin}")
        print(f"[SERVO] min_pulse_width={min_pulse_width}, max_pulse_width={max_pulse_width}")
        
        try:
            self.servo = Servo(servo_pin, min_pulse_width=min_pulse_width, max_pulse_width=max_pulse_width)
            print("[SERVO] Servo object created")
        except Exception as e:
            print(f"[SERVO] ERROR creating servo: {e}")
            raise
        
        self.servo.value = None
        print(f"[SERVO] Initial servo value set to None")
        self.lock = Lock()
        self.irrigation_count = 0
        self.last_irrigation_time = None
        
        print("[SERVO] Testing servo movement at startup...")
        try:
            self.servo.mid()
            print("[SERVO] Servo moved to mid position")
            time.sleep(0.5)
            self.servo.value = None
            print("[SERVO] Servo disabled")
        except Exception as e:
            print(f"[SERVO] WARNING: Test movement failed: {e}")
        
        time.sleep(0.5)
        print("[SERVO] Servo initialized and ready")

    def irrigate(self):
        print("[SERVO] Irrigate method called")
        print(f"[SERVO] Attempting to acquire lock...")
        
        with self.lock:
            print("[SERVO] Lock acquired, starting irrigation...")
            print(f"[SERVO] Current irrigation count: {self.irrigation_count}")
            
            try:
                print("[SERVO] Step 1: Moving to minimum position")
                self.servo.min()
                print(f"[SERVO] Servo value after min(): {self.servo.value}")
                time.sleep(0.5)

                print("[SERVO] Step 2: Moving to maximum position (watering)")
                self.servo.max()
                print(f"[SERVO] Servo value after max(): {self.servo.value}")
                time.sleep(2)

                print("[SERVO] Step 3: Returning to minimum position")
                self.servo.min()
                print(f"[SERVO] Servo value after min(): {self.servo.value}")
                time.sleep(1)

                print("[SERVO] Step 4: Disabling PWM")
                self.servo.value = None
                print(f"[SERVO] Servo value after disable: {self.servo.value}")

                self.irrigation_count += 1
                self.last_irrigation_time = time.time()
                
                print(f"[SERVO] Irrigation completed successfully (Total: {self.irrigation_count})")
                print("[SERVO] Releasing lock")
                return True
                
            except Exception as e:
                print(f"[SERVO] IRRIGATION ERROR: {e}")
                import traceback
                traceback.print_exc()
                try:
                    self.servo.value = None
                    print("[SERVO] Servo disabled after error")
                except:
                    print("[SERVO] Could not disable servo after error")
                print("[SERVO] Releasing lock after error")
                return False

    def get_state(self):
        with self.lock:
            return {
                'irrigation_count': self.irrigation_count,
                'last_irrigation_time': self.last_irrigation_time
            }

    def cleanup(self):
        with self.lock:
            print("[SERVO] Cleaning up servo")
            try:
                self.servo.value = None
                print("[SERVO] Servo PWM disabled")
            except Exception as e:
                print(f"[SERVO] Error during cleanup: {e}")