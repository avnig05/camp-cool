from fastapi import FastAPI
# import shutil
# from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
# from typing import Optional


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
