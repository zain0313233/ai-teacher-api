import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Creating admin account...\n');

    const adminEmail = 'zain.ali.cs.dev@gmail.com';
    const adminPassword = 'ZainAdmin731@';
    const adminName = 'Zain Ali (Admin)';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`👤 Name: ${existingAdmin.name}`);
      console.log(`🔑 Role: ${existingAdmin.role}`);
      console.log(`✅ Verified: ${existingAdmin.isVerified}`);
      
      // Update to ADMIN role if not already
      if (existingAdmin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email: adminEmail },
          data: { 
            role: 'ADMIN',
            isVerified: true, // Auto-verify admin
          },
        });
        console.log('\n✅ Updated existing user to ADMIN role');
      }
      
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true, // Auto-verify admin account
        plan: 'PRO', // Give admin PRO plan
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

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  } finally {
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
