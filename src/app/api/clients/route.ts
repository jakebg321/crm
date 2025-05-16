import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/clients - Get all clients
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      where: {
        jobs: {
          some: {
            createdById: session.user.id
          }
        }
      },
      include: {
        jobs: true, // Always include jobs array
        _count: {
          select: {
            jobs: {
              where: {
                createdById: session.user.id
              }
            },
            estimates: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Ensure jobs is always an array (defensive, but should be handled by include)
    const safeClients = clients.map((client: any) => ({ ...client, jobs: client.jobs || [] }));

    return NextResponse.json(safeClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/clients - Create a new client
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, address, city, state, zipCode, notes } = body;

    // Validate required fields
    if (!name || !email || !phone || !address || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        notes,
        companyId: session.user.companyId,
        jobs: {
          create: {
            title: 'Initial Contact',
            description: 'Client created',
            type: 'LAWN_MAINTENANCE',
            status: 'PENDING',
            startDate: new Date(),
            price: 0,
            createdById: session.user.id,
            assignedToId: session.user.id,
            companyId: session.user.companyId,
          }
        }
      },
      include: {
        jobs: true,
        _count: {
          select: {
            jobs: true,
            estimates: true,
          }
        }
      }
    });

    // Ensure jobs is always an array (defensive, but should be handled by include)
    const safeClient = { ...client, jobs: client.jobs || [] };

    return NextResponse.json(safeClient);
  } catch (error) {
    console.error('Error creating client:', error);
    if (error instanceof Error && (error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 