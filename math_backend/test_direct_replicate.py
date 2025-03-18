"""Test direct Replicate API call with the new character-based prompt"""
import os
import replicate
import json

def test_direct_replicate_call():
    """Test direct call to Replicate API with the character-based prompt"""
    # Set Replicate API token from environment variable
    token = os.environ.get("REPLICATE_API_TOKEN_NEW", "")
    if not token:
        token = "r8_VIhtaaMbH6NxjGik2BmVJhuMwqZV2bv00GSRt"
    
    os.environ["REPLICATE_API_TOKEN"] = token
    
    print(f"Using Replicate API token: {token[:5]}...{token[-5:]}")
    
    # Define the prompt exactly as provided by the user
    prompt = """生成一道中国北京市数学三年级的题目. 注意： 
1. 分别使用瑞典语与中文描述题目 
2. 题目里小朋友用黄小星或李小毛替代。 
3. 黄小星喜欢玩车，李小毛喜欢画画 
4. 请生成不同难度，且让黄小星或李小毛同学喜欢且有趣的题目"""
    
    # Call Replicate API
    print("Calling Replicate API with Claude 3.7...")
    output = ""
    try:
        for event in replicate.stream(
            "anthropic/claude-3.7-sonnet",
            input={
                "prompt": prompt,
                "temperature": 0.7,
                "max_tokens": 1024
            }
        ):
            output += str(event)
            print(event, end="")
        
        print("\n\nFull output:")
        print(output)
        
        # Check if the output includes one of the characters
        if "黄小星" in output or "李小毛" in output:
            print("✅ Problem includes character")
        else:
            print("❌ Problem does not include character")
        
        # Check if the output is related to cars or drawing
        if "车" in output or "画" in output:
            print("✅ Problem includes character interests (cars or drawing)")
        else:
            print("❌ Problem does not include character interests")
            
        # Check if the output includes both Chinese and Swedish
        if any(c for c in output if '\u4e00' <= c <= '\u9fff') and any(c for c in output if c in "åäöÅÄÖ"):
            print("✅ Problem includes both Chinese and Swedish text")
        else:
            print("❌ Problem does not include both Chinese and Swedish text")
            
    except Exception as e:
        print(f"❌ Error calling Replicate API: {str(e)}")

if __name__ == "__main__":
    test_direct_replicate_call()
