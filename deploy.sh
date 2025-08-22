#!/bin/bash

# Location Evaluation Tool - DigitalOcean Deployment Script
# This script helps deploy the application to a DigitalOcean droplet

set -e  # Exit on any error

echo "🚀 Location Evaluation Tool - DigitalOcean Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Please create one from .env.example"
    echo "cp .env.example .env"
    echo "Then edit .env with your actual API keys and domain."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Checking environment variables..."

# Source the .env file to check variables
source .env

if [ -z "$GOOGLE_MAPS_API_KEY" ] || [ "$GOOGLE_MAPS_API_KEY" = "your_google_maps_api_key_here" ]; then
    print_error "GOOGLE_MAPS_API_KEY is not set in .env file"
    exit 1
fi

if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_gemini_api_key_here" ]; then
    print_error "GEMINI_API_KEY is not set in .env file"
    exit 1
fi

print_success "Environment variables are configured"

# Build and start the application
print_status "Building Docker images..."
docker-compose build --no-cache

print_status "Starting the application..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 10

# Check health
print_status "Checking application health..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Backend is healthy!"
else
    print_error "Backend health check failed"
    print_status "Checking logs..."
    docker-compose logs
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is accessible!"
else
    print_warning "Frontend might take a moment to be ready"
fi

print_success "🎉 Deployment completed successfully!"
echo ""
echo "📍 Your Location Evaluation Tool is now running:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001/api"
echo "   Health Check: http://localhost:3001/api/health"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop app: docker-compose down"
echo "   Restart: docker-compose restart"
echo "   Update: git pull && docker-compose build --no-cache && docker-compose up -d"
echo ""

# Show running containers
print_status "Running containers:"
docker-compose ps
