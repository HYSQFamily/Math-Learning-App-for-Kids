from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from uuid import uuid4
import logging
import json

from app.database import get_db
from app.models import Problem, ProblemResponse
from app.providers import ProviderFactory, ProblemGenerationRequest

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/generate", response_model=ProblemResponse)
async def generate_problem(
    grade_level: int = Query(3, description="Grade level (1-6)"),
    topic: Optional[str] = Query(None, description="Topic (e.g., addition, subtraction)"),
    difficulty: Optional[int] = Query(None, description="Difficulty level (1-3)"),
    language: str = Query("zh", description="Language (zh, sv, zh+sv)"),
    prompt_template: Optional[str] = Query(None, description="Custom prompt template"),
    service: str = Query("replicate", description="AI service to use (replicate, deepseek, openai)")
):
    """Generate a new math problem using AI"""
    try:
        logger.info(f"Generating problem: Grade {grade_level}, Topic {topic}, Difficulty {difficulty}, Service {service}")
        
        # Create problem generation request
        request = ProblemGenerationRequest(
            grade_level=grade_level,
            topic=topic,
            difficulty=difficulty,
            language=language,
            prompt_template=prompt_template
        )
        
        # Get the appropriate provider
        provider = ProviderFactory.get_provider(service)
        
        # Generate problem
        problem_data = await provider.generate_problem(request)
        
        # Validate problem data
        if not problem_data or "question" not in problem_data or "answer" not in problem_data:
            raise ValueError("Invalid problem data generated")
        
        # Create a new problem in the database
        db_problem = Problem(
            id=str(uuid4()),
            type=problem_data.get("type", "arithmetic"),
            question=problem_data["question"],
            answer=float(problem_data["answer"]),
            difficulty=problem_data.get("difficulty", 2),
            hints=json.dumps(problem_data.get("hints", [])),
            knowledge_point=problem_data.get("knowledge_point", "基础数学")
        )
        
        # Return the problem without saving to database
        # This allows for more flexibility in testing
        return {
            "id": db_problem.id,
            "question": db_problem.question,
            "answer": db_problem.answer,
            "difficulty": db_problem.difficulty,
            "hints": db_problem.hints,
            "knowledge_point": db_problem.knowledge_point,
            "type": db_problem.type
        }
        
    except ValueError as e:
        logger.error(f"Value error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="无法生成题目，请稍后再试")

@router.post("/save", response_model=ProblemResponse)
async def save_problem(
    problem: ProblemResponse,
    db: Session = Depends(get_db)
):
    """Save a generated problem to the database"""
    try:
        # Create a new problem in the database
        db_problem = Problem(
            id=problem.id,
            type=problem.type,
            question=problem.question,
            answer=float(problem.answer),
            difficulty=problem.difficulty,
            hints=problem.hints,
            knowledge_point=problem.knowledge_point
        )
        
        db.add(db_problem)
        db.commit()
        db.refresh(db_problem)
        
        return db_problem
        
    except Exception as e:
        logger.error(f"Error saving problem: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="无法保存题目，请稍后再试")
