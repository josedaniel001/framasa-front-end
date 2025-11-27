"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
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
  X,
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
    fechaInicio: "2024-01-15",
    fechaEstimadaTerminacion: "2024-01-16",
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
    fechaInicio: "",
    fechaEstimadaTerminacion: "2024-01-17",
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
    fechaInicio: "2024-01-10",
    fechaEstimadaTerminacion: "2024-01-12",
    fechaTerminacionReal: "2024-01-12T15:30",
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
    fechaInicio: "",
    fechaEstimadaTerminacion: "2024-01-18",
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
    fechaInicio: "",
    fechaEstimadaTerminacion: "2024-01-15",
    costo: 0,
    progreso: 0,
  },
]

const getPrioridadBadge = (prioridad: string) => {
  const variants = {
    Baja: "bg-gray-100 text-gray-800 border-gray-200",
    Media: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Alta: "bg-orange-100 text-orange-800 border-orange-200",
    Crítica: "bg-red-100 text-red-800 border-red-200",
  }
  return variants[prioridad as keyof typeof variants] || variants["Media"]
}

// Calcular progreso basado en fechas
const calcularProgreso = (fechaInicio: string, fechaFinEstimada: string): number => {
  if (!fechaInicio || !fechaFinEstimada) return 0

  const inicio = new Date(fechaInicio).getTime()
  const fin = new Date(fechaFinEstimada).getTime()
  const ahora = new Date().getTime()

  if (ahora < inicio) return 0
  if (ahora >= fin) return 100

  const total = fin - inicio
  const transcurrido = ahora - inicio
  return Math.min(100, Math.max(0, Math.round((transcurrido / total) * 100)))
}

// Verificar si la fecha actual es mayor que la fecha de terminación estimada
const estaVencida = (fechaFinEstimada: string): boolean => {
  if (!fechaFinEstimada) return false
  const fin = new Date(fechaFinEstimada)
  const ahora = new Date()
  ahora.setHours(0, 0, 0, 0)
  fin.setHours(0, 0, 0, 0)
  return ahora > fin
}

export default function OrdenesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroPeriodo, setFiltroPeriodo] = useState("General")

  // Filtrar órdenes según el período y búsqueda
  const ordenesFiltradas = useMemo(() => {
    let filtered = ordenes

    // Filtro por período
    if (filtroPeriodo !== "General") {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      filtered = filtered.filter((orden) => {
        const fechaCreacion = new Date(orden.fechaCreacion)
        fechaCreacion.setHours(0, 0, 0, 0)

        if (filtroPeriodo === "Hoy") {
          return fechaCreacion.getTime() === hoy.getTime()
        } else if (filtroPeriodo === "Esta Semana") {
          const semanaAtras = new Date(hoy)
          semanaAtras.setDate(hoy.getDate() - 7)
          return fechaCreacion >= semanaAtras
        } else if (filtroPeriodo === "Este Mes") {
          return (
            fechaCreacion.getMonth() === hoy.getMonth() &&
            fechaCreacion.getFullYear() === hoy.getFullYear()
          )
        }
        return true
      })
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (orden) =>
          orden.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orden.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orden.tecnico.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [searchTerm, filtroPeriodo])

  // Calcular estadísticas basadas en órdenes filtradas
  const stats = useMemo(() => {
    return {
      total: ordenesFiltradas.length,
      pendientes: ordenesFiltradas.filter((o) => o.estado === "Pendiente").length,
      enProgreso: ordenesFiltradas.filter((o) => o.estado === "En Progreso").length,
      completadas: ordenesFiltradas.filter((o) => o.estado === "Completada").length,
      costoTotal: ordenesFiltradas.reduce((sum, o) => sum + o.costo, 0),
    }
  }, [ordenesFiltradas])

  const limpiarFiltros = () => {
    setSearchTerm("")
    setFiltroPeriodo("General")
  }

  const tieneFiltrosActivos = searchTerm !== "" || filtroPeriodo !== "General"

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
                <p className="text-2xl font-bold">Q{stats.costoTotal.toLocaleString()}</p>
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
              <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Este Mes">Este Mes</SelectItem>
                  <SelectItem value="Esta Semana">Esta Semana</SelectItem>
                  <SelectItem value="Hoy">Hoy</SelectItem>
                </SelectContent>
              </Select>
              {tieneFiltrosActivos && (
                <Button variant="outline" onClick={limpiarFiltros}>
                  <X className="h-4 w-4 mr-2" />
                  Quitar Filtros
                </Button>
              )}
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
                    <Badge className={`${getPrioridadBadge(orden.prioridad)} border`}>{orden.prioridad}</Badge>
                    {estaVencida(orden.fechaEstimadaTerminacion) && (
                      <Badge variant="destructive" className="border">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Vencida
                      </Badge>
                    )}
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
                      <p className="text-muted-foreground">Fecha Estimada Terminación</p>
                      <p className="font-medium">{new Date(orden.fechaEstimadaTerminacion).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Progreso basado en fechas */}
                  {orden.fechaInicio && orden.fechaEstimadaTerminacion && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progreso</span>
                        <span>{calcularProgreso(orden.fechaInicio, orden.fechaEstimadaTerminacion)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            estaVencida(orden.fechaEstimadaTerminacion)
                              ? "bg-red-600"
                              : calcularProgreso(orden.fechaInicio, orden.fechaEstimadaTerminacion) === 100
                                ? "bg-green-600"
                                : "bg-blue-600"
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(0, calcularProgreso(orden.fechaInicio, orden.fechaEstimadaTerminacion)))}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>
                          Inicio: {new Date(orden.fechaInicio).toLocaleDateString("es-GT")} | Fin:{" "}
                          {new Date(orden.fechaEstimadaTerminacion).toLocaleDateString("es-GT")}
                        </span>
                        <span>Costo: Q{orden.costo.toLocaleString()}</span>
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
