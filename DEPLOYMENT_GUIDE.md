# KyyStatus HD - Deployment Guide

## Quick Start (Development)

### 1. Clone & Install
```bash
cd /home/user/kyystatus-hd
git init
npm install
```

### 2. Install Dependencies for Both Client & Server
```bash
# Install all dependencies (uses npm workspaces)
npm install

# Or install separately
cd client && npm install
cd ../server && npm install
cd ..
```

### 3. Install FFmpeg (Required for Video Compression)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**MacOS:**
```bash
brew install ffmpeg
```

**Windows:**
- Download from https://ffmpeg.org/download.html
- Add to PATH

### 4. Start Development Servers
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### 5. Access the App
Open your browser and navigate to: **http://localhost:5173**

---

## Production Deployment

### Option 1: Railway (Recommended)

#### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/kyystatus-hd.git
git push -u origin main
```

#### Step 2: Import to Railway
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect the configuration

#### Step 3: Configure Environment Variables
In Railway dashboard:
- Go to your project
- Navigate to "Variables" tab
- Add these variables:
  ```
  NODE_ENV=production
  PORT=3000
  HOST=0.0.0.0
  CORS_ORIGIN=*
  SESSION_DIR=/data/sessions
  STORAGE_DIR=/data/storage
  TEMP_DIR=/data/temp
  ```

#### Step 4: Add Volume for Persistent Storage
1. Go to "Volumes" tab
2. Create a new volume named `data`
3. Mount path: `/data`

#### Step 5: Deploy
Click "Deploy" and wait for the build to complete.

#### Step 6: Access
Your app will be available at the Railway-provided URL.

---

### Option 2: Docker

#### Step 1: Build Image
```bash
docker-compose build
```

#### Step 2: Run Container
```bash
docker-compose up -d
```

#### Step 3: Access
- App: http://localhost:3000

#### Step 4: Stop
```bash
docker-compose down
```

---

### Option 3: Manual Deployment

#### Step 1: Build Frontend
```bash
cd client
npm run build
cd ..
```

#### Step 2: Build Backend
```bash
cd server
npm run build
cd ..
```

#### Step 3: Start Server
```bash
cd server
dist/server.js
```

#### Step 4: Serve Frontend
Use any static file server:
```bash
# Using serve
npx serve -s client/dist -l 5173

# Using nginx
# Configure nginx to serve client/dist and proxy /api to server

# Using pm2
pm2 start server/dist/server.js --name kyystatus-server
pm2 serve client/dist --name kyystatus-client -- 5173
```

---

## Configuration

### Environment Variables

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
CORS_ORIGIN=https://your-domain.com

# Storage Configuration
SESSION_DIR=./sessions
STORAGE_DIR=./storage
TEMP_DIR=./temp

# Security (Optional)
API_KEY=your-secret-key
REQUIRE_API_KEY=false

# Logging
LOG_LEVEL=info
```

### For Client

Create `.env` in `client/` directory:

```env
VITE_API_URL=https://your-api-domain.com
VITE_SOCKET_URL=https://your-api-domain.com
```

---

## Verify Installation

### Check FFmpeg
```bash
ffmpeg -version
```

Should output FFmpeg version info.

### Check Node.js
```bash
node -v
npm -v
```

Should be Node.js 18+ and npm 8+.

### Check Dependencies
```bash
cd server
npm ls @whiskeysockets/baileys fluent-ffmpeg
```

---

## Troubleshooting

### Error: FFmpeg not found
**Solution:** Install FFmpeg on your system (see above).

### Error: Port already in use
**Solution:** Change the PORT in `.env` or kill the existing process:
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Error: Session not persisting
**Solution:** Ensure the session directory exists and is writable:
```bash
mkdir -p sessions
chmod 755 sessions
```

### Error: Connection timeout
**Solution:** Check your internet connection and WhatsApp account.

### Error: Video compression failing
**Solution:** 
1. Verify FFmpeg is installed
2. Check FFmpeg supports the video codec
3. Try with a different video file

### Error: Cannot read property 'emit' of undefined
**Solution:** Ensure socket.io is properly initialized. Check the server logs.

---

## Updating

### Pull Latest Changes
```bash
git pull origin main
npm install
npm run build
```

### Restart Services
```bash
# Docker
docker-compose down
docker-compose up -d --build

# Manual
pm2 restart kyystatus-server
pm2 restart kyystatus-client
```

---

## Monitoring

### Logs
```bash
# Docker
docker-compose logs -f

# Manual
pm2 logs kyystatus-server
```

### Health Check
```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "version": "1.0.0",
  "connections": {
    "activeSockets": 0,
    "activeSessions": 0
  },
  "uptime": 123.456,
  "memory": {...}
}
```

---

## Scaling

### Multiple Instances
For production scaling, consider:
1. Using a load balancer
2. Redis for session sharing (advanced)
3. Multiple Docker containers

### Current Limitations
- Sessions are stored locally (not shared between instances)
- For multi-instance, implement Redis session store

---

## Security Best Practices

1. **HTTPS**: Always use HTTPS in production
2. **CORS**: Restrict CORS origins to your domain only
3. **API Key**: Enable API key authentication
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Session Cleanup**: Regularly clean up old sessions
6. **Updates**: Keep dependencies updated

---

## Backup & Restore

### Backup Data
```bash
# Backup sessions and storage
cp -r data/ data_backup_$(date +%Y%m%d)/

# Or using tar
.tar.gz data_backup_$(date +%Y%m%d).tar.gz data/
```

### Restore Data
```bash
# Stop services first
cp -r data_backup_*/ data/

# Or
.tar -xzf data_backup_*.tar.gz
```

---

## Performance Tips

1. **Memory**: Allocate at least 2GB RAM for the server
2. **FFmpeg**: Use hardware acceleration if available
3. **Cleanup**: Schedule regular cleanup of temp files
4. **Monitoring**: Set up monitoring for server resources
5. **Caching**: Consider caching for static assets

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development servers |
| `npm run build` | Build production bundles |
| `npm start` | Start production server |
| `npm run build:client` | Build frontend only |
| `npm run build:server` | Build backend only |
| `npm run lint` | Run linting |
| `npm run clean` | Clean build artifacts |
| `docker-compose up -d` | Start with Docker |
| `docker-compose down` | Stop Docker containers |
| `docker-compose logs -f` | View Docker logs |

---

## Support

For issues or questions:
1. Check the logs first
2. Review this deployment guide
3. Check the README.md for more info
4. Open a GitHub issue with details

---

**Happy Deploying!** 🚀

*KyyStatus HD - Modern WhatsApp Status Uploader*
