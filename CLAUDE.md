# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ComicIF is a monorepo application for generating images using Google GenAI based on user prompts. The project consists of:
- **Backend**: Node.js/TypeScript REST API with Socket.IO for real-time updates
- **Frontend**: React/TypeScript with Vite, using Tailwind CSS and shadcn/ui components
- **Infrastructure**: PostgreSQL database, MinIO object storage, Docker services

## Key Commands

### Monorepo Commands (from root)
```bash
npm run dev                  # Start both backend and frontend in parallel
npm run build               # Build all workspaces
npm test                    # Run tests for all workspaces
npm run backend:dev         # Start only backend in development mode
npm run backend:build       # Compile backend TypeScript
npm run backend:start       # Start backend in production mode
npm run frontend:dev        # Start only frontend in development mode
npm run frontend:build      # Build frontend for production
```

### Backend Commands (from apps/backend)
```bash
npm run dev                 # Start backend with nodemon (auto-reload)
npm run build              # Compile TypeScript to JavaScript
npm start                  # Run compiled backend (production)
```

### Frontend Commands (from apps/frontend)
```bash
npm run dev                # Start Vite dev server (port 5173)
npm run build              # Build for production
npm run start              # Preview production build
npm run lint               # Run ESLint
```

### Infrastructure
```bash
docker-compose up -d       # Start PostgreSQL and MinIO services
docker-compose down        # Stop all services
```

## Architecture

### Backend Architecture (apps/backend/)

**Entry Point**: `app.ts` initializes Express, Socket.IO server, database connection, and registers routes

**Service Layer Pattern**:
- `services/databaseService.ts`: Singleton managing TypeORM DataSource with PostgreSQL
- `services/minioService.ts`: Handles S3-compatible object storage (uploads, downloads, presigned URLs)
- `services/googleGenAIService.ts`: Wrapper for Google GenAI API (text generation, image captioning, image generation using gemini-2.5-flash models)

**Data Model** (TypeORM entities):
- `Prompt` (title, prompt text, person_count) → OneToMany → `Photo` (path in MinIO, likes)
- Database synchronization enabled in development (`synchronize: true`)

**API Routes**:
- `/api/prompts` - CRUD operations for prompts
- `/api/photos` - Photo generation, listing, and likes; emits Socket.IO events on new photos
- `/api/files` - File uploads (Multer) and downloads via MinIO
- `/api/auth` - Authentication endpoints

**Real-time Communication**: Socket.IO emits `new-photo` events when images are generated, allowing frontend to receive updates without polling

### Frontend Architecture (apps/frontend/)

**Framework**: React 19 with TypeScript, Vite as build tool, React Router for routing

**State Management**:
- `contexts/AuthContext.tsx`: Global authentication state
- Custom hooks for data fetching: `usePrompts`, `usePhotos`, `useRealTimePhotos`

**Real-time Updates**: `hooks/useRealTimePhotos.ts` connects to Socket.IO and listens for `new-photo` events, with polling fallback

**Pages**:
- `Home`: Landing page
- `Login`: Authentication
- `Prompts`: Protected CRUD interface for managing prompts
- `Generate`: Protected image generation interface
- `Gallery`: Public photo gallery with likes
- `EventCarousel`: Slideshow mode for events with mouse controls

**UI Components**: Uses shadcn/ui components (button, card, dialog, table, etc.) with Tailwind CSS

**API Communication**: Centralized axios instance in `services/api.ts`, specific service modules for prompts and photos

### Environment Configuration

Backend requires `.env` file:
```
PORT=3000
GOOGLE_GENAI_API_KEY=<your_key>
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=comicif
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=comicif
MINIO_USE_SSL=false
```

Frontend uses `src/config/env.ts` for API endpoint configuration

## Development Workflow

1. Ensure Docker services are running: `docker-compose up -d`
2. Install dependencies: `npm install` (from root, installs all workspaces)
3. Start development: `npm run dev` (runs both apps) or `npm run backend:dev` + `npm run frontend:dev` separately
4. Backend runs on port 3000, frontend on port 5173
5. Access MinIO console at http://localhost:9001 (minioadmin/minioadmin)

## Important Notes

- **Database**: TypeORM auto-sync is enabled (development only). For production, use migrations
- **CORS**: Backend is configured for `https://comicif.rifeeh.com`, `http://localhost:3000`, and `http://localhost:5173`
- **Authentication**: Protected routes use `middleware/auth.ts` on backend and `ProtectedRoute` component on frontend
- **File Storage**: All images stored in MinIO with presigned URL access
- **AI Model**: Uses `gemini-2.5-flash` for text/image analysis and `gemini-2.5-flash-image-preview` for image generation