import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/estimate-templates/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
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
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if this template belongs to the current user
    if (template.userId !== session.user.id) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT /api/estimate-templates/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, items } = body;

    // First check if template exists and belongs to user
    const existingTemplate = await prisma.estimateTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (existingTemplate.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update the template with a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing template items
      await tx.templateItem.deleteMany({
        where: { estimateTemplateId: params.id },
      });

      // Update template base info
      const updatedTemplate = await tx.estimateTemplate.update({
        where: { id: params.id },
        data: {
          name,
          description,
        },
      });

      // Add new template items if provided
      if (items && items.length > 0) {
        for (const item of items) {
          await tx.templateItem.create({
            data: {
              estimateTemplateId: updatedTemplate.id,
              savedItemId: item.savedItemId,
              quantity: item.quantity || 1,
            },
          });
        }
      }

      // Return updated template with items
      return await tx.estimateTemplate.findUnique({
        where: { id: updatedTemplate.id },
        include: {
          items: {
            include: {
              savedItem: true,
            },
          },
        },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/estimate-templates/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // First check if template exists and belongs to user
    const template = await prisma.estimateTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (template.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete with transaction
    await prisma.$transaction(async (tx) => {
      // First delete related template items
      await tx.templateItem.deleteMany({
        where: { estimateTemplateId: params.id },
      });

      // Then delete the template
      await tx.estimateTemplate.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 