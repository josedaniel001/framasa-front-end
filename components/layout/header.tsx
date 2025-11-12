"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { LogOut, Bell, Search } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"

export function AppHeader() {
  const { logout, usuario } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // Generar breadcrumbs basado en la ruta actual
  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs = []

    if (segments.length === 0 || segments[0] === "dashboard") {
      return [{ label: "Dashboard", href: "/dashboard", isLast: true }]
    }

    // Mapeo de rutas a nombres legibles
    const routeNames: { [key: string]: string } = {
      ferreteria: "Ferretería",
      piedrinera: "Piedrinera",
      bloquera: "Bloquera",
      taller: "Taller",
      planillas: "Planillas",
      productos: "Productos",
      inventario: "Inventario",
      ventas: "Ventas",
      cotizaciones: "Cotizaciones",
      clientes: "Clientes",
      produccion: "Producción",
      ordenes: "Órdenes",
      empleados: "Empleados",
      asistencia: "Asistencia",
      nomina: "Nómina",
      reportes: "Reportes",
      materiales: "Materiales",
      servicios: "Servicios",
      camiones: "Camiones",
      despachos: "Despachos",
    }

    let currentPath = ""
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1
      breadcrumbs.push({
        label: routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
        isLast,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className="hidden md:block">
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar..." className="w-[200px] pl-8 lg:w-[300px]" />
        </div>

        <Button variant="ghost" size="icon" className="hidden md:flex">
          <Bell className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 text-sm">
          <span className="hidden md:inline">{usuario?.username}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
