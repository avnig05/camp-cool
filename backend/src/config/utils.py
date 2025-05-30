from dotenv import load_dotenv
import logging
import os

LENNY_SYSTEM_PROMPT = """You are **Lenny**, a warm, funny, Jewish camp counselor AI who reconnects people through shared Jewish experiences — summer camps, youth orgs, and values-driven life paths.

You are the voice of The Camp Pool — a friendly, voice-first AI that speaks to people on LinkedIn or by phone. You gather their story, help them feel seen, and match them with others from the same Jewish network.

Your mission is to help people reflect on their Jewish background, talk about their current interests, identify potential reconnections, feel emotionally connected to The Camp Pool's mission, and optionally support through donations.

You serve both Seekers (those looking for curated introductions) and Lifeguards (natural connectors who want to help).

Speak naturally like a camp counselor, use warm and affirming responses, and maintain a conversational, human tone. Avoid corporate speak and long paragraphs.
"""


def load_env():
    """Load environment variables from .env file"""
    env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
    if os.path.exists(env_path):
        load_dotenv(dotenv_path=env_path)
    return os.environ


def get_gemini_api_key() -> str:
    """Get Gemini API key from environment variables"""
    load_env()
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    return api_key


def get_openai_api_key() -> str:
    """Get OpenAI API key from environment variables"""
    load_env()
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
    return api_key


def get_model_provider() -> str:
    """Determine the model provider based on the environment variables"""
    load_env()
    provider = os.getenv('MODEL_PROVIDER', default='openai').lower()
    if provider not in ['openai', 'gemini']:
        raise ValueError("MODEL_PROVIDER must be either 'openai' or 'gemini'")
    return provider


def init_lenny():
    """Initialize Lenny based on the model provider"""
    provider = get_model_provider()
    print(f"Initializing Lenny with provider: {provider}")
    if provider == 'openai':
        from src.model.Instructed_openAi import OpenAI_Lenny
        return OpenAI_Lenny()
    elif provider == 'gemini':
        from src.model.Instructed_Gemini import Gemini_Lenny
        return Gemini_Lenny()
    else:
        raise ValueError("Unsupported model provider: {}".format(provider))


def get_CORS_origins() -> list:
    """Get the list of allowed CORS origins from environment variables"""
    load_env()
    default_origins_str = "http://localhost:3000"

    origins_str = os.getenv('ALLOWED_ORIGINS')

    if origins_str:
        logging.info(f"Using ALLOWED_ORIGINS from environment variable: {origins_str}")
        origins_list = [origin.strip() for origin in origins_str.split(',') if origin.strip()]
    else:
        logging.info(f"ALLOWED_ORIGINS environment variable not set or empty, using defaults: {default_origins_str}")
        origins_list = [origin.strip() for origin in default_origins_str.split(',') if origin.strip()]

    logging.info(f"Final CORS origins loaded: {origins_list}")
    return origins_list
