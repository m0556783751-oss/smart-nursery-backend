import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function setupTestData() {
  await prisma.careReminder.deleteMany();
  await prisma.userPlant.deleteMany();
  await prisma.order.deleteMany();
  await prisma.message.deleteMany();
  await prisma.plant.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const category = await prisma.category.create({ data: { name: 'Test Category' } });
  const passwordHash = await bcrypt.hash('password123', 10);

  const staff = await prisma.user.create({
    data: { email: 'staff@test.com', passwordHash, name: 'Test Staff', role: 'STAFF' },
  });

  const customer = await prisma.user.create({
    data: { email: 'customer@test.com', passwordHash, name: 'Test Customer', role: 'CUSTOMER' },
  });

  const plant = await prisma.plant.create({
    data: {
      name: 'Test Plant',
      description: 'A test plant for testing',
      categoryId: category.id,
      price: 29.99,
      difficulty: 'EASY',
      sunlight: 'FULL_SUN',
      wateringFrequencyDays: 3,
      inStock: true,
    },
  });

  const outOfStockPlant = await prisma.plant.create({
    data: {
      name: 'Out of Stock Plant',
      description: 'This plant is not available',
      categoryId: category.id,
      price: 19.99,
      difficulty: 'MEDIUM',
      sunlight: 'SHADE',
      wateringFrequencyDays: 7,
      inStock: false,
    },
  });

  return { staff, customer, plant, outOfStockPlant, category };
}

export async function cleanupTestData() {
  await prisma.careReminder.deleteMany();
  await prisma.userPlant.deleteMany();
  await prisma.order.deleteMany();
  await prisma.message.deleteMany();
  await prisma.plant.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
}

export async function getToken(email: string, password: string): Promise<string> {
  const { app } = await import('../src/app');
  const supertest = (await import('supertest')).default;
  const res = await supertest(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

export { prisma };
