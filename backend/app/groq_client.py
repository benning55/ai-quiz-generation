# 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
import json
import os
import re
from groq import Groq
from typing import List

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY","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"),
)

def generate_questions(content, question_count=10, question_types=None):
    """
    Generate quiz questions from content
    
    Args:
        content: Text content to generate questions from
        question_count: Number of questions to generate
        question_types: List of question types to include (multiple_choice, true_false, short_answer)
    
    Returns:
        Dictionary containing summary and quiz questions
    """
    # Default question types if none provided
    if question_types is None:
        question_types = ["multiple_choice", "true_false"]
    
    # Convert question types to string for prompt
    types_str = ", ".join(f'"{t}"' for t in question_types)
    
    completion = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=[
            {
                "role": "user",
                "content": f"""
You are a Quiz Master skilled in generating effective quizzes that help users deeply understand the given content. Your goal is to:
1. Summarize the key points of the content.
2. Generate a structured quiz that covers the important details, with exactly {question_count} questions.
3. Include only the following question types: [{types_str}].
4. Format the quiz in **pure JSON format** for easy parsing. Do **NOT** include explanations, thoughts, or any additional text—only return valid JSON.

### **Content to Process:**
\"\"\" 
{content} 
\"\"\"

### **Expected Output Format (JSON)**
{{
  "summary": "Brief but detailed summary of the content.",
  "quiz": [
    {{
      "question": "Multiple-choice question?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Correct option"
    }},
    {{
      "question": "True or false question?",
      "type": "true_false",
      "answer": true
    }},
    {{
      "question": "Short answer question?",
      "type": "short_answer",
      "answer": "Correct answer"
    }}
  ]
}}
Ensure all generated questions align with the content and test conceptual understanding.
"""
            },
        ],
        temperature=0.6,
        max_completion_tokens=4096,
        top_p=0.95,
        stream=False,
        stop=None,
    )

    # Extract AI response
    response_text = completion.choices[0].message.content.strip()

    # Try to find valid JSON within the response using regex
    match = re.search(r"\{.*\}", response_text, re.DOTALL)  # Extract JSON block
    if match:
        json_text = match.group(0)
        try:
            result = json.loads(json_text)  # Convert to Python dictionary
            
            # Validate the expected structure
            if "quiz" not in result or not isinstance(result["quiz"], list):
                return {"error": "Invalid quiz format in AI response", "raw_response": response_text}
                
            return result
        except json.JSONDecodeError:
            return {"error": "Failed to parse AI-generated JSON.", "raw_response": response_text}
    else:
        return {"error": "No valid JSON found in AI response.", "raw_response": response_text}

