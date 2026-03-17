# API Endpoints Testing Guide

Base URL: `http://localhost:3000/api`

## Authentication Endpoints

### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "plan": "FREE",
    "createdAt": "2026-03-12T..."
  }
}
```

### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "plan": "FREE"
  }
}
```

### 3. Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### 4. Logout
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

## User Endpoints

### 1. Get Profile
```http
GET /api/users/profile
Authorization: Bearer <access-token>
```

### 2. Update Profile
```http
PATCH /api/users/profile
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "John Updated"
}
```

### 3. Update Plan
```http
PATCH /api/users/plan
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "plan": "PRO"
}
```

## Document Endpoints

### 1. Upload Document
```http
POST /api/documents/upload
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

file: <select file>
```

### 2. Get All Documents
```http
GET /api/documents
Authorization: Bearer <access-token>
```

### 3. Get Document by ID
```http
GET /api/documents/:id
Authorization: Bearer <access-token>
```

### 4. Delete Document
```http
DELETE /api/documents/:id
Authorization: Bearer <access-token>
```

## Exam Endpoints

### 1. Generate Exam
```http
POST /api/exams/generate
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "subject": "Mathematics",
  "examType": "Midterm",
  "topics": ["Algebra", "Geometry"],
  "structure": {
    "mcqs": 10,
    "shortQuestions": 5,
    "longQuestions": 2
  }
}
```

### 2. Get All Exams
```http
GET /api/exams
Authorization: Bearer <access-token>
```

### 3. Get Exam by ID
```http
GET /api/exams/:id
Authorization: Bearer <access-token>
```

### 4. Delete Exam
```http
DELETE /api/exams/:id
Authorization: Bearer <access-token>
```

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### Get Profile (replace TOKEN)
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
