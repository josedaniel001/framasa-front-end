"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  Package,
  Factory,
  Truck,
  Hammer,
  Users,
  BarChart3,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { usuario, tienePermiso } = useAuth()

  const stats = [
    {
      title: "Ventas del Mes",
      value: "Q 125,430",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Órdenes Pendientes",
      value: "23",
      change: "+3",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Productos en Stock",
      value: "1,247",
      change: "-5.2%",
      icon: Package,
      color: "text-orange-600",
    },
    {
      title: "Alertas Activas",
      value: "8",
      change: "+2",
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ]

  const modules = [
    {
      title: "Ferretería",
      description: "Gestión de productos, inventario y ventas",
      icon: Package,
      href: "/ferreteria",
      color: "bg-blue-500",
      permission: "ferreteria",
    },
    {
      title: "Bloquera",
      description: "Control de producción y órdenes",
      icon: Factory,
      href: "/bloquera",
      color: "bg-green-500",
      permission: "bloquera",
    },
    {
      title: "Piedrinera",
      description: "Manejo de agregados y despachos",
      icon: Truck,
      href: "/piedrinera",
      color: "bg-orange-500",
      permission: "piedrinera",
    },
    {
      title: "Taller",
      description: "Órdenes de trabajo y materiales",
      icon: Hammer,
      href: "/taller",
      color: "bg-purple-500",
      permission: "taller",
    },
    {
      title: "Planillas",
      description: "Gestión de empleados y nómina",
      icon: Users,
      href: "/planillas",
      color: "bg-indigo-500",
      permission: "planillas",
    },
    {
      title: "Reportes",
      description: "Análisis y reportes ejecutivos",
      icon: BarChart3,
      href: "/reportes",
      color: "bg-red-500",
      permission: "reportes",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      action: "Nueva venta registrada",
      details: "Factura #1001 - Q 2,450.00",
      time: "Hace 5 minutos",
      type: "sale",
    },
    {
      id: 2,
      action: "Stock bajo detectado",
      details: "Cemento UGC 50kg - Solo quedan 15 unidades",
      time: "Hace 15 minutos",
      type: "alert",
    },
    {
      id: 3,
      action: "Orden de producción completada",
      details: "Blocks 15x20x40 - 500 unidades",
      time: "Hace 1 hora",
      type: "production",
    },
    {
      id: 4,
      action: "Nuevo cliente registrado",
      details: "Constructora XYZ",
      time: "Hace 2 horas",
      type: "client",
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="capitalize">
            {usuario?.rol?.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>{stat.change}</span>{" "}
                desde el mes pasado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Modules Grid */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Módulos del Sistema</CardTitle>
            <CardDescription>Accede a los diferentes módulos según tus permisos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <Card key={module.title} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${module.color} text-white`}>
                        <module.icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-base">{module.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm mb-3">{module.description}</CardDescription>
                    <Button asChild size="sm" className="w-full">
                      <Link href={module.href}>Acceder</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.details}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
