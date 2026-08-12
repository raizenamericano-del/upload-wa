# KyyStatus HD - Struktur Proyek

```
kyystatus-hd/
├── client/                  # Frontend (React + Vite)
│   ├── public/
│   │   ├── favicon.ico
│   │   └── robots.txt
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   │   └── logo.svg
│   │   │   └── sounds/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Loader.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Toast.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── Connection/
│   │   │   │   ├── QRCodeDisplay.tsx
│   │   │   │   ├── PairingCode.tsx
│   │   │   │   └── ConnectionStatus.tsx
│   │   │   └── Upload/
│   │   │       ├── FileDropzone.tsx
│   │   │       ├── MediaPreview.tsx
│   │   │       ├── CompressionOptions.tsx
│   │   │       └── ProgressBar.tsx
│   │   ├── hooks/
│   │   │   ├── useSocket.ts
│   │   │   ├── useTheme.ts
│   │   │   └── useConnection.ts
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Connection.tsx
│   │   │   ├── Upload.tsx
│   │   │   └── History.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── animations.css
│   │   │   └── theme.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── compress.ts
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/                  # Backend (Node.js + Express)
│   ├── config/
│   │   ├── baileys.ts
│   │   └── socket.ts
│   ├── controllers/
│   │   ├── connection.ts
│   │   ├── upload.ts
│   │   └── status.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── error.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── connection.ts
│   │   └── upload.ts
│   ├── services/
│   │   ├── baileysService.ts
│   │   ├── compressionService.ts
│   │   └── storageService.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── helpers.ts
│   ├── app.ts
│   └── server.ts
│
├── shared/                  # Shared types & utilities
│   ├── types/
│   │   └── index.ts
│   └── constants.ts
│
├── .env.example
├── .gitignore
├── package.json
├── railway.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```
