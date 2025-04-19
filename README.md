# CanCitizenTest - Canadian Citizenship Test Practice

A web application that helps users practice for the Canadian citizenship test using AI-generated quizzes from uploaded study materials or a database of flashcards.

## Project Structure

- **Frontend**: Next.js application for the user interface (using Yarn)
- **Backend**: FastAPI application for processing uploads and generating quizzes
- **Database**: PostgreSQL for data storage
- **Proxy**: Caddy for HTTPS and routing

## Development Setup

### Prerequisites

- Docker and Docker Compose installed
- Git

### Starting the Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-quiz-generation.git
   cd ai-quiz-generation
   ```

2. Start the development environment:
   ```bash
   docker compose up
   ```

3. Access the application:
   - Frontend: http://localhost
   - API: http://localhost/api
   - Swagger UI: http://localhost/api/docs

4. Development workflow:
   - Code changes will trigger hot-reloading for both frontend and backend
   - API calls are proxied through Caddy, so CORS is handled correctly

### Manual Frontend Development (Alternative)

If you want to run the frontend directly:

```bash
cd frontend
yarn install
yarn dev
```

## Setting Up Flashcards

The application includes a database-driven flashcard system that stores questions and answers for the Canadian citizenship test.

### Initial Setup

1. Enter the backend container:
   ```bash
   docker compose exec backend bash
   ```

2. Run the setup script:
   ```bash
   cd /app
   python setup_flashcards.py
   ```

   This will:
   - Extract questions and answers from the `flash-card-for-exam.docx` file
   - Store them in the database for quiz generation

### Using Flashcards

1. Once flashcards are imported, you can generate quizzes directly from the database rather than uploading files.
2. Use the "Flashcards" option on the main screen to select the number of questions and category.

### API Endpoints

- `GET /flashcards/` - List all flashcards (with optional filtering)
- `POST /flashcards/` - Create a new flashcard
- `GET /flashcards/{id}` - Get a specific flashcard
- `POST /generate-quiz-from-flashcards/` - Generate a quiz from database flashcards

## Authentication with Clerk

This application uses Clerk for authentication. Non-authenticated users can view up to 3 questions in quizzes, while authenticated users have full access.

### Setup Clerk

1. Create an account at [clerk.dev](https://clerk.dev)
2. Create a new application
3. Get your API keys from the Clerk dashboard
4. Update the following files with your Clerk keys:
   - `frontend/.env.local`: Add your Clerk publishable key and secret key
   - `backend/.env`: Add your Clerk secret key

### Webhook Configuration

To keep your user database in sync with Clerk:

1. In the Clerk dashboard, go to **Webhooks**
2. Create a new webhook with the endpoint: `https://your-api-domain.com/api/webhooks/clerk`
3. Select the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the webhook signing secret and add it to `backend/.env` as `CLERK_WEBHOOK_SECRET`

### Authentication Flow

- Users can sign up/sign in using Clerk's components
- When a user signs in, their data is automatically synchronized with the backend
- Non-authenticated users can view a limited number of questions (3)
- Authenticated users can access all features

## Database Schema

The database includes the following tables:

- **users**: User information synced from Clerk
  - `id`: Primary key
  - `clerk_id`: The user's ID from Clerk (for syncing)
  - `email`: User's email address
  - `first_name`: User's first name
  - `last_name`: User's last name
  - `image_url`: Profile picture URL
  - `created_at`, `updated_at`: Timestamps

- **flashcards**: Study material in Q&A format
  - `id`: Primary key
  - `question`: The question text
  - `answer`: The answer text
  - `tags`: Array of tags for categorization
  - `category`: Main category
  - `user_id`: Foreign key to users table (optional)

- **quizzes**: Quiz records
  - `id`: Primary key
  - `title`: Quiz title
  - `description`: Quiz description
  - `user_id`: Foreign key to users table (optional)

## Production Deployment

### Prerequisites

- Docker and Docker Compose installed on production server
- Domain name configured to point to your server
- SSH access to your server

### Deployment Steps

1. Copy production files to your server:
   ```bash
   scp docker-compose.prod.yml Caddyfile.prod .env.prod your-server:~/app/
   ```

2. SSH into your server:
   ```bash
   ssh your-server
   cd ~/app
   ```

3. Set up environment variables:
   ```bash
   cp .env.prod.example .env.prod
   # Edit .env.prod with your production settings
   nano .env.prod
   ```

4. Start the production stack:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. Monitor the logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

## Security Features

- HTTPS with automatic certificate management via Caddy
- Secure HTTP headers
- Non-root users in containers
- Multi-stage Docker builds to minimize attack surface
- Separate networks for frontend and backend communications
- Health checks for all services

## Maintenance

### Backups

Database backups are stored in the postgres_data volume. To create a manual backup:

```bash
docker-compose -f docker-compose.prod.yml exec db pg_dump -U user mydatabase > backup.sql
```

### Updates

To update the application:

```bash
git pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

## License

[MIT License](LICENSE)