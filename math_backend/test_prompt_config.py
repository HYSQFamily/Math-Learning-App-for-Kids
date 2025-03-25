"""Test the prompt configuration in the Replicate provider"""
import os
import sys
from app.config.prompt_templates import BEIJING_BILINGUAL_PROMPT

def test_prompt_config():
    """Test the prompt configuration"""
    print("Testing prompt configuration...")
    
    # Print the prompt template
    print("BEIJING_BILINGUAL_PROMPT:")
    print(BEIJING_BILINGUAL_PROMPT)
    
    # Check if the prompt includes required elements
    required_elements = [
        "黄小星", "李小毛",  # Character names
        "玩车", "画画", "动画片", "运动",  # Character interests
        "北京", "歌德堡",  # Character locations
        "瑞典语", "中文",  # Languages
        "JSON"  # Output format
    ]
    
    missing_elements = []
    for element in required_elements:
        if element not in BEIJING_BILINGUAL_PROMPT:
            missing_elements.append(element)
    
    if missing_elements:
        print(f"❌ Missing required elements: {', '.join(missing_elements)}")
    else:
        print("✅ All required elements are present in the prompt")
    
    # Check if the prompt includes instructions for bilingual output
    if "question" in BEIJING_BILINGUAL_PROMPT and "zh" in BEIJING_BILINGUAL_PROMPT and "sv" in BEIJING_BILINGUAL_PROMPT:
        print("✅ Prompt includes instructions for bilingual output")
    else:
        print("❌ Prompt does not include instructions for bilingual output")

if __name__ == "__main__":
    test_prompt_config()
