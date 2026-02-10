#!/bin/bash
# AWS Lightsail Deployment Script for GroupTrip
# Run this on a fresh Ubuntu instance

set -e

echo "=== GroupTrip Lightsail Setup ==="

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx for reverse proxy (optional, can use container)
sudo apt install -y nginx certbot python3-certbot-nginx

# Create app directory
sudo mkdir -p /opt/grouptrip
sudo chown $USER:$USER /opt/grouptrip

echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Clone your repository to /opt/grouptrip"
echo "2. Create .env file with production values"
echo "3. Run: docker-compose up -d"
echo "4. Configure SSL with: sudo certbot --nginx"
