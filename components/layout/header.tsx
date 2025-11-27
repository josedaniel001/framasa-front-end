"use client"

import { useState, useEffect, useRef } from "react"
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
import { LogOut, Bell, Search, Package, Users, Loader2 } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"

interface SearchResult {
  id: string
  tipo: "producto" | "cliente"
  modulo: "ferreteria" | "bloquera" | "piedrinera"
  titulo: string
  subtitulo?: string
  url: string
}

export function AppHeader() {
  const { logout, usuario } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // Búsqueda global
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([])
      return
    }

    // Debounce de búsqueda
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const term = searchTerm.trim().toLowerCase()
        const results: SearchResult[] = []

        // Buscar productos en paralelo
        const [ferreteriaProductos, bloqueraProductos, piedrineraProductos, ferreteriaClientes] = await Promise.allSettled([
          apiGet<any>(`${API_ENDPOINTS.FERRETERIA.PRODUCTOS}?search=${term}`),
          apiGet<any>(`${API_ENDPOINTS.BLOQUERA.PRODUCTOS}?search=${term}`),
          apiGet<any>(`${API_ENDPOINTS.PIEDRINERA.PRODUCTOS}?search=${term}`),
          apiGet<any>(`${API_ENDPOINTS.FERRETERIA.CLIENTES}?search=${term}`),
        ])

        // Procesar productos de ferretería
        if (ferreteriaProductos.status === "fulfilled") {
          const productos = Array.isArray(ferreteriaProductos.value)
            ? ferreteriaProductos.value
            : ferreteriaProductos.value?.results || ferreteriaProductos.value?.data || []
          
          productos.slice(0, 5).forEach((p: any) => {
            results.push({
              id: `ferr-prod-${p.id}`,
              tipo: "producto",
              modulo: "ferreteria",
              titulo: p.nombre || p.nombre_producto || "",
              subtitulo: p.codigo || p.codigo_producto || "",
              url: `/ferreteria/productos/${p.id}`,
            })
          })
        }

        // Procesar productos de bloquera
        if (bloqueraProductos.status === "fulfilled") {
          const productos = Array.isArray(bloqueraProductos.value)
            ? bloqueraProductos.value
            : bloqueraProductos.value?.results || bloqueraProductos.value?.data || []
          
          productos.slice(0, 5).forEach((p: any) => {
            results.push({
              id: `bloq-prod-${p.id}`,
              tipo: "producto",
              modulo: "bloquera",
              titulo: p.nombre || p.nombre_producto || "",
              subtitulo: p.codigo || p.codigo_producto || "",
              url: `/bloquera/productos/${p.id}`,
            })
          })
        }

        // Procesar productos de piedrinera
        if (piedrineraProductos.status === "fulfilled") {
          const productos = Array.isArray(piedrineraProductos.value)
            ? piedrineraProductos.value
            : piedrineraProductos.value?.results || piedrineraProductos.value?.data || []
          
          productos.slice(0, 5).forEach((p: any) => {
            results.push({
              id: `pied-prod-${p.id}`,
              tipo: "producto",
              modulo: "piedrinera",
              titulo: p.nombre || p.nombre_producto || "",
              subtitulo: p.codigo || p.codigo_producto || "",
              url: `/piedrinera/productos/${p.id}`,
            })
          })
        }

        // Procesar clientes de ferretería
        if (ferreteriaClientes.status === "fulfilled") {
          const clientes = Array.isArray(ferreteriaClientes.value)
            ? ferreteriaClientes.value
            : ferreteriaClientes.value?.results || ferreteriaClientes.value?.data || []
          
          clientes.slice(0, 5).forEach((c: any) => {
            results.push({
              id: `ferr-cli-${c.id}`,
              tipo: "cliente",
              modulo: "ferreteria",
              titulo: c.nombre || c.nombre_cliente || "",
              subtitulo: c.nit || c.telefono || "",
              url: `/ferreteria/clientes/${c.id}`,
            })
          })
        }

        setSearchResults(results)
      } catch (error) {
        console.error("Error en búsqueda global:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  const handleSearchSelect = (url: string) => {
    setSearchOpen(false)
    setSearchTerm("")
    router.push(url)
  }

  const getResultIcon = (tipo: string) => {
    switch (tipo) {
      case "producto":
        return <Package className="h-4 w-4" />
      case "cliente":
        return <Users className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getModuloBadge = (modulo: string) => {
    const colors: Record<string, string> = {
      ferreteria: "bg-blue-500",
      bloquera: "bg-green-500",
      piedrinera: "bg-orange-500",
    }
    return (
      <span className={`text-xs px-1.5 py-0.5 rounded text-white ${colors[modulo] || "bg-gray-500"}`}>
        {modulo.charAt(0).toUpperCase() + modulo.slice(1)}
      </span>
    )
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
      asistencias: "Asistencias",
      nomina: "Nómina",
      nominas: "Nóminas",
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
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos, clientes..."
                className="w-[200px] pl-8 lg:w-[300px]"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => {
                  if (searchTerm.trim().length >= 2) {
                    setSearchOpen(true)
                  }
                }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="end">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Buscar productos, clientes..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                {isSearching && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
                  </div>
                )}
                {!isSearching && searchTerm.trim().length < 2 && (
                  <CommandEmpty>Escribe al menos 2 caracteres para buscar</CommandEmpty>
                )}
                {!isSearching && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
                  <CommandEmpty>No se encontraron resultados</CommandEmpty>
                )}
                {!isSearching && searchResults.length > 0 && (
                  <>
                    <CommandGroup heading="Resultados">
                      {searchResults.map((result) => (
                        <CommandItem
                          key={result.id}
                          value={result.id}
                          onSelect={() => handleSearchSelect(result.url)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 text-muted-foreground">
                              {getResultIcon(result.tipo)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{result.titulo}</span>
                                {getModuloBadge(result.modulo)}
                              </div>
                              {result.subtitulo && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {result.subtitulo}
                                </p>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

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
