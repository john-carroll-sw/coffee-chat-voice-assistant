# Stage 1: Build the Vite app
FROM node:20-slim AS build-stage

# Set the working directory inside the container
WORKDIR /frontend

# Accept build arguments for frontend env variables
ARG VITE_AUTH_URL
ARG VITE_AUTH_ENABLED

# Debug environment variables 
RUN echo "Building with VITE_AUTH_URL=$VITE_AUTH_URL, VITE_AUTH_ENABLED=$VITE_AUTH_ENABLED"

COPY frontend ./

# Create .env file dynamically if not already in the copied files
RUN if [ ! -f .env ]; then \
      echo "Creating .env file"; \
      echo "VITE_AUTH_URL=${VITE_AUTH_URL}" > .env; \
      echo "VITE_AUTH_ENABLED=${VITE_AUTH_ENABLED}" >> .env; \
    else \
      echo "Using existing .env file"; \
      cat .env; \
    fi

RUN npm install
RUN npm run build

# Stage 2: Serve the built app with a static file server
FROM python:3.12-slim AS production-stage

WORKDIR /app
COPY --from=build-stage /backend/static /app/static
COPY ./backend/ /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN python -m pip install -r requirements.txt

RUN python -m pip install gunicorn

CMD ["python3", "-m", "gunicorn", "app:create_app", "-b", "0.0.0.0:8000", "--worker-class", "aiohttp.GunicornWebWorker"]
