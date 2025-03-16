from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from pydantic import BaseModel
import logging

from app.database import get_db
from app.models import Problem, Attempt
from app.providers import ProviderFactory

router = APIRouter()
logger = logging.getLogger(__name__)

class EvaluationRequest(BaseModel):
    problem_id: str
    user_answer: float
    user_id: Optional[str] = None

class EvaluationResponse(BaseModel):
    is_correct: bool
    explanation: str
    need_extra_help: bool = False

@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_answer(
    request: EvaluationRequest,
    service: str = Query("deepseek", description="AI service to use (deepseek, openai, replicate)"),
    db: Session = Depends(get_db)
):
    """Evaluate a user's answer using AI"""
    try:
        # Get the problem
        problem = db.query(Problem).filter(Problem.id == request.problem_id).first()
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found")
        
        logger.info(f"Evaluating answer: Problem {request.problem_id}, User answer: {request.user_answer}, Service: {service}")
        
        # Get the appropriate provider
        provider = ProviderFactory.get_provider(service)
        
        # Evaluate answer
        evaluation = await provider.evaluate_answer(
            problem_id=request.problem_id,
            user_answer=request.user_answer,
            correct_answer=problem.answer
        )
        
        # Validate evaluation data
        if not evaluation or "is_correct" not in evaluation:
            raise ValueError("Invalid evaluation data")
        
        # Return the evaluation
        return {
            "is_correct": evaluation["is_correct"],
            "explanation": evaluation.get("explanation", ""),
            "need_extra_help": evaluation.get("need_extra_help", False)
        }
        
    except ValueError as e:
        logger.error(f"Value error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="无法评估答案，请稍后再试")
