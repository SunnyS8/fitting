"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "react-hot-toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.2 0.007 70)",
            color: "oklch(0.96 0.006 80)",
            border: "1px solid oklch(1 0 0 / 10%)",
          },
        }}
      />
    </SessionProvider>
  )
}
