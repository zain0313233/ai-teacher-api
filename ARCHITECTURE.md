# AI Teacher Assistant - Backend Architecture

## Project Structure

```
ai-teacher-api/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── auth/                  # Authentication module
│   │   ├── dto/               # Data transfer objects
│   │   ├── guards/            # Auth guards (JWT, Roles)
│   │   ├── strategies/        # Passport strategies
│   │   ├── utils/             # Password hashing utilities
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/                 # Users module
│   │   ├── dto/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── documents/             # Documents module
│   │   ├── documents.controller.ts
│   │   ├── documents.service.ts
│   │   └── documents.module.ts
│   ├── exams/                 # Exams module
│   │   ├── dto/
│   │   ├── exams.controller.ts
│   │   ├── exams.service.ts
│   │   └── exams.module.ts
│   ├── prisma/                # Prisma module
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts
│   └── main.ts
└── .env                       # Environment variables
```

## Modules Overview

### 1. Auth Module
- JWT-based authentication
- Access tokens (15 min expiry)
- Refresh tokens (7 days expiry)
- Password hashing with bcryptjs
- Register, Login, Logout, Refresh endpoints

### 2. Users Module
- User profile management
- Plan management (FREE, BASIC, PRO)
- Protected routes with JWT guard

### 3. Documents Module
- File upload (will integrate Cloudinary)
- Document listing
- Document deletion
- Tracks processing status

### 4. Exams Module
- Exam generation (will integrate FastAPI AI)
- Exam history
- Exam retrieval and deletion

### 5. Prisma Module
- Global database service
- Auto-connect/disconnect
- Type-safe queries

## Database Schema

### Users
- UUID primary key
- Email (unique)
- Password (hashed)
- Role: USER | ADMIN
- Plan: FREE | BASIC | PRO

### RefreshTokens
- Linked to User
- 7-day expiry
- Cascade delete on user deletion

### Documents
- Linked to User
- Stores file metadata
- Cloudinary URL
- Processing status flag

### DocumentChunks
- Linked to Document
- Text chunks for RAG
- Metadata (chapter, topic)
- Will store embeddings in Pinecone

### Exams
- Linked to User
- Subject, type, topics
- JSON content (questions)

## Authentication Flow

1. User registers → Password hashed → User created
2. User logs in → Credentials verified → Access + Refresh tokens issued
3. Access token expires (15 min) → Use refresh token → Get new access token
4. User logs out → Refresh token deleted

## Security Features

- JWT tokens with separate secrets
- Password hashing (bcrypt, 10 rounds)
- Role-based access control
- Token expiration
- Validation pipes (class-validator)
- CORS enabled

## Integration Points

### With FastAPI AI Engine
- Documents module will send files to FastAPI for processing
- Exams module will call FastAPI to generate questions
- FastAPI URL configured in .env: `AI_ENGINE_URL`

### With Cloudinary
- Documents module will upload files to Cloudinary
- Store Cloudinary URLs in database
- Configure credentials in .env

### With Pinecone
- FastAPI will handle vector embeddings
- NestJS stores metadata in PostgreSQL
- Pinecone stores vectors for RAG

## Next Steps

1. Set up PostgreSQL database
2. Run migrations: `npx prisma migrate dev`
3. Test authentication endpoints
4. Implement Cloudinary integration
5. Build FastAPI AI Engine
6. Connect NestJS ↔ FastAPI
