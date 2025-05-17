# Camp Cool - Fine-tuning Project

This project contains code for fine-tuning an OpenAI model with custom data.

## Setup

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the project root and add your OpenAI API key:
```
OPENAI_API_KEY=your-api-key-here
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
