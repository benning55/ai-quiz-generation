# CanCitizenTest Frontend

This is the frontend for the Canadian Citizenship Test Practice application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Update the values in `.env.local` with your configuration

```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | The URL of the backend API | https://api.example.com | 