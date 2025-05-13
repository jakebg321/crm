import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// GET /api/schedule - Get all jobs for the schedule
export async function GET(request: Request) {
  try {
    console.log('Fetching schedule - checking authentication');
    
    // Check database connection first before anything else
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ 
        error: 'Database connection error', 
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 });
    }
    
    const session = await getServerSession(authOptions);
    
    // Authentication check
    if (!session) {
      console.log('Unauthorized: No session found');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }
    
    if (!session.user) {
      console.log('Unauthorized: No user in session');
      return NextResponse.json({ error: 'Unauthorized - No user in session' }, { status: 401 });
    }
    
    if (!session.user.id) {
      console.log('Unauthorized: No user ID in session');
      return NextResponse.json({ error: 'Unauthorized - No user ID' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employeeId = searchParams.get('employeeId');

    if (!startDate || !endDate) {
      console.log('Missing date parameters');
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    console.log(`Fetching jobs from ${startDate} to ${endDate} for user ${session.user.id}`);
    
    // Verify the user exists in the database
    try {
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true }
      });
      
      if (!userExists) {
        console.log(`User ID ${session.user.id} not found in database`);
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
      }
    } catch (userError) {
      console.error('Error checking user existence:', userError);
      return NextResponse.json({ 
        error: 'Error verifying user', 
        details: userError instanceof Error ? userError.message : 'Unknown user error'
      }, { status: 500 });
    }
    
    // Now try to fetch the jobs
    try {
      const where = {
        startDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        ...(employeeId && {
          assignedToId: employeeId,
        }),
      };
      
      // First check if the job table exists by trying a count
      const jobCount = await prisma.job.count({
        where: where
      });
      
      console.log(`Found ${jobCount} jobs in count query`);
      
      // If we get here, the table exists, so we can try the full query
      const jobs = await prisma.job.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedTo: {
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
      
      console.log(`Successfully fetched ${jobs.length} jobs`);
      return NextResponse.json(jobs);
    } catch (prismaError) {
      console.error('Prisma query error:', prismaError);
      
      // If it's a known Prisma error, we can provide more details
      if (prismaError instanceof PrismaClientKnownRequestError) {
        console.error(`Prisma error code: ${prismaError.code}`);
        
        // Handle specific Prisma error codes
        if (prismaError.code === 'P2021') {
          return NextResponse.json({ 
            error: 'Database table not found', 
            details: 'The job table does not exist in the database. Run database migrations.' 
          }, { status: 500 });
        } else if (prismaError.code === 'P2003') {
          return NextResponse.json({ 
            error: 'Foreign key constraint failed', 
            details: 'A related record was not found. Check client and assignedTo IDs.' 
          }, { status: 400 });
        }
      }
      
      return NextResponse.json({ 
        error: 'Database query error', 
        details: prismaError instanceof Error ? prismaError.message : 'Unknown database error' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in schedule API:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/schedule - Create a new job
export async function POST(request: Request) {
  try {
    console.log('Creating new job - checking authentication');
    
    // Check database connection first before anything else
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ 
        error: 'Database connection error', 
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 });
    }
    
    const session = await getServerSession(authOptions);
    
    // Authentication check
    if (!session) {
      console.log('Unauthorized: No session found');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }
    
    if (!session.user) {
      console.log('Unauthorized: No user in session');
      return NextResponse.json({ error: 'Unauthorized - No user in session' }, { status: 401 });
    }
    
    if (!session.user.id) {
      console.log('Unauthorized: No user ID in session');
      return NextResponse.json({ error: 'Unauthorized - No user ID' }, { status: 401 });
    }
    
    // Verify the user exists in the database
    try {
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true }
      });
      
      if (!userExists) {
        console.log(`User ID ${session.user.id} not found in database`);
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
      }
    } catch (userError) {
      console.error('Error checking user existence:', userError);
      return NextResponse.json({ 
        error: 'Error verifying user', 
        details: userError instanceof Error ? userError.message : 'Unknown user error'
      }, { status: 500 });
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

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

    // Helper to normalize date strings to ISO-8601 with seconds
    function normalizeDate(dateStr) {
      if (!dateStr) return null;
      // If already has seconds, return as is
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateStr)) return dateStr;
      // If matches yyyy-mm-ddThh:mm, add :00
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateStr)) return dateStr + ':00';
      return dateStr; // fallback, let Prisma throw if truly invalid
    }

    const safeJobData = {
      title,
      description: description || null,
      type: type || null,
      startDate: startDate ? new Date(normalizeDate(startDate)) : null,
      endDate: endDate ? new Date(normalizeDate(endDate)) : null,
      price: price === '' ? null : price,
      clientId: clientId || null,
      assignedToId: assignedToId || null,
      createdById: session.user.id,
    };

    console.log('Received job data:', { title, type, startDate, clientId, assignedToId });

    // Validate required fields
    if (!title) {
      console.log('Missing required field: title');
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Verify client and assignedTo exist if provided
    try {
      if (clientId) {
        const clientExists = await prisma.client.findUnique({
          where: { id: clientId },
          select: { id: true }
        });
        
        if (!clientExists) {
          console.log(`Client ID ${clientId} not found in database`);
          return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }
      }
      
      if (assignedToId) {
        const assignedToExists = await prisma.user.findUnique({
          where: { id: assignedToId },
          select: { id: true }
        });
        
        if (!assignedToExists) {
          console.log(`AssignedTo user ID ${assignedToId} not found in database`);
          return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 });
        }
      }
    } catch (entityError) {
      console.error('Error verifying client/assignedTo existence:', entityError);
      return NextResponse.json({ 
        error: 'Error verifying client or assignedTo user', 
        details: entityError instanceof Error ? entityError.message : 'Unknown entity error'
      }, { status: 500 });
    }

    try {
      const job = await prisma.job.create({
        data: safeJobData,
        include: {
          client: true,
          assignedTo: true,
        },
      });
      console.log('Job created successfully:', job.id);
      return NextResponse.json(job);
    } catch (prismaError: any) {
      console.error('Prisma create error:', prismaError);
      if (prismaError.code) {
        console.error(`Prisma error code: ${prismaError.code}`);
        
        // Handle common Prisma errors
        if (prismaError.code === 'P2002') {
          return NextResponse.json({ error: 'Unique constraint violation' }, { status: 400 });
        } else if (prismaError.code === 'P2003') {
          return NextResponse.json({ error: 'Foreign key constraint failed' }, { status: 400 });
        } else if (prismaError.code === 'P2021') {
          return NextResponse.json({ 
            error: 'Database table not found', 
            details: 'The job table does not exist in the database. Run database migrations.' 
          }, { status: 500 });
        }
      }
      
      return NextResponse.json({ 
        error: 'Database error', 
        details: prismaError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 