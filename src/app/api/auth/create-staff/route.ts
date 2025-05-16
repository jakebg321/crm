import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export async function GET() {
  try {
    // Check if staff user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'staff@gmail.com' },
    });

    if (existingUser) {
      // If user exists, reset password
      const hashedPassword = await bcrypt.hash('staff', 10);
      await prisma.user.update({
        where: { email: 'staff@gmail.com' },
        data: { password: hashedPassword },
      });
      return NextResponse.json({ message: 'Staff user password has been reset', success: true });
    }

    // Create or find default company for staff users
    let defaultCompany = await prisma.company.findFirst({
      where: { name: 'Demo Company' }
    });

    if (!defaultCompany) {
      defaultCompany = await prisma.company.create({
        data: { name: 'Demo Company' }
      });
    }

    // Create staff user
    const hashedPassword = await bcrypt.hash('staff', 10);
    await prisma.user.create({
      data: {
        email: 'staff@gmail.com',
        name: 'Staff User',
        password: hashedPassword,
        role: UserRole.STAFF,
        companyId: defaultCompany.id, // Assign to the default company
      },
    });

    return NextResponse.json({ message: 'Staff user created successfully', success: true });
  } catch (error) {
    console.error('Error creating staff user:', error);
    return NextResponse.json({ error: 'Failed to create staff user', success: false }, { status: 500 });
  }
} 