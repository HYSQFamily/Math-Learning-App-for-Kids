from fastapi import APIRouter, Depends, HTTPException, Query
import logging
from typing import Optional
from pydantic import BaseModel

from .providers import TutorRequest, ProviderFactory

router = APIRouter()
logger = logging.getLogger(__name__)

class TutorQuestionRequest(BaseModel):
    user_id: str
    question: str
    hint_type: str = "quick_hint"

class TutorResponse(BaseModel):
    answer: str
    model: Optional[str] = None

@router.post("/ask", response_model=TutorResponse)
async def ask_tutor(
    request: TutorQuestionRequest,
    service: str = Query("deepseek", description="AI service to use (deepseek or openai)")
):
    try:
        logger.info(f"Tutor request: {request.user_id}, {request.question}, {service}")
        
        # Validate hint_type
        if request.hint_type not in ["quick_hint", "deep_analysis"]:
            request.hint_type = "quick_hint"
            
        # Get the appropriate provider
        provider = ProviderFactory.get_provider(service)
        
        # Create a provider request
        provider_request = TutorRequest(
            user_id=request.user_id,
            question=request.question,
            hint_type=request.hint_type
        )
        
        # Get response from provider
        answer = await provider.ask(provider_request)
        
        # Return response with model info if available
        model = getattr(provider, "model", None)
        return TutorResponse(answer=answer, model=model)
        
    except ValueError as e:
        logger.error(f"Value error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="AI助手暂时无法回答，请稍后再试")
