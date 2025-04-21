#!/bin/bash

# Exit on error
set -e

# Install Doppler CLI if not already installed
if ! command -v doppler &> /dev/null; then
    echo "Installing Doppler CLI..."
    curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh
fi

# Login to Doppler
echo "Configuring Doppler..."
doppler configure set token $DOPPLER_TOKEN

# Pull latest images
echo "Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Run Docker Compose with Doppler environment variables
echo "Starting services..."
doppler run -- docker-compose -f docker-compose.prod.yml up -d

# Clean up unused images
echo "Cleaning up unused images..."
docker image prune -f

echo "Deployment completed successfully!" 