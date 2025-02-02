# 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
import json
import os
import re
from groq import Groq

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY","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"),
)

def generate_questions(content):
    completion = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=[
            {
                "role": "user",
                "content": f"""
You are a Quiz Master skilled in generating effective quizzes that help users deeply understand the given content. Your goal is to:
1. Summarize the key points of the content.
2. Generate a structured quiz that covers the important details, ensuring a mix of question types (multiple-choice, true/false) with at least 10 questions.
3. Format the quiz in **pure JSON format** for easy parsing. Do **NOT** include explanations, thoughts, or any additional text—only return valid JSON.

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
            return json.loads(json_text)  # Convert to Python dictionary
        except json.JSONDecodeError:
            return {"error": "Failed to parse AI-generated JSON."}
    else:
        return {"error": "No valid JSON found in AI response."}

