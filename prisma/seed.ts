import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.note.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.job.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@yardbase.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log('Database has been seeded with admin user. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 