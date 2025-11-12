"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Clock,
  User,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
} from "lucide-react"
import Link from "next/link"

const ordenes = [
  {
    id: "ORD-001",
    equipo: "Excavadora CAT 320D",
    tipo: "Preventivo",
    descripcion: "Cambio de aceite y filtros",
    prioridad: "Media",
    estado: "En Progreso",
    tecnico: "Carlos Mendez",
    fechaCreacion: "2024-01-15",
    fechaEstimada: "2024-01-16",
    horasEstimadas: 4,
    horasReales: 2.5,
    costo: 850.0,
    progreso: 60,
  },
  {
    id: "ORD-002",
    equipo: "Camión Volvo FH16",
    tipo: "Correctivo",
    descripcion: "Reparación sistema de frenos",
    prioridad: "Alta",
    estado: "Pendiente",
    tecnico: "Miguel Torres",
    fechaCreacion: "2024-01-14",
    fechaEstimada: "2024-01-17",
    horasEstimadas: 6,
    horasReales: 0,
    costo: 1200.0,
    progreso: 0,
  },
  {
    id: "ORD-003",
    equipo: "Retroexcavadora JCB 3CX",
    tipo: "Preventivo",
    descripcion: "Inspección general 500 horas",
    prioridad: "Baja",
    estado: "Completada",
    tecnico: "Ana Rodriguez",
    fechaCreacion: "2024-01-10",
    fechaEstimada: "2024-01-12",
    horasEstimadas: 3,
    horasReales: 3.5,
    costo: 650.0,
    progreso: 100,
  },
  {
    id: "ORD-004",
    equipo: "Grúa Liebherr LTM 1050",
    tipo: "Correctivo",
    descripcion: "Falla en sistema hidráulico",
    prioridad: "Crítica",
    estado: "Programada",
    tecnico: "Luis Vargas",
    fechaCreacion: "2024-01-16",
    fechaEstimada: "2024-01-18",
    horasEstimadas: 8,
    horasReales: 0,
    costo: 2100.0,
    progreso: 0,
  },
  {
    id: "ORD-005",
    equipo: "Compactadora Dynapac CA250",
    tipo: "Preventivo",
    descripcion: "Mantenimiento sistema vibratorio",
    prioridad: "Media",
    estado: "Cancelada",
    tecnico: "Pedro Jimenez",
    fechaCreacion: "2024-01-13",
    fechaEstimada: "2024-01-15",
    horasEstimadas: 2,
    horasReales: 0,
    costo: 0,
    progreso: 0,
  },
]

const getEstadoBadge = (estado: string) => {
  const variants = {
    Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Programada: "bg-blue-100 text-blue-800 border-blue-200",
    "En Progreso": "bg-orange-100 text-orange-800 border-orange-200",
    Completada: "bg-green-100 text-green-800 border-green-200",
    Cancelada: "bg-red-100 text-red-800 border-red-200",
  }
  return variants[estado as keyof typeof variants] || variants["Pendiente"]
}

const getPrioridadBadge = (prioridad: string) => {
  const variants = {
    Baja: "bg-gray-100 text-gray-800 border-gray-200",
    Media: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Alta: "bg-orange-100 text-orange-800 border-orange-200",
    Crítica: "bg-red-100 text-red-800 border-red-200",
  }
  return variants[prioridad as keyof typeof variants] || variants["Media"]
}

const getEstadoIcon = (estado: string) => {
  const icons = {
    Pendiente: <Clock className="h-4 w-4" />,
    Programada: <Calendar className="h-4 w-4" />,
    "En Progreso": <Wrench className="h-4 w-4" />,
    Completada: <CheckCircle className="h-4 w-4" />,
    Cancelada: <XCircle className="h-4 w-4" />,
  }
  return icons[estado as keyof typeof icons] || icons["Pendiente"]
}

export default function OrdenesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("Todos")

  const ordenesFiltradas = ordenes.filter((orden) => {
    const matchesSearch =
      orden.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.tecnico.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filtroEstado === "Todos" || orden.estado === filtroEstado
    return matchesSearch && matchesEstado
  })

  const stats = {
    total: ordenes.length,
    pendientes: ordenes.filter((o) => o.estado === "Pendiente").length,
    enProgreso: ordenes.filter((o) => o.estado === "En Progreso").length,
    completadas: ordenes.filter((o) => o.estado === "Completada").length,
    costoTotal: ordenes.reduce((sum, o) => sum + o.costo, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Órdenes de Trabajo</h1>
          <p className="text-muted-foreground">Gestión de mantenimiento y reparaciones</p>
        </div>
        <Link href="/taller/ordenes/nueva">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Orden
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Órdenes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Progreso</p>
                <p className="text-2xl font-bold text-orange-600">{stats.enProgreso}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.completadas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Costo Total</p>
                <p className="text-2xl font-bold">${stats.costoTotal.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por equipo, descripción o técnico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Programada">Programada</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Órdenes */}
      <div className="grid gap-4">
        {ordenesFiltradas.map((orden) => (
          <Card key={orden.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{orden.id}</h3>
                    <Badge className={`${getEstadoBadge(orden.estado)} border`}>
                      {getEstadoIcon(orden.estado)}
                      <span className="ml-1">{orden.estado}</span>
                    </Badge>
                    <Badge className={`${getPrioridadBadge(orden.prioridad)} border`}>{orden.prioridad}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Equipo</p>
                      <p className="font-medium">{orden.equipo}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Descripción</p>
                      <p className="font-medium">{orden.descripcion}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Técnico</p>
                      <p className="font-medium flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {orden.tecnico}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fecha Estimada</p>
                      <p className="font-medium">{new Date(orden.fechaEstimada).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Progreso */}
                  {orden.estado === "En Progreso" && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progreso</span>
                        <span>{orden.progreso}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${orden.progreso}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>
                          {orden.horasReales}h / {orden.horasEstimadas}h
                        </span>
                        <span>Costo: ${orden.costo.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href={`/taller/ordenes/${orden.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </Link>
                  <Link href={`/taller/ordenes/${orden.id}/editar`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ordenesFiltradas.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron órdenes</h3>
            <p className="text-gray-500 mb-4">No hay órdenes que coincidan con los filtros seleccionados.</p>
            <Link href="/taller/ordenes/nueva">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Orden
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
