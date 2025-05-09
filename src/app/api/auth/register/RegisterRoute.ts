import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use." }, { status: 400 });
    }
    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        // Optionally set default role here
      },
    });
    return NextResponse.json({ message: "User created successfully." }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
} 