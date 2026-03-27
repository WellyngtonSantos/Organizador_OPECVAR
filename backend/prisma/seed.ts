import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default manager user
  const passwordHash = await bcrypt.hash('admin123', 12);

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

  // Create sample analysts
  const analystPassword = await bcrypt.hash('analista123', 12);

  const analysts = [
    { name: 'Ana Silva', email: 'ana.silva@opecvar.com' },
    { name: 'Carlos Souza', email: 'carlos.souza@opecvar.com' },
    { name: 'Maria Santos', email: 'maria.santos@opecvar.com' },
  ];

  for (const analyst of analysts) {
    await prisma.user.upsert({
      where: { email: analyst.email },
      update: {},
      create: {
        ...analyst,
        passwordHash: analystPassword,
        role: 'ANALYST',
      },
    });
    console.log('Created analyst:', analyst.email);
  }

  // Create buckets
  const buckets = [
    { name: 'Regulatorio', color: '#1976d2' },
    { name: 'Mercado', color: '#388e3c' },
    { name: 'Credito', color: '#f57c00' },
    { name: 'Operacional', color: '#7b1fa2' },
    { name: 'Liquidez', color: '#c62828' },
  ];

  for (const bucket of buckets) {
    await prisma.bucket.upsert({
      where: { name: bucket.name },
      update: {},
      create: bucket,
    });
    console.log('Created bucket:', bucket.name);
  }

  // Create labels
  const labels = [
    { name: 'BACEN', color: '#0288d1' },
    { name: 'CVM', color: '#7b1fa2' },
    { name: 'Relatorio', color: '#388e3c' },
    { name: 'Validacao', color: '#f57c00' },
    { name: 'Ad-hoc', color: '#c62828' },
    { name: 'Recorrente', color: '#455a64' },
  ];

  for (const label of labels) {
    await prisma.label.upsert({
      where: { name: label.name },
      update: {},
      create: label,
    });
    console.log('Created label:', label.name);
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
