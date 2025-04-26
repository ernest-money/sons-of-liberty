#!/bin/bash
# build-and-push.sh

# Define variables
ENVIRONMENT=$1  # development, staging, or production
FRONTEND_IMAGE_NAME="bennyblader/sol-frontend"
SOL_IMAGE_NAME="bennyblader/sol"
GIT_COMMIT=$(git rev-parse --short HEAD)  # Get short commit hash
TAG="${ENVIRONMENT}-${GIT_COMMIT}"
LATEST_TAG="${ENVIRONMENT}"

# Set NODE_ENV for the build
export NODE_ENV=$ENVIRONMENT

docker build \
  --build-arg ENVIRONMENT=$ENVIRONMENT \
  -t $SOL_IMAGE_NAME:$TAG \
  -t $SOL_IMAGE_NAME:$LATEST_TAG \
  -f ./docker/dockerfile .

# Build the Docker image
docker build \
  --build-arg ENVIRONMENT=$ENVIRONMENT \
  -t $FRONTEND_IMAGE_NAME:$TAG \
  -t $FRONTEND_IMAGE_NAME:$LATEST_TAG \
  -f ./docker/dockerfile-frontend .

# Log in to Docker Hub (consider using a more secure method to handle credentials)
echo "Logging in to Docker Hub..."
docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD

# Push images to Docker Hub
docker push $SOL_IMAGE_NAME:$TAG
docker push $SOL_IMAGE_NAME:$LATEST_TAG
docker push $FRONTEND_IMAGE_NAME:$TAG
docker push $FRONTEND_IMAGE_NAME:$LATEST_TAG

echo "Successfully built and pushed ${SOL_IMAGE_NAME}:${TAG} and ${SOL_IMAGE_NAME}:${LATEST_TAG} and ${FRONTEND_IMAGE_NAME}:${TAG} and ${FRONTEND_IMAGE_NAME}:${LATEST_TAG}"