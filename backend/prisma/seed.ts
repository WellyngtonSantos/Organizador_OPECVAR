import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');

  // Delete all data in dependency order
  await prisma.taskLabel.deleteMany();
  await prisma.taskNote.deleteMany();
  await prisma.taskHistory.deleteMany();
  await prisma.timerSession.deleteMany();
  await prisma.task.deleteMany();
  await prisma.label.deleteMany();
  await prisma.bucket.deleteMany();
  await prisma.user.deleteMany();
  console.log('All data cleared');

  // Create only the admin user
  const passwordHash = await bcrypt.hash('Admin123', 12);

  const manager = await prisma.user.upsert({
    where: { email: 'admin@opecvar.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@opecvar.com',
      passwordHash,
      role: 'MANAGER',
    },
  });
  console.log('Created manager:', manager.email);

  console.log('Seed completed! Database clean with admin user only.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
