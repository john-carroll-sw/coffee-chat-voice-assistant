# Deployment Instructions

## What The Deployment Script Does

1. Loads environment variables from the specified .env file
2. Creates or updates Azure resources:
   - Resource Group
   - Azure Container Registry
   - App Service Plan
   - Web App
   - Application Insights
   - Log Analytics Workspace
3. Builds the Docker image locally using the specified Dockerfile and context
4. Pushes the image to Azure Container Registry
5. Configures the Web App with all environment variables

## Build and Test Locally with Docker

From the root directory, execute the following commands:

```bash
docker build -t coffee-chat-app -f ./app/Dockerfile ./app
docker run -p 8000:8000 --env-file ./app/backend/.env coffee-chat-app:latest
```

## Deploy the Application

After testing locally, deploy the application with:

```bash
./scripts/deploy.sh \
    --env-file ./app/backend/.env \
    --dockerfile ./app/Dockerfile \
    --context ./app \
    coffee-chat-assistant
```
