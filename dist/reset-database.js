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
const dotenv_1 = require("dotenv");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const readline = __importStar(require("readline"));
(0, dotenv_1.config)();
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}
async function resetDatabase() {
    try {
        console.log('⚠️  WARNING: DATABASE RESET OPERATION ⚠️\n');
        console.log('This will permanently delete:');
        console.log('  ❌ All users (admins and regular users)');
        console.log('  ❌ All documents and document chunks');
        console.log('  ❌ All exams and patterns');
        console.log('  ❌ All past papers and questions');
        console.log('  ❌ All pattern clusters and caches');
        console.log('  ❌ All refresh tokens, OTP codes, and password resets');
        console.log('  ❌ All chapters');
        console.log('\n🔥 THIS CANNOT BE UNDONE! 🔥\n');
        const answer1 = await askQuestion('Are you absolutely sure? Type "YES" to continue: ');
        if (answer1.trim() !== 'YES') {
            console.log('\n✅ Operation cancelled. No data was deleted.');
            rl.close();
            return;
        }
        const answer2 = await askQuestion('\n⚠️  Last chance! Type "DELETE ALL DATA" to proceed: ');
        if (answer2.trim() !== 'DELETE ALL DATA') {
            console.log('\n✅ Operation cancelled. No data was deleted.');
            rl.close();
            return;
        }
        console.log('\n🗑️  Starting database cleanup...\n');
        console.log('Deleting refresh tokens...');
        await prisma.refreshToken.deleteMany({});
        console.log('Deleting OTP codes...');
        await prisma.otpCode.deleteMany({});
        console.log('Deleting password resets...');
        await prisma.passwordReset.deleteMany({});
        console.log('Deleting document chunks...');
        await prisma.documentChunk.deleteMany({});
        console.log('Deleting chapters...');
        await prisma.chapter.deleteMany({});
        console.log('Deleting documents...');
        await prisma.document.deleteMany({});
        console.log('Deleting exams...');
        await prisma.exam.deleteMany({});
        console.log('Deleting patterns...');
        await prisma.pattern.deleteMany({});
        console.log('Deleting past paper questions...');
        await prisma.pastPaperQuestion.deleteMany({});
        console.log('Deleting past papers...');
        await prisma.pastPaper.deleteMany({});
        console.log('Deleting pattern clusters...');
        await prisma.patternCluster.deleteMany({});
        console.log('Deleting pattern cache...');
        await prisma.patternCache.deleteMany({});
        console.log('Deleting all users...');
        await prisma.user.deleteMany({});
        console.log('\n✅ Database cleanup completed!\n');
        console.log('📊 Summary:');
        console.log('  ✓ All users deleted');
        console.log('  ✓ All documents and chunks deleted');
        console.log('  ✓ All exams and patterns deleted');
        console.log('  ✓ All past papers deleted');
        console.log('  ✓ All authentication tokens deleted');
        console.log('\n⚠️  Note: Pinecone data needs to be cleared separately.');
        console.log('💡 To clear Pinecone, you need to delete the index or namespace from Pinecone dashboard.\n');
    }
    catch (error) {
        console.error('\n❌ Error during database reset:', error);
    }
    finally {
        await prisma.$disconnect();
        await pool.end();
        rl.close();
    }
}
resetDatabase();
//# sourceMappingURL=reset-database.js.map