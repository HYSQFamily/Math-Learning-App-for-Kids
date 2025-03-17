"""Test script to verify the fix for the answer evaluation issue"""
import asyncio
import json
import logging
import os
import sys
import time
import subprocess
from uuid import uuid4

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the current directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_db, engine, Base
from app.models import Problem, User, Attempt, KnowledgePointPerformance

def ensure_database_setup():
    """Ensure database tables are created"""
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
            
        # Create a test session
        session = next(get_db())
        
        try:
            # Create a test user if it doesn't exist
            test_user = session.query(User).filter(User.id == "test-user").first()
            if not test_user:
                test_user = User(
                    id="test-user",
                    username="Test User",
                    grade_level=3,
                    points=0,
                    streak_days=0
                )
                session.add(test_user)
                session.commit()
                print("✅ Test user created")
            else:
                print("✅ Test user already exists")
        except Exception as e:
            print(f"Warning: Could not create test user: {str(e)}")
            print("Continuing with test...")
            session.rollback()
            
        session.close()
    except Exception as e:
        print(f"❌ Error setting up database: {str(e)}")
        print("Continuing with test anyway...")

async def test_answer_evaluation_fix():
    """Test the fix for the answer evaluation issue"""
    print("\n=== Testing Answer Evaluation Fix ===")
    
    # Create a test session
    session = next(get_db())
    
    # Create a test problem similar to the one in the screenshot
    problem_id = str(uuid4())
    question = {
        "zh": "小明有8个苹果，小红有5个苹果，小明比小红多几个苹果?",
        "sv": "Xiao Ming har 8 äpplen och Xiao Hong har 5 äpplen. Hur många fler äpplen har Xiao Ming än Xiao Hong?"
    }
    
    # Store the problem in the database
    db_problem = Problem(
        id=problem_id,
        type="word_problem",
        question=json.dumps(question, ensure_ascii=False),
        answer=3.0,
        difficulty=2,
        hints="比较两个数的差值",
        knowledge_point="减法"
    )
    
    try:
        session.add(db_problem)
        session.commit()
        print(f"✅ Test problem stored in database with ID: {problem_id}")
    except Exception as e:
        session.rollback()
        print(f"❌ Error storing test problem: {str(e)}")
        return
    
    # Test submitting the answer through the API
    import aiohttp
    
    async with aiohttp.ClientSession() as client:
        # Test the /problems/submit endpoint
        submit_data = {
            "user_id": "test-user",
            "problem_id": problem_id,
            "answer": 3.0
        }
        
        try:
            # Wait for the server to process the problem
            print("Waiting for server to be ready...")
            time.sleep(2)
            
            async with client.post("http://localhost:8000/problems/submit", json=submit_data) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"Submit result: {json.dumps(result, indent=2)}")
                    
                    if result.get("is_correct"):
                        print("✅ Answer correctly evaluated as correct")
                    else:
                        print("❌ Answer incorrectly evaluated as wrong")
                else:
                    print(f"❌ API request failed with status code {response.status}")
                    print(await response.text())
        except Exception as e:
            print(f"Error testing API: {str(e)}")
            print("Note: Make sure the backend server is running on http://localhost:8000")
    
    # Clean up
    try:
        session.query(Problem).filter(Problem.id == problem_id).delete()
        session.commit()
        print("✅ Test problem deleted from database")
    except Exception as e:
        session.rollback()
        print(f"❌ Error deleting test problem: {str(e)}")

if __name__ == "__main__":
    # Ensure database is set up
    ensure_database_setup()
    
    # Run the test
    asyncio.run(test_answer_evaluation_fix())
