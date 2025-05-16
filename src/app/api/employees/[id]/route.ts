import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

// GET /api/employees/[id] - Get a specific employee
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized: No user ID or company ID in session' }, { status: 401 });
    }

    // Allow users to view their own profile or admins/managers to view any profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.id !== params.id && user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized: You can only view your own profile or profiles within your company' }, { status: 401 });
    }

    // Get employee from the same company
    const employee = await prisma.user.findFirst({
      where: { 
        id: params.id,
        companyId: session.user.companyId // Ensure employee is from the same company
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedJobs: true,
            createdJobs: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Transform the data to include job counts
    const transformedEmployee = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      assignedJobs: employee._count.assignedJobs,
      completedJobs: employee._count.createdJobs,
    };

    return NextResponse.json(transformedEmployee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id] - Update an employee
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized: No user ID or company ID in session' }, { status: 401 });
    }

    // Only allow admins to update employee roles, or users to update their own profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify target employee exists and is in the same company
    const targetEmployee = await prisma.user.findFirst({
      where: { 
        id: params.id,
        companyId: session.user.companyId // Ensure employee is from the same company
      },
    });

    if (!targetEmployee) {
      return NextResponse.json({ error: 'Employee not found or not in your company' }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // If updating role, only admin can do this
    if (role && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Only admins can update roles' }, { status: 401 });
    }

    // If updating someone else's profile, only admin can do this
    if (params.id !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: You can only update your own profile' }, { status: 401 });
    }

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== params.id) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedEmployee = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    });

    // Remove password from response
    const { password: _, ...employeeWithoutPassword } = updatedEmployee;

    return NextResponse.json(employeeWithoutPassword);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id] - Delete an employee
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized: No user ID or company ID in session' }, { status: 401 });
    }

    // Only allow admins to delete employees
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Only admins can delete employees' }, { status: 401 });
    }

    // Check if employee exists in the same company
    const employee = await prisma.user.findFirst({
      where: { 
        id: params.id,
        companyId: session.user.companyId // Ensure employee is from the same company
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found or not in your company' }, { status: 404 });
    }

    // Prevent deleting yourself
    if (employee.id === session.user.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    // Delete employee
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 