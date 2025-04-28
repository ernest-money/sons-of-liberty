#!/bin/bash
# build-and-push.sh
set -e  # Exit on any error

# Check if environment is specified
if [ -z "$1" ]; then
  echo "Error: No environment specified. Please provide an environment (development, staging, or production)."
  exit 1
fi

# Define variables
ENVIRONMENT=$1  # development, staging, or production
FRONTEND_IMAGE_NAME="bennyblader/sol-frontend"
SOL_IMAGE_NAME="bennyblader/sol"
GIT_COMMIT=$(git rev-parse --short HEAD)  # Get short commit hash
TAG="${ENVIRONMENT}-${GIT_COMMIT}"
LATEST_TAG="${ENVIRONMENT}"

# Login to Docker Hub
if ! docker login -u $DOCKERHUB_USERNAME -p $DOCKERHUB_PASSWORD; then
  echo "Error: Failed to login to Docker Hub"
  exit 1
fi

# Create and use a new builder instance if it doesn't exist, otherwise use existing one
if ! docker buildx inspect sol-builder > /dev/null 2>&1; then
  if ! docker buildx create --name sol-builder; then
    echo "Error: Failed to create Docker buildx builder instance"
    exit 1
  fi
fi

# Use the builder
if ! docker buildx use sol-builder; then
  echo "Error: Failed to use Docker buildx builder instance"
  exit 1
fi

# Build multi-platform images for SOL
echo "Building SOL images..."
if ! docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg ENVIRONMENT=$ENVIRONMENT \
  -t $SOL_IMAGE_NAME:$TAG \
  -t $SOL_IMAGE_NAME:$LATEST_TAG \
  -f ./docker/dockerfile \
  --push .; then
  echo "Error: Failed to build and push ${SOL_IMAGE_NAME}:${TAG} and ${SOL_IMAGE_NAME}:${LATEST_TAG}"
  exit 1
fi

# Build multi-platform images for Frontend
echo "Building Frontend images..."
if ! docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg ENVIRONMENT=$ENVIRONMENT \
  -t $FRONTEND_IMAGE_NAME:$TAG \
  -t $FRONTEND_IMAGE_NAME:$LATEST_TAG \
  -f ./docker/dockerfile-frontend \
  --push .; then
  echo "Error: Failed to build and push ${FRONTEND_IMAGE_NAME}:${TAG} and ${FRONTEND_IMAGE_NAME}:${LATEST_TAG}"
  exit 1
fi

docker buildx rm sol-builder > /dev/null 2>&1

echo "Successfully built and pushed ${SOL_IMAGE_NAME}:${TAG} and ${SOL_IMAGE_NAME}:${LATEST_TAG} and ${FRONTEND_IMAGE_NAME}:${TAG} and ${FRONTEND_IMAGE_NAME}:${LATEST_TAG}"