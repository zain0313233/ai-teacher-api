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
const bcrypt = __importStar(require("bcryptjs"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
async function createAdmin() {
    try {
        console.log('🔧 Creating admin account...\n');
        const adminEmail = 'zain.ali.cs.dev@gmail.com';
        const adminPassword = 'ZainAdmin731@';
        const adminName = 'Zain Ali (Admin)';
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail },
        });
        if (existingAdmin) {
            console.log('⚠️  Admin account already exists!');
            console.log(`📧 Email: ${adminEmail}`);
            console.log(`👤 Name: ${existingAdmin.name}`);
            console.log(`🔑 Role: ${existingAdmin.role}`);
            console.log(`✅ Verified: ${existingAdmin.isVerified}`);
            if (existingAdmin.role !== 'ADMIN') {
                await prisma.user.update({
                    where: { email: adminEmail },
                    data: {
                        role: 'ADMIN',
                        isVerified: true,
                    },
                });
                console.log('\n✅ Updated existing user to ADMIN role');
            }
            return;
        }
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = await prisma.user.create({
            data: {
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN',
                isVerified: true,
                plan: 'PRO',
            },
        });
        console.log('✅ Admin account created successfully!\n');
        console.log('📋 Admin Details:');
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   👤 Name: ${admin.name}`);
        console.log(`   🔑 Role: ${admin.role}`);
        console.log(`   💎 Plan: ${admin.plan}`);
        console.log(`   ✅ Verified: ${admin.isVerified}`);
        console.log(`   🆔 ID: ${admin.id}`);
        console.log('\n🔐 Login Credentials:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('\n🌐 Login URL: http://localhost:3000/login');
        console.log('   After login, you will be redirected to /admin/dashboard\n');
    }
    catch (error) {
        console.error('❌ Error creating admin:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
createAdmin()
    .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=create-admin.js.map