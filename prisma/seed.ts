import { PrismaClient, Difficulty, Sunlight, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.careReminder.deleteMany();
  await prisma.userPlant.deleteMany();
  await prisma.order.deleteMany();
  await prisma.message.deleteMany();
  await prisma.plant.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'פנימי' } }),
    prisma.category.create({ data: { name: 'חיצוני' } }),
    prisma.category.create({ data: { name: 'סוקולנט' } }),
    prisma.category.create({ data: { name: 'תבלין' } }),
    prisma.category.create({ data: { name: 'פריחה' } }),
  ]);

  const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'admin123', 10);
  const userPassword = await bcrypt.hash(process.env.SEED_USER_PASSWORD || 'user123', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@nursery.com', passwordHash: adminPassword, name: 'מנהל המשתלה', role: Role.STAFF },
  });

  const customer = await prisma.user.create({
    data: { email: 'user@example.com', passwordHash: userPassword, name: 'ישראל ישראלי', role: Role.CUSTOMER },
  });

  const plants = await Promise.all([
    prisma.plant.create({
      data: {
        name: 'פוטוס זהוב',
        description: 'צמח פנימי קל לגידול, מתאים למתחילים. עלים ירוקים עם גוון זהוב.',
        categoryId: categories[0].id,
        price: 45.00,
        difficulty: Difficulty.EASY,
        sunlight: Sunlight.PARTIAL_SHADE,
        wateringFrequencyDays: 7,
        season: 'כל השנה',
        inStock: true,
      },
    }),
    prisma.plant.create({
      data: {
        name: 'לבנדר',
        description: 'צמח ריחני סגול, מושך פרפרים. מתאים לגינה ולמרפסת.',
        categoryId: categories[1].id,
        price: 35.00,
        difficulty: Difficulty.MEDIUM,
        sunlight: Sunlight.FULL_SUN,
        wateringFrequencyDays: 4,
        season: 'אביב',
        inStock: true,
      },
    }),
    prisma.plant.create({
      data: {
        name: 'אלוורה',
        description: 'סוקולנט רפואי, קל מאוד לטיפול. דורש מעט מים.',
        categoryId: categories[2].id,
        price: 30.00,
        difficulty: Difficulty.EASY,
        sunlight: Sunlight.FULL_SUN,
        wateringFrequencyDays: 14,
        season: 'כל השנה',
        inStock: true,
      },
    }),
    prisma.plant.create({
      data: {
        name: 'בזיליקום',
        description: 'תבלין נהדר לבישול. גידול קל במטבח ליד החלון.',
        categoryId: categories[3].id,
        price: 15.00,
        difficulty: Difficulty.EASY,
        sunlight: Sunlight.FULL_SUN,
        wateringFrequencyDays: 2,
        season: 'אביב-קיץ',
        inStock: true,
      },
    }),
    prisma.plant.create({
      data: {
        name: 'סחלב פלנופסיס',
        description: 'פרח אלגנטי ויפהפה. דורש טיפול מתון אך שווה את המאמץ.',
        categoryId: categories[4].id,
        price: 89.00,
        difficulty: Difficulty.HARD,
        sunlight: Sunlight.PARTIAL_SHADE,
        wateringFrequencyDays: 7,
        season: 'כל השנה',
        inStock: true,
      },
    }),
    prisma.plant.create({
      data: {
        name: 'רוזמרין',
        description: 'תבלין ריחני לבישול ולתה. עמיד ודורש מעט מים.',
        categoryId: categories[3].id,
        price: 20.00,
        difficulty: Difficulty.EASY,
        sunlight: Sunlight.FULL_SUN,
        wateringFrequencyDays: 5,
        season: 'כל השנה',
        inStock: true,
      },
    }),
    prisma.plant.create({
      data: {
        name: 'קקטוס כדורי',
        description: 'סוקולנט קטן ומקסים. כמעט לא צריך השקיה.',
        categoryId: categories[2].id,
        price: 25.00,
        difficulty: Difficulty.EASY,
        sunlight: Sunlight.FULL_SUN,
        wateringFrequencyDays: 21,
        season: 'כל השנה',
        inStock: true,
      },
    }),
    prisma.plant.create({
      data: {
        name: 'שרך בוסטון',
        description: 'צמח פנימי ירוק ושופע. אוהב לחות ואור עקיף.',
        categoryId: categories[0].id,
        price: 55.00,
        difficulty: Difficulty.MEDIUM,
        sunlight: Sunlight.SHADE,
        wateringFrequencyDays: 3,
        season: 'כל השנה',
        inStock: false,
      },
    }),
  ]);

  const order1 = await prisma.order.create({
    data: { userId: customer.id, plantId: plants[0].id, status: 'COMPLETED' },
  });

  const userPlant1 = await prisma.userPlant.create({
    data: { userId: customer.id, plantId: plants[0].id, orderId: order1.id },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.careReminder.createMany({
    data: [
      {
        userPlantId: userPlant1.id,
        type: 'WATERING',
        message: 'הגיע הזמן להשקות את הפוטוס זהוב שלך!',
        dueDate: today,
      },
      {
        userPlantId: userPlant1.id,
        type: 'SUNLIGHT',
        message: 'ודא שהצמח שלך מקבל אור חלקי היום',
        dueDate: today,
      },
    ],
  });

  await prisma.order.create({
    data: { userId: customer.id, plantId: plants[1].id, status: 'PENDING' },
  });

  await prisma.message.create({
    data: {
      userId: customer.id,
      plantId: plants[0].id,
      content: 'העלים של הפוטוס שלי מתחילים להצהיב, מה אפשר לעשות?',
    },
  });

  console.log('Seed completed successfully!');
  console.log(`Admin: admin@nursery.com (password from SEED_ADMIN_PASSWORD env var or default)`);
  console.log(`Customer: user@example.com (password from SEED_USER_PASSWORD env var or default)`);
  console.log(`Plants created: ${plants.length}`);
  console.log(`Categories created: ${categories.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
