"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../config/authOptions";
import { db } from "@packages/prisma";

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log("No session or user email found");
      return null;
    }

    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        emailVerificationToken: true,
        secondaryEmail: true,
        secondaryEmailVerified: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        lastLoginAt: true,
        previousLoginAt: true,
        lastLoginIp: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        hasSeenWelcome: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("User data retrieved:", user ? "User found" : "User not found");
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
