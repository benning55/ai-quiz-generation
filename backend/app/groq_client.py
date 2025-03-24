# 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
import json
import os
import re
from groq import Groq
from datetime import datetime, timedelta
import pytz

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


# test = f"""
# You are a **Schedule Planner Expert**. Your goal is to:
# 1. Take the provided tasks data (wake/sleep times, travel time, deadlines, maxSessionLength, base tasks, extra tasks).
# 2. Generate a **weekly schedule (Sunday to Saturday)** optimized for productivity using cognitive science principles:
#    - Mornings (7:30–12:00) for deep cognitive work (e.g., software jobs, study).
#    - Afternoons (12:00–18:00) for routine or sustained tasks (e.g., classes, jobs).
#    - Evenings (18:00–00:00) for lighter or creative tasks.
# 3. **Return output in pure JSON** (no Markdown) formatted for Google Calendar API (ISO format timestamps).
# 4. **Ensure no tasks overlap in the schedule** by assigning each task a unique time slot without conflicts.

# ### **Input Data:**
# \"\"\" 
# {json.dumps(tasks_data, indent=2)} 
# \"\"\"

# ### **Week Range:**
# - Start: {week_start_str} (Sunday)
# - End: {week_end_str} (Saturday)

# ### **Expected Output Format (JSON)**
# {{
#   "schedule": [
#     {{
#       "summary": "Task name",
#       "start": "{week_start_str}T09:30:00{time_zone}",
#       "end": "{week_start_str}T18:00:00{time_zone}",
#       "description": "Optional details"
#     }},
#     ...
#   ]
# }}
# - Use the week range {week_start_str} to {week_end_str}.
# - Time zone: Pacific Time (-07:00), format YYYY-MM-DDTHH:MM:SS-07:00
# - Priority: Deadline tasks first → Fixed tasks → Flexible tasks
# - **Re-check JSON again to have no overlaps**: respect task dependencies.
# - Round-trip travel: Split equally before and after the associated task.
# - Session limits: If a task exceeds maxSessionLength, break it into multiple sessions with reasonable breaks.
# """


def generate_schedule(tasks_data):
    # Get current date and calculate the week's Sunday-to-Saturday range
    today = datetime.now(pytz.timezone('US/Pacific')).date()  # Use UTC as base, adjust to Pacific later
    print(today)
    # Find the most recent Sunday (start of week)
    days_since_sunday = today.weekday() + 1  # Sunday is 6, Monday is 0, etc.
    print(days_since_sunday)
    week_start = today - timedelta(days=days_since_sunday % 7)
    print(week_start)
    week_end = week_start + timedelta(days=6)
    print(week_end)

    # Format dates for prompt
    week_start_str = week_start.strftime("%Y-%m-%d")
    week_end_str = week_end.strftime("%Y-%m-%d")

    wake_time = tasks_data["wakeTime"]
    sleep_time = tasks_data["sleepTime"]

    time_zone = "-07:00"

    completion = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=[
            {
                "role": "user",
                "content": f"""
You are a Schedule Planner Expert. Your goal is to:
1. Take the provided tasks data (wake/sleep times, travel time, deadlines, maxSessionLength, base tasks, extra tasks).
2. Make sure every input task hours will meet with correction.
3. Generate a **weekly schedule (Sunday to Saturday)** optimized for productivity using cognitive science principles:
   - Mornings (7:30–12:00) for deep cognitive work (e.g., software jobs, study).
   - Afternoons (12:00–18:00) for routine or sustained tasks (e.g., classes, jobs).
   - Evenings (18:00–00:00) for lighter or creative tasks.
4. **Return output in pure JSON** (no Markdown) formatted for Google Calendar API (ISO format timestamps).
5. **Ensure no tasks overlap in the schedule** by assigning each task a unique time slot without conflicts.

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
      "summary": "[Task name (deadline) or Travel],
      "start": "{week_start_str}T09:30:00-07:00",
      "end": "{week_start_str}T18:00:00-07:00",
      "description": "Optional details"
    }},
    ...
  ]
}}
- Use the week range {week_start_str} to {week_end_str}.
- Format timestamps in Pacific Time (-07:00) as YYYY-MM-DDTHH:MM:SS-07:00.
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
# def generate_schedule(tasks_data):
#     # Get current date and calculate the week's Sunday-to-Saturday range
#     today = datetime.utcnow().date()  # Use UTC as base, adjust to Pacific later
#     # Find the most recent Sunday (start of week)
#     days_since_sunday = today.weekday() + 1  # Sunday is 6, Monday is 0, etc.
#     week_start = today - timedelta(days=days_since_sunday % 7)
#     week_end = week_start + timedelta(days=6)

#     # Format dates for prompt
#     week_start_str = week_start.strftime("%Y-%m-%d")
#     week_end_str = week_end.strftime("%Y-%m-%d")

#     wake_time = tasks_data["wakeTime"]
#     sleep_time = tasks_data["sleepTime"]
#     base_tasks = tasks_data["baseTasks"]
#     extra_tasks = tasks_data["extraTasks"]

#     completion = client.chat.completions.create(
#         model="deepseek-r1-distill-llama-70b",
#         messages=[
#             {
#                 "role": "user",
#                 "content": f"""
# You are an AI Schedule Planner creating a weekly schedule from {week_start_str} to {week_end_str}. Return **only valid JSON** as specified below. Do **NOT** include explanations, <think> tags, or any text outside the JSON structure.

# ### **Input Data:**
# {json.dumps(tasks_data, indent=2)}

# ### **Instructions:**
# - Schedule between {wake_time} and {sleep_time}, Pacific Time (-07:00).
# - `baseTasks`: Fixed if `days` and `time` are non-empty; otherwise flexible.
# - `extraTasks`: Flexible, prioritize deadlines if present.
# - Fixed tasks: Use `days` (Sun={week_start_str}, Mon={week_start_str}+1, etc.) and `time`; split `travel` evenly (e.g., 3h → 1.5h before/after).
# - Flexible tasks: Prioritize evenings (17:00–22:00); use mornings ({wake_time}–12:00) for "Fitness" or if evenings are full; deadlines must be met by date.
# - Session rules: Respect `maxSessionLength` (default 3h for "Software Job", 1–2h others); split `duration` into sessions.
# - Priority: Fixed tasks first, then deadline tasks, then flexible tasks. No overlaps.

# ### **Output Format (JSON):**
# ```json
# {{
#   "schedule": [
#     {{
#       "summary": "[task name or Travel to/back from name]",
#       "start": "{week_start_str}T09:30:00-07:00",
#       "end": "{week_start_str}T18:00:00-07:00",
#       "description": "Optional (e.g., Fixed task, Deadline 2025-03-26)"
#     }}
#   ]
# }}
# """
#             },
#         ],
#         temperature=0.5,
#         max_completion_tokens=8192,
#         top_p=0.9,
#         stream=False,
#         stop=None,
#     )

#     response_text = completion.choices[0].message.content.strip()
#     print("DONEE")
#     print(response_text)
#     try:
#       schedule_data = json.loads(response_text)
#       print("Parsed JSON:")
#       print(json.dumps(schedule_data, indent=2))
#       return schedule_data
#     except json.JSONDecodeError as e:
#       print(f"JSON Parsing Error: {e}")
#       json_match = re.search(r"json\s*(.*?)\s*", response_text, re.DOTALL)
#       if json_match:
#         json_text = json_match.group(1)
#         print("Extracted JSON:")
#         print(json_text)
#         try:
#           return json.loads(json_text)
#         except json.JSONDecodeError:
#           return {"error": "Failed to parse extracted JSON."}
#     return {"error": "No valid JSON found in AI response."}
#     # match = re.search(r"\{.*\}", response_text, re.DOTALL)
#     # if match:
#     #     json_text = match.group(0)
#     #     print(json_text)
#     #     try:
#     #         return json.loads(json_text)
#     #     except json.JSONDecodeError:
#     #         return {"error": "Failed to parse AI-generated JSON."}
#     # else:
#     #     return {"error": "No valid JSON found in AI response."}

