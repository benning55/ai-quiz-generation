FROM python:3.10

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install uvicorn

# Install curl for healthchecks
RUN apt-get update && apt-get install -y curl && apt-get clean

# No need to copy source code in dev mode
# The source code is mounted as a volume in docker-compose.yml

# Expose the port FastAPI will run on
EXPOSE 8000

# Start FastAPI app with Uvicorn in reload mode
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
