#!/bin/bash

echo "Setting up git hooks..."
npm install
chmod +x .husky/pre-commit

# Create a Python virtual environment for development
echo "Creating Python virtual environment for development..."
python -m venv .venv

# Activate the virtual environment - different approach for more reliability
ACTIVATE_SCRIPT=".venv/bin/activate"
if [ -f "$ACTIVATE_SCRIPT" ]; then
    echo "Activating virtual environment..."
    source "$ACTIVATE_SCRIPT"
else
    echo "Error: Virtual environment activation script not found at $ACTIVATE_SCRIPT"
    exit 1
fi

# Verify the virtual environment is active
if [[ "$VIRTUAL_ENV" != *".venv"* ]]; then
    echo "Error: Failed to activate virtual environment properly."
    echo "VIRTUAL_ENV = $VIRTUAL_ENV"
    exit 1
fi

echo "Virtual environment successfully activated: $(which python)"

# Install development dependencies in the backend
echo "Installing backend development dependencies..."
pip install -r backend/dev-requirements.txt

echo Installing frontend dependencies...
cd frontend
npm install
cd ..

echo "Development environment setup complete!"
echo "To activate the virtual environment manually, run: source .venv/bin/activate"