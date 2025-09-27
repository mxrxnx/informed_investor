# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS

# Create the app
app = Flask(__name__)
# Allow the frontend to connect
CORS(app) 

# Test endpoint
@app.route("/api/test")
def test_endpoint():
    return jsonify({"message": "Hello from the Python backend! 🐍"})

# Run the app
if __name__ == "__main__":
    app.run(debug=True, port=5001)