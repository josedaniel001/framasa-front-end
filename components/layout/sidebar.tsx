"use client"

import { useState } from "react"
import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, Home, Package, Factory, Truck, Hammer, Users, BarChart3, ChevronDown, CreditCard } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/contexts/auth-context"
import { ModuloSistema } from "@/types/database"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    modulo: ModuloSistema.DASHBOARD,
  },
  {
    title: "Ferretería",
    icon: Package,
    modulo: ModuloSistema.FERRETERIA,
    items: [
      {
        title: "🛒 Operación",
        items: [
          { title: "Realizar Venta (Generar Factura)", url: "/ferreteria/ventas" },
          { title: "Generar Cotizaciones", url: "/ferreteria/cotizaciones" },
        ],
      },
      {
        title: "📦 Catálogo",
        items: [
          { title: "Registrar Productos de Ferreteria", url: "/ferreteria/productos" },
          { title: "Administrar Inventario (Salidas y Entradas)", url: "/ferreteria/inventario" },
        ],
      },
      {
        title: "👥 Clientes",
        items: [
          { title: "Lista de Clientes", url: "/ferreteria/clientes" },
          { title: "Cuentas por Cobrar para Empresa", url: "/ferreteria/cuentas-por-cobrar" },
        ],
      },
    ],
  },
  {
    title: "Bloquera",
    icon: Factory,
    modulo: ModuloSistema.BLOQUERA,
    items: [
      {
        title: "📦 Catalogos y Existencias",
        items: [
          { title: "Registrar Productos de Bloquera", url: "/bloquera/productos" },
          { title: "Administrar Inventario (Entradas y Salidas)", url: "/bloquera/inventario" },
        ],
      },
      {
        title: "🏗️ Producción",
        items: [
          { title: "Generar Ordenes de Producción de Bloquera", url: "/bloquera/ordenes" },
        ],
      },
    ],
  },
  {
    title: "Piedrinera",
    icon: Truck,
    modulo: ModuloSistema.PIEDRINERA,
    items: [
      {
        title: "🧱 Materiales",
        items: [
          { title: "Registrar Productos de Piedrinera", url: "/piedrinera/productos" },
          { title: "Administrar Inventario (Entradas y Salidas)", url: "/piedrinera/inventario" },
        ],
      },
      {
        title: "⛏️ Operación",
        items: [
          { title: "Registrar Nueva Producción de Piedrinera", url: "/piedrinera/produccion" },
          { title: "Realizar Venta de Producto de Piedrinera", url: "/piedrinera/ventas" },
        ],
      },
      {
        title: "🚛 Logística",
        items: [
          { title: "Registrar Camiones a usar en Piedrinera", url: "/piedrinera/camiones" },
          { title: "Despachos de Camiones", url: "/piedrinera/despachos" },
        ],
      },
    ],
  },
  {
    title: "Taller",
    icon: Hammer,
    modulo: ModuloSistema.TALLER,
    items: [
      {
        title: "🛠️ Operación",
        items: [
          { title: "Crear Orden de Mantenimiento", url: "/taller/ordenes" },
        ],
      },
      {
        title: "⚙️ Recursos",
        items: [
          { title: "Registro de Maquinaria de Empresa Framasa", url: "/taller/maquinaria" },
        ],
      },
      {
        title: "🧾 Externos",
        items: [
          { title: "Registro de Compra de Repuestos (no de Inventario)", url: "/taller/compra-repuestos" },
        ],
      },
    ],
  },
  {
    title: "Planillas",
    icon: Users,
    modulo: ModuloSistema.PLANILLAS,
    items: [
      {
        title: "👤 Personal",
        items: [
          { title: "Registro de Empleados", url: "/planillas/empleados" },
        ],
      },
      {
        title: "⏱️ Asistencia",
        items: [
          { title: "Registro de Asistencia de Empleados", url: "/planillas/asistencias" },
        ],
      },
      {
        title: "💰 Pagos",
        items: [
          { title: "Creación de Nóminas", url: "/planillas/nominas" },
        ],
      },
    ],
  },
  {
    title: "Caja",
    url: "/caja",
    icon: CreditCard,
    modulo: ModuloSistema.CAJA,
  },
  {
    title: "Reportes",
    url: "/reportes",
    icon: BarChart3,
    modulo: ModuloSistema.REPORTES,
  },
]

export function AppSidebar() {
  const { tienePermiso, usuario } = useAuth()
  const pathname = usePathname()
  const { state, setOpen, isMobile, open: sidebarOpen } = useSidebar()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [wasCollapsed, setWasCollapsed] = useState(false)

  const filteredItems = navigationItems.filter((item) => tienePermiso(item.modulo))

  // Detectar si hay un menú abierto basado en la ruta actual
  const activeMenu = filteredItems.find((item) => 
    item.items && pathname.includes(item.title.toLowerCase())
  )?.title || null

  // Cuando se abre un menú, expandir el sidebar si está colapsado
  const handleMenuOpen = (menuTitle: string) => {
    if (state === "collapsed" && !isMobile) {
      // Guardar que estaba colapsado
      setWasCollapsed(true)
      // Expandir el sidebar primero - esto cambiará el ancho de 3rem a 16rem
      setOpen(true)
      // Esperar a que el sidebar se expanda completamente antes de abrir el menú
      // La animación del sidebar es de 300ms
      setTimeout(() => {
        setOpenMenu(menuTitle)
      }, 350) // Dar tiempo suficiente para la animación de expansión horizontal
    } else {
      // Si ya está expandido, solo abrir el menú
      setOpenMenu(menuTitle)
    }
  }

  // Cuando se cierra un menú o se hace click en el overlay
  const handleMenuClose = () => {
    setOpenMenu(null)
    // Si el sidebar estaba colapsado originalmente, volver a colapsarlo
    if (wasCollapsed && !isMobile) {
      setTimeout(() => {
        setOpen(false)
        setWasCollapsed(false)
      }, 300) // Esperar a que la animación del menú se complete
    }
  }
  
  // Efecto para manejar el menú activo basado en la ruta
  React.useEffect(() => {
    if (activeMenu && !openMenu && !isMobile) {
      // Si hay un menú activo por la ruta pero no hay un menú abierto manualmente
      // y el sidebar está colapsado, expandirlo
      if (state === "collapsed") {
        setWasCollapsed(true)
        setOpen(true)
      }
    }
  }, [activeMenu, openMenu, state, isMobile, setOpen])

  // Cerrar el menú cuando se hace click en un enlace
  const handleLinkClick = () => {
    if (openMenu) {
      handleMenuClose()
    }
  }

  // Determinar si hay un menú abierto actualmente
  // Priorizar el menú abierto manualmente sobre el activo por ruta
  const currentOpenMenu = openMenu || (activeMenu && state === "expanded" ? activeMenu : null)
  const isMenuOpen = currentOpenMenu !== null
  
  // Mostrar overlay solo cuando hay una sección seleccionada manualmente (no solo por ruta)
  // El overlay aparece cuando el usuario ha seleccionado una sección
  const shouldShowOverlay = openMenu !== null && !isMobile

  return (
    <>
      {/* Overlay semitransparente que aparece cuando hay una sección seleccionada/expandida */}
      {shouldShowOverlay && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/50",
            "sidebar-overlay-enter",
            "transition-opacity duration-300"
          )}
          onClick={handleMenuClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              handleMenuClose()
            }
          }}
          aria-hidden="true"
          role="button"
          tabIndex={-1}
        />
      )}
      <Sidebar 
        collapsible="icon" 
        variant="sidebar"
      >
      <SidebarHeader className="shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold">FRAMASA</span>
                  <span className="truncate text-xs">Sistema Multiempresa</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto overflow-x-hidden min-w-0 max-w-full">
        <SidebarGroup className="min-w-0 max-w-full">
          <SidebarGroupLabel>Navegación Principal</SidebarGroupLabel>
          <SidebarGroupContent className="min-w-0 max-w-full">
            <SidebarMenu className="min-w-0 max-w-full">
              {filteredItems.map((item) => {
                const isActive = item.url ? pathname === item.url : pathname.startsWith(`/${item.title.toLowerCase()}`)

                if (item.items) {
                  // Determinar si este menú está abierto
                  const isOpen = currentOpenMenu === item.title || (activeMenu === item.title && state === "expanded")
                  
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      open={isOpen}
                      onOpenChange={(open) => {
                        if (open) {
                          // Abrir el menú y expandir el sidebar si es necesario
                          handleMenuOpen(item.title)
                        } else {
                          // Cerrar el menú y colapsar el sidebar si estaba colapsado originalmente
                          handleMenuClose()
                        }
                      }}
                      className="group/collapsible min-w-0 max-w-full"
                    >
                      <SidebarMenuItem className="min-w-0 max-w-full">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title} className="min-w-0 max-w-full">
                            <item.icon className="shrink-0" />
                            <span className="truncate min-w-0">{item.title}</span>
                            <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 shrink-0" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent 
                          className={cn(
                            "min-w-0 max-w-full",
                            "data-[state=open]:animate-in data-[state=closed]:animate-out",
                            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                            "data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1",
                            "duration-300 ease-in-out",
                            "overflow-hidden"
                          )}
                        >
                          <SidebarMenuSub className="min-w-0 max-w-full">
                            {item.items.map((subItem: any) => {
                              // Si el subItem tiene items anidados, es un subgrupo
                              if ('items' in subItem && subItem.items) {
                                return (
                                  <div key={subItem.title} className="space-y-1 min-w-0 max-w-full">
                                    <div className="px-3 py-2 text-xs font-semibold text-white border-l-2 border-white/20 ml-2 min-w-0 max-w-full whitespace-normal break-words">
                                      {subItem.title}
                                    </div>
                                    <div className="ml-4 space-y-1 min-w-0 max-w-full">
                                      {subItem.items.map((nestedItem: { title: string; url: string }) => (
                                        <SidebarMenuSubItem key={nestedItem.url} className="min-w-0 max-w-full">
                                          <SidebarMenuSubButton asChild isActive={pathname === nestedItem.url} className="min-w-0 max-w-full">
                                            <Link href={nestedItem.url} className="min-w-0 max-w-full whitespace-normal break-words" onClick={handleLinkClick}>
                                              <span className="min-w-0">{nestedItem.title}</span>
                                            </Link>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      ))}
                                    </div>
                                  </div>
                                )
                              }

                              // Si no tiene items anidados, es un item normal
                              return (
                                <SidebarMenuSubItem key={subItem.url} className="min-w-0 max-w-full">
                                  <SidebarMenuSubButton asChild isActive={pathname === subItem.url} className="min-w-0 max-w-full">
                                    <Link href={subItem.url} className="min-w-0 max-w-full whitespace-normal break-words" onClick={handleLinkClick}>
                                      <span className="min-w-0">{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.title} className="min-w-0 max-w-full">
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive} className="min-w-0 max-w-full">
                      <Link href={item.url!} className="min-w-0 max-w-full">
                        <item.icon className="shrink-0" />
                        <span className="truncate min-w-0">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium shrink-0">
                  {usuario?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold">{usuario?.username || "Usuario"}</span>
                  <span className="truncate text-xs capitalize">{usuario?.rol?.replace("_", " ") || "Sin rol"}</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      {/* SidebarRail deshabilitado - no debe afectar el estado del sidebar */}
      <div 
        className="absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] group-data-[side=left]:-right-4 sm:flex pointer-events-none"
        onClick={(e) => e.stopPropagation()}
        aria-hidden="true"
      />
    </Sidebar>
    </>
  )
}
