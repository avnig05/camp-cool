from dotenv import load_dotenv
import os


def load_env():
    """Load environment variables from .env file"""
    env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
    if os.path.exists(env_path):
        load_dotenv(dotenv_path=env_path)
    else:
        raise FileNotFoundError(f".env file not found at {env_path}")
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
