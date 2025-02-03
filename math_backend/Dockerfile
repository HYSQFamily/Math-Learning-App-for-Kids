FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libffi-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip check && \
    python -c "import aiohttp; print('aiohttp:', aiohttp.__version__); import sys; print('Python path:', sys.path)"

# Copy app code
COPY . .

# Set environment variables
ENV PORT=8080
ENV HOST=0.0.0.0
ENV PYTHONPATH=/app

EXPOSE 8080

CMD uvicorn app.main:app --host 0.0.0.0 --port 8080 --log-level debug
