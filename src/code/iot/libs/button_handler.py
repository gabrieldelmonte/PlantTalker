import time
from gpiozero import Button
from threading import Thread, Lock


class ButtonHandler:
    def __init__(self, button_pin=20):
        self.button = Button(button_pin)
        self.lock = Lock()
        self.press_count = 0
        self.last_press_time = None
        self.running = False
        self.thread = None
        self.callback = None

    def set_callback(self, callback):
        with self.lock:
            self.callback = callback

    def start(self):
        print("[BUTTON] Starting button handler thread")
        self.running = True
        self.button.when_pressed = self._on_button_press
        self.thread = Thread(target=self._run, daemon=True)
        self.thread.start()

    def stop(self):
        print("[BUTTON] Stopping button handler thread")
        self.running = False
        if self.thread:
            self.thread.join()

    def _on_button_press(self):
        # Update state with lock
        with self.lock:
            self.press_count += 1
            self.last_press_time = time.time()
            callback_to_call = self.callback
        
        # Print and execute callback without holding lock
        print("[BUTTON] Button pressed!")
        
        if callback_to_call:
            try:
                print("[BUTTON] Executing callback...")
                callback_to_call()
                print("[BUTTON] Callback completed")
            except Exception as e:
                print(f"[BUTTON] Callback error: {e}")
                import traceback
                traceback.print_exc()

    def _run(self):
        while self.running:
            time.sleep(0.1)

    def get_state(self):
        with self.lock:
            return {
                'press_count': self.press_count,
                'last_press_time': self.last_press_time,
                'is_pressed': self.button.is_pressed
            }

    def wait_for_press(self, timeout=None):
        self.button.wait_for_press(timeout=timeout)