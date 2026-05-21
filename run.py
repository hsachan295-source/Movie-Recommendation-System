import os
import sys
import subprocess

def install_requirements():
    print("Checking dependencies...")
    try:
        import flask
        print("Flask is already installed.")
    except ImportError:
        print("Flask is not installed. Installing required dependencies from requirements.txt...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            print("Dependencies installed successfully!")
        except Exception as e:
            print(f"Error installing dependencies: {e}")
            sys.exit(1)

def run_app():
    print("\n" + "="*50)
    print("Starting Movie Recommendation System web application...")
    print("Please open your browser and navigate to: http://127.0.0.1:5000")
    print("="*50 + "\n")
    
    try:
        # Run Flask app
        subprocess.run([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\nStopping server...")
    except Exception as e:
        print(f"Error launching server: {e}")

if __name__ == "__main__":
    install_requirements()
    run_app()
