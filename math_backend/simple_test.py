"""Simple test script to verify the fix for the answer evaluation issue"""
import json
import logging
import os
import sys
import requests
from uuid import uuid4

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the current directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine
from sqlalchemy import text

def create_tables():
    """Create database tables manually"""
    try:
        # Create problems table
        with engine.connect() as conn:
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS problems (
                id TEXT PRIMARY KEY,
                type TEXT,
                question TEXT,
                answer REAL,
                difficulty INTEGER,
                hints TEXT,
                knowledge_point TEXT
            )
            """))
            
            # Create users table
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT,
                grade_level INTEGER,
                points INTEGER,
                streak_days INTEGER
            )
            """))
            
            # Create attempts table
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS attempts (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                problem_id TEXT,
                answer REAL,
                is_correct BOOLEAN,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """))
            
            # Create knowledge_point_performance table
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS knowledge_point_performance (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                knowledge_point TEXT,
                mastery_level REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """))
            
            conn.commit()
            
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating database tables: {str(e)}")

def insert_test_problem():
    """Insert a test problem into the database"""
    try:
        problem_id = str(uuid4())
        question = {
            "zh": "小明有8个苹果，小红有5个苹果，小明比小红多几个苹果?",
            "sv": "Xiao Ming har 8 äpplen och Xiao Hong har 5 äpplen. Hur många fler äpplen har Xiao Ming än Xiao Hong?"
        }
        
        with engine.connect() as conn:
            conn.execute(
                text("""
                INSERT INTO problems (id, type, question, answer, difficulty, hints, knowledge_point)
                VALUES (:id, :type, :question, :answer, :difficulty, :hints, :knowledge_point)
                """),
                {
                    "id": problem_id,
                    "type": "word_problem",
                    "question": json.dumps(question, ensure_ascii=False),
                    "answer": 3.0,
                    "difficulty": 2,
                    "hints": "比较两个数的差值",
                    "knowledge_point": "减法"
                }
            )
            conn.commit()
            
        print(f"✅ Test problem inserted with ID: {problem_id}")
        return problem_id
    except Exception as e:
        print(f"❌ Error inserting test problem: {str(e)}")
        return None

def test_submit_answer(problem_id):
    """Test submitting an answer to the problem"""
    try:
        # Submit the answer through the API
        submit_data = {
            "user_id": "test-user",
            "problem_id": problem_id,
            "answer": 3.0
        }
        
        response = requests.post("http://localhost:8000/problems/submit", json=submit_data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"Submit result: {json.dumps(result, indent=2)}")
            
            if result.get("is_correct"):
                print("✅ Answer correctly evaluated as correct")
            else:
                print("❌ Answer incorrectly evaluated as wrong")
        else:
            print(f"❌ API request failed with status code {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error testing API: {str(e)}")
        print("Note: Make sure the backend server is running on http://localhost:8000")

def cleanup_test_problem(problem_id):
    """Clean up the test problem from the database"""
    try:
        with engine.connect() as conn:
            conn.execute(
                text("DELETE FROM problems WHERE id = :id"),
                {"id": problem_id}
            )
            conn.commit()
            
        print("✅ Test problem deleted from database")
    except Exception as e:
        print(f"❌ Error deleting test problem: {str(e)}")

if __name__ == "__main__":
    print("\n=== Testing Answer Evaluation Fix ===")
    
    # Create tables
    create_tables()
    
    # Insert test problem
    problem_id = insert_test_problem()
    
    if problem_id:
        # Test submitting the answer
        test_submit_answer(problem_id)
        
        # Clean up
        cleanup_test_problem(problem_id)
