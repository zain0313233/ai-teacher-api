/**
 * Wipe all application data except user accounts (+ student/teacher profiles).
 * Clears: PostgreSQL tables, Supabase storage bucket, local upload folders.
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });
const bucketName = 'documents';

async function listAllStoragePaths(
  supabase: ReturnType<typeof createClient<any>>,
  prefix: string,
): Promise<string[]> {
  const paths: string[] = [];
  const { data, error } = await supabase.storage.from(bucketName).list(prefix, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' },
  });

  if (error) {
    throw new Error(`Supabase list failed (${prefix || 'root'}): ${error.message}`);
  }

  for (const item of data ?? []) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) {
      paths.push(...(await listAllStoragePaths(supabase, fullPath)));
    } else {
      paths.push(fullPath);
    }
  }

  return paths;
}

async function emptySupabaseBucket() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_KEY missing');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const paths = await listAllStoragePaths(supabase, '');

  if (paths.length === 0) {
    console.log('  Supabase bucket already empty');
    return;
  }

  const batchSize = 100;
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    const { error } = await supabase.storage.from(bucketName).remove(batch);
    if (error) {
      throw new Error(`Supabase remove failed: ${error.message}`);
    }
  }

  console.log(`  Removed ${paths.length} file(s) from Supabase bucket "${bucketName}"`);
}

function clearLocalUploads() {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('  No local uploads folder');
    return;
  }

  let removed = 0;
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        fs.rmdirSync(full);
      } else {
        fs.unlinkSync(full);
        removed += 1;
      }
    }
  };

  for (const entry of fs.readdirSync(uploadsDir, { withFileTypes: true })) {
    const full = path.join(uploadsDir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      fs.rmdirSync(full);
    } else {
      fs.unlinkSync(full);
      removed += 1;
    }
  }

  console.log(`  Removed ${removed} local upload file(s)`);
}

async function wipePostgresKeepUsers() {
  const userCount = await prisma.user.count();
  console.log(`  Keeping ${userCount} user account(s)`);

  const results: Record<string, number> = {};

  results.correction_logs = (await prisma.correctionLog.deleteMany()).count;
  results.past_paper_questions = (await prisma.pastPaperQuestion.deleteMany()).count;
  results.pattern_clusters = (await prisma.patternCluster.deleteMany()).count;
  results.past_papers = (await prisma.pastPaper.deleteMany()).count;
  results.exams = (await prisma.exam.deleteMany()).count;
  results.patterns = (await prisma.pattern.deleteMany()).count;
  results.document_chunks = (await prisma.documentChunk.deleteMany()).count;
  results.content_blocks = (await prisma.contentBlock.deleteMany()).count;
  results.chapters = (await prisma.chapter.deleteMany()).count;
  results.documents = (await prisma.document.deleteMany()).count;
  results.pattern_cache = (await prisma.patternCache.deleteMany()).count;
  results.pattern_templates = (await prisma.patternTemplate.deleteMany()).count;
  results.board_configs = (await prisma.boardConfig.deleteMany()).count;
  results.otp_codes = (await prisma.otpCode.deleteMany()).count;
  results.password_resets = (await prisma.passwordReset.deleteMany()).count;
  results.refresh_tokens = (await prisma.refreshToken.deleteMany()).count;

  for (const [table, count] of Object.entries(results)) {
    if (count > 0) {
      console.log(`  Deleted ${count} row(s) from ${table}`);
    }
  }

  const remainingUsers = await prisma.user.count();
  const profiles =
    (await prisma.studentProfile.count()) + (await prisma.teacherProfile.count());
  console.log(`  Users remaining: ${remainingUsers}, profiles: ${profiles}`);
}

async function main() {
  console.log('\n=== CLEANUP: PostgreSQL + Supabase bucket + local uploads ===\n');

  console.log('1) PostgreSQL (keep users + profiles)...');
  await wipePostgresKeepUsers();

  console.log('\n2) Supabase storage bucket...');
  await emptySupabaseBucket();

  console.log('\n3) Local uploads folder...');
  clearLocalUploads();

  console.log('\n=== Database + storage cleanup complete ===\n');
}

main()
  .catch((err) => {
    console.error('Cleanup failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
