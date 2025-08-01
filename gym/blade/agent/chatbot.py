# chatbot.py
# Not used right now

import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# --- 1. Configuration ---
# Load environment variables from your .env file.
# Get the current file directory
current_dir = os.path.dirname(os.path.abspath(__file__))
root_folder = os.path.abspath(os.path.join(current_dir, "..", "..", ".."))
env_path = os.path.join(root_folder, "gym", ".env")

try:
    load_dotenv(dotenv_path=env_path)
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    print(GOOGLE_API_KEY)
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY not found in environment variables.")
    # genai.configure(api_key=GOOGLE_API_KEY)
except (ValueError, FileNotFoundError) as e:
    print(f"Error: Could not configure API key. {e}")
    # Exit or handle the error as appropriate for your backend.
    exit()

# --- 2. Define Functions for the AI to Call ---
# These are the Python functions the AI can choose to execute.
# In a real application, these could interact with databases, other APIs, etc.

get_weather_function = {
    "name": "get_weather",
    "description": "Gets the current weather for a specified location.",
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "The city and state, e.g., 'San Francisco, CA'",
            },
        },
        "required": ["location"],
    },
}

create_user_reminder_function = {
    "name": "create_user_reminder",
    "description": "Creates a reminder for the user.",
    "parameters": {
        "type": "object",
        "properties": {
            "reminder_text": {
                "type": "string",
                "description": "The content of the reminder.",
            },
            "time": {
                "type": "string",
                "description": "The time for the reminder, e.g., 'in 15 minutes'",
            },
        },
        "required": ["reminder_text", "time"],
    },
}

# --- 3. Initialize the Gemini Model ---
# This is where you configure the model's behavior.

# Provide context and instructions for the AI agent.
# You can customize this prompt extensively.
SYSTEM_PROMPT = """
You are a helpful and respectful AI assistant for a project.
Your role is to assist users with their questions, provide information, and perform tasks.
Be concise and clear in your responses. If you need to perform an action, use the available tools.
Do not make up information if a tool is available to get it.
"""

# The 'tools' parameter describes your Python functions to the Gemini model.
# This allows the model to understand what functions are available,
# what they do, and what arguments they expect.
# GEMINI_MODEL = genai.GenerativeModel(
#     model_name="models/gemini-2.5-flash", # Use the model you need
#     system_instruction=SYSTEM_PROMPT,
#     tools=[get_current_weather, create_user_reminder]
# )
GEMINI_MODEL = genai.Client()

# --- 4. Main Chat Logic ---
# This function will be called by your backend API endpoint.

def generate_ai_response(user_prompt: str):
    """
    Handles the core logic of getting a response from the Gemini model.

    Args:
        user_prompt (str): The user's input from the frontend.

    Returns:
        str: The AI's final text response to be sent back to the frontend.
    """
    print(f"\nUser Prompt: '{user_prompt}'")

    tools = types.Tool(function_declarations=[get_weather_function, create_user_reminder_function])
    config = types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT, tools=[tools])

    response = GEMINI_MODEL.models.generate_content(
        model="gemini-2.5-flash",
        contents=[user_prompt],
        config=config,
    )


    # The response object contains the model's final, user-facing text.
    print(f"AI Response: '{response.text}'")
    return response.text

# --- 5. Example Usage ---
# This block demonstrates how you might use the function in your backend.
if __name__ == "__main__":
    # Example 1: A simple conversation
    generate_ai_response("Hello, how are you today?")
    
    # Example 2: A prompt that should trigger the get_current_weather function
    generate_ai_response("What's the weather like in Phoenix right now?")
    
    # Example 3: A prompt that should trigger the create_user_reminder function
    generate_ai_response("Can you remind me to call my dentist in 1 hour?")
    
    # Example 4: A more complex prompt
    generate_ai_response("It's probably hot in Phoenix, can you check the weather and also remind me to drink water in 5 minutes?")
