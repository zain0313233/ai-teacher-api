# How to Run Database Migration

## Issue
Your database is currently not reachable:
```
Can't reach database server at ep-morning-meadow-advbaut0-pooler.c-2.us-east-1.aws.neon.tech:5432
```

## Solutions

### Option 1: Fix Database Connection (Recommended)

1. **Check your internet connection**
2. **Verify database credentials in `.env`:**
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
   ```
3. **Check if Neon database is active:**
   - Go to https://console.neon.tech
   - Check if your project is active
   - Verify the connection string

4. **Once connected, run migration:**
   ```bash
   npx prisma migrate dev --name add_level_class_fields
   ```

### Option 2: Run Migration Manually

If you have direct database access (pgAdmin, psql, etc.):

1. **Connect to your database**
2. **Run the migration SQL:**
   ```bash
   psql -h your-host -U your-user -d your-database -f prisma/migrations/add_level_class_fields.sql
   ```

   Or copy the contents of `prisma/migrations/add_level_class_fields.sql` and run in your database client.

### Option 3: Use Local PostgreSQL (Development)

For development, use a local PostgreSQL database:

1. **Install PostgreSQL locally:**
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create local database:**
   ```bash
   createdb ai-teacher-api
   ```

3. **Update `.env` to use local database:**
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ai-teacher-api"
   ```

4. **Run migration:**
   ```bash
   npx prisma migrate dev --name add_level_class_fields
   ```

## What the Migration Does

The migration adds these new fields to the `documents` table:

1. **documentType** - Type of document (textbook, past_paper, notes, etc.)
2. **educationSystem** - Education system (punjab_board, federal_board, etc.)
3. **language** - Document language (english, urdu, mixed)
4. **extractionMethod** - Extraction method used (pymupdf, ocr, vision_model)
5. **extractionQuality** - Quality score (0.0 to 1.0)
6. **verified** - Whether extraction was verified

It also:
- Updates `level` default from "secondary" to "matric"
- Migrates old level values to new ones
- Creates `content_blocks` table for structured content
- Adds indexes for better performance

## Verify Migration

After running the migration, verify it worked:

```bash
npx prisma studio
```

This opens a GUI where you can see your database tables and the new fields.

## Rollback (If Needed)

If something goes wrong, you can rollback:

```bash
npx prisma migrate reset
```

**Warning:** This will delete all data! Only use in development.

## Current Status

✅ Prisma schema updated
✅ Prisma client regenerated
✅ TypeScript compilation successful
✅ Migration SQL file created
⏳ Database migration pending (waiting for database connection)

## Next Steps

1. Fix database connection or use local PostgreSQL
2. Run the migration
3. Restart your NestJS server
4. Update frontend to include level/class fields
5. Test document upload with new fields

## Need Help?

- **Database connection issues:** Check firewall, VPN, or network settings
- **Neon database issues:** Contact Neon support or check their status page
- **Local PostgreSQL setup:** See PostgreSQL documentation
