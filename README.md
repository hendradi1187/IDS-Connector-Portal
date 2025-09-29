# IDS Connector Portal

Portal aplikasi untuk mengelola IDS (Industrial Data Space) Connector dengan antarmuka web modern.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Docker Compose (sudah termasuk dalam Docker Desktop)

### Installation dengan Docker Compose

1. **Clone repository dan masuk ke direktori**
   ```bash
   git clone <repository-url>
   cd IDS-Connector-Portal
   ```

2. **Setup environment variables**
   ```bash
   # Copy file environment
   cp .env.example .env.production
   ```

3. **Konfigurasi database di .env.production**
   ```env
   POSTGRES_USER=your_username
   POSTGRES_PASSWORD=your_strong_password
   POSTGRES_DB=ids_portal_db
   DATABASE_URL=postgresql://your_username:your_strong_password@db:5432/ids_portal_db
   ```

4. **Build dan jalankan aplikasi**
   ```bash
   # Build dan jalankan semua services
   docker-compose up -d

   # Atau untuk development dengan logs
   docker-compose up --build
   ```

5. **Akses aplikasi**
   - Aplikasi web: `http://localhost`
   - Database: `localhost:5432`

### Docker Commands

```bash
# Stop semua services
docker-compose down

# Rebuild dan restart
docker-compose up --build -d

# Lihat logs aplikasi
docker-compose logs -f app

# Reset database (hapus semua data)
docker-compose down -v
docker-compose up -d

# Masuk ke container aplikasi
docker-compose exec app sh

# Backup database
docker-compose exec db pg_dump -U your_username ids_portal_db > backup.sql
```

### Development

Untuk development mode tanpa Docker:

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Jalankan aplikasi
npm run dev
```

## 📁 Project Structure

```
├── src/app/          # Next.js app router
├── prisma/           # Database schema
├── docker-compose.yml # Docker services configuration
├── Dockerfile        # Application container
├── nginx.conf        # Nginx reverse proxy config
└── README.md
```

## 🔧 Configuration

- **nginx.conf**: Konfigurasi reverse proxy Nginx
- **docker-compose.yml**: Definisi services (app, database, nginx)
- **Dockerfile**: Multi-stage build untuk optimasi production
- **.env.production**: Environment variables untuk production

## 📝 Features

- Dashboard Overview dengan real-time monitoring
- User Management dengan role-based access
- GUI Configuration Tabs
- Data Management Tools
- Connector Controller Interface
- Dataspace Connector Modules
- External Services Aggregation
