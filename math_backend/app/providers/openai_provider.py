import os
import logging
from typing import Optional
import openai
from .base_provider import BaseProvider, TutorRequest

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OpenAIProvider(BaseProvider):
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("AI助手服务未配置")
        self.client = openai.AsyncOpenAI(api_key=api_key)

    async def ask(self, request: TutorRequest) -> str:
        try:
            logger.info("Processing request")

            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "你是一位友善的小学数学老师，专门帮助三年级学生学习数学。请用简单易懂的语言回答问题，并在合适的时候给出鼓励。"},
                    {"role": "user", "content": request.question}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            content = response.choices[0].message.content
            if not content:
                raise ValueError("OpenAI返回了空的响应")
            logger.info("Successfully received response from OpenAI")
            return content
            
        except openai.AuthenticationError:
            logger.error("Authentication error")
            raise ValueError("AI助手服务未配置")
        except openai.RateLimitError:
            logger.error("Rate limit exceeded")
            raise ValueError("请稍后再试")
        except openai.APIError:
            logger.error("Service error")
            raise ValueError("服务暂时不可用")
        except Exception:
            logger.error("Unexpected error")
            raise ValueError("服务暂时不可用")
