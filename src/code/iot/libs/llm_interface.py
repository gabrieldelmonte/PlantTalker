import os
from threading import Lock


class LLMInterface:
    def __init__(self, system_state, model="llama3.2:1b"):
        self.system_state = system_state
        self.lock = Lock()
        self.conversation_history = []
        self.model = model
        self.use_mock = False
        
        try:
            import ollama
            self.client = ollama
            print(f"Ollama client initialized with model: {self.model}")
        except ImportError:
            print("Warning: ollama package not installed. Install with: pip install ollama")
            print("Running in mock mode.")
            self.use_mock = True
        except Exception as e:
            print(f"Warning: Failed to initialize Ollama: {e}")
            print("Running in mock mode.")
            self.use_mock = True
    
    def chat(self, user_message):
        with self.lock:
            context = self.system_state.get_context_string()
            full_message = f"{context}\n\nUser message: {user_message}"
            
            if self.use_mock:
                return self._mock_response(user_message, context)
            
            try:
                self.conversation_history.append({
                    "role": "user",
                    "content": full_message
                })
                
                messages = [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that helps users understand and manage their plant care system. Provide clear, concise answers based on the current system state provided in each message."
                    }
                ] + self.conversation_history
                
                response = self.client.chat(
                    model=self.model,
                    messages=messages
                )
                
                assistant_message = response['message']['content']
                
                self.conversation_history.append({
                    "role": "assistant",
                    "content": assistant_message
                })
                
                if len(self.conversation_history) > 20:
                    self.conversation_history = self.conversation_history[-20:]
                
                return assistant_message
                
            except Exception as e:
                print(f"LLM Error: {e}")
                return f"Error communicating with Ollama: {str(e)}"
    
    def _mock_response(self, user_message, context):
        state = self.system_state.get_full_state()
        
        response_parts = ["Based on the current system state:"]
        
        if state['soil_moisture'] is not None:
            moisture = state['soil_moisture']
            if moisture == 0:
                response_parts.append("The moisture sensor is not in the soil. Please check the sensor placement.")
            elif moisture < 35:
                response_parts.append(f"The soil is quite dry at {moisture}%. Your plant needs watering soon.")
            elif moisture <= 63:
                response_parts.append(f"The soil moisture is at {moisture}%, which is moderate. Monitor it regularly.")
            else:
                response_parts.append(f"The soil moisture is at {moisture}%, which is ideal for most plants.")
        
        if state['temperature_c'] is not None:
            response_parts.append(f"The ambient temperature is {state['temperature_c']:.1f}C.")
        
        if state['humidity'] is not None:
            response_parts.append(f"The air humidity is {state['humidity']:.1f}%.")
        
        if state['irrigation_count'] > 0:
            response_parts.append(f"The system has performed {state['irrigation_count']} irrigation(s) so far.")
        
        response_parts.append(f"\nYour question: '{user_message}' - In a full implementation with Ollama access, I would provide a detailed answer based on this context.")
        
        return " ".join(response_parts)
    
    def reset_conversation(self):
        with self.lock:
            self.conversation_history = []
            print("Conversation history cleared.")