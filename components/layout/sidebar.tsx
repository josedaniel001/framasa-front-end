"use client"

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
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/contexts/auth-context"
import { ModuloSistema } from "@/types/database"

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

  const filteredItems = navigationItems.filter((item) => tienePermiso(item.modulo))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">FRAMASA</span>
                  <span className="truncate text-xs">Sistema Multiempresa</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const isActive = item.url ? pathname === item.url : pathname.startsWith(`/${item.title.toLowerCase()}`)

                if (item.items) {
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={pathname.includes(item.title.toLowerCase())}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem: any) => {
                              // Si el subItem tiene items anidados, es un subgrupo
                              if ('items' in subItem && subItem.items) {
                                return (
                                  <div key={subItem.title} className="space-y-1">
                                    <div className="px-3 py-2 text-xs font-semibold text-white border-l-2 border-white/20 ml-2">
                                      {subItem.title}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                      {subItem.items.map((nestedItem: { title: string; url: string }) => (
                                        <SidebarMenuSubItem key={nestedItem.url}>
                                          <SidebarMenuSubButton asChild isActive={pathname === nestedItem.url}>
                                            <Link href={nestedItem.url}>
                                              <span>{nestedItem.title}</span>
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
                                <SidebarMenuSubItem key={subItem.url}>
                                  <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
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
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                      <Link href={item.url!}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
                  {usuario?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{usuario?.username || "Usuario"}</span>
                  <span className="truncate text-xs capitalize">{usuario?.rol?.replace("_", " ") || "Sin rol"}</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
