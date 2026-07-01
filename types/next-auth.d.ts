import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      credits: number
      subscriptionStatus: string
      subscriptionPlan: string | null
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    credits: number
    subscriptionStatus: string
    subscriptionPlan: string | null
  }
}
