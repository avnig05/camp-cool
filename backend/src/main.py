from fastapi import FastAPI, Form
# import shutil
# from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
# from typing import Optional

from src.config.utils import init_lenny


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    if text is None:
        return {"error": "No text provided for chat with Lenny."}
    response = lenny.send_msg(text)
    return {"response": response}
