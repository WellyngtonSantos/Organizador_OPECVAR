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

  const analystData = [
    { name: 'Ana Silva', email: 'ana.silva@opecvar.com' },
    { name: 'Carlos Souza', email: 'carlos.souza@opecvar.com' },
    { name: 'Maria Santos', email: 'maria.santos@opecvar.com' },
  ];

  const analystUsers = [];
  for (const analyst of analystData) {
    const user = await prisma.user.upsert({
      where: { email: analyst.email },
      update: {},
      create: {
        ...analyst,
        passwordHash: analystPassword,
        role: 'ANALYST',
      },
    });
    analystUsers.push(user);
    console.log('Created analyst:', user.email);
  }

  // Create buckets
  const bucketData = [
    { name: 'Regulatorio', color: '#1976d2' },
    { name: 'Mercado', color: '#388e3c' },
    { name: 'Credito', color: '#f57c00' },
    { name: 'Operacional', color: '#7b1fa2' },
    { name: 'Liquidez', color: '#c62828' },
  ];

  const buckets = [];
  for (const bucket of bucketData) {
    const b = await prisma.bucket.upsert({
      where: { name: bucket.name },
      update: {},
      create: bucket,
    });
    buckets.push(b);
    console.log('Created bucket:', b.name);
  }

  // Create labels
  const labelData = [
    { name: 'BACEN', color: '#0288d1' },
    { name: 'CVM', color: '#7b1fa2' },
    { name: 'Relatorio', color: '#388e3c' },
    { name: 'Validacao', color: '#f57c00' },
    { name: 'Ad-hoc', color: '#c62828' },
    { name: 'Recorrente', color: '#455a64' },
  ];

  const labels = [];
  for (const label of labelData) {
    const l = await prisma.label.upsert({
      where: { name: label.name },
      update: {},
      create: label,
    });
    labels.push(l);
    console.log('Created label:', l.name);
  }

  // Create sample tasks
  const now = new Date();
  const day = (offset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(9, 0, 0, 0);
    return d;
  };

  const taskData = [
    {
      name: 'Relatorio DLO mensal - Marco/2026',
      analystId: analystUsers[0].id,
      bucketId: buckets[0].id, // Regulatorio
      priority: 'HIGH' as const,
      status: 'IN_PROGRESS' as const,
      receivedDate: day(-10),
      startDate: day(-9),
      estimatedCompletionDate: day(2),
      estimatedHours: 16,
      actualHours: 8.5,
      queueOrder: 1,
      labelIds: [labels[0].id, labels[2].id], // BACEN, Relatorio
    },
    {
      name: 'Validacao VaR parametrico - carteira trading',
      analystId: analystUsers[0].id,
      bucketId: buckets[1].id, // Mercado
      priority: 'URGENT' as const,
      status: 'IN_PROGRESS' as const,
      receivedDate: day(-5),
      startDate: day(-4),
      estimatedCompletionDate: day(-1), // overdue!
      estimatedHours: 12,
      actualHours: 10,
      queueOrder: 2,
      labelIds: [labels[3].id], // Validacao
    },
    {
      name: 'Apuracao RWACPAD trimestral',
      analystId: analystUsers[0].id,
      bucketId: buckets[2].id, // Credito
      priority: 'MEDIUM' as const,
      status: 'NOT_STARTED' as const,
      receivedDate: day(-3),
      estimatedCompletionDate: day(10),
      estimatedHours: 24,
      actualHours: 0,
      queueOrder: 3,
      labelIds: [labels[0].id, labels[5].id], // BACEN, Recorrente
    },
    {
      name: 'Stress test cenario ad-hoc - alta de juros',
      analystId: analystUsers[1].id,
      bucketId: buckets[1].id, // Mercado
      priority: 'HIGH' as const,
      status: 'IN_PROGRESS' as const,
      receivedDate: day(-7),
      startDate: day(-6),
      estimatedCompletionDate: day(1),
      estimatedHours: 20,
      actualHours: 14,
      queueOrder: 1,
      labelIds: [labels[4].id], // Ad-hoc
    },
    {
      name: 'Relatorio LCR/NSFR semanal',
      analystId: analystUsers[1].id,
      bucketId: buckets[4].id, // Liquidez
      priority: 'MEDIUM' as const,
      status: 'COMPLETED' as const,
      receivedDate: day(-14),
      startDate: day(-13),
      estimatedCompletionDate: day(-7),
      actualCompletionDate: day(-8),
      estimatedHours: 8,
      actualHours: 6.5,
      queueOrder: 2,
      labelIds: [labels[0].id, labels[2].id, labels[5].id], // BACEN, Relatorio, Recorrente
    },
    {
      name: 'Enquadramento limites operacionais',
      analystId: analystUsers[1].id,
      bucketId: buckets[3].id, // Operacional
      priority: 'LOW' as const,
      status: 'STAND_BY' as const,
      receivedDate: day(-20),
      startDate: day(-18),
      estimatedCompletionDate: day(5),
      estimatedHours: 10,
      actualHours: 3,
      queueOrder: 3,
      labelIds: [labels[3].id, labels[5].id], // Validacao, Recorrente
    },
    {
      name: 'Calculo PLE consolidado',
      analystId: analystUsers[2].id,
      bucketId: buckets[2].id, // Credito
      priority: 'HIGH' as const,
      status: 'IN_PROGRESS' as const,
      receivedDate: day(-4),
      startDate: day(-3),
      estimatedCompletionDate: day(3),
      estimatedHours: 18,
      actualHours: 7,
      queueOrder: 1,
      labelIds: [labels[0].id], // BACEN
    },
    {
      name: 'Relatorio ICAAP anual - capitulo risco de mercado',
      analystId: analystUsers[2].id,
      bucketId: buckets[0].id, // Regulatorio
      priority: 'URGENT' as const,
      status: 'NOT_STARTED' as const,
      receivedDate: day(-2),
      estimatedCompletionDate: day(7),
      estimatedHours: 40,
      actualHours: 0,
      queueOrder: 2,
      labelIds: [labels[0].id, labels[1].id, labels[2].id], // BACEN, CVM, Relatorio
    },
    {
      name: 'Validacao modelo rating interno',
      analystId: analystUsers[2].id,
      bucketId: buckets[2].id, // Credito
      priority: 'MEDIUM' as const,
      status: 'COMPLETED' as const,
      receivedDate: day(-21),
      startDate: day(-20),
      estimatedCompletionDate: day(-10),
      actualCompletionDate: day(-11),
      estimatedHours: 30,
      actualHours: 26,
      queueOrder: 3,
      labelIds: [labels[3].id], // Validacao
    },
    {
      name: 'Atualizacao parametros curva pre-fixada',
      analystId: analystUsers[0].id,
      bucketId: buckets[1].id, // Mercado
      priority: 'MEDIUM' as const,
      status: 'COMPLETED' as const,
      receivedDate: day(-15),
      startDate: day(-14),
      estimatedCompletionDate: day(-8),
      actualCompletionDate: day(-9),
      estimatedHours: 6,
      actualHours: 5,
      queueOrder: 4,
      labelIds: [labels[5].id], // Recorrente
    },
    {
      name: 'Backtesting VaR historico 250 dias',
      analystId: analystUsers[1].id,
      bucketId: buckets[1].id, // Mercado
      priority: 'HIGH' as const,
      status: 'NOT_STARTED' as const,
      receivedDate: day(-1),
      estimatedCompletionDate: day(8),
      estimatedHours: 15,
      actualHours: 0,
      queueOrder: 4,
      labelIds: [labels[3].id, labels[5].id], // Validacao, Recorrente
    },
    {
      name: 'Relatorio PCLD trimestral',
      analystId: analystUsers[2].id,
      bucketId: buckets[2].id, // Credito
      priority: 'MEDIUM' as const,
      status: 'STAND_BY' as const,
      receivedDate: day(-12),
      startDate: day(-10),
      estimatedCompletionDate: day(-2), // overdue!
      estimatedHours: 12,
      actualHours: 5,
      queueOrder: 4,
      labelIds: [labels[2].id], // Relatorio
    },
    {
      name: 'Mapeamento fluxos operacionais - nova mesa',
      analystId: analystUsers[0].id,
      bucketId: buckets[3].id, // Operacional
      priority: 'LOW' as const,
      status: 'NOT_STARTED' as const,
      receivedDate: day(0),
      estimatedCompletionDate: day(15),
      estimatedHours: 20,
      actualHours: 0,
      queueOrder: 5,
      labelIds: [labels[4].id], // Ad-hoc
    },
    {
      name: 'Conciliacao exposicoes derivativos',
      analystId: analystUsers[1].id,
      bucketId: buckets[1].id, // Mercado
      priority: 'MEDIUM' as const,
      status: 'CANCELED' as const,
      receivedDate: day(-25),
      startDate: day(-24),
      estimatedCompletionDate: day(-15),
      estimatedHours: 8,
      actualHours: 2,
      queueOrder: 5,
      labelIds: [labels[3].id], // Validacao
    },
    {
      name: 'Dashboard indicadores liquidez - automatizacao',
      analystId: analystUsers[2].id,
      bucketId: buckets[4].id, // Liquidez
      priority: 'HIGH' as const,
      status: 'IN_PROGRESS' as const,
      receivedDate: day(-6),
      startDate: day(-5),
      estimatedCompletionDate: day(4),
      estimatedHours: 25,
      actualHours: 12,
      queueOrder: 5,
      labelIds: [labels[4].id, labels[2].id], // Ad-hoc, Relatorio
    },
  ];

  // Clear existing tasks to avoid duplicates on re-seed
  await prisma.taskLabel.deleteMany();
  await prisma.taskNote.deleteMany();
  await prisma.taskHistory.deleteMany();
  await prisma.timerSession.deleteMany();
  await prisma.task.deleteMany();
  console.log('Cleared existing tasks');

  for (const t of taskData) {
    const { labelIds, ...data } = t;
    const task = await prisma.task.create({
      data: {
        ...data,
        createdById: manager.id,
        labels: {
          create: labelIds.map((labelId) => ({ labelId })),
        },
      },
    });
    console.log('Created task:', task.name);
  }

  // Create some timer sessions for completed work
  const completedTasks = await prisma.task.findMany({
    where: { actualHours: { gt: 0 } },
    select: { id: true, analystId: true, actualHours: true, startDate: true },
  });

  for (const task of completedTasks) {
    if (!task.startDate) continue;
    const sessionStart = new Date(task.startDate);
    sessionStart.setHours(9, 0, 0, 0);
    const sessionEnd = new Date(sessionStart);
    sessionEnd.setHours(sessionStart.getHours() + Math.min(task.actualHours, 8));

    await prisma.timerSession.create({
      data: {
        taskId: task.id,
        userId: task.analystId,
        startedAt: sessionStart,
        stoppedAt: sessionEnd,
        hours: Math.min(task.actualHours, 8),
      },
    });
  }
  console.log('Created timer sessions');

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
