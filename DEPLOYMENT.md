# IDS Connector Portal - Deployment Guide

Comprehensive guide for deploying IDS Connector Portal in various environments.

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Deployment Configurations](#deployment-configurations)
- [Environment Variables](#environment-variables)
- [Production Deployment](#production-deployment)
- [Development Setup](#development-setup)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

**Default Production Setup (Recommended):**

```bash
# Start the application with Nginx reverse proxy
docker compose up -d

# Access the application
# HTTP:  http://localhost:8080
# HTTPS: https://localhost:8443
```

---

## 🔧 Deployment Configurations

The project includes three Docker Compose configurations for different scenarios:

### 1. **docker-compose.yml** (Production - Default)

**Best for:** Production deployments with Nginx reverse proxy

```bash
docker compose up -d
```

**Features:**
- ✅ Nginx reverse proxy for SSL termination
- ✅ Health checks for all services
- ✅ No exposed ports (secure)
- ✅ Production-optimized
- ✅ Automatic restart on failure

**Access:**
- App: `http://localhost:8080` or `https://localhost:8443`
- Database: Internal only (secure)

**Ports:**
- `8080:80` - HTTP (change to `80:80` in production)
- `8443:443` - HTTPS (change to `443:443` in production)

---

### 2. **docker-compose.dev.yml** (Development)

**Best for:** Local development with debugging capabilities

```bash
docker compose -f docker-compose.dev.yml up -d
```

**Features:**
- ✅ All ports exposed for debugging
- ✅ Direct access to Next.js and PostgreSQL
- ✅ Hot reload support (optional)
- ✅ Detailed logging
- ✅ Database tools access (pgAdmin, DBeaver)

**Access:**
- App (Direct): `http://localhost:3000`
- App (Nginx): `http://localhost:8080`
- Database: `postgresql://localhost:5432`

**Ports:**
- `3000:3000` - Next.js (direct access)
- `5432:5432` - PostgreSQL (direct access)
- `8080:80` - Nginx HTTP
- `8443:443` - Nginx HTTPS

---

### 3. **docker-compose.no-nginx.yml** (Standalone)

**Best for:** Integration with existing web server/proxy

```bash
docker compose -f docker-compose.no-nginx.yml up -d
```

**Use Cases:**
- Existing web server (Apache, Nginx, IIS, Caddy)
- External reverse proxy (Cloudflare Tunnel, ngrok)
- Corporate proxy/load balancer
- Kubernetes orchestration

**Features:**
- ✅ No Nginx included (bring your own)
- ✅ Direct app and database access
- ✅ Lightweight deployment

**Access:**
- App: `http://localhost:3000`
- Database: `postgresql://localhost:5432`

**Note:** Configure your external proxy to forward to `http://localhost:3000`

---

## 🔐 Environment Variables

### Required Configuration

Create `.env.production` file (or copy from `.env.example`):

```bash
# Database Configuration
POSTGRES_USER=ids_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=ids_portal_prod

# Database URL (auto-generated from above)
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public"

# Next.js Configuration
NODE_ENV=production
NEXTAUTH_URL="https://your-domain.com"
AUTH_SECRET="generate_random_secret_here"

# Server Actions Support
HOSTNAME=0.0.0.0
```

### Generate Secure Secrets

```bash
# Generate AUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🌐 Production Deployment

### Step 1: Configure Environment

1. Copy environment template:
   ```bash
   cp .env.example .env.production
   ```

2. Edit `.env.production`:
   - Set strong `POSTGRES_PASSWORD`
   - Generate new `AUTH_SECRET`
   - Update `NEXTAUTH_URL` to your domain

### Step 2: Configure SSL (HTTPS)

1. Obtain SSL certificates (Let's Encrypt, Cloudflare, etc.)

2. Update `docker-compose.yml`:
   ```yaml
   nginx:
     ports:
       - "80:80"      # Change from 8080
       - "443:443"    # Change from 8443
     volumes:
       - ./nginx.conf:/etc/nginx/nginx.conf:ro
       - ./certs:/etc/nginx/certs:ro  # Add SSL certs
   ```

3. Update `nginx.conf` with SSL configuration

### Step 3: Deploy

```bash
# Build and start services
docker compose up -d --build

# Verify all services are running
docker compose ps

# Check logs
docker compose logs -f

# Run database migrations
docker compose exec app npx prisma db push
```

### Step 4: Verify Deployment

```bash
# Test app health
curl http://localhost:8080

# Test database connection
docker compose exec db psql -U ids_user -d ids_portal_prod -c "SELECT version();"

# Check service status
docker compose ps
```

---

## 💻 Development Setup

### Local Development

```bash
# Start with development config
docker compose -f docker-compose.dev.yml up -d

# Watch logs
docker compose -f docker-compose.dev.yml logs -f app

# Access services
# - App: http://localhost:3000
# - DB: postgresql://localhost:5432
```

### Database Management

```bash
# Run Prisma migrations
docker compose exec app npx prisma db push

# Open Prisma Studio
docker compose exec app npx prisma studio

# Backup database
docker compose exec db pg_dump -U ids_user ids_portal_prod > backup.sql

# Restore database
docker compose exec -T db psql -U ids_user ids_portal_prod < backup.sql
```

---

## 🔍 Troubleshooting

### Server Actions Error

**Error:** `Invalid Server Actions request - x-forwarded-host mismatch`

**Solution:** Ensure nginx.conf has correct headers:
```nginx
proxy_set_header Host $http_host;
proxy_set_header X-Forwarded-Host $http_host;
```

### Database Connection Failed

**Error:** `Can't reach database server`

**Solution:**
1. Check if database is running: `docker compose ps db`
2. Verify environment variables: `docker compose config`
3. Check logs: `docker compose logs db`

### Port Already in Use

**Error:** `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solutions:**
1. Use development config (different ports)
2. Stop conflicting service
3. Change ports in docker-compose.yml

### Build Failures

```bash
# Clean rebuild
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

---

## 📦 Common Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f [service_name]

# Rebuild specific service
docker compose up -d --build app

# Remove all data (⚠️ destructive)
docker compose down -v

# Health check
docker compose ps
docker compose exec app wget --spider http://localhost:3000

# Database shell
docker compose exec db psql -U ids_user ids_portal_prod

# App shell
docker compose exec app sh
```

---

## 🔒 Security Checklist

- [ ] Strong database password set
- [ ] AUTH_SECRET generated and unique
- [ ] SSL certificates configured (production)
- [ ] Database ports not exposed (production)
- [ ] Environment files in .gitignore
- [ ] Regular backups configured
- [ ] Firewall rules configured
- [ ] Docker images regularly updated

---

## 📞 Support

For issues and questions:
- Check logs: `docker compose logs -f`
- Verify configuration: `docker compose config`
- Review this guide's troubleshooting section

---

**Last Updated:** 2025-10-03
**Version:** 1.0.0
