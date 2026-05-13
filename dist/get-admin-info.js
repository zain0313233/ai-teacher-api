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
async function getAdminInfo() {
    try {
        console.log('🔍 Searching for admin users...\n');
        const admins = await prisma.user.findMany({
            where: {
                role: 'ADMIN'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                plan: true,
                isVerified: true,
                createdAt: true,
            }
        });
        if (admins.length === 0) {
            console.log('❌ No admin users found in the database.');
            return;
        }
        console.log(`✅ Found ${admins.length} admin user(s):\n`);
        admins.forEach((admin, index) => {
            console.log(`Admin #${index + 1}:`);
            console.log(`  ID: ${admin.id}`);
            console.log(`  Name: ${admin.name}`);
            console.log(`  Email: ${admin.email}`);
            console.log(`  Role: ${admin.role}`);
            console.log(`  Plan: ${admin.plan}`);
            console.log(`  Verified: ${admin.isVerified}`);
            console.log(`  Created: ${admin.createdAt}`);
            console.log('');
        });
        console.log('⚠️  Note: Passwords are hashed and cannot be displayed.');
        console.log('💡 To reset password, use the forgot password endpoint or update directly in database.\n');
    }
    catch (error) {
        console.error('❌ Error fetching admin info:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
getAdminInfo();
//# sourceMappingURL=get-admin-info.js.map