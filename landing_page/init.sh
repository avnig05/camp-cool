Echo "This is a Script to quickly initialize the landing page environment"
Echo "Please ensure you have Node.js and npm installed on your system."
Echo "Installing dependencies..."

npm install -g pnpm
npm fund
pnpm install

Echo "Landing page environment initialized successfully."
Echo "You can now run the landing page using 'pnpm dev'."