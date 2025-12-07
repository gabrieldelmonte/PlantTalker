import time
import serial
from threading import Thread, Lock


class UARTHandler:
    def __init__(self, port='/dev/ttyAMA0', baudrate=115200, timeout=1, read_interval=1):
        self.serial = serial.Serial(port, baudrate, timeout=timeout)
        self.read_interval = read_interval
        self.soil_moisture = None
        self.lock = Lock()
        self.running = False
        self.thread = None
        self.last_update_time = None

    def start(self):
        print("[UART] Starting UART handler thread")
        self.running = True
        self.thread = Thread(target=self._run, daemon=True)
        self.thread.start()

    def stop(self):
        print("[UART] Stopping UART handler thread")
        self.running = False
        if self.thread:
            self.thread.join()
        self.serial.close()

    def _run(self):
        print("[UART] UART handler thread running")
        while self.running:
            try:
                if self.serial.in_waiting > 0:
                    data = self.serial.readline().decode('utf-8').strip()
                    print(f"[UART] Received data: {data}")
                    moisture = self._extract_moisture(data)

                    if moisture is not None:
                        with self.lock:
                            self.soil_moisture = moisture
                            self.last_update_time = time.time()
                        print(f"[UART] Soil moisture updated: {moisture}%")
                    else:
                        print(f"[UART] Failed to parse moisture from: {data}")

            except Exception as e:
                print(f"[UART] Error: {e}")

            time.sleep(self.read_interval)

    def _extract_moisture(self, data):
        try:
            if "Moisture" in data:
                moisture_value = int(data.split('=')[1].replace('%', '').strip())
                print(f"[UART] Extracted moisture value: {moisture_value}%")
                return moisture_value
        except Exception as e:
            print(f"[UART] Failed to extract moisture: {e}")
        return None

    def get_data(self):
        with self.lock:
            return {
                'soil_moisture': self.soil_moisture,
                'last_update_time': self.last_update_time
            }

    def get_soil_moisture(self):
        with self.lock:
            return self.soil_moisture