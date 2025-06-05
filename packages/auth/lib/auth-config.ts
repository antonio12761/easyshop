import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@packages/prisma";
import bcrypt from "bcryptjs";

// Re-export authOptions dal file config per mantenere compatibilità
export { authOptions } from "../config/authOptions";

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        // Ottieni l'IP dell'utente dalla richiesta
        const userIp =
          req?.headers?.["x-forwarded-for"] ||
          req?.headers?.["x-real-ip"] ||
          "unknown";

        const clientIp = Array.isArray(userIp) ? userIp[0] : userIp;

        // Aggiorna previousLoginAt e lastLoginIp prima di restituire l'utente
        await db.user.update({
          where: { id: user.id },
          data: {
            previousLoginAt: new Date(),
            lastLoginIp: clientIp,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
          emailVerified: user.emailVerified,
          previousLoginAt: user.previousLoginAt,
          lastLoginIp: clientIp,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.twoFactorEnabled = user.twoFactorEnabled;
        token.emailVerified = user.emailVerified;
        token.previousLoginAt = user.previousLoginAt?.toISOString() || null;
        token.lastLoginIp = user.lastLoginIp;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.twoFactorEnabled = token.twoFactorEnabled;
        session.user.emailVerified = token.emailVerified;
        session.user.previousLoginAt = token.previousLoginAt;
        session.user.lastLoginIp = token.lastLoginIp;
        session.user.createdAt = token.createdAt;
        session.user.updatedAt = token.updatedAt;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
