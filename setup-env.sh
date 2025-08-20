#!/bin/bash

# Environment Configuration Script for Personal Website
# This script helps switch between different environment configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo -e "${BLUE}Usage: $0 [environment]${NC}"
    echo ""
    echo "Available environments:"
    echo "  development  - Local development (localhost)"
    echo "  production   - Production deployment (colemanlai.com)"
    echo "  local        - Local network access"
    echo ""
    echo "Example:"
    echo "  $0 development"
    echo "  $0 production"
}

# Function to set environment
set_environment() {
    local env=$1
    
    case $env in
        development)
            echo -e "${YELLOW}Setting up development environment...${NC}"
            cp .env.development .env
            cp server/.env.development server/.env
            echo -e "${GREEN}✓ Development environment configured${NC}"
            echo -e "${BLUE}Frontend: http://localhost:5173${NC}"
            echo -e "${BLUE}API: http://localhost:3001/api${NC}"
            ;;
        production)
            echo -e "${YELLOW}Setting up production environment...${NC}"
            cp .env.production .env
            cp server/.env.production server/.env
            echo -e "${GREEN}✓ Production environment configured${NC}"
            echo -e "${BLUE}Frontend: https://www.colemanlai.com${NC}"
            echo -e "${BLUE}API: https://api.colemanlai.com/api${NC}"
            echo -e "${RED}⚠️  Remember to change the admin password in server/.env!${NC}"
            ;;
        local)
            echo -e "${YELLOW}Setting up local network environment...${NC}"
            
            # Try to detect IP address
            if command -v ip &> /dev/null; then
                LOCAL_IP=$(ip route get 1.1.1.1 | awk '{print $7; exit}')
            elif command -v ifconfig &> /dev/null; then
                LOCAL_IP=$(ifconfig | grep -E "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
            else
                LOCAL_IP="YOUR_IP"
            fi
            
            # Update local env file with detected IP
            if [ "$LOCAL_IP" != "YOUR_IP" ]; then
                sed "s/YOUR_IP/$LOCAL_IP/g" .env.local > .env
                echo -e "${GREEN}✓ Detected IP: $LOCAL_IP${NC}"
            else
                cp .env.local .env
                echo -e "${YELLOW}⚠️  Could not detect IP address. Please manually replace YOUR_IP in .env${NC}"
            fi
            
            cp server/.env.local server/.env
            echo -e "${GREEN}✓ Local network environment configured${NC}"
            echo -e "${BLUE}Frontend: http://$LOCAL_IP:5173${NC}"
            echo -e "${BLUE}API: http://$LOCAL_IP:3001/api${NC}"
            ;;
        *)
            echo -e "${RED}Error: Unknown environment '$env'${NC}"
            usage
            exit 1
            ;;
    esac
}

# Main script logic
if [ $# -eq 0 ]; then
    usage
    exit 1
fi

if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
fi

set_environment $1

echo ""
echo -e "${GREEN}Environment setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Install server dependencies: cd server && npm install"
echo "  2. Install frontend dependencies: npm install"
echo "  3. Start the server: cd server && npm start"
echo "  4. Start the frontend: npm run dev"
