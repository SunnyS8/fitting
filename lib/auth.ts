import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import { UserService } from "./services/user"
import type { AuthOptions } from "next-auth"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user?.id) {
        await UserService.giveFreeCreditsIfNeeded(user.id)
      }
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.credits = user.credits
        session.user.subscriptionStatus = user.subscriptionStatus
        session.user.subscriptionPlan = user.subscriptionPlan
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
}
