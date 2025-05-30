from fastapi import FastAPI, Form
import logging
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import json

from src.config.utils import init_lenny, get_CORS_origins, load_env
load_env()

app = FastAPI()

allowed_origins_list = get_CORS_origins()

logging.basicConfig(level=logging.INFO)  # Configure basic logging

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to the Camp Pool backend Endpoints",
        "description": "camp pool is a tool designed to connect the Jewish community with mentors and resources to help them grow",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/chat")
async def chat_with_lenny(
    text: Optional[str] = Form(None),
    history_str: Optional[str] = Form(None)
):

    lenny = init_lenny()
    print(f"lenny initialized: {lenny}")
    logging.info(f"Received chat request with text: {text}")
    logging.info(f"Received chat history: {history_str}")

    if text is None:
        logging.error("No text provided for chat with Lenny.")
        return {"error": "No text provided for chat with Lenny."}

    parsed_history: List[Dict[str, str]] = []
    if history_str:
        try:
            parsed_history = json.loads(history_str)
            logging.info(f"Parsed chat history: {parsed_history}")
        except json.JSONDecodeError as e:
            logging.error(f"Error parsing chat history: {e}")
            parsed_history = []

    response = lenny.send_msg(text, history=parsed_history)
    if response is None:
        logging.error("Lenny's response is None.")
        return {"error": "Lenny's response is None."}

    logging.info(f"Lenny's response: {response}")
    return {"response": response}
