"use client"
import Link from "next/link"
import { CardDescription } from "@/components/ui/card"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Truck,
  Package,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  Factory,
  Warehouse,
} from "lucide-react"

// Datos de ejemplo para el dashboard
const kpis = [
  {
    title: "Despachos Hoy",
    value: "24",
    change: "+12%",
    trend: "up",
    icon: Truck,
    color: "text-blue-600",
  },
  {
    title: "Agregados en Stock",
    value: "8,450 m³",
    change: "-5%",
    trend: "down",
    icon: Package,
    color: "text-green-600",
  },
  {
    title: "Órdenes Pendientes",
    value: "18",
    change: "+3",
    trend: "up",
    icon: ClipboardList,
    color: "text-orange-600",
  },
  {
    title: "Camiones Activos",
    value: "12/15",
    change: "80%",
    trend: "stable",
    icon: CheckCircle,
    color: "text-purple-600",
  },
]

const despachosRecientes = [
  {
    id: 1,
    orden: "PD-2024-001",
    cliente: "Constructora Maya",
    producto: "Arena de Río",
    cantidad: "25 m³",
    camion: "CAM-001",
    estado: "En Tránsito",
    hora: "08:30",
  },
  {
    id: 2,
    orden: "PD-2024-002",
    cliente: "Obras Civiles S.A.",
    producto: 'Grava 3/4"',
    cantidad: "40 m³",
    camion: "CAM-003",
    estado: "Entregado",
    hora: "07:45",
  },
  {
    id: 3,
    orden: "PD-2024-003",
    cliente: "Inmobiliaria Central",
    producto: 'Piedrín 1/2"',
    cantidad: "15 m³",
    camion: "CAM-005",
    estado: "Cargando",
    hora: "09:15",
  },
  {
    id: 4,
    orden: "PD-2024-004",
    cliente: "Desarrollo Urbano",
    producto: "Arena Lavada",
    cantidad: "30 m³",
    camion: "CAM-002",
    estado: "Pendiente",
    hora: "10:00",
  },
]

const alertasCalidad = [
  {
    id: 1,
    tipo: "Humedad Alta",
    producto: "Arena de Río - Lote AR-240115",
    nivel: "Media",
    fecha: "Hoy 09:30",
  },
  {
    id: 2,
    tipo: "Granulometría",
    producto: 'Grava 3/4" - Lote GR-240114',
    nivel: "Baja",
    fecha: "Ayer 16:45",
  },
  {
    id: 3,
    tipo: "Impurezas",
    producto: 'Piedrín 1/2" - Lote PI-240113',
    nivel: "Alta",
    fecha: "Ayer 14:20",
  },
]

export default function PiedrineraHomePage() {
  const getEstadoBadge = (estado: string) => {
    const variants = {
      "En Tránsito": "default",
      Entregado: "secondary",
      Cargando: "outline",
      Pendiente: "destructive",
    } as const

    return <Badge variant={variants[estado as keyof typeof variants] || "default"}>{estado}</Badge>
  }

  const getNivelAlerta = (nivel: string) => {
    const colors = {
      Alta: "text-red-600 bg-red-50",
      Media: "text-yellow-600 bg-yellow-50",
      Baja: "text-blue-600 bg-blue-50",
    } as const

    return colors[nivel as keyof typeof colors] || "text-gray-600 bg-gray-50"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Piedrinera</h1>
          <p className="text-muted-foreground">Gestión de agregados, producción, inventario, despachos y camiones.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/piedrinera/despachos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Orden
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    kpi.trend === "up" ? "text-green-600" : kpi.trend === "down" ? "text-red-600" : "text-gray-600"
                  }
                >
                  {kpi.change}
                </span>{" "}
                desde ayer
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Despachos Recientes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Despachos de Hoy</CardTitle>
                <CardDescription>Seguimiento en tiempo real de entregas</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/piedrinera/despachos">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Todos
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {despachosRecientes.map((despacho) => (
                <div
                  key={despacho.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{despacho.orden}</span>
                      {getEstadoBadge(despacho.estado)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {despacho.cliente} • {despacho.producto}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>📦 {despacho.cantidad}</span>
                      <span>🚛 {despacho.camion}</span>
                      <span>🕐 {despacho.hora}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/piedrinera/despachos/${despacho.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Calidad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Control de Calidad
            </CardTitle>
            <CardDescription>Alertas y observaciones recientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertasCalidad.map((alerta) => (
                <div key={alerta.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{alerta.tipo}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNivelAlerta(alerta.nivel)}`}>
                      {alerta.nivel}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{alerta.producto}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {alerta.fecha}
                  </p>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent" asChild>
              <Link href="/piedrinera/calidad">Ver Todos los Reportes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/piedrinera/productos">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agregados</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ver y gestionar agregados</div>
              <p className="text-xs text-muted-foreground">Catálogo de todos los tipos de arena, grava y piedrín.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/piedrinera/produccion">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Producción</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Control de lotes de producción</div>
              <p className="text-xs text-muted-foreground">Registro y seguimiento de la extracción y procesamiento.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/piedrinera/inventario">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventario</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gestión de stock de agregados</div>
              <p className="text-xs text-muted-foreground">Control de existencias y movimientos de inventario.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/piedrinera/despachos">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despachos</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Administrar despachos de material</div>
              <p className="text-xs text-muted-foreground">Creación y seguimiento de entregas a clientes.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/piedrinera/camiones">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Camiones</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gestión de flota de camiones</div>
              <p className="text-xs text-muted-foreground">Control de estado y mantenimiento de vehículos.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
