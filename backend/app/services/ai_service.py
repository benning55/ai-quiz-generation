"""
Enhanced AI Service with better error handling, retry logic, and consistency
"""
import asyncio
import json
import re
from typing import Dict, List, Optional, Union
from dataclasses import dataclass
from enum import Enum
import logging
from groq import Groq
import requests
from ..utils import config

logger = logging.getLogger(__name__)

class AIProvider(Enum):
    GROQ = "groq"
    DEEPSEEK = "deepseek"

@dataclass
class QuizGenerationRequest:
    content: str
    question_count: int
    question_types: List[str]
    difficulty: str = "medium"
    category: Optional[str] = None

@dataclass 
class QuizResponse:
    quiz: List[Dict]
    summary: str
    provider_used: str
    generation_time: float

class AIQuizGenerator:
    def __init__(self):
        self.groq_client = None
        if config.GROQ_API_KEY and config.GROQ_API_KEY != "your_groq_api_key_here":
            self.groq_client = Groq(api_key=config.GROQ_API_KEY)
    
    async def generate_quiz(self, request: QuizGenerationRequest) -> QuizResponse:
        """Generate quiz with fallback providers and retry logic"""
        providers = [AIProvider.GROQ, AIProvider.DEEPSEEK]
        
        for provider in providers:
            try:
                return await self._generate_with_provider(provider, request)
            except Exception as e:
                logger.warning(f"Provider {provider.value} failed: {e}")
                continue
        
        raise Exception("All AI providers failed")
    
    async def _generate_with_provider(self, provider: AIProvider, request: QuizGenerationRequest) -> QuizResponse:
        """Generate quiz with specific provider"""
        import time
        start_time = time.time()
        
        if provider == AIProvider.GROQ:
            result = await self._generate_groq(request)
        else:
            result = await self._generate_deepseek(request)
        
        generation_time = time.time() - start_time
        
        return QuizResponse(
            quiz=result["quiz"],
            summary=result.get("summary", ""),
            provider_used=provider.value,
            generation_time=generation_time
        )
    
    async def _generate_groq(self, request: QuizGenerationRequest) -> Dict:
        """Generate using Groq with improved error handling"""
        if not self.groq_client:
            raise Exception("Groq client not initialized")
        
        prompt = self._build_prompt(request)
        
        # Retry logic with exponential backoff
        for attempt in range(3):
            try:
                completion = self.groq_client.chat.completions.create(
                    model="deepseek-r1-distill-llama-70b",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.6,
                    max_completion_tokens=4096,
                    top_p=0.95,
                    stream=False
                )
                
                response_text = completion.choices[0].message.content.strip()
                return self._parse_response(response_text)
                
            except Exception as e:
                if attempt == 2:  # Last attempt
                    raise e
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
    
    async def _generate_deepseek(self, request: QuizGenerationRequest) -> Dict:
        """Generate using DeepSeek with improved error handling"""
        if not config.DEEPSEEK_API_KEY:
            raise Exception("DeepSeek API key not configured")
        
        prompt = self._build_prompt(request)
        headers = {
            "Authorization": f"Bearer {config.DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.6,
            "max_tokens": 4096,
            "top_p": 0.95
        }
        
        # Retry logic
        for attempt in range(3):
            try:
                response = requests.post(
                    config.DEEPSEEK_API_URL, 
                    headers=headers, 
                    json=payload,
                    timeout=30
                )
                response.raise_for_status()
                
                response_text = response.json()["choices"][0]["message"]["content"].strip()
                return self._parse_response(response_text)
                
            except Exception as e:
                if attempt == 2:
                    raise e
                await asyncio.sleep(2 ** attempt)
    
    def _build_prompt(self, request: QuizGenerationRequest) -> str:
        """Build optimized prompt for better consistency"""
        types_str = ", ".join(f'"{t}"' for t in request.question_types)
        
        difficulty_instructions = {
            "easy": "Use simple vocabulary and straightforward concepts.",
            "medium": "Use moderate complexity with some technical terms.",
            "hard": "Use advanced concepts and detailed analysis."
        }
        
        prompt = f"""You are an expert Canadian Citizenship Test Quiz Generator.

TASK: Create a quiz from the provided content with exactly {request.question_count} questions.

REQUIREMENTS:
1. Question types: [{types_str}]
2. Difficulty level: {request.difficulty} - {difficulty_instructions.get(request.difficulty, "")}
3. Focus on Canadian citizenship test topics: history, geography, government, rights, responsibilities
4. Ensure questions are factual and test comprehension
5. Provide clear, unambiguous answers

OUTPUT FORMAT (STRICT JSON):
{{
  "summary": "Brief 2-3 sentence summary of the content",
  "quiz": [
    {{
      "question": "Clear, specific question text",
      "type": "multiple_choice|true_false|short_answer",
      "options": ["A", "B", "C", "D"] (for multiple_choice only),
      "answer": "Correct answer",
      "explanation": "Brief explanation of why this is correct"
    }}
  ]
}}

CONTENT TO ANALYZE:
{request.content}

Generate exactly {request.question_count} questions. Respond with ONLY the JSON, no additional text."""

        return prompt
    
    def _parse_response(self, response_text: str) -> Dict:
        """Enhanced response parsing with better error handling"""
        # Try to find JSON in the response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if not json_match:
            raise ValueError("No JSON found in AI response")
        
        json_text = json_match.group(0)
        
        try:
            result = json.loads(json_text)
        except json.JSONDecodeError as e:
            # Try to fix common JSON issues
            json_text = self._fix_json_issues(json_text)
            try:
                result = json.loads(json_text)
            except json.JSONDecodeError:
                raise ValueError(f"Invalid JSON in AI response: {e}")
        
        # Validate structure
        if not isinstance(result, dict):
            raise ValueError("Response is not a JSON object")
        
        if "quiz" not in result or not isinstance(result["quiz"], list):
            raise ValueError("Invalid quiz format in AI response")
        
        # Validate each question
        for i, question in enumerate(result["quiz"]):
            if not isinstance(question, dict):
                raise ValueError(f"Question {i} is not a valid object")
            
            required_fields = ["question", "type", "answer"]
            for field in required_fields:
                if field not in question:
                    raise ValueError(f"Question {i} missing required field: {field}")
        
        return result
    
    def _fix_json_issues(self, json_text: str) -> str:
        """Attempt to fix common JSON formatting issues"""
        # Remove trailing commas
        json_text = re.sub(r',(\s*[}\]])', r'\1', json_text)
        
        # Fix unescaped quotes in strings
        json_text = re.sub(r'(?<!\\)"(?=[^,}\]]*[,}\]])', r'\\"', json_text)
        
        return json_text

# Global instance
ai_generator = AIQuizGenerator()

# Backward compatibility functions
async def generate_quiz(content: str, question_count: int, question_types: List[str], ai_provider: str = "groq") -> dict:
    """Backward compatible function"""
    request = QuizGenerationRequest(
        content=content,
        question_count=question_count,
        question_types=question_types
    )
    
    response = await ai_generator.generate_quiz(request)
    
    return {
        "quiz": response.quiz,
        "summary": response.summary,
        "metadata": {
            "provider_used": response.provider_used,
            "generation_time": response.generation_time
        }
    }