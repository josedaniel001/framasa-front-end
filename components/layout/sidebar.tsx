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
      { title: "Productos", url: "/ferreteria/productos" },
      { title: "Inventario", url: "/ferreteria/inventario" },
      { title: "Ventas", url: "/ferreteria/ventas" },
      { title: "Cotizaciones", url: "/ferreteria/cotizaciones" },
      { title: "Clientes", url: "/ferreteria/clientes" },
      { title: "Cuentas por Cobrar", url: "/ferreteria/cuentas-por-cobrar" },
    ],
  },
  {
    title: "Bloquera",
    icon: Factory,
    modulo: ModuloSistema.BLOQUERA,
    items: [
      { title: "Productos", url: "/bloquera/productos" },
      { title: "Inventario", url: "/bloquera/inventario" },
      { title: "Producción", url: "/bloquera/produccion" },
      { title: "Órdenes", url: "/bloquera/ordenes" },
    ],
  },
  {
    title: "Piedrinera",
    icon: Truck,
    modulo: ModuloSistema.PIEDRINERA,
    items: [
      { title: "Productos", url: "/piedrinera/productos" },
      { title: "Inventario", url: "/piedrinera/inventario" },
      { title: "Ventas", url: "/piedrinera/ventas" },
      { title: "Producción", url: "/piedrinera/produccion" },
      { title: "Camiones", url: "/piedrinera/camiones" },
      { title: "Despachos", url: "/piedrinera/despachos" },
    ],
  },
  {
    title: "Taller",
    icon: Hammer,
    modulo: ModuloSistema.TALLER,
    items: [
      { title: "Órdenes", url: "/taller/ordenes" },
      { title: "Materiales", url: "/taller/materiales" },
      { title: "Servicios", url: "/taller/servicios" },
    ],
  },
  {
    title: "Planillas",
    icon: Users,
    modulo: ModuloSistema.PLANILLAS,
    items: [
      { title: "Empleados", url: "/planillas/empleados" },
      { title: "Asistencia", url: "/planillas/asistencias" },
      { title: "Nómina", url: "/planillas/nominas" },
    ],
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
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.url}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
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
