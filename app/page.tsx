"use client"

import { redirect } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }

  return null
}
