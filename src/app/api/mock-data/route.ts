import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { JobType, EstimateStatus, JobStatus } from '@prisma/client';

// List of real city/state combinations for realistic routing
const realLocations = [
  { city: 'New York', state: 'NY', zip: '10001' },
  { city: 'Los Angeles', state: 'CA', zip: '90001' },
  { city: 'Chicago', state: 'IL', zip: '60601' },
  { city: 'Houston', state: 'TX', zip: '77001' },
  { city: 'Phoenix', state: 'AZ', zip: '85001' },
  { city: 'Philadelphia', state: 'PA', zip: '19101' },
  { city: 'San Antonio', state: 'TX', zip: '78201' },
  { city: 'San Diego', state: 'CA', zip: '92101' },
  { city: 'Dallas', state: 'TX', zip: '75201' },
  { city: 'San Jose', state: 'CA', zip: '95101' },
];

// Job types from schema - these must match the exact values in the Prisma schema
const jobTypes = [
  JobType.LAWN_MAINTENANCE,
  JobType.LANDSCAPE_DESIGN,
  JobType.TREE_SERVICE,
  JobType.IRRIGATION,
  JobType.HARDSCAPING,
  JobType.CLEANUP,
  JobType.PLANTING,
  JobType.FERTILIZATION
];

// POST /api/mock-data - Generate mock data
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.companyId || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Only admins can generate mock data' }, { status: 401 });
    }

    const body = await request.json();
    const { employees = 3, clients = 5, jobsPerClient = 2, estimates = 3 } = body;

    const companyId = session.user.companyId;
    const results = {
      employees: 0,
      clients: 0,
      jobs: 0,
      estimates: 0,
    };

    // 1. Create mock employees
    const mockEmployees = [];
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    for (let i = 0; i < employees; i++) {
      const role = i === 0 ? 'MANAGER' : 'STAFF';
      const mockEmployee = await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          password: hashedPassword,
          role,
          companyId,
        },
      });
      mockEmployees.push(mockEmployee);
    }
    results.employees = mockEmployees.length;

    // 2. Create mock clients with real addresses
    const mockClients = [];
    for (let i = 0; i < clients; i++) {
      const location = realLocations[i % realLocations.length];
      const streetAddress = faker.location.streetAddress();
      const mockClient = await prisma.client.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          phone: faker.phone.number(),
          address: streetAddress,
          city: location.city,
          state: location.state,
          zipCode: location.zip,
          notes: faker.lorem.paragraph(),
          companyId,
        },
      });
      mockClients.push(mockClient);
    }
    results.clients = mockClients.length;

    // 3. Create mock jobs for each client
    const mockJobs = [];
    for (const client of mockClients) {
      for (let i = 0; i < jobsPerClient; i++) {
        // Randomly assign to an employee
        const assignedEmployee = mockEmployees[Math.floor(Math.random() * mockEmployees.length)];
        const startDate = faker.date.between({ from: new Date(), to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 3);
        
        // Use JobStatus enum values
        const jobStatus = Math.random() > 0.7 ? JobStatus.COMPLETED : 
                          Math.random() > 0.5 ? JobStatus.SCHEDULED : 
                          JobStatus.PENDING;
        
        const mockJob = await prisma.job.create({
          data: {
            title: faker.lorem.words(3),
            description: faker.lorem.paragraph(),
            status: jobStatus,
            type: jobTypes[Math.floor(Math.random() * jobTypes.length)],
            startDate,
            endDate,
            price: parseFloat(faker.commerce.price({ min: 100, max: 2000 })),
            companyId,
            clientId: client.id,
            assignedToId: assignedEmployee.id,
            createdById: session.user.id,
          },
        });
        mockJobs.push(mockJob);
      }
    }
    results.jobs = mockJobs.length;

    // 4. Create mock estimates
    const mockEstimates = [];
    for (let i = 0; i < estimates; i++) {
      const client = mockClients[Math.floor(Math.random() * mockClients.length)];
      const totalPrice = parseFloat(faker.commerce.price({ min: 500, max: 5000 }));
      
      // Use EstimateStatus enum values
      const estimateStatus = Math.random() > 0.7 ? EstimateStatus.ACCEPTED : 
                            Math.random() > 0.5 ? EstimateStatus.SENT : 
                            EstimateStatus.DRAFT;
      
      const mockEstimate = await prisma.estimate.create({
        data: {
          title: `Estimate for ${client.name}`,
          description: faker.lorem.paragraph(),
          status: estimateStatus,
          price: totalPrice,
          validUntil: faker.date.future(),
          taxRate: 8.25,
          terms: 'Payment due within 30 days of completion',
          companyId,
          clientId: client.id,
          createdById: session.user.id,
          lineItems: {
            create: [
              {
                description: 'Initial service fee',
                quantity: 1,
                unitPrice: totalPrice * 0.3,
                total: totalPrice * 0.3,
              },
              {
                description: 'Labor',
                quantity: 8,
                unitPrice: (totalPrice * 0.5) / 8,
                total: totalPrice * 0.5,
              },
              {
                description: 'Materials',
                quantity: 1,
                unitPrice: totalPrice * 0.2,
                total: totalPrice * 0.2,
              },
            ],
          },
        },
      });
      mockEstimates.push(mockEstimate);
    }
    results.estimates = mockEstimates.length;

    return NextResponse.json({
      message: 'Mock data generated successfully',
      results,
    });
  } catch (error) {
    console.error('Error generating mock data:', error);
    return NextResponse.json(
      { error: 'Failed to generate mock data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 