import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// GET /api/estimates - Get all estimates for the logged-in user
export async function GET(request: Request) {
  try {
    console.log('Fetching estimates - checking authentication');
    
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

    console.log(`Fetching estimates for user ${session.user.id}`);
    
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
    
    // Now try to fetch the estimates
    try {
      // First check if the estimate table exists by trying a count
      const estimateCount = await prisma.estimate.count({
        where: { createdById: session.user.id }
      });
      
      console.log(`Found ${estimateCount} estimates for user`);
      
      // If we get here, the table exists, so we can try the full query
      const estimates = await prisma.estimate.findMany({
        where: { createdById: session.user.id },
        include: { client: true, lineItems: true },
        orderBy: { createdAt: 'desc' },
      });
      
      console.log(`Successfully fetched ${estimates.length} estimates`);
      return NextResponse.json(estimates);
    } catch (prismaError) {
      console.error('Prisma query error:', prismaError);
      
      // If it's a known Prisma error, we can provide more details
      if (prismaError instanceof PrismaClientKnownRequestError) {
        console.error(`Prisma error code: ${prismaError.code}`);
        
        // Handle specific Prisma error codes
        if (prismaError.code === 'P2021') {
          return NextResponse.json({ 
            error: 'Database table not found', 
            details: 'The estimates table does not exist in the database. Run database migrations.' 
          }, { status: 500 });
        }
      }
      
      return NextResponse.json({ 
        error: 'Database query error', 
        details: prismaError instanceof Error ? prismaError.message : 'Unknown database error' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in estimates API:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/estimates - Create a new estimate
export async function POST(request: Request) {
  try {
    console.log('Creating new estimate - checking authentication');
    
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
    
    const { clientId, total, status, lineItems } = body;
    console.log('Received estimate data:', { clientId, total, status, lineItemCount: lineItems?.length || 0 });
    
    if (!clientId || !total || !status) {
      console.log('Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    try {
      // Verify the client exists
      const clientExists = await prisma.client.findUnique({
        where: { id: clientId },
        select: { id: true }
      });
      
      if (!clientExists) {
        console.log(`Client ID ${clientId} not found in database`);
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      
      const estimate = await prisma.estimate.create({
        data: {
          clientId,
          total,
          status,
          createdById: session.user.id,
          lineItems: lineItems && Array.isArray(lineItems) ? {
            create: lineItems.map(item => ({
              description: item.description,
              quantity: item.quantity,
              price: item.price,
            }))
          } : undefined,
        },
        include: { client: true, lineItems: true },
      });
      console.log('Estimate created successfully:', estimate.id);
      return NextResponse.json(estimate);
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
            details: 'The estimates table does not exist in the database. Run database migrations.' 
          }, { status: 500 });
        }
      }
      
      return NextResponse.json({ 
        error: 'Database error', 
        details: prismaError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating estimate:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 