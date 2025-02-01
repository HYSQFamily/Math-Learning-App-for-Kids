import os
from typing import Optional
import openai
from .base_provider import BaseProvider, TutorRequest

class OpenAIProvider(BaseProvider):
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_TOKEN")
        if not self.api_key:
            raise ValueError("OPENAI_API_TOKEN not found in environment")
        self.client = openai.AsyncOpenAI(api_key=self.api_key)

    async def ask(self, request: TutorRequest) -> str:
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": self.get_system_prompt()},
                    {"role": "user", "content": request.question}
                ],
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        except openai.APIError as e:
            print(f"OpenAI API error: {str(e)}")
            raise
