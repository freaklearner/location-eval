#!/bin/bash

# Quick Start Script for Location Evaluation Tool
# Use this for local development and testing

set -e

echo "🚀 Location Evaluation Tool - Quick Start"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    print_status "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    print_status "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_warning "Please edit .env file with your actual API keys:"
    print_status "  - GOOGLE_MAPS_API_KEY"
    print_status "  - GEMINI_API_KEY"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
fi

# Source environment variables
source .env

# Validate API keys
if [ -z "$GOOGLE_MAPS_API_KEY" ] || [ "$GOOGLE_MAPS_API_KEY" = "your_google_maps_api_key_here" ]; then
    print_error "Please set GOOGLE_MAPS_API_KEY in .env file"
    exit 1
fi

if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_gemini_api_key_here" ]; then
    print_error "Please set GEMINI_API_KEY in .env file"
    exit 1
fi

print_success "Environment variables are configured"

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Build and start services
print_status "Building Docker images..."
docker-compose build

print_status "Starting services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 15

# Check health
print_status "Checking application health..."

# Check backend
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "✅ Backend is healthy!"
else
    print_error "❌ Backend health check failed"
    print_status "Checking backend logs..."
    docker-compose logs location-evaluation-tool | tail -20
    exit 1
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "✅ Frontend is accessible!"
else
    print_warning "⚠️ Frontend might take a moment to be ready"
fi

print_success "🎉 Application is running successfully!"
echo ""
echo "📍 Access your Location Evaluation Tool:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001/api"
echo "   Health Check: http://localhost:3001/api/health"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop app: docker-compose down"
echo "   Restart: docker-compose restart"
echo ""

# Show running containers
print_status "Running containers:"
docker-compose ps

# Open browser (optional)
read -p "Open application in browser? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open http://localhost:3000
    elif command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3000
    else
        print_status "Please open http://localhost:3000 in your browser"
    fi
fi

print_status "To stop the application, run: docker-compose down"
