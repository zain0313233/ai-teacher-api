# Supabase Connection Error Fix

## Error
```
Error: getaddrinfo ENOTFOUND dtcouglhxbacqvwniyjh.supabase.co
```

This means your app cannot connect to Supabase. Here are the solutions:

## Solution 1: Check Internet Connection
Make sure you have an active internet connection and can access external URLs.

## Solution 2: Check Supabase Credentials
Verify your `.env` file has correct Supabase credentials:

```env
SUPABASE_URL=https://dtcouglhxbacqvwniyjh.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

## Solution 3: Check Supabase Project Status
1. Go to https://supabase.com/dashboard
2. Check if your project is active
3. Verify the project URL matches your `.env` file

## Solution 4: Use Local File Storage (Temporary)
If Supabase is not working, you can temporarily use local file storage:

### Create Local Storage Service

Create `ai-teacher-api/src/documents/local-storage.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class LocalStorageService {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'documents');

  constructor() {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = join(this.uploadDir, fileName);
    
    await writeFile(filePath, file.buffer);
    
    // Return local file URL
    return `http://localhost:3001/uploads/documents/${fileName}`;
  }
}
```

### Update Documents Module

In `ai-teacher-api/src/documents/documents.module.ts`:

```typescript
import { LocalStorageService } from './local-storage.service';

@Module({
  providers: [
    DocumentsService,
    SupabaseService,
    LocalStorageService, // Add this
  ],
  // ...
})
```

### Update Documents Controller

In `ai-teacher-api/src/documents/documents.controller.ts`:

```typescript
constructor(
  private readonly documentsService: DocumentsService,
  private readonly supabaseService: SupabaseService,
  private readonly localStorageService: LocalStorageService, // Add this
) {}

// In uploadDocument method, replace:
const fileUrl = await this.supabaseService.uploadFile(file);

// With:
let fileUrl: string;
try {
  fileUrl = await this.supabaseService.uploadFile(file);
} catch (error) {
  console.log('Supabase upload failed, using local storage');
  fileUrl = await this.localStorageService.uploadFile(file);
}
```

### Serve Static Files

In `ai-teacher-api/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // ... rest of your code
}
```

## Solution 5: Check Firewall/Proxy
If you're behind a corporate firewall or proxy, it might be blocking Supabase:
- Check with your network administrator
- Try using a VPN
- Try from a different network

## Solution 6: DNS Issue
Try flushing your DNS cache:

**Windows:**
```bash
ipconfig /flushdns
```

**Mac/Linux:**
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

## Recommended: Use Local Storage for Development
For development, local storage is faster and doesn't require internet. Use Supabase only for production.
