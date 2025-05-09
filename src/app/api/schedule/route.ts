import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET /api/schedule - Get all jobs for the schedule
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const jobs = await prisma.job.findMany({
      where: {
        startDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        client: true,
        assignedTo: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/schedule - Create a new job
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      price,
      clientId,
      assignedToId,
    } = body;

    // Validate required fields
    if (!title || !type || !startDate || !price || !clientId || !assignedToId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        type,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        price,
        clientId,
        assignedToId,
        createdById: session.user.id,
      },
      include: {
        client: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 