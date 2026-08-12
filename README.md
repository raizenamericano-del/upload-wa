# KyyStatus HD

![KyyStatus HD Logo](https://img.shields.io/badge/KyyStatus%20HD-WhatsApp%20Status%20Uploader-0ea5e9?style=for-the-badge&logo=whatsapp&logoColor=white)

> **KyyStatus HD** - Upload WhatsApp Status with HD Quality Compression

A modern, production-ready web application that allows you to connect your WhatsApp account and upload photos/videos as Status with optimal HD compression.

## Features

- **Easy Connection**: Connect via QR Code or Pairing Code
- **HD Compression**: Optimized compression for WhatsApp Status while maintaining HD quality
- **Real-time Progress**: Track upload, compression, and posting progress
- **Persistent Sessions**: Sessions remain active even after server restart
- **Modern UI**: Glassmorphism design, smooth animations, dark mode support
- **Responsive**: Works on desktop and mobile devices
- **Production Ready**: Ready to deploy to Railway, Docker, or any Node.js hosting

## Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Build Tool
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Socket.io-client** - Real-time Communication
- **React Dropzone** - File Uploads
- **React Hook Form + Zod** - Form Validation
- **Lucide React** - Icons

### Backend
- **Node.js + Express** - Server Framework
- **@whiskeysockets/baileys** - WhatsApp Web API
- **Socket.io** - Real-time Communication
- **fluent-ffmpeg + ffmpeg-static** - Media Compression
- **Pino** - Logging
- **QRCode** - QR Code Generation

### Infrastructure
- **Docker** - Containerization
- **Railway** - Deployment Platform

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm
- FFmpeg (for video compression)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/kyystatus-hd.git
cd kyystatus-hd
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the development servers:
```bash
npm run dev
```

This will start both the frontend (Vite) and backend (Express) servers.

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `0.0.0.0` |
| `CORS_ORIGIN` | CORS origin | `*` |
| `SESSION_DIR` | Session storage directory | `./sessions` |
| `STORAGE_DIR` | Upload storage directory | `./storage` |
| `TEMP_DIR` | Temporary files directory | `./temp` |
| `API_KEY` | Optional API key | - |
| `REQUIRE_API_KEY` | Require API key | `false` |
| `LOG_LEVEL` | Logging level | `info` |

### WhatsApp Connection

The application uses **@whiskeysockets/baileys** for WhatsApp Web API connection. Sessions are stored persistently in the `SESSION_DIR` directory.

## Deployment

### Railway

1. Push to GitHub
2. Import repository to Railway
3. Railway will automatically detect and deploy the application
4. Configure environment variables in Railway dashboard
5. Add a volume for `/data` to persist sessions

### Docker

```bash
# Build and run
docker-compose up -d

# Or manually
docker build -t kyystatus-hd .
docker run -p 3000:3000 -v ./data:/data kyystatus-hd
```

### Manual Deployment

1. Build the frontend:
```bash
cd client
npm run build
```

2. Build the backend:
```bash
cd server
npm run build
```

3. Start the server:
```bash
cd server
dist/server.js
```

4. Serve the frontend (using nginx, serve, etc.)

## Project Structure

```
kyystatus-hd/
├── client/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── styles/          # Global styles
│   └── vite.config.ts       # Vite configuration
│
├── server/                  # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── types/           # TypeScript types
│   └── server.ts            # Server entry point
│
├── railway.json             # Railway configuration
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose configuration
└── README.md
```

## API Endpoints

### Connection
- `POST /api/connections/generate` - Generate new session ID
- `POST /api/connections/init` - Initialize connection
- `GET /api/connections/:sessionId/state` - Get connection state
- `GET /api/connections/:sessionId/qr` - Get QR code
- `GET /api/connections/:sessionId/pairing` - Get pairing code
- `POST /api/connections/:sessionId/disconnect` - Disconnect session
- `POST /api/connections/:sessionId/reconnect` - Reconnect session

### Upload
- `POST /api/uploads` - Upload file for status
- `POST /api/uploads/with-compression` - Upload with compression options
- `GET /api/uploads/history` - Get upload history
- `POST /api/uploads/recommendations` - Get compression recommendations

### Status
- `GET /api/status/my` - Get my status
- `GET /api/status/:jid` - Get status by JID
- `DELETE /api/status/:statusId` - Delete status

### Health
- `GET /health` - Health check
- `GET /health/ping` - Ping endpoint

## Socket.io Events

### Client to Server
- `connection:init` - Initialize connection
- `connection:disconnect` - Disconnect session
- `connection:reconnect` - Reconnect session
- `upload:start` - Start upload
- `status:fetch` - Fetch status

### Server to Client
- `connection:status` - Connection state update
- `connection:qr` - QR code generated
- `connection:pairing` - Pairing code generated
- `connection:success` - Connection successful
- `connection:error` - Connection error
- `upload:progress` - Upload progress update
- `upload:result` - Upload result
- `status:list` - Status list
- `error` - General error

## UI Components

### Common Components
- `Button` - Styled button with variants
- `Card` - Glassmorphism card
- `Input` - Form input
- `Modal` - Dialog modal
- `Toast` - Notification toast
- `Loader` - Loading indicators
- `Logo` - KyyDevv branding

### Connection Components
- `ConnectionStatus` - Connection status display
- `QRCodeDisplay` - QR code with instructions
- `PairingCode` - Pairing code display

### Upload Components
- `FileDropzone` - Drag & drop file upload
- `MediaPreview` - Media preview
- `CompressionOptions` - Compression settings
- `ProgressBar` - Upload progress

### Layout Components
- `Layout` - Main layout
- `Header` - Top navigation
- `Sidebar` - Side navigation

## Customization

### Branding
Update the logo and colors in:
- `client/src/components/common/Logo.tsx`
- `client/src/styles/theme.ts`
- `client/src/styles/globals.css`

### Compression Settings
Modify compression defaults in:
- `server/src/services/compressionService.ts`

### UI Themes
Customize themes in:
- `client/src/hooks/useTheme.ts`
- `client/src/styles/theme.ts`

## Troubleshooting

### FFmpeg Not Found
Install FFmpeg on your system:
- **Ubuntu/Debian**: `sudo apt install ffmpeg`
- **MacOS**: `brew install ffmpeg`
- **Windows**: Download from https://ffmpeg.org

### Session Not Persisting
Ensure the `SESSION_DIR` directory exists and is writable:
```bash
mkdir -p sessions
chmod 755 sessions
```

### Connection Issues
- Make sure your phone has internet access
- Ensure WhatsApp is installed and logged in
- Try reconnecting with a new session

### Video Compression Failing
Check FFmpeg installation and permissions. For Docker, ensure FFmpeg is installed in the container.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

MIT License - Feel free to use, modify, and distribute.

## Credits

- **KyyDevv** - Developer
- **@whiskeysockets/baileys** - WhatsApp Web API
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [KyyDevv](https://github.com/kyydevv)

---

**Made with ❤️ by KyyDevv**

*Unofficial WhatsApp client. Use at your own risk.*
