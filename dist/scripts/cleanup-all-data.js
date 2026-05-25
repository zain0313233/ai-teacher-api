"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pg_1 = require("pg");
dotenv.config();
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const bucketName = 'documents';
async function listAllStoragePaths(supabase, prefix) {
    const paths = [];
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
        }
        else {
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
    const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
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
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
                fs.rmdirSync(full);
            }
            else {
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
        }
        else {
            fs.unlinkSync(full);
            removed += 1;
        }
    }
    console.log(`  Removed ${removed} local upload file(s)`);
}
async function wipePostgresKeepUsers() {
    const userCount = await prisma.user.count();
    console.log(`  Keeping ${userCount} user account(s)`);
    const results = {};
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
    const profiles = (await prisma.studentProfile.count()) + (await prisma.teacherProfile.count());
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
//# sourceMappingURL=cleanup-all-data.js.map