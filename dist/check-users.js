"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
(0, dotenv_1.config)();
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function checkUsers() {
    try {
        console.log('🔍 Checking all registered users...\n');
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                plan: true,
                isVerified: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const adminCount = allUsers.filter(u => u.role === 'ADMIN').length;
        const userCount = allUsers.filter(u => u.role === 'USER').length;
        console.log('📊 User Statistics:');
        console.log(`  Total Users: ${allUsers.length}`);
        console.log(`  Admins: ${adminCount}`);
        console.log(`  Regular Users: ${userCount}`);
        console.log('');
        if (allUsers.length === 0) {
            console.log('❌ No users found in the database.');
            console.log('💡 You may need to register users first.\n');
            return;
        }
        console.log('👥 All Registered Users:\n');
        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Plan: ${user.plan}`);
            console.log(`   Verified: ${user.isVerified ? '✅' : '❌'}`);
            console.log(`   Registered: ${user.createdAt.toLocaleDateString()}`);
            console.log('');
        });
        console.log('⚠️  Note: Passwords are hashed and cannot be displayed for security.\n');
    }
    catch (error) {
        console.error('❌ Error fetching users:', error);
    }
    finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
checkUsers();
//# sourceMappingURL=check-users.js.map