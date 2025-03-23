# 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
import json
import os
import re
from groq import Groq
from datetime import datetime, timedelta

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
    
def generate_schedule(tasks_data):
    # Get current date and calculate the week's Sunday-to-Saturday range
    today = datetime.utcnow().date()  # Use UTC as base, adjust to Pacific later
    # Find the most recent Sunday (start of week)
    days_since_sunday = today.weekday() + 1  # Sunday is 6, Monday is 0, etc.
    week_start = today - timedelta(days=days_since_sunday % 7)
    week_end = week_start + timedelta(days=6)

    # Format dates for prompt
    week_start_str = week_start.strftime("%Y-%m-%d")
    week_end_str = week_end.strftime("%Y-%m-%d")

    completion = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=[
            {
                "role": "user",
                "content": f"""
You are a Schedule Planner Expert. Your goal is to:
1. Take the provided tasks data (wake/sleep times, base tasks, extra tasks).
2. Generate a weekly schedule from Sunday to Saturday, optimizing for productivity based on scientific principles:
   - Mornings (8:00–12:00) for deep cognitive work (e.g., software jobs, study).
   - Afternoons (12:00–18:00) for routine or sustained tasks (e.g., classes, jobs).
   - Evenings (18:00–22:00) for lighter or creative tasks.
3. Return the schedule in **pure JSON format** with events ready for Google Calendar API (start/end times in ISO format).

### **Input Data:**
\"\"\" 
{json.dumps(tasks_data, indent=2)} 
\"\"\"

### **Week Range:**
- Start: {week_start_str} (Sunday)
- End: {week_end_str} (Saturday)

### **Expected Output Format (JSON)**
{{
  "schedule": [
    {{
      "summary": "Task name",
      "start": "{week_start_str}T09:30:00-07:00",
      "end": "{week_start_str}T18:00:00-07:00",
      "description": "Optional details"
    }},
    ...
  ]
}}
- Use the week range {week_start_str} to {week_end_str}.
- Format timestamps in Pacific Time (-07:00) as YYYY-MM-DDTHH:MM:SS-07:00.
- For base tasks with fixed days (e.g., "Mon"), assign them to the corresponding date in the week.
- For flexible tasks (e.g., software jobs, extra tasks), distribute them optimally across the week.
"""
            },
        ],
        temperature=0.6,
        max_completion_tokens=4096,
        top_p=0.95,
        stream=False,
        stop=None,
    )

    response_text = completion.choices[0].message.content.strip()
    match = re.search(r"\{.*\}", response_text, re.DOTALL)
    if match:
        json_text = match.group(0)
        try:
            return json.loads(json_text)
        except json.JSONDecodeError:
            return {"error": "Failed to parse AI-generated JSON."}
    else:
        return {"error": "No valid JSON found in AI response."}

