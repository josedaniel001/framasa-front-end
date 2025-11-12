"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Wrench, AlertTriangle, DollarSign, Calendar, Users, Package, Settings, FileText } from "lucide-react"
import Link from "next/link"

export default function TallerDashboard() {
  const kpis = [
    {
      title: "Órdenes Activas",
      value: "23",
      change: "+3 desde ayer",
      icon: Wrench,
      color: "text-blue-600",
    },
    {
      title: "Equipos en Mantenimiento",
      value: "8",
      change: "2 críticos",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      title: "Técnicos Disponibles",
      value: "12/15",
      change: "80% ocupación",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Costo del Mes",
      value: "₡2,450,000",
      change: "-8% vs mes anterior",
      icon: DollarSign,
      color: "text-purple-600",
    },
  ]

  const ordenesRecientes = [
    {
      id: "OT-2024-001",
      equipo: "Excavadora CAT 320",
      tipo: "Preventivo",
      tecnico: "Carlos Méndez",
      estado: "En Progreso",
      prioridad: "Media",
      fechaInicio: "2024-01-15",
      progreso: 65,
    },
    {
      id: "OT-2024-002",
      equipo: "Camión Volvo FH16",
      tipo: "Correctivo",
      tecnico: "Ana Rodríguez",
      estado: "Pendiente Repuestos",
      prioridad: "Alta",
      fechaInicio: "2024-01-14",
      progreso: 30,
    },
    {
      id: "OT-2024-003",
      equipo: "Compresor Atlas Copco",
      tipo: "Preventivo",
      tecnico: "Luis Vargas",
      estado: "Completado",
      prioridad: "Baja",
      fechaInicio: "2024-01-13",
      progreso: 100,
    },
  ]

  const equiposCriticos = [
    {
      nombre: "Retroexcavadora JCB 3CX",
      ultimoMantenimiento: "2023-12-15",
      proximoMantenimiento: "2024-01-20",
      estado: "Crítico",
      horasOperacion: 2450,
    },
    {
      nombre: "Grúa Liebherr LTM 1050",
      ultimoMantenimiento: "2024-01-10",
      proximoMantenimiento: "2024-02-10",
      estado: "Atención",
      horasOperacion: 1890,
    },
  ]

  const getEstadoBadge = (estado: string) => {
    const variants = {
      "En Progreso": "default",
      "Pendiente Repuestos": "destructive",
      Completado: "secondary",
      Crítico: "destructive",
      Atención: "destructive",
    }
    return variants[estado as keyof typeof variants] || "default"
  }

  const getPrioridadColor = (prioridad: string) => {
    const colors = {
      Alta: "text-red-600",
      Media: "text-yellow-600",
      Baja: "text-green-600",
    }
    return colors[prioridad as keyof typeof colors] || "text-gray-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Taller</h1>
          <p className="text-muted-foreground">Gestión de mantenimiento y reparaciones</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/taller/ordenes/nueva">
              <Wrench className="mr-2 h-4 w-4" />
              Nueva Orden
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/taller/mantenimientos/programar">
              <Calendar className="mr-2 h-4 w-4" />
              Programar
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
              <p className="text-xs text-muted-foreground">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Órdenes de Trabajo Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Órdenes de Trabajo Recientes
            </CardTitle>
            <CardDescription>Últimas órdenes de trabajo en el taller</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordenesRecientes.map((orden) => (
                <div key={orden.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{orden.id}</h4>
                      <p className="text-sm text-muted-foreground">{orden.equipo}</p>
                    </div>
                    <Badge variant={getEstadoBadge(orden.estado)}>{orden.estado}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Tipo:</span> {orden.tipo}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Técnico:</span> {orden.tecnico}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Inicio:</span> {orden.fechaInicio}
                    </div>
                    <div className={getPrioridadColor(orden.prioridad)}>
                      <span className="text-muted-foreground">Prioridad:</span> {orden.prioridad}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span>{orden.progreso}%</span>
                    </div>
                    <Progress value={orden.progreso} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/taller/ordenes">Ver Todas las Órdenes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Equipos que Requieren Atención */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Equipos que Requieren Atención
            </CardTitle>
            <CardDescription>Equipos con mantenimiento próximo o vencido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {equiposCriticos.map((equipo, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{equipo.nombre}</h4>
                    <Badge variant={getEstadoBadge(equipo.estado)}>{equipo.estado}</Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Último:</span> {equipo.ultimoMantenimiento}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Próximo:</span> {equipo.proximoMantenimiento}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Horas:</span> {equipo.horasOperacion.toLocaleString()}h
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/taller/equipos">Ver Todos los Equipos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
          <CardDescription>Navegación rápida a las funciones principales del taller</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/taller/equipos">
                <Settings className="h-6 w-6 mb-2" />
                Equipos
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/taller/ordenes">
                <Wrench className="h-6 w-6 mb-2" />
                Órdenes de Trabajo
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/taller/repuestos">
                <Package className="h-6 w-6 mb-2" />
                Repuestos
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/taller/tecnicos">
                <Users className="h-6 w-6 mb-2" />
                Técnicos
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
