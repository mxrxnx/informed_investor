import os
import google.generativeai as genai
from flask import Flask, jsonify
from flask_cors import CORS

#Configuration
try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
except KeyError:
    print("Error: GEMINI_API_KEY environment variable not set.")
    exit()

# --- App Initialization ---
app = Flask(__name__)
# CORS allows your frontend (on a different address) to communicate with this backend.
CORS(app)


# --- API Endpoints ---

# This is a simple "home" route to check if the server is running.
@app.route("/")
def home():
    return "<h1>Invesight Backend is Running</h1>"

# This is the main endpoint that your frontend will call.
# It takes a stock 'ticker' from the URL.
@app.route("/api/insight/<string:ticker>")
def get_insight(ticker):
    """
    Takes a stock ticker, sends a prompt to the Gemini AI,
    and returns the AI-generated insight.
    """
    try:
        # Initialize the AI model
        model = genai.GenerativeModel("gemini-flash-latest")
        # Craft the detailed prompt for the AI
        prompt = f"""
        You are a concise financial analyst AI named 'Invesight'.
        Your sole task is to explain the recent price movement of the asset with the ticker: {ticker}.

        Analyze real-time news, analyst ratings, and market movement regarding the asset.
        Synthesize this into a clear, balanced, and easy-to-understand summary of 3-4 sentences (max 120 words).
        Start your response giving the most recent significant event or news affecting the asset.
        Provide context on how this event impacts the asset's price movement.
        Do not give any financial advice or price predictions. Just state the context.
        """
        
        # Send the prompt to the AI and get the response
        response = model.generate_content(prompt)
        
        # Return the AI's text in a JSON format
        return jsonify({"insight": response.text})

    except Exception as e:
        # Handle potential errors during the API call
        print(f"An error occurred: {e}")
        return jsonify({"error": "Failed to generate insight from AI"}), 500


# --- Run the App ---
if __name__ == "__main__":
    app.run(debug=True, port=5001)
