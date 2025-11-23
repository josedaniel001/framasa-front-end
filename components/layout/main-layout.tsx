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
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isPublicRoute = pathname === "/login" || pathname === "/"

  useEffect(() => {
    // Solo redirigir si ya terminó de cargar y no está autenticado
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router])

  // Mostrar loading mientras se verifica el token
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

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
