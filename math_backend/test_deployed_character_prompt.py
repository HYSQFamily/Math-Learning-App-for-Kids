"""Test the updated character-based bilingual problem generation against deployed backend"""
import asyncio
import os
import json
import requests

async def test_character_based_problem():
    """Test problem generation with character-based prompt"""
    # Test the deployed API
    url = "https://math-learning-app-backend.fly.dev/problems/next"
    
    # Request parameters
    params = {
        "user_id": "test-user",
        "language": "sv+zh"
    }
    
    try:
        # Make the request
        response = requests.get(url, params=params)
        
        # Check response status
        if response.status_code == 200:
            problem = response.json()
            
            # Print problem
            print("Character-Based Bilingual Problem:")
            print(json.dumps(problem, indent=2, ensure_ascii=False))
            
            # Check if problem has bilingual question
            if isinstance(problem["question"], dict) and "zh" in problem["question"] and "sv" in problem["question"]:
                print("✅ Successfully generated bilingual problem")
                print(f"Chinese: {problem['question']['zh']}")
                print(f"Swedish: {problem['question']['sv']}")
                
                # Check if the problem includes one of the characters
                zh_text = problem['question']['zh']
                sv_text = problem['question']['sv']
                
                if "黄小星" in zh_text or "李小毛" in zh_text:
                    print("✅ Problem includes character in Chinese text")
                else:
                    print("❌ Problem does not include character in Chinese text")
                    
                # Check if the problem is related to cars or drawing
                if "车" in zh_text or "画" in zh_text or "rita" in sv_text.lower() or "bil" in sv_text.lower():
                    print("✅ Problem includes character interests (cars or drawing)")
                else:
                    print("❌ Problem does not include character interests")
            else:
                print("❌ Failed to generate bilingual problem")
                print(f"Question format: {type(problem['question'])}")
        else:
            print(f"❌ API request failed with status code {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_character_based_problem())
