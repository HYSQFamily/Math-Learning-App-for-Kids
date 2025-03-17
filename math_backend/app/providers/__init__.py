from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class TutorRequest(BaseModel):
    user_id: str
    question: str
    hint_type: str = "quick_hint"

class ProblemGenerationRequest(BaseModel):
    grade_level: int = 3
    topic: Optional[str] = None
    difficulty: Optional[int] = None
    language: str = "zh"
    prompt_template: Optional[str] = None

class Provider:
    """Base class for AI providers"""
    async def ask(self, request: TutorRequest) -> str:
        """Ask a question to the AI tutor"""
        raise NotImplementedError()
        
    async def generate_problem(self, request: ProblemGenerationRequest) -> Dict[str, Any]:
        """Generate a math problem"""
        raise NotImplementedError()
        
    async def evaluate_answer(self, problem_id: str, user_answer: float, correct_answer: float) -> Dict[str, Any]:
        """Evaluate a user's answer to a problem"""
        raise NotImplementedError()

class ProviderFactory:
    """Factory for creating AI providers"""
    @staticmethod
    def get_provider(provider_name: str) -> Provider:
        """Get a provider by name"""
        if provider_name.lower() == "deepseek":
            from .deepseek_provider import DeepSeekProvider
            return DeepSeekProvider()
        elif provider_name.lower() == "replicate":
            from .replicate_provider import ReplicateProvider
            return ReplicateProvider()
        elif provider_name.lower() == "openai":
            from .openai_provider import OpenAIProvider
            return OpenAIProvider()
        else:
            # Default to DeepSeek
            from .deepseek_provider import DeepSeekProvider
            return DeepSeekProvider()
