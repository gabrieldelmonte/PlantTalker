#!/usr/bin/env python3
"""
Helper script to check Ollama installation and model availability.
"""

import sys


def check_ollama_package():
    """Check if ollama package is installed."""
    try:
        import ollama
        print("✓ Ollama Python package is installed")
        return True
    except ImportError:
        print("✗ Ollama Python package is NOT installed")
        print("  Install with: pip install ollama")
        return False


def check_ollama_service():
    """Check if Ollama service is running."""
    try:
        import ollama
        models = ollama.list()
        print("✓ Ollama service is running")
        return True, models
    except Exception as e:
        print("✗ Ollama service is NOT running")
        print(f"  Error: {e}")
        print("  Start with: ollama serve")
        return False, None


def check_model(model_name="llama3.2:1b"):
    """Check if specific model is available."""
    try:
        import ollama
        models = ollama.list()
        model_names = [model['name'] for model in models.get('models', [])]
        
        if model_name in model_names:
            print(f"✓ Model '{model_name}' is available")
            return True
        else:
            print(f"✗ Model '{model_name}' is NOT available")
            print(f"  Pull with: ollama pull {model_name}")
            print(f"\nAvailable models: {', '.join(model_names) if model_names else 'None'}")
            return False
    except Exception as e:
        print(f"✗ Could not check models: {e}")
        return False


def test_generation(model_name="llama3.2:1b"):
    """Test a simple generation with the model."""
    try:
        import ollama
        print(f"\nTesting generation with {model_name}...")
        response = ollama.chat(
            model=model_name,
            messages=[
                {
                    'role': 'system',
                    'content': 'You are a helpful assistant. Respond briefly.'
                },
                {
                    'role': 'user',
                    'content': 'Say hello in one sentence.'
                }
            ]
        )
        print(f"✓ Generation test successful")
        print(f"  Response: {response['message']['content']}")
        return True
    except Exception as e:
        print(f"✗ Generation test failed: {e}")
        return False


def main():
    print("=" * 60)
    print("Ollama Status Check for Plant Talker System")
    print("=" * 60)
    print()
    
    all_good = True
    
    # Check package
    if not check_ollama_package():
        all_good = False
        print()
        return 1
    
    print()
    
    # Check service
    service_running, models = check_ollama_service()
    if not service_running:
        all_good = False
        print()
        return 1
    
    print()
    
    # Check model
    if not check_model("llama3.2:1b"):
        all_good = False
        print()
        return 1
    
    print()
    
    # Test generation
    if not test_generation("llama3.2:1b"):
        all_good = False
        print()
        return 1
    
    print()
    print("=" * 60)
    if all_good:
        print("All checks passed! Ollama is ready for Plant Talker.")
    else:
        print("Some checks failed. Please fix the issues above.")
    print("=" * 60)
    
    return 0 if all_good else 1


if __name__ == "__main__":
    sys.exit(main())