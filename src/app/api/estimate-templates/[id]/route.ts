import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/estimate-templates/[id] - Get a specific estimate template
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const template = await prisma.estimateTemplate.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            savedItem: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ message: 'Template not found' }, { status: 404 });
    }

    // Check if this template belongs to the current user
    if (template.userId !== session.user.id) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Transform the response
    const items = template.items.map(item => ({
      id: item.id,
      description: item.savedItem.description,
      quantity: item.quantity,
      unitPrice: item.savedItem.unitPrice,
      total: item.quantity * item.savedItem.unitPrice,
      savedItemId: item.savedItemId,
    }));

    const totalPrice = items.reduce((sum, item) => sum + item.total, 0);

    const response = {
      id: template.id,
      name: template.name,
      description: template.description,
      items,
      totalPrice,
      createdAt: template.createdAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching estimate template:', error);
    return NextResponse.json(
      { message: 'Error fetching estimate template' },
      { status: 500 }
    );
  }
}

// PUT /api/estimate-templates/[id] - Update a specific estimate template
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // First, verify the template exists and belongs to the user
    const existingTemplate = await prisma.estimateTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existingTemplate) {
      return NextResponse.json({ message: 'Template not found' }, { status: 404 });
    }

    if (existingTemplate.userId !== session.user.id) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Validate required fields
    if (!data.name || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if all saved items exist
    const savedItemIds = data.items.map(item => item.savedItemId);
    const savedItems = await prisma.savedItem.findMany({
      where: {
        id: { in: savedItemIds },
        userId: session.user.id,
      },
    });

    if (savedItems.length !== savedItemIds.length) {
      return NextResponse.json(
        { message: 'One or more saved items not found' },
        { status: 400 }
      );
    }

    // Update the estimate template and its items
    const updatedTemplate = await prisma.$transaction(async (tx) => {
      // Delete all existing template items
      await tx.templateItem.deleteMany({
        where: { estimateTemplateId: params.id },
      });

      // Update the template and create new items
      return tx.estimateTemplate.update({
        where: { id: params.id },
        data: {
          name: data.name,
          description: data.description || '',
          items: {
            create: data.items.map(item => ({
              quantity: item.quantity || 1,
              savedItemId: item.savedItemId,
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
    });

    // Transform the response
    const items = updatedTemplate.items.map(item => ({
      id: item.id,
      description: item.savedItem.description,
      quantity: item.quantity,
      unitPrice: item.savedItem.unitPrice,
      total: item.quantity * item.savedItem.unitPrice,
    }));

    const totalPrice = items.reduce((sum, item) => sum + item.total, 0);

    const response = {
      id: updatedTemplate.id,
      name: updatedTemplate.name,
      description: updatedTemplate.description,
      items,
      totalPrice,
      createdAt: updatedTemplate.createdAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating estimate template:', error);
    return NextResponse.json(
      { message: 'Error updating estimate template' },
      { status: 500 }
    );
  }
}

// DELETE /api/estimate-templates/[id] - Delete a specific estimate template
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // First, verify the template exists and belongs to the user
    const existingTemplate = await prisma.estimateTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existingTemplate) {
      return NextResponse.json({ message: 'Template not found' }, { status: 404 });
    }

    if (existingTemplate.userId !== session.user.id) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Delete the template and its items
    await prisma.$transaction(async (tx) => {
      // First delete all template items
      await tx.templateItem.deleteMany({
        where: { estimateTemplateId: params.id },
      });

      // Then delete the template
      await tx.estimateTemplate.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting estimate template:', error);
    return NextResponse.json(
      { message: 'Error deleting estimate template' },
      { status: 500 }
    );
  }
} 