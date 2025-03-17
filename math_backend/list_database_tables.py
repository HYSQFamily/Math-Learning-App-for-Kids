"""Script to list database tables"""
import os
import sys
import logging
from sqlalchemy import inspect

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the current directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base

def list_database_tables():
    """List database tables"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        
        # List tables
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Tables in database: {tables}")
        
        # Check if the database file exists
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app.db")
        if os.path.exists(db_path):
            print(f"✅ Database file exists at: {db_path}")
            print(f"Database file size: {os.path.getsize(db_path)} bytes")
        else:
            print(f"❌ Database file does not exist at: {db_path}")
            
            # Check the current directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            print(f"Current directory: {current_dir}")
            print("Files in current directory:")
            for file in os.listdir(current_dir):
                if file.endswith(".db"):
                    print(f"  - {file} ({os.path.getsize(os.path.join(current_dir, file))} bytes)")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    list_database_tables()
