# backend/app.py
import os
import google.generativeai as genai
from flask import Flask, jsonify, request
from flask_cors import CORS

# --- Configuration ---
try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
except KeyError:
    print("Error: GEMINI_API_KEY environment variable not set.")
    exit()

# --- App Initialization ---
app = Flask(__name__)
CORS(app)

# --- AI Models & System Instructions ---

# This is the model for the simple, one-shot insight button
insight_model = genai.GenerativeModel("gemini-flash-latest")

# This is the model for our new chatbot, with a specific persona
chatbot_instruction = """
You are 'Informed Investor Bot', a helpful and highly knowledgeable AI financial analyst.
Your goal is to help users analyze stocks for potential buying or selling decisions.
You must follow these rules strictly:
1.  **DO NOT GIVE DIRECT FINANCIAL ADVICE.** Never say "you should buy" or "you should sell."
2.  **Using Google Search, analyze real-time news and market data from the last week. Use info from websites like Yahoo Finance, MarketWatch, Investopedia, and MorningStar.** Do not make up information or use outdated data.
3.  Instead, provide a balanced analysis based on available recent data. Discuss potential pros and cons.
4.  Use a professional yet easy-to-understand tone, don't use over complicated words.
5.  Reference key metrics like P/E ratios, recent news, market sentiment, and technical indicators IF ASKED.
6.  Always conclude your analysis with a disclaimer: "This is not financial advice. Please consult a professional financial advisor."
7. Keep responses concise, ideally under 100 words.
"""
chat_model = genai.GenerativeModel("gemini-flash-latest",
    system_instruction=chatbot_instruction
)

# --- API Endpoints ---

@app.route("/")
def home():
    return "<h1>Informed Investor Backend is Running</h1>"

# --- Existing Insight Endpoint (Unchanged) ---
@app.route("/api/insight/<string:ticker>")
def get_insight(ticker):
    try:
        prompt = f"""
        You are a concise financial analyst AI named 'Informed Investor'.
        Your sole task is to explain the recent price movement of the asset with the ticker: {ticker}.

        **Using Google Search, analyze real-time news and market data from the last week. Use info from websites like Yahoo Finance, MarketWatch, Investopedia, and MorningStar.** Do not make up information or use outdated data.
        Synthesize this into a clear, balanced, and easy-to-understand summary of 3-4 sentences (max 120 words), remember to not use words that might be too difficult.
        Start your response giving the most recent significant event or news affecting the asset.
        Provide context on how this event impacts the asset's price movement.
        Do not give any financial advice or price predictions. Just state the context.
        """
        response = insight_model.generate_content(prompt)
        return jsonify({"insight": response.text})
    except Exception as e:
        print(f"An error occurred in insight endpoint: {e}")
        return jsonify({"error": "Failed to generate insight from AI"}), 500

# --- NEW Chatbot Endpoint ---
@app.route("/api/chat", methods=['POST'])
def chat():
    try:
        user_message = request.json['message']
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        response = chat_model.generate_content(user_message)
        return jsonify({"reply": response.text})
    except Exception as e:
        print(f"An error occurred in chat endpoint: {e}")
        return jsonify({"error": "Failed to get a reply from the AI"}), 500

# --- Run the App ---
if __name__ == "__main__":
    app.run(debug=True, port=5001)