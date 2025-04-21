#!/bin/bash

# Exit on error
set -e

# Set Docker Compose environment variables
export REGISTRY=ghcr.io
export IMAGE_NAME=$GITHUB_REPOSITORY  # This is automatically set by GitHub Actions
export VERSION=${VERSION:-latest}     # Use the version from the workflow or default to latest

# Install Doppler CLI if not already installed
if ! command -v doppler &> /dev/null; then
    echo "Installing Doppler CLI..."
    curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh
fi

# Login to Doppler and export all environment variables
echo "Configuring Doppler..."
doppler configure set token $DOPPLER_TOKEN
echo "Loading environment variables..."
eval $(doppler secrets export --format env)

# Login to GitHub Container Registry
echo "Logging in to GitHub Container Registry..."
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

# Pull latest images
echo "Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Run Docker Compose with all environment variables
echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Clean up unused images
echo "Cleaning up unused images..."
docker image prune -f

echo "Deployment completed successfully!" 