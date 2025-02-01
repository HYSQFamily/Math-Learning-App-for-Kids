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
        required_vars = ["SF_DEEPSEEK_API_TOKEN", "SF_DEEPSEEK_API_URL", "SF_DEEPSEEK_MODEL"]
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        if missing_vars:
            logger.warning("Missing required configuration")
            raise ValueError("AI助手服务未配置")
        logger.info("AI service initialized")

    async def ask(self, request: TutorRequest) -> str:
        try:
            logger.info("Processing request")
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {os.getenv('SF_DEEPSEEK_API_TOKEN')}"
            }
            
            payload = {
                "model": os.getenv("SF_DEEPSEEK_MODEL"),
                "messages": [
                    {"role": "system", "content": self.get_system_prompt()},
                    {"role": "user", "content": request.question}
                ],
                "stream": False,
                "max_tokens": 512,
                "stop": ["null"],
                "temperature": 0.7,
                "top_p": 0.7,
                "top_k": 50,
                "frequency_penalty": 0.5,
                "n": 1,
                "response_format": {"type": "text"}
            }
            
            timeout = aiohttp.ClientTimeout(total=60)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                try:
                    async with session.post(os.getenv("SF_DEEPSEEK_API_URL"), headers=headers, json=payload) as response:
                        response_text = await response.text()
                        if response.status != 200:
                            logger.error(f"Service error occurred: {response.status}")
                            if response.status == 401:
                                raise ValueError("AI助手服务未配置")
                            elif response.status == 429:
                                raise ValueError("请稍后再试")
                            raise ValueError("服务暂时不可用")
                        
                        try:
                            data = json.loads(response_text)
                            if not data.get("choices") or not data["choices"]:
                                raise ValueError("服务暂时不可用")
                            
                            message = data["choices"][0].get("message", {})
                            content = message.get("content")
                            if not content or not isinstance(content, str):
                                raise ValueError("服务暂时不可用")
                                
                            logger.info("Request completed successfully")
                            return content
                        except json.JSONDecodeError as e:
                            logger.error(f"Failed to parse response JSON: {e}")
                            raise ValueError("AI助手返回了无效的JSON格式")
                        
                except aiohttp.ClientError:
                    logger.error("Connection error occurred")
                    raise ValueError("网络连接失败")
                    
        except Exception as e:
            logger.error(f"Service error: {str(e)}")
            raise ValueError("服务暂时不可用")
