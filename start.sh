#!/bin/bash

# Update repository
git pull

# Build
docker-compose build

# Start services
docker-compose up -d