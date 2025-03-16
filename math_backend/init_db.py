from app.database import engine
from app.models import Base, Problem, User
import uuid
import json
import os

def init_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Check if we need to add sample data
    from sqlalchemy.orm import Session
    with Session(engine) as session:
        # Check if problems table is empty
        problem_count = session.query(Problem).count()
        
        if problem_count == 0:
            print("Adding sample problems...")
            
            # Sample problems
            problems = [
                {
                    "id": str(uuid.uuid4()),
                    "type": "addition",
                    "question": "5 + 7 = ?",
                    "answer": 12,
                    "difficulty": 1,
                    "hints": json.dumps(["Count 5 and then add 7 more", "You can also think of it as 7 + 5"]),
                    "knowledge_point": "addition"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "subtraction",
                    "question": "15 - 8 = ?",
                    "answer": 7,
                    "difficulty": 2,
                    "hints": json.dumps(["Start with 15 and count down 8", "Think of how much you need to add to 8 to get 15"]),
                    "knowledge_point": "subtraction"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "multiplication",
                    "question": "6 × 4 = ?",
                    "answer": 24,
                    "difficulty": 3,
                    "hints": json.dumps(["Add 6 four times", "Think of 4 groups of 6 items"]),
                    "knowledge_point": "multiplication"
                }
            ]
            
            # Add problems to database
            for problem_data in problems:
                problem = Problem(**problem_data)
                session.add(problem)
            
            # Create a default user
            default_user = User(
                id=str(uuid.uuid4()),
                username="DefaultUser",
                grade_level=3,
                points=0,
                streak_days=0
            )
            session.add(default_user)
            
            session.commit()
            print("Sample data added successfully!")
        else:
            print(f"Database already contains {problem_count} problems. Skipping sample data.")

if __name__ == "__main__":
    init_db()
