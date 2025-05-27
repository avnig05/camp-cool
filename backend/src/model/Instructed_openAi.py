# backend/src/model/instructed_openai.py
import logging
from openai import OpenAI  # Assuming you're using the 'openai' library

from src.config.utils import get_openai_api_key, LENNY_SYSTEM_PROMPT

logging.basicConfig(level=logging.ERROR)  # Configure logging


class OpenAI_Lenny:
    def __init__(self):
        # Initialize OpenAI client with API key
        self.client = OpenAI(api_key=get_openai_api_key())
        self.model = "gpt-4-turbo-preview"

    def send_msg(self, text: str) -> str:
        try:
            # print(f"\nSending request to OpenAI API ({self.model}): ", text)
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": LENNY_SYSTEM_PROMPT},
                    {"role": "user", "content": text}
                ]
            )
            generated_text = response.choices[0].message.content.strip()
            return generated_text

        # catch any errors gracefully
        except ConnectionError as ce:
            logging.error(
                "Connection error while sending request to OpenAI API: %s", ce
            )
            return "A connection error occurred while communicating with OpenAI API. Please check your internet connection."

        except ValueError as ve:
            logging.error("Invalid input or response from OpenAI: %s", ve)
            return (
                "An error occurred due to an invalid input or response from OpenAI API."
            )

        except Exception as e:
            logging.error("Unexpected error: %s", e)
            return f"An unexpected error occurred: {e}"
