import time
import board
import adafruit_dht
from threading import Thread, Lock


class DHTSensor:
    def __init__(self, pin=board.D16, read_interval=10):
        self.dht_device = adafruit_dht.DHT22(pin)
        self.read_interval = read_interval
        self.temperature_c = None
        self.temperature_f = None
        self.humidity = None
        self.lock = Lock()
        self.running = False
        self.thread = None

    def start(self):
        print("[DHT] Starting DHT22 sensor thread")
        self.running = True
        self.thread = Thread(target=self._run, daemon=True)
        self.thread.start()

    def stop(self):
        print("[DHT] Stopping DHT22 sensor thread")
        self.running = False
        if self.thread:
            self.thread.join()

    def _run(self):
        print("[DHT] DHT22 sensor thread running")
        while self.running:
            try:
                temp_c = self.dht_device.temperature
                temp_f = temp_c * 9/5 + 32
                hum = self.dht_device.humidity

                with self.lock:
                    self.temperature_c = temp_c
                    self.temperature_f = temp_f
                    self.humidity = hum

                print(f"[DHT] Temp: {temp_f:.1f}F / {temp_c:.1f}C | Humidity: {hum:.1f}%")

            except RuntimeError as error:
                print(f"[DHT] Error: {error.args[0]}")
            except Exception as e:
                print(f"[DHT] Exception: {e}")

            time.sleep(self.read_interval)

    def get_data(self):
        with self.lock:
            return {
                'temperature_c': self.temperature_c,
                'temperature_f': self.temperature_f,
                'humidity': self.humidity
            }