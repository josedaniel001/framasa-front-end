"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "./sidebar"
import { AppHeader } from "./header"
import { cn } from "@/lib/utils"

function MainContent({ children }: { children: React.ReactNode }) {
  const { state, isMobile } = useSidebar()
  
  // Calcular el margen izquierdo basado en el estado
  const marginLeft = isMobile 
    ? "0" 
    : state === "expanded" 
      ? "16rem" 
      : "3rem"
  
  return (
    <SidebarInset
      className="md:transition-[margin-left] md:duration-200 md:ease-linear"
      style={{
        marginLeft: isMobile ? undefined : marginLeft,
      }}
    >
      <AppHeader />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </SidebarInset>
  )
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isPublicRoute = pathname === "/login" || pathname === "/"

  useEffect(() => {
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login")
    }
  }, [isAuthenticated, isPublicRoute, router])

  if (isPublicRoute) {
    return <div className="min-h-screen">{children}</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  )
}
