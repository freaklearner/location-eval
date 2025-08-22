#!/bin/bash

# SSL Setup Script using Let's Encrypt
# Run this after setting up your domain and DNS

set -e

echo "🔒 SSL Setup for Location Evaluation Tool"
echo "======================================="

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

# Get domain name
read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    print_error "Domain name is required"
    exit 1
fi

# Install certbot
print_status "Installing Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# Stop nginx temporarily
print_status "Stopping Nginx temporarily..."
systemctl stop nginx

# Obtain SSL certificate
print_status "Obtaining SSL certificate for $DOMAIN..."
certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --agree-tos --no-eff-email --email admin@$DOMAIN

# Create enhanced nginx configuration with SSL
print_status "Creating SSL-enabled Nginx configuration..."
cat > /etc/nginx/sites-available/location-evaluation-tool << EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

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

# Test nginx configuration
print_status "Testing Nginx configuration..."
nginx -t

# Start nginx
print_status "Starting Nginx..."
systemctl start nginx

# Set up automatic renewal
print_status "Setting up automatic SSL renewal..."
crontab -l > /tmp/crontab.bak 2>/dev/null || true
echo "0 12 * * * /usr/bin/certbot renew --quiet --nginx" >> /tmp/crontab.bak
crontab /tmp/crontab.bak
rm /tmp/crontab.bak

# Update environment variables
print_status "Updating environment configuration..."
if [ -f "/opt/location-evaluation-tool/.env" ]; then
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|g" /opt/location-evaluation-tool/.env
    print_success "Updated FRONTEND_URL in .env file"
else
    print_warning ".env file not found at /opt/location-evaluation-tool/.env"
fi

print_success "🎉 SSL setup completed successfully!"
echo ""
echo "🔒 Your site is now secured with SSL:"
echo "   https://$DOMAIN"
echo "   https://www.$DOMAIN"
echo ""
echo "📋 SSL Certificate Information:"
certbot certificates
echo ""
echo "🔄 Automatic renewal is set up via cron job"
echo "   Test renewal: certbot renew --dry-run"
echo ""

# Test the SSL setup
print_status "Testing SSL configuration..."
if curl -f https://$DOMAIN > /dev/null 2>&1; then
    print_success "SSL is working correctly!"
else
    print_warning "SSL test failed. Check your DNS and firewall settings."
fi
