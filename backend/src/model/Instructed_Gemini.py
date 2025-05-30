# backend/src/model/Instructed_Gemini.py
# Standard library imports
import logging
from typing import List, Dict

# Third-party imports
from google import genai as Gemini
from google.genai import types


# Local application imports
from src.config.utils import get_gemini_api_key, LENNY_SYSTEM_PROMPT

logging.basicConfig(level=logging.ERROR)  # Configure logging


class Gemini_Lenny:
    def __init__(self):
        # Initialize Gemini client with API key
        self.client = Gemini.Client(api_key=get_gemini_api_key())
        self.model = "gemini-2.0-flash"

    def send_msg(self, text: str, history: List[Dict[str, str]]) -> str:
        prompt = []

        for message in history:
            role = "user" if message.get("sender") == "user" else "assistant"
            prompt.append({"role": role, "content": message.get("text", "")})

        # Add the current user message to the prompt
        prompt.append({"role": "user", "content": text})
        logging.info(f"Sending prompt to Gemini: {prompt}")

        try:
            response = self.client.models.generate_content(
                model=self.model,
                config=types.GenerateContentConfig(system_instruction=LENNY_SYSTEM_PROMPT),
                contents=prompt,
            )

            generated_text = response.text

        # catch any errors gracefully
        except ConnectionError as ce:
            logging.error(
                "Connection error while sending request to Gemini API: %s", ce
            )
            return "A connection error occurred while communicating with Gemini API. Please check your internet connection."

        except ValueError as ve:
            logging.error("Invalid input or response from Gemini: %s", ve)
            return (
                "An error occurred due to an invalid input or response from Gemini API."
            )

        except Exception as e:
            logging.error("Unexpected error: %s", e)
            return f"An unexpected error occurred: {e}"

        # print("response from Gemini API: ", generated_text)

        return generated_text
