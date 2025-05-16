import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sign } from "jsonwebtoken";

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error("Error parsing JSON body:", err);
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  try {
    const { name, email, password, companyId, companyName } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    // Must provide either companyId or companyName, but not both
    if ((!companyId && !companyName) || (companyId && companyName)) {
      return NextResponse.json({ error: "You must provide either a companyId to join or a companyName to create a new organization, but not both." }, { status: 400 });
    }
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use." }, { status: 400 });
    }
    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    let finalCompanyId = companyId;
    if (companyName) {
      // Create new company
      const newCompany = await prisma.company.create({
        data: { name: companyName }
      });
      finalCompanyId = newCompany.id;
    }
    // Create user with the determined companyId
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        // @ts-ignore - Prisma schema includes companyId but TypeScript might not know
        companyId: finalCompanyId,
        role: companyName ? 'ADMIN' : 'STAFF', // Set role to ADMIN if creating new company, otherwise STAFF
      }
    });

    // Create a session token with companyId
    const token = sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        // @ts-ignore - Include companyId in the token
        companyId: finalCompanyId,
      },
      process.env.NEXTAUTH_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Set the session cookie
    const response = NextResponse.json(
      { message: "User created successfully." },
      { status: 201 }
    );

    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    // Always log the error for debugging
    console.error("Registration error:", err);
    // Always return JSON
    let message = "Server error.";
    if (err?.message) message = err.message;
    // Prisma errors may have a 'code' property
    if (err?.code && err?.meta?.cause) message = err.meta.cause;
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 