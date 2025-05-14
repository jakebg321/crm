import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TaskStatus, Priority } from '@prisma/client';

// GET /api/tasks - Get tasks with optional date range and employee filter
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    // Build query conditions
    const where: any = {};

    // Add date range filter if provided
    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Add employee filter if provided
    if (employeeId) {
      where.assignedToId = employeeId;
    }

    // Add status filter if provided
    if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
      where.status = status;
    }

    // Fetch tasks with filters
    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      title,
      description,
      status = 'PENDING',
      priority = 'MEDIUM',
      startDate,
      endDate,
      assignedToId,
    } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { error: 'Start date is required' },
        { status: 400 }
      );
    }

    // Helper to normalize date strings to ISO-8601 with seconds
    function normalizeDate(dateStr) {
      if (!dateStr) return null;
      // If already has seconds, return as is
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateStr)) return dateStr;
      // If matches yyyy-mm-ddThh:mm, add :00
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateStr)) return dateStr + ':00';
      return dateStr; // fallback, let Prisma throw if truly invalid
    }

    const taskData = {
      title,
      description: description || null,
      status: status as TaskStatus,
      priority: priority as Priority,
      startDate: new Date(normalizeDate(startDate)),
      endDate: endDate ? new Date(normalizeDate(endDate)) : null,
      assignedToId: assignedToId || null,
      createdById: session.user.id,
    };

    const newTask = await prisma.task.create({
      data: taskData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 