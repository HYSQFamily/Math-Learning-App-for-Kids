"""Test the updated Replicate provider with the new token"""
import asyncio
import os
import sys
import json
from app.providers.replicate_provider import ReplicateProvider

async def test_provider():
    """Test the Replicate provider with the new token"""
    # Set the token in the environment
    os.environ["REPLICATE_API_TOKEN"] = "r8_Fekm5RoK35omRjujcJbHWXj7dY0EiWO0M0cSm"
    
    # Create the provider
    provider = ReplicateProvider()
    
    # Check if the provider is available
    if not provider.is_available():
        print("❌ Provider is not available")
        return
    
    print("✅ Provider is available")
    
    # Generate a problem
    try:
        problem = await provider.generate_problem()
        print("✅ Problem generated successfully")
        print(json.dumps(problem, indent=2, ensure_ascii=False))
        
        # Check if the problem has the required fields
        if "question" in problem and "answer" in problem:
            print("✅ Problem has required fields")
            
            # Check if the problem is bilingual
            if isinstance(problem["question"], dict) and "zh" in problem["question"] and "sv" in problem["question"]:
                print("✅ Problem is bilingual")
                
                # Check if the problem includes character names
                zh_text = problem["question"]["zh"]
                sv_text = problem["question"]["sv"]
                
                if "黄小星" in zh_text or "李小毛" in zh_text:
                    print("✅ Problem includes character names in Chinese")
                else:
                    print("❌ Problem does not include character names in Chinese")
                
                # Check if the problem includes character interests
                if "车" in zh_text or "画" in zh_text or "动画片" in zh_text or "运动" in zh_text:
                    print("✅ Problem includes character interests in Chinese")
                else:
                    print("❌ Problem does not include character interests in Chinese")
            else:
                print("❌ Problem is not bilingual")
        else:
            print("❌ Problem does not have required fields")
    except Exception as e:
        print(f"❌ Error generating problem: {str(e)}")
    
    # Test the ask method
    try:
        response = await provider.ask("test-user", "如何解决5+3=?这道题？", "quick_hint")
        print("\n✅ Ask method works")
        print(f"Response: {response['answer']}")
    except Exception as e:
        print(f"❌ Error asking question: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_provider())
