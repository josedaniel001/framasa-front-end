"use client"

import { CardDescription } from "@/components/ui/card"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Factory, Package, ClipboardList, TrendingUp, AlertTriangle, Warehouse } from "lucide-react"
import Link from "next/link"

export default function BloquearaPage() {
  const stats = [
    {
      title: "Producción Diaria",
      value: "2,450",
      unit: "bloques",
      change: "+12%",
      icon: Factory,
      color: "text-blue-600",
    },
    {
      title: "Órdenes Activas",
      value: "18",
      unit: "órdenes",
      change: "+3",
      icon: ClipboardList,
      color: "text-green-600",
    },
    {
      title: "Inventario Total",
      value: "45,230",
      unit: "bloques",
      change: "-5%",
      icon: Package,
      color: "text-purple-600",
    },
    {
      title: "Eficiencia",
      value: "94.2%",
      unit: "calidad",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  const alertas = [
    {
      tipo: "warning",
      mensaje: "Stock bajo en Bloque 6x8x16",
      cantidad: "150 unidades restantes",
    },
    {
      tipo: "error",
      mensaje: "Máquina #2 requiere mantenimiento",
      tiempo: "Hace 2 horas",
    },
    {
      tipo: "info",
      mensaje: "Nueva orden de 5,000 bloques programada",
      cliente: "Constructora Maya",
    },
  ]

  const ordenesRecientes = [
    {
      id: "ORD-001",
      cliente: "Constructora Maya",
      producto: "Bloque 6x8x16",
      cantidad: 5000,
      estado: "En Producción",
      fecha: "2024-01-15",
    },
    {
      id: "ORD-002",
      cliente: "Edificaciones GT",
      producto: "Bloque 4x8x16",
      cantidad: 3200,
      estado: "Pendiente",
      fecha: "2024-01-16",
    },
    {
      id: "ORD-003",
      cliente: "Constructora Sol",
      producto: "Bloque 6x8x16",
      cantidad: 2800,
      estado: "Completada",
      fecha: "2024-01-14",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bloquera</h1>
          <p className="text-muted-foreground">Gestión de producción, órdenes y control de calidad</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/bloquera/ordenes/nueva">
              <ClipboardList className="mr-2 h-4 w-4" />
              Nueva Orden
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/bloquera/produccion/nueva">
              <Factory className="mr-2 h-4 w-4" />
              Iniciar Producción
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/bloquera/productos">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ver y gestionar bloques</div>
              <p className="text-xs text-muted-foreground">Catálogo de todos los tipos de bloques y adoquines.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/bloquera/produccion">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Producción</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Control de lotes de producción</div>
              <p className="text-xs text-muted-foreground">Registro y seguimiento de la fabricación de bloques.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/bloquera/inventario">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventario</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gestión de stock de bloques</div>
              <p className="text-xs text-muted-foreground">Control de existencias y movimientos de inventario.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/bloquera/ordenes">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Órdenes de Producción</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Administrar órdenes de fabricación</div>
              <p className="text-xs text-muted-foreground">Creación y seguimiento de pedidos de producción.</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
                <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>{stat.change}</span>{" "}
                desde el mes pasado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas del Sistema
            </CardTitle>
            <CardDescription>Notificaciones importantes de producción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alertas.map((alerta, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    alerta.tipo === "error" ? "bg-red-500" : alerta.tipo === "warning" ? "bg-yellow-500" : "bg-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alerta.mensaje}</p>
                  <p className="text-xs text-muted-foreground">{alerta.cantidad || alerta.tiempo || alerta.cliente}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Órdenes Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              Órdenes Recientes
            </CardTitle>
            <CardDescription>Últimas órdenes de producción</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordenesRecientes.map((orden) => (
                <div key={orden.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{orden.id}</span>
                      <Badge
                        variant={
                          orden.estado === "Completada"
                            ? "default"
                            : orden.estado === "En Producción"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {orden.estado}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{orden.cliente}</p>
                    <p className="text-xs text-muted-foreground">
                      {orden.cantidad.toLocaleString()} {orden.producto}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{orden.fecha}</p>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/bloquera/ordenes/${orden.id}`}>Ver</Link>
                    </Button>
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
