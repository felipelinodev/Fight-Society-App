import { PrismaClient, MartialArt } from '@prisma/client';
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

  // Create plans
  const plansData = [
    {
      name: 'Jiu Jitsu - Mensal',
      description: 'Plano mensal de Jiu Jitsu. Acesso a todas as aulas de Jiu Jitsu.',
      martialArt: MartialArt.JIU_JITSU,
      price: 150.00,
      durationDays: 30,
    },
    {
      name: 'Jiu Jitsu - Trimestral',
      description: 'Plano trimestral de Jiu Jitsu com desconto. Acesso a todas as aulas de Jiu Jitsu.',
      martialArt: MartialArt.JIU_JITSU,
      price: 400.00,
      durationDays: 90,
    },
    {
      name: 'Jiu Jitsu - Semestral',
      description: 'Plano semestral de Jiu Jitsu com melhor desconto. Acesso a todas as aulas de Jiu Jitsu.',
      martialArt: MartialArt.JIU_JITSU,
      price: 720.00,
      durationDays: 180,
    },
    {
      name: 'Muay Thai - Mensal',
      description: 'Plano mensal de Muay Thai. Acesso a todas as aulas de Muay Thai.',
      martialArt: MartialArt.MUAY_THAI,
      price: 140.00,
      durationDays: 30,
    },
    {
      name: 'Muay Thai - Trimestral',
      description: 'Plano trimestral de Muay Thai com desconto. Acesso a todas as aulas de Muay Thai.',
      martialArt: MartialArt.MUAY_THAI,
      price: 370.00,
      durationDays: 90,
    },
    {
      name: 'Muay Thai - Semestral',
      description: 'Plano semestral de Muay Thai com melhor desconto. Acesso a todas as aulas de Muay Thai.',
      martialArt: MartialArt.MUAY_THAI,
      price: 670.00,
      durationDays: 180,
    },
  ];

  for (const planData of plansData) {
    const plan = await prisma.plan.create({
      data: planData,
    });
    console.log(`✅ Plan created: ${plan.name} - R$${planData.price}`);
  }

  console.log('\n🎉 Seed completed!');
  console.log(`\n📋 Admin credentials:`);
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPasswordRaw}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
