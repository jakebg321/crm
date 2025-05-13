import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/estimate-templates - Get all templates
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const templates = await prisma.estimateTemplate.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            savedItem: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate total price for each template
    const templatesWithTotals = templates.map(template => {
      const totalPrice = template.items.reduce((sum, item) => {
        return sum + (item.quantity * item.savedItem.unitPrice);
      }, 0);
      
      return {
        ...template,
        totalPrice,
      };
    });

    return NextResponse.json(templatesWithTotals);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { message: 'Error fetching templates' },
      { status: 500 }
    );
  }
}

// POST /api/estimate-templates - Create a new template
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the template with items
    const template = await prisma.estimateTemplate.create({
      data: {
        name: data.name,
        description: data.description || '',
        userId: session.user.id,
        items: {
          create: data.items.map(item => ({
            quantity: item.quantity || 1,
            savedItem: {
              connect: { id: item.savedItemId }
            }
          })),
        },
      },
      include: {
        items: {
          include: {
            savedItem: true,
          },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { message: 'Error creating template' },
      { status: 500 }
    );
  }
} 