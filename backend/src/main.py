from fastapi import FastAPI, Form
import logging
from fastapi.middleware.cors import CORSMiddleware
# from typing import Optional

from src.config.utils import init_lenny


app = FastAPI()

allowed_origins_list = [
    "http://localhost:3000",
    "https://v0-camp-cool.vercel.app",
    "https://v0-camp-cool-v0slugai-gmailcoms-projects.vercel.app"
]

logging.basicConfig(level=logging.INFO)  # Configure basic logging
logging.info(f"CORS Middleware configured to allow origins: {allowed_origins_list}")


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
async def chat_with_lenny(text: str = Form(None)):
    lenny = init_lenny()
    print(f"lenny initialized: {lenny}")
    logging.info(f"Received chat request with text: {text}")
    if text is None:
        return {"error": "No text provided for chat with Lenny."}
    response = lenny.send_msg(text)
    logging.info(f"Lenny's response: {response}")
    return {"response": response}
