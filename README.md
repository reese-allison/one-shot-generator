# Oneshot RPG Generator

A web application that generates unique RPG oneshot adventure ideas based on user prompts. The system consists of a SvelteKit frontend with Skeleton UI and a Python backend using FastAPI.

## Project Overview

This project provides a simple interface for generating RPG oneshot adventure ideas. Users enter a prompt, which is sent to a generative AI backend that returns a complete adventure concept, including details and characters.

## Tech Stack

### Frontend
- SvelteKit
- Skeleton UI (Tailwind CSS framework)
- Docker for containerization

### Backend
- Python 3.13
- Litestar (API framework)
- Uvicorn (ASGI server)
- Docker for containerization

## Setup Instructions

### Development Setup

1. **Windows Setup**:
   Run the setup script to create a Python virtual environment and install dependencies:
   ```
   setup.bat
   ```
   This script will:
   - Create a Python virtual environment
   - Install backend dependencies
   - Install frontend dependencies
   - Set up git hooks for development

2. **Linux/macOS Setup**:
   For Linux or macOS systems, use the setup shell script:
   ```
   ./setup.sh
   ```
   Make sure to give it execute permissions first:
   ```
   chmod +x setup.sh
   ```
   This script performs the same setup steps as the Windows version but for Unix-based systems.

3. **Docker Setup**:
   To run the application using Docker:
   ```
   docker compose up -d
   ```
   This will start both the frontend and backend services:
   - Frontend will be available at http://localhost:80
   - Backend will be available at http://localhost:8000
