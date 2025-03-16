from app.database import engine
from app.models import Base, Problem, User
from sqlalchemy.orm import Session
from uuid import uuid4

# Recreate all tables
Base.metadata.create_all(bind=engine)

# Create sample data
def create_sample_data():
    session = Session(engine)
    
    # Check if problems exist
    problems = session.query(Problem).all()
    if not problems:
        # Sample problems
        sample_problems = [
            {
                "id": "p1",
                "type": "addition",
                "question": "5 + 7 = ?",
                "difficulty": 1,
                "hints": "Count 5 and then add 7 more",
                "knowledge_point": "addition",
                "answer": 12
            },
            {
                "id": "p2",
                "type": "subtraction",
                "question": "15 - 8 = ?",
                "difficulty": 2,
                "hints": "Start with 15 and count down 8",
                "knowledge_point": "subtraction",
                "answer": 7
            },
            {
                "id": "p3",
                "type": "multiplication",
                "question": "6 × 4 = ?",
                "difficulty": 3,
                "hints": "Add 6 four times or 4 six times",
                "knowledge_point": "multiplication",
                "answer": 24
            }
        ]
        
        for problem_data in sample_problems:
            problem = Problem(
                id=problem_data["id"],
                type=problem_data["type"],
                question=problem_data["question"],
                difficulty=problem_data["difficulty"],
                hints=problem_data["hints"],
                knowledge_point=problem_data["knowledge_point"],
                answer=problem_data["answer"]
            )
            session.add(problem)
    
    # Create default user if none exists
    users = session.query(User).all()
    if not users:
        default_user = User(
            id="default-user",
            username="DefaultUser",
            grade_level=3,
            points=0,
            streak_days=0
        )
        session.add(default_user)
    
    session.commit()
    session.close()
    print("Database initialized with sample data")

if __name__ == "__main__":
    create_sample_data()
