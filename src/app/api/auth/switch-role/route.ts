import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from '@/lib/auth';
import { UserRole } from "@prisma/client";

export async function POST(req: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Don't allow role changes for staff@gmail.com
    if (session.user.email === 'staff@gmail.com') {
      return NextResponse.json({ error: "Cannot change role for this user" }, { status: 403 });
    }

    const { role } = await req.json();
    if (!role || !Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update user role
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Role switch error:", error);
    return NextResponse.json({ error: "Failed to switch role" }, { status: 500 });
  }
} 