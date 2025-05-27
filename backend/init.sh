Echo "This Script will initialize the backend environment, venv, and install dependencies."

Echo OPENAI_API_KEY=your-api-key-here > .env
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
Echo "Backend environment initialized successfully."
Echo "you can now run the backend server or use the cmdline interface."