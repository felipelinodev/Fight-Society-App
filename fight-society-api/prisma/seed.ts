import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@martialarts.com';
  const adminPasswordRaw = process.env.ADMIN_PASSWORD || 'admin123';
  const appName = process.env.APP_NAME || 'Martial Arts Academy';

  const adminPassword = await bcrypt.hash(adminPasswordRaw, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: `Admin ${appName}`,
      email: adminEmail,
      passwordHash: adminPassword,
      phone: '11999990000',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  console.log('\n🎉 Seed completed!');
  console.log(`\n📋 Admin credentials:`);
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPasswordRaw}`);
  console.log('\n💡 Create plans via the admin panel in the web app.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
