import os
import logging
import json
import aiohttp
from typing import Optional
from .base_provider import BaseProvider, TutorRequest

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DeepSeekProvider(BaseProvider):
    def __init__(self):
        self.api_token = os.getenv("SF_DEEPSEEK_API_TOKEN")
        if not self.api_token:
            logger.error("Missing API token")
            raise ValueError("智能助教暂时无法使用，请稍后再试")
        self.api_url = "https://api.siliconflow.cn/v1/chat/completions"
        self.model = "deepseek-ai/DeepSeek-V3"
        logger.info("AI service initialized")

    async def ask(self, request: TutorRequest) -> str:
        try:
            logger.info("Processing request")
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_token}"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": self.get_system_prompt()},
                    {"role": "user", "content": request.question}
                ],
                "stream": False,
                "max_tokens": 512,
                "temperature": 0.7,
                "top_p": 0.7,
                "top_k": 50,
                "frequency_penalty": 0.5,
                "response_format": {"type": "text"}
            }
            
            timeout = aiohttp.ClientTimeout(total=60)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                try:
                    async with session.post(self.api_url, headers=headers, json=payload) as response:
                        if response.status != 200:
                            logger.error(f"Service error: {response.status}")
                            raise ValueError("智能助教暂时无法使用，请稍后再试")
                        
                        data = await response.json()
                        if not data.get("choices") or not data["choices"]:
                            logger.error("Invalid response: missing choices")
                            raise ValueError("智能助教暂时无法使用，请稍后再试")
                        
                        content = data["choices"][0].get("message", {}).get("content")
                        if not content:
                            logger.error("Invalid response: empty content")
                            raise ValueError("智能助教暂时无法使用，请稍后再试")
                            
                        logger.info("Request completed successfully")
                        return content
                        
                except aiohttp.ClientError as e:
                    logger.error(f"Connection error: {str(e)}")
                    raise ValueError("智能助教暂时无法使用，请稍后再试")
                    
        except Exception as e:
            logger.error(f"Service error: {str(e)}")
            raise ValueError("智能助教暂时无法使用，请稍后再试")
