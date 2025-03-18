"""Configurable prompt templates for problem generation"""

# Default bilingual problem template (Chinese and Swedish)
BILINGUAL_PROBLEM_TEMPLATE = """你是一位小学数学老师，需要生成适合小学生的数学题目。
请生成一道数学题目，并用中文和瑞典语两种语言表达。按照以下JSON格式返回:
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
"""

# Beijing bilingual problem template (Chinese and Swedish)
BEIJING_BILINGUAL_PROMPT = """你是一位小学数学老师，专门为北京市三年级学生出题。
请生成一道适合中国北京市三年级学生水平的数学题目。注意：
1. 分别使用瑞典语与中文描述题目
2. 题目里小朋友用黄小星或李小毛替代
3. 黄小星喜欢玩车，李小毛喜欢画画
4. 请生成不同难度，且让黄小星或李小毛同学喜欢且有趣的题目

请按照以下JSON格式返回题目:
{
    "question": {
        "zh": "中文题目",
        "sv": "瑞典语题目"
    },
    "answer": 数字答案,
    "knowledge_point": "知识点",
    "hints": ["提示1", "提示2"],
    "difficulty": 难度等级(1-3),
    "type": "题目类型"
}

只返回JSON格式，不要有其他文字。确保瑞典语翻译准确。确保answer是一个数字，不是字符串。
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
