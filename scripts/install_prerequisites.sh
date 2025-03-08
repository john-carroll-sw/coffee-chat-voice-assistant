#!/bin/bash

echo "Installing Azure CLI tools..."
brew update && brew install azure-cli

echo "Logging in to Azure..."
az login

echo "Installing Docker if not already installed..."
if ! command -v docker &> /dev/null; then
    echo "Docker not found, please install Docker Desktop from https://www.docker.com/products/docker-desktop"
fi

echo "Setup complete!"
