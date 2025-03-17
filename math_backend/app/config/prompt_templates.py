"""Configurable prompt templates for problem generation"""

# Default bilingual problem template (Chinese and Swedish)
BILINGUAL_PROBLEM_TEMPLATE = """你是一位小学数学老师，需要生成适合小学生的数学题目。
生成一道中国北京市数学三年级的题目.分别使用瑞典语与中文

必须按照以下JSON格式返回，确保question字段包含zh和sv两个子字段:
{
    "question": {
        "zh": "中文题目内容",
        "sv": "瑞典语题目内容"
    },
    "answer": 数字答案,
    "knowledge_point": "知识点",
    "hints": ["提示1", "提示2"],
    "difficulty": 难度等级(1-3),
    "type": "题目类型"
}

只返回JSON格式，不要有其他文字。确保answer是一个数字，不是字符串。
确保question是一个对象，包含zh和sv两个字段，不是字符串。
"""

# Chinese-only problem template
CHINESE_PROBLEM_TEMPLATE = """你是一位小学数学老师，需要生成适合小学生的数学题目。
请生成一道数学题目，并按照以下JSON格式返回:
{
    "question": "题目内容",
    "answer": 数字答案,
    "knowledge_point": "知识点",
    "hints": ["提示1", "提示2"],
    "difficulty": 难度等级(1-3),
    "type": "题目类型"
}

只返回JSON格式，不要有其他文字。确保answer是一个数字，不是字符串。
"""
