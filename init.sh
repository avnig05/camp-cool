#!/usr/bin/env bash
set -euo pipefail
trap 'echo "❌ Error on line $LINENO. Exiting." >&2' ERR

error_exit() {
    echo "❌ $1" >&2
    exit 1
}

echo "This script wraps the front end and backend setup scripts to run in a single command."
echo "Please ensure you have Node.js, npm, and Python installed on your system."

cd backend || error_exit "Could not cd into backend directory"
source init.sh || error_exit "backend init.sh failed"

cd ../landing_page || error_exit "Could not cd into landing_page directory"
bash init.sh || error_exit "landing_page init.sh failed"

cd .. || error_exit "Could not return to project root"

echo "✅ Both backend and landing page environments initialized successfully."
echo "You can now start both the backend server and landing page using the provided 'run.sh'."