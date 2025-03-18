from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import uuid4
import random
from datetime import datetime

from app.database import get_db
from app.models import Problem, ProblemResponse, Attempt, AttemptCreate, AttemptResponse, User, KnowledgePointPerformance

router = APIRouter()

# Sample problems for demo
SAMPLE_PROBLEMS = [
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

@router.get("/", response_model=List[ProblemResponse])
def get_problems(type: Optional[str] = None, db: Session = Depends(get_db)):
    # Check if problems exist in the database
    problems = db.query(Problem).all()
    
    # If no problems in database, create sample problems
    if not problems:
        for problem_data in SAMPLE_PROBLEMS:
            problem = Problem(
                id=problem_data["id"],
                type=problem_data["type"],
                question=problem_data["question"],
                difficulty=problem_data["difficulty"],
                hints=problem_data["hints"],
                knowledge_point=problem_data["knowledge_point"],
                answer=problem_data["answer"]
            )
            db.add(problem)
        db.commit()
        problems = db.query(Problem).all()
    
    # Filter by type if specified
    if type:
        problems = [p for p in problems if p.type == type]
    
    return problems

@router.get("/next", response_model=ProblemResponse)
async def get_next_problem(
    user_id: Optional[str] = None,
    topic: Optional[str] = None,
    language: str = "sv+zh",
    x_client_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Get the next problem for a user with bilingual support"""
    try:
        # Try to generate a new problem using the problem generator
        from app.providers import ProblemGenerationRequest
        from app.providers.provider_factory import ProviderFactory
        from app.config.prompt_templates import BEIJING_BILINGUAL_PROMPT
        from uuid import uuid4
        import json
        import logging
        
        logger = logging.getLogger(__name__)
        
        try:
            # Set the prompt template based on language
            prompt_template = None
            if language == "sv+zh" or language == "zh+sv":
                prompt_template = BEIJING_BILINGUAL_PROMPT
            
            # Create problem generation request
            request = ProblemGenerationRequest(
                grade_level=3,
                topic=topic or "addition",
                difficulty=2,
                language=language,
                prompt_template=prompt_template
            )
            
            # Get the Replicate provider
            provider = ProviderFactory.get_provider("replicate")
            
            # Generate problem
            problem_data = await provider.generate_problem(request)
            
            # Create a unique ID for the problem
            problem_id = str(uuid4())
            
            # Convert question to string if it's a dict
            question_str = problem_data["question"]
            if isinstance(question_str, dict):
                question_str = json.dumps(question_str, ensure_ascii=False)
            
            # Create a Problem object and store it in the database
            db_problem = Problem(
                id=problem_id,
                type=problem_data.get("type", "arithmetic"),
                question=question_str,
                answer=float(problem_data["answer"]),
                difficulty=problem_data.get("difficulty", 2),
                hints=json.dumps(problem_data.get("hints", [])) if isinstance(problem_data.get("hints", []), list) else problem_data.get("hints", ""),
                knowledge_point=problem_data.get("knowledge_point", "基础数学")
            )
            
            db.add(db_problem)
            db.commit()
            
            # Return the problem
            return {
                "id": problem_id,
                "question": problem_data["question"],
                "answer": float(problem_data["answer"]),
                "difficulty": problem_data.get("difficulty", 2),
                "hints": problem_data.get("hints", []),
                "knowledge_point": problem_data.get("knowledge_point", "基础数学"),
                "type": problem_data.get("type", "arithmetic"),
                "created_at": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error generating problem: {str(e)}")
            # Fall back to database problems
            pass
            
        # If generation fails, get a random problem from the database
        problems = db.query(Problem).all()
        
        # If no problems in database, create sample problems
        if not problems:
            for problem_data in SAMPLE_PROBLEMS:
                problem = Problem(
                    id=problem_data["id"],
                    type=problem_data["type"],
                    question=problem_data["question"],
                    difficulty=problem_data["difficulty"],
                    hints=problem_data["hints"],
                    knowledge_point=problem_data["knowledge_point"],
                    answer=problem_data["answer"]
                )
                db.add(problem)
            db.commit()
            problems = db.query(Problem).all()
        
        # Select a random problem
        problem = random.choice(problems)
        
        # Convert hints string to list for frontend
        hints_list = [problem.hints] if problem.hints else []
        
        # Create response with additional fields needed by frontend
        # Check if question is a JSON string and parse it
        question = problem.question
        try:
            if isinstance(question, str) and (question.startswith('{') or question.startswith('[')):
                question = json.loads(question)
        except json.JSONDecodeError:
            # Keep as string if not valid JSON
            pass
            
        response = {
            "id": problem.id,
            "question": question,
            "answer": problem.answer,
            "difficulty": problem.difficulty,
            "hints": hints_list,
            "knowledge_point": problem.knowledge_point,
            "type": problem.type,
            "created_at": datetime.utcnow().isoformat()
        }
        
        return response
    except Exception as e:
        logger.error(f"Error getting next problem: {str(e)}")
        raise HTTPException(status_code=500, detail="无法获取题目，请稍后再试")

@router.get("/{problem_id}", response_model=ProblemResponse)
def get_problem(problem_id: str, db: Session = Depends(get_db)):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

@router.post("/submit", response_model=AttemptResponse)
def submit_answer(
    attempt: AttemptCreate, 
    x_client_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    # Get the problem
    problem = db.query(Problem).filter(Problem.id == attempt.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Use client_id as user_id if available
    user_id = x_client_id or "anonymous"
    
    # Get or create user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Create a default user
        user = User(
            id=user_id,
            username=f"User_{user_id[:8]}",
            grade_level=3,
            points=0,
            streak_days=0
        )
        db.add(user)
        try:
            db.commit()
        except Exception:
            db.rollback()
            # Just use a temporary user object
            user = User(
                id=user_id,
                username=f"User_{user_id[:8]}",
                grade_level=3,
                points=0,
                streak_days=0
            )
    
    # Check if the answer is correct
    is_correct = abs(attempt.answer - problem.answer) < 0.001  # Allow for floating point comparison
    
    # Create the attempt record
    db_attempt = Attempt(
        id=str(uuid4()),
        user_id=user_id,
        problem_id=attempt.problem_id,
        answer=attempt.answer,
        is_correct=is_correct
    )
    
    try:
        db.add(db_attempt)
        
        # Update user points if correct
        if is_correct and user.id != "anonymous":
            user.points += 10 * problem.difficulty
            
            # Update knowledge point performance
            performance = db.query(KnowledgePointPerformance).filter(
                KnowledgePointPerformance.user_id == user.id,
                KnowledgePointPerformance.knowledge_point == problem.knowledge_point
            ).first()
            
            if performance:
                # Increase mastery level (max 1.0)
                performance.mastery_level = min(1.0, performance.mastery_level + 0.1)
            else:
                # Create new performance record
                performance = KnowledgePointPerformance(
                    id=str(uuid4()),
                    user_id=user.id,
                    knowledge_point=problem.knowledge_point,
                    mastery_level=0.1
                )
                db.add(performance)
        
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error saving attempt: {str(e)}")
    
    # Prepare response
    explanation = None
    if is_correct:
        explanation = f"Great job! {problem.question.split('=')[0]}= {problem.answer}"
    else:
        explanation = f"The correct answer is {problem.answer}. Let's try another one!"
    
    return AttemptResponse(
        id=db_attempt.id,
        is_correct=is_correct,
        explanation=explanation
    )

@router.post("/attempt", response_model=AttemptResponse)
def submit_attempt(attempt: AttemptCreate, db: Session = Depends(get_db)):
    # Get the problem
    problem = db.query(Problem).filter(Problem.id == attempt.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Get the user
    user = db.query(User).filter(User.id == attempt.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if the answer is correct
    is_correct = abs(attempt.answer - problem.answer) < 0.001  # Allow for floating point comparison
    
    # Create the attempt record
    db_attempt = Attempt(
        id=str(uuid4()),
        user_id=attempt.user_id,
        problem_id=attempt.problem_id,
        answer=attempt.answer,
        is_correct=is_correct
    )
    db.add(db_attempt)
    
    # Update user points if correct
    if is_correct:
        user.points += 10 * problem.difficulty
        
        # Update knowledge point performance
        performance = db.query(KnowledgePointPerformance).filter(
            KnowledgePointPerformance.user_id == user.id,
            KnowledgePointPerformance.knowledge_point == problem.knowledge_point
        ).first()
        
        if performance:
            # Increase mastery level (max 1.0)
            performance.mastery_level = min(1.0, performance.mastery_level + 0.1)
        else:
            # Create new performance record
            performance = KnowledgePointPerformance(
                id=str(uuid4()),
                user_id=user.id,
                knowledge_point=problem.knowledge_point,
                mastery_level=0.1
            )
            db.add(performance)
    
    db.commit()
    
    # Prepare response
    explanation = None
    if is_correct:
        explanation = f"Great job! {problem.question.split('=')[0]}= {problem.answer}"
    else:
        explanation = f"The correct answer is {problem.answer}. Let's try another one!"
    
    return AttemptResponse(
        id=db_attempt.id,
        is_correct=is_correct,
        explanation=explanation
    )
