FROM python:3.12-slim

WORKDIR /app

# Install Poetry
RUN pip install poetry==1.7.1

# Copy poetry configuration files
COPY pyproject.toml poetry.lock* /app/

# Configure poetry to not create a virtual environment
RUN poetry config virtualenvs.create false

# Install dependencies
RUN poetry install --no-interaction --no-ansi --no-dev

# Copy application code
COPY . /app/

# Make sure the database directory exists and is writable
RUN mkdir -p /data && chmod 777 /data

# Set environment variables
ENV DATABASE_URL="sqlite:///./math_app.db"
ENV PYTHONPATH="/app"

# Run the database fix script to ensure proper initialization
RUN python fix_db.py

# Expose the port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
