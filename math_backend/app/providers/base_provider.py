from abc import ABC, abstractmethod
from typing import Optional
from pydantic import BaseModel

class TutorRequest(BaseModel):
    user_id: str
    question: str

class BaseProvider(ABC):
    @abstractmethod
    async def ask(self, request: TutorRequest) -> str:
        pass

    def get_system_prompt(self) -> str:
        return """你是一位友善的小学数学老师，正在辅导三年级的学生。
请用简单易懂的语言回答问题，并鼓励学生思考。在回答时：
1. 使用生动有趣的例子
2. 分步骤解释
3. 给出提示而不是直接答案
4. 用积极鼓励的语气
5. 适时表扬学生的思考"""
