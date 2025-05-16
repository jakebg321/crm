import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          // Find user in the database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) return null;
          
          // Compare password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;
          
          // Return user object (omit password)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
          };
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.sub || "",
          role: token.role as string || "",
          companyId: token.companyId as string || "",
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.companyId = (user as any).companyId;
      }
      return token;
    }
  }
}; 