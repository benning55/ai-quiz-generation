import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# Stripe API key
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")


# AI Service Keys
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "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")
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY")

# AI Service URLs
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

# Clerk Webhook Secret
CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET") 