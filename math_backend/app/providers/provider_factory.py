import logging
from typing import Dict, Type
from .base_provider import BaseProvider
from .deepseek_provider import DeepSeekProvider
from .openai_provider import OpenAIProvider
from .replicate_provider import ReplicateProvider

logger = logging.getLogger(__name__)

class ProviderFactory:
    _providers: Dict[str, Type[BaseProvider]] = {
        "deepseek": DeepSeekProvider,
        "openai": OpenAIProvider,
        "replicate": ReplicateProvider
    }
    
    @classmethod
    def get_provider(cls, service: str = "deepseek") -> BaseProvider:
        try:
            provider_class = cls._providers.get(service)
            if not provider_class:
                logger.warning(f"Unknown service: {service}")
                raise ValueError("不支持的AI助手服务")
            
            return provider_class()
        except Exception as e:
            logger.error(f"Failed to initialize provider: {str(e)}")
            raise ValueError("无法初始化AI助手，请稍后再试")
