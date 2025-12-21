"use client"

import { useState, useEffect } from "react"
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
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface ActividadReciente {
  id: string
  tipo: 'info' | 'warning' | 'danger'
  titulo: string
  descripcion: string
  monto?: string
  estado?: string
  empresa?: string
  tiempo: string
  icono: string
}

interface DashboardMetrics {
  ventas_mes: {
    valor: number
    formateado: string
    cambio_porcentaje: number
    cambio_formateado: string
    tendencia: 'up' | 'down'
  }
  ordenes_pendientes: {
    valor: number
    cambio: number
    cambio_formateado: string
    tendencia: 'up' | 'down'
  }
  productos_stock: {
    valor: number
    formateado: string
    cambio_porcentaje: number
    cambio_formateado: string
    tendencia: 'up' | 'down'
  }
  alertas_activas: {
    valor: number
    cambio: number
    cambio_formateado: string
    tendencia: 'up' | 'down'
  }
  actividades_recientes: ActividadReciente[]
  resumen_por_empresa: {
    ferreteria: { ventas_mes: number; productos_stock: number; alertas: number }
    bloquera: { ordenes_pendientes: number; productos_stock: number; alertas: number }
    piedrinera: { productos_stock: number; alertas: number }
  }
}

export default function DashboardPage() {
  const { usuario, tienePermiso } = useAuth()
  const { toast } = useToast()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardMetrics()
  }, [])

  const loadDashboardMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reportes/dashboard_metrics/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      } else {
        console.error('Error al cargar métricas del dashboard')
        // Si Django no está disponible, mostrar datos de muestra
        console.log('Django no disponible, mostrando datos de muestra')
        const mockData: DashboardMetrics = {
          ventas_mes: {
            valor: 125430.00,
            formateado: 'Q 125,430.00',
            cambio_porcentaje: 12.5,
            cambio_formateado: '+12.5%',
            tendencia: 'up' as const
          },
          ordenes_pendientes: {
            valor: 23,
            cambio: 3,
            cambio_formateado: '+3',
            tendencia: 'up' as const
          },
          productos_stock: {
            valor: 1247,
            formateado: '1,247',
            cambio_porcentaje: -5.2,
            cambio_formateado: '-5.2%',
            tendencia: 'down' as const
          },
          alertas_activas: {
            valor: 8,
            cambio: 2,
            cambio_formateado: '+2',
            tendencia: 'up' as const
          },
          actividades_recientes: [
            {
              id: 'mock-1',
              tipo: 'info',
              titulo: 'Nueva Factura',
              descripcion: 'Factura V-2024-001 - Constructora ABC',
              monto: 'Q 2,450.00',
              tiempo: 'Hace 5 minutos',
              icono: 'receipt'
            },
            {
              id: 'mock-2',
              tipo: 'warning',
              titulo: 'Orden Pendiente',
              descripcion: 'Orden de producción - 500 unidades',
              estado: 'En Proceso',
              tiempo: 'Hace 15 minutos',
              icono: 'factory'
            },
            {
              id: 'mock-3',
              tipo: 'danger',
              titulo: 'Stock Bajo',
              descripcion: 'Cemento UGC 50kg - Solo quedan 15 unidades',
              empresa: 'Ferretería',
              tiempo: 'Hace 30 minutos',
              icono: 'alert-triangle'
            }
          ],
          resumen_por_empresa: {
            ferreteria: { ventas_mes: 85430.00, productos_stock: 850, alertas: 5 },
            bloquera: { ordenes_pendientes: 23, productos_stock: 320, alertas: 2 },
            piedrinera: { productos_stock: 77, alertas: 1 }
          }
        }
        setMetrics(mockData)
      }
    } catch (error) {
      console.error('Error de conexión:', error)
      // Fallback a datos de muestra
      const mockData: DashboardMetrics = {
        ventas_mes: {
          valor: 125430.00,
          formateado: 'Q 125,430.00',
          cambio_porcentaje: 12.5,
          cambio_formateado: '+12.5%',
          tendencia: 'up' as const
        },
        ordenes_pendientes: {
          valor: 23,
          cambio: 3,
          cambio_formateado: '+3',
          tendencia: 'up' as const
        },
        productos_stock: {
          valor: 1247,
          formateado: '1,247',
          cambio_porcentaje: -5.2,
          cambio_formateado: '-5.2%',
          tendencia: 'down' as const
        },
        alertas_activas: {
          valor: 8,
          cambio: 2,
          cambio_formateado: '+2',
          tendencia: 'up' as const
        },
        actividades_recientes: [
          {
            id: 'mock-1',
            tipo: 'info',
            titulo: 'Nueva Factura',
            descripcion: 'Factura V-2024-001 - Constructora ABC',
            monto: 'Q 2,450.00',
            tiempo: 'Hace 5 minutos',
            icono: 'receipt'
          },
          {
            id: 'mock-2',
            tipo: 'warning',
            titulo: 'Orden Pendiente',
            descripcion: 'Orden de producción - 500 unidades',
            estado: 'En Proceso',
            tiempo: 'Hace 15 minutos',
            icono: 'factory'
          },
          {
            id: 'mock-3',
            tipo: 'danger',
            titulo: 'Stock Bajo',
            descripcion: 'Cemento UGC 50kg - Solo quedan 15 unidades',
            empresa: 'Ferretería',
            tiempo: 'Hace 30 minutos',
            icono: 'alert-triangle'
          }
        ],
        resumen_por_empresa: {
          ferreteria: { ventas_mes: 85430.00, productos_stock: 850, alertas: 5 },
          bloquera: { ordenes_pendientes: 23, productos_stock: 320, alertas: 2 },
          piedrinera: { productos_stock: 77, alertas: 1 }
        }
      }
      setMetrics(mockData)
    } finally {
      setLoading(false)
    }
  }

  const stats = metrics ? [
    {
      title: "Ventas del Mes",
      value: metrics.ventas_mes.formateado,
      change: metrics.ventas_mes.cambio_formateado,
      icon: DollarSign,
      color: metrics.ventas_mes.tendencia === 'up' ? "text-green-600" : "text-red-600",
      trendIcon: metrics.ventas_mes.tendencia === 'up' ? TrendingUp : TrendingDown,
    },
    {
      title: "Órdenes Pendientes",
      value: metrics.ordenes_pendientes.valor.toString(),
      change: metrics.ordenes_pendientes.cambio_formateado,
      icon: ShoppingCart,
      color: metrics.ordenes_pendientes.tendencia === 'up' ? "text-blue-600" : "text-orange-600",
      trendIcon: metrics.ordenes_pendientes.tendencia === 'up' ? TrendingUp : TrendingDown,
    },
    {
      title: "Productos en Stock",
      value: metrics.productos_stock.formateado,
      change: metrics.productos_stock.cambio_formateado,
      icon: Package,
      color: metrics.productos_stock.tendencia === 'up' ? "text-green-600" : "text-red-600",
      trendIcon: metrics.productos_stock.tendencia === 'up' ? TrendingUp : TrendingDown,
    },
    {
      title: "Alertas Activas",
      value: metrics.alertas_activas.valor.toString(),
      change: metrics.alertas_activas.cambio_formateado,
      icon: AlertTriangle,
      color: metrics.alertas_activas.tendencia === 'up' ? "text-red-600" : "text-green-600",
      trendIcon: metrics.alertas_activas.tendencia === 'up' ? TrendingUp : TrendingDown,
    },
  ] : []

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
        {loading ? (
          // Loading state
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className="flex items-center gap-1">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  {stat.trendIcon && <stat.trendIcon className={`h-3 w-3 ${stat.color}`} />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>
                    {stat.change}
                  </span>{" "}
                  desde el mes pasado
                </p>
              </CardContent>
            </Card>
          ))
        )}
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
              {metrics?.actividades_recientes?.map((activity) => {
                // Determinar colores según el tipo de actividad
                const getActivityColors = (tipo: string) => {
                  switch (tipo) {
                    case 'danger':
                      return {
                        dot: 'bg-red-500',
                        title: 'text-red-700',
                        badge: 'bg-red-100 text-red-800'
                      }
                    case 'warning':
                      return {
                        dot: 'bg-yellow-500',
                        title: 'text-yellow-700',
                        badge: 'bg-yellow-100 text-yellow-800'
                      }
                    case 'info':
                    default:
                      return {
                        dot: 'bg-blue-500',
                        title: 'text-blue-700',
                        badge: 'bg-blue-100 text-blue-800'
                      }
                  }
                }

                const colors = getActivityColors(activity.tipo)

                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 ${colors.dot} rounded-full mt-2`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${colors.title}`}>{activity.titulo}</p>
                        {activity.empresa && (
                          <Badge variant="secondary" className={`text-xs ${colors.badge}`}>
                            {activity.empresa}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{activity.descripcion}</p>
                      {activity.monto && (
                        <p className="text-sm font-semibold text-green-600">{activity.monto}</p>
                      )}
                      {activity.estado && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {activity.estado}
                        </Badge>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{activity.tiempo}</p>
                    </div>
                  </div>
                )
              }) || recentActivity.map((activity) => (
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
