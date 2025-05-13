import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/saved-items - Get all saved items for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const savedItems = await prisma.savedItem.findMany({
      where: { userId: session.user.id },
      orderBy: { description: 'asc' },
    });

    return NextResponse.json(savedItems);
  } catch (error) {
    console.error('Error fetching saved items:', error);
    return NextResponse.json(
      { message: 'Error fetching saved items' },
      { status: 500 }
    );
  }
}

// POST /api/saved-items - Create a new saved item
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.description || data.unitPrice === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the saved item with category support
    const savedItem = await prisma.savedItem.create({
      data: {
        description: data.description,
        unitPrice: data.unitPrice,
        quantity: data.quantity || 1,
        category: data.category || 'Other', // Add category support
        userId: session.user.id,
      },
    });

    return NextResponse.json(savedItem, { status: 201 });
  } catch (error) {
    console.error('Error creating saved item:', error);
    return NextResponse.json(
      { message: 'Error creating saved item' },
      { status: 500 }
    );
  }
} 