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
        # Verify required environment variables exist
        required_vars = ["DEEPSEEK_API_KEY", "SF_DEEPSEEK_API_URL", "SF_DEEPSEEK_MODEL"]
        for var in required_vars:
            if not os.getenv(var):
                logger.warning("Configuration incomplete")
                raise ValueError("AI助手服务未配置")
            
        logger.info("AI service initialized")

    async def ask(self, request: TutorRequest) -> str:
        try:
            logger.info("Processing request")
            api_key = os.getenv("DEEPSEEK_API_KEY")
            if not api_key:
                raise ValueError("AI助手服务未配置")
                
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
            # All configuration from environment variables
            max_tokens = os.getenv("SF_MAX_TOKENS")
            temperature = os.getenv("SF_TEMPERATURE")
            top_p = os.getenv("SF_TOP_P")
            
            payload = {
                "model": os.getenv("SF_DEEPSEEK_MODEL"),
                "messages": [
                    {"role": "system", "content": self.get_system_prompt()},
                    {"role": "user", "content": request.question}
                ],
                "stream": False,
                "max_tokens": int(max_tokens) if max_tokens else None,
                "temperature": float(temperature) if temperature else None,
                "top_p": float(top_p) if top_p else None,
                "response_format": {"type": "text"}
            }
            # Remove None values from payload
            payload = {k: v for k, v in payload.items() if v is not None}
            logger.info("Processing request")
            
            timeout = aiohttp.ClientTimeout(total=60, connect=10)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                try:
                    api_url = os.getenv("SF_DEEPSEEK_API_URL")
                    if not api_url:
                        raise ValueError("AI助手服务未配置")
                    async with session.post(api_url, headers=headers, json=payload) as response:
                        response_text = await response.text()
                        if response.status != 200:
                            logger.error("Service error occurred")
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
                except Exception:
                    logger.error("Unexpected error")
                    raise ValueError("服务暂时不可用")
                    
        except aiohttp.ClientError:
            logger.error("Connection error")
            raise ValueError("网络连接失败")
        except Exception:
            logger.error("Service error")
            raise ValueError("服务暂时不可用")
