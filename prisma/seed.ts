import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function safeDelete(model: any) {
  try {
    await model.deleteMany();
  } catch (e) {
    // Table might not exist yet, ignore
  }
}

async function main() {
  // Clear existing data - order matters due to foreign keys
  // Clear models that depend on User or Job first
  await safeDelete(prisma.note);
  await safeDelete(prisma.lineItem);
  await safeDelete(prisma.photo); // Assuming Photo depends on Job or User
  await safeDelete(prisma.templateItem); // Assuming TemplateItem depends on EstimateTemplate or SavedItem
  
  // Clear models that depend on Client, Estimate, Job
  await safeDelete(prisma.estimate); // Job depends on Estimate, so Estimate first or handle relation carefully
  await safeDelete(prisma.job); 
  
  // Clear models that depend on User (and User depends on Company)
  await safeDelete(prisma.savedItem);
  await safeDelete(prisma.estimateTemplate);
  await safeDelete(prisma.userSettings);
  await safeDelete(prisma.account); // NextAuth table
  await safeDelete(prisma.session); // NextAuth table
  // VerificationToken and Authenticator are typically safe to delete without order issues if not heavily related
  await safeDelete(prisma.verificationToken);
  await safeDelete(prisma.authenticator);

  // Clear core data tables
  await safeDelete(prisma.client);
  await safeDelete(prisma.user); // User must be deleted before Company if no onDelete Cascade from Company to User
  await safeDelete(prisma.company);

  // Create a default company
  const defaultCompany = await prisma.company.create({
    data: {
      name: 'Default Landscaping Co.',
    },
  });
  console.log(`Created default company: ${defaultCompany.name} (ID: ${defaultCompany.id})`);

  // Create admin user for the default company
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@yardbase.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      companyId: defaultCompany.id, // Associate with the default company
    },
  });

  console.log('Database has been seeded with a default company and an admin user for that company. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 