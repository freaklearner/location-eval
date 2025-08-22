#!/bin/bash

# DigitalOcean Droplet Setup Script
# Run this script on your DigitalOcean droplet to prepare it for deployment

set -e

echo "🌊 DigitalOcean Droplet Setup for Location Evaluation Tool"
echo "========================================================"

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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
print_status "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
print_status "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Start and enable Docker
print_status "Starting Docker service..."
systemctl start docker
systemctl enable docker

# Install Node.js (for any additional tooling)
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Nginx (for reverse proxy)
print_status "Installing Nginx..."
apt install -y nginx

# Configure firewall
print_status "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000
ufw allow 3001

# Create application directory
print_status "Creating application directory..."
mkdir -p /opt/location-evaluation-tool
chown $SUDO_USER:$SUDO_USER /opt/location-evaluation-tool

# Create nginx configuration for reverse proxy
print_status "Creating Nginx configuration..."
cat > /etc/nginx/sites-available/location-evaluation-tool << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/location-evaluation-tool /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Start nginx
systemctl start nginx
systemctl enable nginx

# Create systemd service for the application
print_status "Creating systemd service..."
cat > /etc/systemd/system/location-evaluation-tool.service << EOF
[Unit]
Description=Location Evaluation Tool
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/location-evaluation-tool
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=$SUDO_USER
Group=$SUDO_USER

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable location-evaluation-tool

print_success "✅ DigitalOcean droplet setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Clone your repository to /opt/location-evaluation-tool"
echo "2. Copy your .env file with API keys"
echo "3. Update the Nginx configuration with your actual domain"
echo "4. Start the application: systemctl start location-evaluation-tool"
echo "5. (Optional) Set up SSL with Let's Encrypt"
echo ""
echo "🔧 Useful commands:"
echo "   Check status: systemctl status location-evaluation-tool"
echo "   View logs: journalctl -u location-evaluation-tool -f"
echo "   Restart: systemctl restart location-evaluation-tool"
echo "   Check nginx: systemctl status nginx"
echo ""

# Show system info
print_status "System information:"
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"
echo "Node.js version: $(node --version)"
echo "Nginx version: $(nginx -v 2>&1)"
echo "UFW status: $(ufw status)"
