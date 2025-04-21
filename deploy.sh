#!/bin/bash

# Exit immediately on error
set -e

# Set Docker Compose environment variables
export REGISTRY=ghcr.io
export IMAGE_NAME=${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}
export VERSION=${VERSION:-$(git describe --tags --always 2>/dev/null || echo "latest")}
export DOPPLER_TOKEN=${DOPPLER_TOKEN:?DOPPLER_TOKEN is required}
export GITHUB_TOKEN=${GITHUB_TOKEN:?GITHUB_TOKEN is required}
export GITHUB_ACTOR=${GITHUB_ACTOR:?GITHUB_ACTOR is required}

# Install Doppler CLI if not already installed
if ! command -v doppler &> /dev/null; then
    echo "Installing Doppler CLI..."
    curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh
fi

# Configure Doppler
echo "Configuring Doppler..."
doppler configure set token "$DOPPLER_TOKEN" --silent

# Export environment variables from Doppler
echo "Loading environment variables from Doppler..."
eval "$(doppler secrets export --format bash)"

# Echo all envs for debugging (you can remove this later)
echo "🔍 Doppler environment variables:"
doppler secrets export --format env

# Login to GitHub Container Registry
echo "🔐 Logging in to GitHub Container Registry..."
echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin

# Pull and start services
echo "📦 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Clean up unused images
echo "🧹 Cleaning up unused Docker images..."
docker image prune -f

echo "✅ Deployment completed successfully! Version: $VERSION"

