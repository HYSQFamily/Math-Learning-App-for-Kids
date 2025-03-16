from pydantic import BaseModel
from typing import Optional

class TutorRequest(BaseModel):
    user_id: str
    question: str
    hint_type: str = "quick_hint"

class ProviderFactory:
    @staticmethod
    def get_provider(service_name: str):
        """Get the appropriate AI provider based on service name"""
        if service_name.lower() == "openai":
            from .openai_provider import OpenAIProvider
            return OpenAIProvider()
        else:
            # Default to DeepSeek
            from .deepseek_provider import DeepSeekProvider
            return DeepSeekProvider()
