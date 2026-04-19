import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import type { Role } from "@/app/generated/prisma/client";

const devCredentials = Credentials({
  id: "dev-login",
  name: "Dev Login",
  credentials: { role: {} },
  async authorize(credentials) {
    const role = credentials?.role as string;
    if (!["ADMIN", "CREATOR", "VIEWER"].includes(role)) return null;
    const email = `${role.toLowerCase()}@dev.local`;
    return await db.user.upsert({
      where: { email },
      update: { role: role as Role },
      create: { email, name: `Dev ${role}`, role: role as Role, emailVerified: new Date() },
    });
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    // Dev-only: instant login as any role without Google OAuth.
    // The provider itself is always registered, but the login page
    // only renders the buttons in NODE_ENV === "development".
    devCredentials,
  ],
  // JWT lets middleware read the session without a DB call (Edge-compatible).
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // First sign-in: persist DB fields into the token.
        token.id = user.id!;
        token.role = (user as unknown as { role: Role }).role;
        token.blocked = (user as unknown as { blocked: boolean }).blocked ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.blocked = token.blocked;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

// Augment NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      blocked: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    blocked: boolean;
  }
}
