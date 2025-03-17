"""Script to initialize the database with required tables"""
import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the current directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app.models import User, Problem, Attempt, KnowledgePointPerformance

def init_database():
    """Initialize the database with required tables"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        
        # Check if the database file exists
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "math_app.db")
        if os.path.exists(db_path):
            print(f"✅ Database file exists at: {db_path}")
            print(f"Database file size: {os.path.getsize(db_path)} bytes")
        else:
            print(f"❌ Database file does not exist at: {db_path}")
    except Exception as e:
        print(f"❌ Error initializing database: {str(e)}")
        raise

if __name__ == "__main__":
    init_database()
