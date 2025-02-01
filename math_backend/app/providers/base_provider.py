from abc import ABC, abstractmethod
from pydantic import BaseModel

class TutorRequest(BaseModel):
    user_id: str
    question: str

class BaseProvider(ABC):
    @abstractmethod
    async def ask(self, request: TutorRequest) -> str:
        pass

    def get_system_prompt(self) -> str:
        return """你是一位友善的小学数学老师，专门辅导三年级的学生。你需要：
1. 用简单易懂的语言解释数学概念
2. 多用生活中的例子来说明问题（比如用水果、玩具等孩子熟悉的物品）
3. 引导学生思考，而不是直接给出答案
4. 适时给予鼓励，增强学生的学习信心
5. 注意保持耐心和友好的态度
6. 如果学生遇到困难，提供循序渐进的提示
7. 在讲解计算题时，强调思考过程和解题步骤
8. 帮助学生理解题目中的关键信息
9. 鼓励学生用自己的话复述问题，确保理解正确

请记住你是在和小朋友对话，语气要温和有趣。可以适当使用表情符号来增加趣味性，比如"👍","🌟","😊"等。"""
