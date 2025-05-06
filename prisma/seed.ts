import { PrismaClient, UserRole, JobStatus, JobType, EstimateStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
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
  const admin = await prisma.user.create({
    data: {
      email: 'admin@yardbase.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  // Create staff members
  const staffMembers = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      return prisma.user.create({
        data: {
          email: faker.internet.email({ firstName, lastName }),
          name: `${firstName} ${lastName}`,
          password: await bcrypt.hash('password123', 10),
          role: faker.helpers.arrayElement([UserRole.MANAGER, UserRole.STAFF]),
        },
      });
    })
  );

  // Create clients
  const clients = await Promise.all(
    Array.from({ length: 20 }).map(() => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      return prisma.client.create({
        data: {
          name: `${firstName} ${lastName}`,
          email: faker.internet.email({ firstName, lastName }),
          phone: faker.phone.number('(###) ###-####'),
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state({ abbreviated: true }),
          zipCode: faker.location.zipCode(),
          notes: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.7 }),
        },
      });
    })
  );

  // Create estimates
  const estimates = await Promise.all(
    Array.from({ length: 30 }).map(async () => {
      const client = faker.helpers.arrayElement(clients);
      const numItems = faker.number.int({ min: 1, max: 5 });
      const lineItems = Array.from({ length: numItems }).map(() => {
        const quantity = faker.number.int({ min: 1, max: 10 });
        const unitPrice = faker.number.float({ min: 50, max: 500, precision: 2 });
        return {
          description: faker.commerce.productDescription(),
          quantity,
          unitPrice,
          total: quantity * unitPrice,
        };
      });

      const totalPrice = lineItems.reduce((sum, item) => sum + item.total, 0);

      return prisma.estimate.create({
        data: {
          title: `${faker.helpers.arrayElement(['Spring', 'Summer', 'Fall', 'Winter'])} ${faker.helpers.arrayElement(['Landscaping', 'Maintenance', 'Renovation'])}`,
          description: faker.lorem.paragraph(),
          status: faker.helpers.arrayElement(Object.values(EstimateStatus)),
          price: totalPrice,
          validUntil: faker.date.future(),
          clientId: client.id,
          lineItems: {
            create: lineItems,
          },
        },
      });
    })
  );

  // Create jobs
  await Promise.all(
    Array.from({ length: 50 }).map(async () => {
      const client = faker.helpers.arrayElement(clients);
      const assignedTo = faker.helpers.arrayElement(staffMembers);
      const estimate = faker.helpers.maybe(() => faker.helpers.arrayElement(estimates));
      const startDate = faker.date.between({ from: '2024-01-01', to: '2024-12-31' });

      const job = await prisma.job.create({
        data: {
          title: `${faker.helpers.arrayElement(['Regular', 'Emergency', 'Seasonal'])} ${faker.helpers.arrayElement(['Maintenance', 'Service', 'Installation'])}`,
          description: faker.lorem.paragraph(),
          status: faker.helpers.arrayElement(Object.values(JobStatus)),
          type: faker.helpers.arrayElement(Object.values(JobType)),
          startDate,
          endDate: faker.helpers.maybe(() => faker.date.soon({ days: 14, refDate: startDate })),
          price: faker.number.float({ min: 100, max: 5000, precision: 2 }),
          clientId: client.id,
          assignedToId: assignedTo.id,
          createdById: admin.id,
          estimateId: estimate?.id,
        },
      });

      // Add notes to jobs
      const numNotes = faker.number.int({ min: 0, max: 5 });
      await Promise.all(
        Array.from({ length: numNotes }).map(() =>
          prisma.note.create({
            data: {
              content: faker.lorem.paragraph(),
              jobId: job.id,
            },
          })
        )
      );

      return job;
    })
  );

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 