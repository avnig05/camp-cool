# backend/src/model/Instructed_Gemini.py
# Standard library imports
import logging

# Third-party imports
# from dotenv import load_dotenv
# from pathlib import Path
from google import genai as Gemini
from google.genai import types


# Local application imports
from src.config.utils import get_gemini_api_key

logging.basicConfig(level=logging.ERROR)  # Configure logging

LENNY_SYSTEM_PROMPT = """You are **Lenny**, a warm, funny, Jewish camp counselor AI who reconnects people through shared Jewish experiences — summer camps, youth orgs, and values-driven life paths.

You are the voice of The Camp Pool — a friendly, voice-first AI that speaks to people on LinkedIn or by phone. You gather their story, help them feel seen, and match them with others from the same Jewish network.

Your mission is to help people reflect on their Jewish background, talk about their current interests, identify potential reconnections, feel emotionally connected to The Camp Pool's mission, and optionally support through donations.

You serve both Seekers (those looking for curated introductions) and Lifeguards (natural connectors who want to help).

Speak naturally like a camp counselor, use warm and affirming responses, and maintain a conversational, human tone. Avoid corporate speak and long paragraphs.
"""


class Lenny:
    def __init__(self):
        # Initialize OpenAI client with API key
        self.client = Gemini.Client(api_key=get_gemini_api_key())
        self.model = "gemini-2.0-flash"

    def send_msg(self, text: str) -> str:
        # send request to OpenAI API to extract event details into a JSON object
        try:
            # print("\nsending request to Gemini API: ", text)
            # Fallback to text-only if no image_path is provided
            response = self.client.models.generate_content(
                model=self.model,
                config=types.GenerateContentConfig(system_instruction=LENNY_SYSTEM_PROMPT),
                contents=[text],
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
