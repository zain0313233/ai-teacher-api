# AI Teacher Assistant API - NestJS Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd ai-teacher-api
npm install
```

### 2. Configure Environment Variables
Update `.env` file with your database credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_teacher_db?schema=public"
JWT_ACCESS_SECRET="your-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
```

### 3. Set Up PostgreSQL Database
Make sure PostgreSQL is running, then create the database:
```bash
# Using psql
createdb ai_teacher_db

# Or using SQL
psql -U postgres
CREATE DATABASE ai_teacher_db;
```

### 4. Run Prisma Migrations
```bash
npx prisma migrate dev --name init
```

This will:
- Create all tables in PostgreSQL
- Generate Prisma Client with TypeScript types

### 5. Start the Server
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user (requires auth)

### Users (`/api/users`)
- `GET /api/users/profile` - Get user profile (requires auth)
- `PATCH /api/users/profile` - Update profile (requires auth)
- `PATCH /api/users/plan` - Update subscription plan (requires auth)

### Documents (`/api/documents`)
- `POST /api/documents/upload` - Upload document (requires auth)
- `GET /api/documents` - Get all user documents (requires auth)
- `GET /api/documents/:id` - Get document by ID (requires auth)
- `DELETE /api/documents/:id` - Delete document (requires auth)

### Exams (`/api/exams`)
- `POST /api/exams/generate` - Generate exam (requires auth)
- `GET /api/exams` - Get all user exams (requires auth)
- `GET /api/exams/:id` - Get exam by ID (requires auth)
- `DELETE /api/exams/:id` - Delete exam (requires auth)

## Database Schema

### Users
- id, name, email, password, role (USER/ADMIN), plan (FREE/BASIC/PRO)

### RefreshTokens
- id, token, userId, expiresAt

### Documents
- id, userId, fileName, fileType, fileUrl, fileSize, uploadDate, processed

### DocumentChunks
- id, documentId, chunkText, chunkIndex, chapter, topic, metadata

### Exams
- id, userId, subject, examType, topics, examContent, createdAt

## Tech Stack
- NestJS (Node.js framework)
- Prisma (ORM)
- PostgreSQL (Database)
- JWT (Authentication)
- bcryptjs (Password hashing)
- class-validator (Validation)

## Next Steps
1. Implement Cloudinary file upload
2. Connect to FastAPI AI Engine
3. Add rate limiting
4. Add API documentation (Swagger)
