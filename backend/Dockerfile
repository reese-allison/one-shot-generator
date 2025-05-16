# Stage 1: Base
# Use an official Python 3.13 slim image.
# 'bookworm' is the current Debian stable release.
FROM python:3.13-slim-bookworm AS base

# Set work directory
WORKDIR /app

# Stage 2: Builder (installs dependencies)
FROM base AS builder
COPY requirements.txt .
RUN pip install -r requirements.txt

# Stage 3: Final image
FROM base AS final
# Copy installed packages from the builder stage
# Ensure this path matches the Python version used in the 'FROM base' instruction.
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
# Use 0.0.0.0 to listen on all available network interfaces within the container
# Add --reload if you want uvicorn to auto-reload on code changes during development (when using volumes)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]