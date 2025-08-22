# 🌊 DigitalOcean Deployment Guide - Location Evaluation Tool

This comprehensive guide will help you deploy your Location Evaluation Tool to DigitalOcean and make it accessible through the internet.

## 📋 Prerequisites

Before starting, ensure you have:

1. **DigitalOcean Account** with billing enabled
2. **Domain Name** (optional but recommended)
3. **API Keys**:
   - Google Maps API Key
   - Gemini AI API Key
4. **Local Environment**:
   - Git installed
   - SSH client

## 🚀 Deployment Options

Choose one of these deployment methods:

### Option A: Quick Deploy with Docker (Recommended)
### Option B: Manual Setup
### Option C: DigitalOcean App Platform

---

## 🐳 Option A: Quick Deploy with Docker (Recommended)

### Step 1: Create DigitalOcean Droplet

1. **Log into DigitalOcean Dashboard**
2. **Create New Droplet**:
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Basic plan, $12/month (2GB RAM, 1 vCPU, 50GB SSD)
   - **Region**: Choose closest to your users
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: `location-eval-tool`

3. **Wait for droplet creation** (~1-2 minutes)

### Step 2: Connect to Your Droplet

```bash
# Replace YOUR_DROPLET_IP with actual IP
ssh root@YOUR_DROPLET_IP
```

### Step 3: Run Setup Script

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/Location-Evaluation-Tool/main/scripts/digitalocean-setup.sh -o setup.sh
chmod +x setup.sh
sudo ./setup.sh
```

**What this script does:**
- Updates system packages
- Installs Docker & Docker Compose
- Installs Node.js, Nginx
- Configures firewall
- Sets up reverse proxy
- Creates systemd service

### Step 4: Deploy Your Application

```bash
# Switch to application directory
cd /opt/location-evaluation-tool

# Clone your repository
git clone https://github.com/yourusername/Location-Evaluation-Tool.git .

# Create environment file
cp .env.example .env
nano .env
```

**Configure `.env` file:**
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://YOUR_DROPLET_IP  # or https://yourdomain.com
GOOGLE_MAPS_API_KEY=your_actual_google_maps_key
GEMINI_API_KEY=your_actual_gemini_key
```

### Step 5: Build and Start Application

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy the application
./deploy.sh
```

### Step 6: Configure Domain (Optional)

If you have a domain:

1. **Point your domain to droplet IP**:
   - Create A record: `yourdomain.com` → `YOUR_DROPLET_IP`
   - Create A record: `www.yourdomain.com` → `YOUR_DROPLET_IP`

2. **Update Nginx configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/location-evaluation-tool
   # Replace 'your-domain.com' with your actual domain
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **Update environment**:
   ```bash
   nano .env
   # Update FRONTEND_URL=https://yourdomain.com
   docker-compose restart
   ```

### Step 7: Set Up SSL (Recommended)

```bash
# Download and run SSL setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/Location-Evaluation-Tool/main/scripts/ssl-setup.sh -o ssl-setup.sh
chmod +x ssl-setup.sh
sudo ./ssl-setup.sh
```

**🎉 Your application is now live!**
- Frontend: `https://yourdomain.com` or `http://YOUR_DROPLET_IP:3000`
- Backend API: `https://yourdomain.com/api` or `http://YOUR_DROPLET_IP:3001/api`

---

## 🛠️ Option B: Manual Setup

### Step 1: Create and Connect to Droplet
Same as Option A, Steps 1-2.

### Step 2: Install Dependencies Manually

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install -y nginx
```

### Step 3: Clone and Configure Application

```bash
# Create app directory
sudo mkdir -p /opt/location-evaluation-tool
sudo chown $USER:$USER /opt/location-evaluation-tool
cd /opt/location-evaluation-tool

# Clone repository
git clone https://github.com/yourusername/Location-Evaluation-Tool.git .

# Configure environment
cp .env.example .env
nano .env  # Add your API keys
```

### Step 4: Build and Deploy

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### Step 5: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/location-evaluation-tool
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name YOUR_DROPLET_IP yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/location-evaluation-tool /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## ☁️ Option C: DigitalOcean App Platform

### Step 1: Prepare Repository

1. **Push code to GitHub/GitLab**
2. **Create `app.yaml`** in your repository root:

```yaml
name: location-evaluation-tool
services:
- name: backend
  source_dir: /backend
  github:
    repo: yourusername/Location-Evaluation-Tool
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "3001"
  - key: GOOGLE_MAPS_API_KEY
    value: your_key_here
    type: SECRET
  - key: GEMINI_API_KEY
    value: your_key_here
    type: SECRET
  http_port: 3001

- name: frontend
  source_dir: /
  github:
    repo: yourusername/Location-Evaluation-Tool
    branch: main
  run_command: serve -s build -l 3000
  build_command: npm install && npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: REACT_APP_BACKEND_URL
    value: ${backend.PUBLIC_URL}/api
  http_port: 3000
```

### Step 2: Deploy via App Platform

1. **Go to DigitalOcean Apps**
2. **Create New App**
3. **Connect GitHub repository**
4. **Configure environment variables**
5. **Deploy**

**Estimated cost**: $12-24/month

---

## 🔧 Management Commands

### Useful Docker Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop application
docker-compose down

# Update application
git pull
docker-compose build --no-cache
docker-compose up -d

# View running containers
docker-compose ps

# Access container shell
docker-compose exec location-evaluation-tool sh
```

### System Commands

```bash
# Check application status
systemctl status location-evaluation-tool

# Start/stop via systemd
sudo systemctl start location-evaluation-tool
sudo systemctl stop location-evaluation-tool

# View system logs
journalctl -u location-evaluation-tool -f

# Check Nginx status
sudo systemctl status nginx

# Reload Nginx configuration
sudo nginx -t && sudo systemctl reload nginx
```

### Health Checks

```bash
# Check backend health
curl http://localhost:3001/api/health

# Check frontend
curl http://localhost:3000

# Check external access
curl http://YOUR_DROPLET_IP/api/health
```

---

## 🔒 Security Best Practices

### 1. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

### 2. SSL/TLS Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Environment Security

- **Never commit API keys** to version control
- **Use strong passwords** for droplet access
- **Regular updates**: `sudo apt update && sudo apt upgrade`
- **Monitor logs** regularly
- **Backup data** periodically

---

## 📊 Monitoring & Maintenance

### 1. Log Monitoring

```bash
# Application logs
docker-compose logs -f

# System logs
sudo journalctl -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Performance Monitoring

```bash
# System resources
htop
df -h
free -h

# Docker stats
docker stats

# Network connections
netstat -tulpn
```

### 3. Backup Strategy

```bash
# Backup application data
tar -czf backup-$(date +%Y%m%d).tar.gz /opt/location-evaluation-tool

# Backup to DigitalOcean Spaces (optional)
# Install s3cmd and configure with Spaces credentials
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
docker-compose logs

# Check environment variables
cat .env

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### 2. API Keys Not Working
```bash
# Verify environment variables
docker-compose exec location-evaluation-tool env | grep API

# Test API endpoints
curl http://localhost:3001/api/health
```

#### 3. Nginx Configuration Issues
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

#### 4. SSL Certificate Problems
```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew --nginx

# Check SSL configuration
openssl s_client -connect yourdomain.com:443
```

### Performance Issues

#### 1. High Memory Usage
```bash
# Check memory usage
free -h
docker stats

# Restart containers
docker-compose restart
```

#### 2. Slow Response Times
```bash
# Check backend health
curl -w "@-" -o /dev/null -s "http://localhost:3001/api/health" <<< "
time_namelookup:  %{time_namelookup}
time_connect:     %{time_connect}
time_appconnect:  %{time_appconnect}
time_pretransfer: %{time_pretransfer}
time_redirect:    %{time_redirect}
time_starttransfer: %{time_starttransfer}
time_total:       %{time_total}
"
```

---

## 💰 Cost Estimation

### DigitalOcean Droplet Pricing

| Size | vCPUs | Memory | Storage | Bandwidth | Price/Month |
|------|-------|--------|---------|-----------|-------------|
| Basic | 1 | 1GB | 25GB | 1TB | $6 |
| **Recommended** | 1 | 2GB | 50GB | 2TB | **$12** |
| Premium | 2 | 2GB | 60GB | 3TB | $18 |
| High Performance | 2 | 4GB | 80GB | 4TB | $24 |

### Additional Costs (Optional)

- **Domain Name**: $10-15/year
- **Load Balancer**: $12/month
- **Managed Database**: $15/month
- **Backup Storage**: $1/month per 20GB
- **Monitoring**: $0 (basic) to $6/month (advanced)

**Recommended Setup Total**: $12-15/month

---

## 🎯 Next Steps

After successful deployment:

1. **Test all functionality**
   - Location analysis
   - Google Maps integration
   - AI evaluation
   - Report generation

2. **Set up monitoring**
   - Application health checks
   - Performance monitoring
   - Error tracking

3. **Configure backups**
   - Application data
   - Configuration files
   - Database (if added)

4. **Optimize performance**
   - Enable caching
   - Optimize images
   - Configure CDN (optional)

5. **Set up CI/CD** (optional)
   - Automated deployments
   - Testing pipeline
   - Environment management

---

## 📞 Support

If you encounter issues:

1. **Check logs** first using the commands above
2. **Verify environment variables** and API keys
3. **Test individual components** (frontend, backend, nginx)
4. **Review firewall and DNS settings**
5. **Check DigitalOcean status page** for service issues

**Common Support Resources:**
- DigitalOcean Community: https://www.digitalocean.com/community
- Docker Documentation: https://docs.docker.com
- Nginx Documentation: https://nginx.org/en/docs/

---

## 🎉 Congratulations!

Your Location Evaluation Tool is now deployed and accessible through the internet! Users can now access your application to evaluate locations for The Momos Mafia franchise expansion.

**Quick Links:**
- 🌐 **Frontend**: https://yourdomain.com
- 🔗 **API**: https://yourdomain.com/api
- 📊 **Health Check**: https://yourdomain.com/api/health
- 📋 **API Documentation**: https://yourdomain.com/api/docs (if added)

Remember to keep your API keys secure and monitor your application regularly!
