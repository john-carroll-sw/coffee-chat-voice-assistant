#!/bin/bash

# Ensure frontend .env file exists before building Docker image
if [ -f "./app/frontend/.env" ]; then
  echo "✅ Frontend .env file found"
  echo "Contents:"
  cat "./app/frontend/.env"
else
    echo "⚠️ Frontend .env file not found, creating from sample or backend..."
    
    # Try to copy from backend env variables related to auth
    if [ -f "./app/backend/.env" ]; then
        echo "Creating frontend .env from backend variables"
        grep "VITE_" ./app/backend/.env > ./app/frontend/.env 2>/dev/null || echo "" > ./app/frontend/.env
        
        # If no VITE_ variables found, add the defaults
        if [ ! -s "./app/frontend/.env" ]; then
            echo "# Authentication Settings" > ./app/frontend/.env
            echo "VITE_AUTH_URL=YOUR_AUTH_URL_HERE" >> ./app/frontend/.env
            echo "VITE_AUTH_ENABLED=false" >> ./app/frontend/.env
            echo "Added default authentication settings to frontend .env (please update VITE_AUTH_URL)"
        fi
    else
        # Create a new .env file with default values
        echo "# Authentication Settings" > ./app/frontend/.env
        echo "VITE_AUTH_URL=YOUR_AUTH_URL_HERE" >> ./app/frontend/.env
        echo "VITE_AUTH_ENABLED=false" >> ./app/frontend/.env
        echo "Created new frontend .env with default settings (please update VITE_AUTH_URL)"
    fi
fi

# Build the Docker image with build arguments from .env
echo "🔨 Building Docker image..."
export $(grep -v '^#' ./app/frontend/.env | xargs)
docker build -t coffee-chat-app \
  --build-arg VITE_AUTH_URL="$VITE_AUTH_URL" \
  --build-arg VITE_AUTH_ENABLED="$VITE_AUTH_ENABLED" \
  -f ./app/Dockerfile ./app

# Run the container
echo "🚀 Running Docker container..."
docker run -p 8000:8000 --env-file ./app/backend/.env coffee-chat-app:latest
