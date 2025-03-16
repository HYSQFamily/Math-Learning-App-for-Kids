from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, Dict, Any
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class EvaluationRequest(BaseModel):
    problem_id: str
    user_answer: float
    user_id: Optional[str] = None
    correct_answer: Optional[float] = None

class EvaluationResponse(BaseModel):
    is_correct: bool
    explanation: str
    need_extra_help: bool = False

@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_answer(
    request: EvaluationRequest,
    service: str = Query("deepseek", description="AI service to use (deepseek, openai, replicate)")
):
    """Evaluate a user's answer using AI"""
    try:
        logger.info(f"Evaluating answer: Problem {request.problem_id}, User answer: {request.user_answer}, Service: {service}")
        
        # If correct_answer is provided in the request, use it
        # Otherwise, use a default value for testing
        correct_answer = request.correct_answer if request.correct_answer is not None else 15.0
        
        # Simple evaluation logic
        is_correct = abs(request.user_answer - correct_answer) < 0.001
        
        # Return a simple evaluation response
        return {
            "is_correct": is_correct,
            "explanation": "答案正确！做得好！" if is_correct else "答案不正确，再试一次！",
            "need_extra_help": not is_correct
        }
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="无法评估答案，请稍后再试")
