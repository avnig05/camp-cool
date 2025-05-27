# Camp Cool - Fine-tuning Project

This project contains code for fine-tuning an OpenAI model with custom data.

## Setup

run the script to set up the environment, venv and dependencies:

```bash
sh init.sh
```

## Usage

Run the fine-tuning script:

```bash
python model/fine_tune_lenny.py
```

The script will:

1. Upload your training data
2. Start a fine-tuning job
3. Print the job ID for tracking
