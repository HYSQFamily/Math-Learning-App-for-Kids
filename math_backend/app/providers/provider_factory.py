from typing import Literal
from .base_provider import BaseProvider
from .openai_provider import OpenAIProvider
from .deepseek_provider import DeepSeekProvider

ProviderType = Literal["openai", "deepseek"]

class ProviderFactory:
    @staticmethod
    def create(provider_type: ProviderType) -> BaseProvider:
        if provider_type == "deepseek":
            return DeepSeekProvider()
        return OpenAIProvider()
