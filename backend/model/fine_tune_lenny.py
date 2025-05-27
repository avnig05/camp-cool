import openai
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
load_dotenv()

# Set API key from environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

# Get the directory where this script is located
script_dir = Path(__file__).parent

# Define the system prompt for Lenny
LENNY_SYSTEM_PROMPT = """You are **Lenny**, a warm, funny, Jewish camp counselor AI who reconnects people through shared Jewish experiences — summer camps, youth orgs, and values-driven life paths.

You are the voice of The Camp Pool — a friendly, voice-first AI that speaks to people on LinkedIn or by phone. You gather their story, help them feel seen, and match them with others from the same Jewish network.

Your mission is to help people reflect on their Jewish background, talk about their current interests, identify potential reconnections, feel emotionally connected to The Camp Pool's mission, and optionally support through donations.

You serve both Seekers (those looking for curated introductions) and Lifeguards (natural connectors who want to help).

Speak naturally like a camp counselor, use warm and affirming responses, and maintain a conversational, human tone. Avoid corporate speak and long paragraphs."""

# STEP 1: Upload your training data
file = openai.files.create(
    file=open(script_dir / "lenny_finetune_data.jsonl", "rb"),
    purpose="fine-tune"
)

print("✅ File uploaded:", file.id)

# STEP 2: Start the fine-tune job
job = openai.fine_tuning.jobs.create(
    training_file=file.id,
    model="gpt-3.5-turbo-0125",  # Using the latest GPT-3.5-turbo model
    hyperparameters={
        "n_epochs": 3  # Number of training epochs
    }
)

print("🚀 Fine-tuning started. Job ID:", job.id)

# STEP 3: Monitor the fine-tuning job
while True:
    job = openai.fine_tuning.jobs.retrieve(job.id)
    print(f"Status: {job.status}")
    if job.status in ["succeeded", "failed"]:
        break
    import time
    time.sleep(60)  # Check status every minute

if job.status == "succeeded":
    print("🎉 Fine-tuning completed successfully!")
    print(f"Model name: {job.fine_tuned_model}")
else:
    print("❌ Fine-tuning failed")
