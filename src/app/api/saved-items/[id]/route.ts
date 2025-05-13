import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/saved-items/[id] - Get a specific saved item
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const savedItem = await prisma.savedItem.findUnique({
      where: { id: params.id },
    });

    if (!savedItem) {
      return NextResponse.json({ message: 'Saved item not found' }, { status: 404 });
    }

    // Check if this item belongs to the current user
    if (savedItem.userId !== session.user.id) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(savedItem);
  } catch (error) {
    console.error('Error fetching saved item:', error);
    return NextResponse.json(
      { message: 'Error fetching saved item' },
      { status: 500 }
    );
  }
}

// PUT /api/saved-items/[id] - Update a specific saved item
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

    // First, verify the saved item exists and belongs to the user
    const existingSavedItem = await prisma.savedItem.findUnique({
      where: { id: params.id },
    });

    if (!existingSavedItem) {
      return NextResponse.json({ message: 'Saved item not found' }, { status: 404 });
    }

    if (existingSavedItem.userId !== session.user.id) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Validate required fields
    if (!data.description || data.unitPrice === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the saved item with category
    const updatedSavedItem = await prisma.savedItem.update({
      where: { id: params.id },
      data: {
        description: data.description,
        unitPrice: data.unitPrice,
        quantity: data.quantity || 1,
        category: data.category || 'Other',
      },
    });

    return NextResponse.json(updatedSavedItem);
  } catch (error) {
    console.error('Error updating saved item:', error);
    return NextResponse.json(
      { message: 'Error updating saved item' },
      { status: 500 }
    );
  }
}

// DELETE /api/saved-items/[id] - Delete a specific saved item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // First, verify the saved item exists and belongs to the user
    const existingSavedItem = await prisma.savedItem.findUnique({
      where: { id: params.id },
    });

    if (!existingSavedItem) {
      return NextResponse.json({ message: 'Saved item not found' }, { status: 404 });
    }

    if (existingSavedItem.userId !== session.user.id) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Delete the saved item
    await prisma.savedItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Saved item deleted successfully' });
  } catch (error) {
    console.error('Error deleting saved item:', error);
    return NextResponse.json(
      { message: 'Error deleting saved item' },
      { status: 500 }
    );
  }
} 