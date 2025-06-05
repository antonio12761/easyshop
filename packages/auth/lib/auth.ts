// packages/auth/lib/auth.ts
import NextAuth from "next-auth";
import { authOptions } from "../config/authOptions";

export const auth = () => NextAuth(authOptions);
