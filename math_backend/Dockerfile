FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create a directory for the database
RUN mkdir -p /data

# Set environment variable to use the data directory for the database
ENV DATABASE_URL=sqlite:////data/math_app.db

EXPOSE 8000

# Run the database initialization script before starting the app
CMD ["sh", "-c", "python init_db_robust.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
