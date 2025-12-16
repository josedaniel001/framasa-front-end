"use client"

import { useState, useEffect, useMemo } from "react"
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
  DollarSign,
  X,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { toast } from "sonner"

interface OrdenTrabajo {
  id: string
  codigoOrden: string
  equipo: string
  tipo: string
  descripcion: string
  prioridad: string
  prioridadValor: string
  estado: string
  estadoValor: string
  tecnico: string
  fechaCreacion: string
  fechaInicio: string
  fechaEstimadaTerminacion: string
  costo: number
  progreso: number
  activo: boolean
  estaVencida: boolean
}

interface Estadisticas {
  total: number
  pendientes: number
  enProgreso: number
  completadas: number
  costoTotal: number
}

const getPrioridadBadge = (prioridad: string) => {
  const variants: Record<string, string> = {
    Baja: "bg-gray-100 text-gray-800 border-gray-200",
    BAJA: "bg-gray-100 text-gray-800 border-gray-200",
    Media: "bg-yellow-100 text-yellow-800 border-yellow-200",
    MEDIA: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Alta: "bg-orange-100 text-orange-800 border-orange-200",
    ALTA: "bg-orange-100 text-orange-800 border-orange-200",
    Urgente: "bg-red-100 text-red-800 border-red-200",
    URGENTE: "bg-red-100 text-red-800 border-red-200",
  }
  return variants[prioridad] || variants["Media"]
}

const getEstadoBadge = (estado: string) => {
  const variants: Record<string, string> = {
    Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
    PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
    "En Progreso": "bg-blue-100 text-blue-800 border-blue-200",
    EN_PROGRESO: "bg-blue-100 text-blue-800 border-blue-200",
    Completada: "bg-green-100 text-green-800 border-green-200",
    COMPLETADA: "bg-green-100 text-green-800 border-green-200",
    Cancelada: "bg-red-100 text-red-800 border-red-200",
    CANCELADA: "bg-red-100 text-red-800 border-red-200",
    Vencida: "bg-purple-100 text-purple-800 border-purple-200",
    VENCIDA: "bg-purple-100 text-purple-800 border-purple-200",
  }
  return variants[estado] || variants["Pendiente"]
}

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total: 0,
    pendientes: 0,
    enProgreso: 0,
    completadas: 0,
    costoTotal: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos")
  const [filtroEstado, setFiltroEstado] = useState("todos")

  // Cargar órdenes desde la API
  const loadOrdenes = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (searchTerm) {
        params.append("search", searchTerm)
      }
      if (filtroPeriodo !== "todos") {
        params.append("periodo", filtroPeriodo)
      }
      if (filtroEstado !== "todos") {
        params.append("estado", filtroEstado)
      }
      params.append("activo", "activo")

      const queryString = params.toString()
      const url = `${API_ENDPOINTS.TALLER.ORDENES}${queryString ? `?${queryString}` : ""}`
      
      const data = await apiGet<OrdenTrabajo[]>(url)
      setOrdenes(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Error al cargar órdenes:", error)
      toast.error("Error al cargar las órdenes de trabajo")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar estadísticas
  const loadEstadisticas = async () => {
    try {
      const data = await apiGet<Estadisticas>(API_ENDPOINTS.TALLER.ORDENES_ESTADISTICAS)
      setEstadisticas(data)
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error)
    }
  }

  useEffect(() => {
    loadOrdenes()
    loadEstadisticas()
  }, [searchTerm, filtroPeriodo, filtroEstado])

  const limpiarFiltros = () => {
    setSearchTerm("")
    setFiltroPeriodo("todos")
    setFiltroEstado("todos")
  }

  const tieneFiltrosActivos = searchTerm !== "" || filtroPeriodo !== "todos" || filtroEstado !== "todos"

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
                <p className="text-2xl font-bold">{estadisticas.total}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
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
                <p className="text-2xl font-bold text-orange-600">{estadisticas.enProgreso}</p>
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
                <p className="text-2xl font-bold text-green-600">{estadisticas.completadas}</p>
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
                <p className="text-2xl font-bold">Q{estadisticas.costoTotal.toLocaleString()}</p>
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
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="mes">Este Mes</SelectItem>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="hoy">Hoy</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="EN_PROGRESO">En Progreso</SelectItem>
                  <SelectItem value="COMPLETADA">Completada</SelectItem>
                  <SelectItem value="CANCELADA">Cancelada</SelectItem>
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando órdenes...</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {ordenes.map((orden) => (
            <Card key={orden.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{orden.codigoOrden}</h3>
                      <Badge className={`${getPrioridadBadge(orden.prioridad)} border`}>
                        {orden.prioridad}
                      </Badge>
                      <Badge className={`${getEstadoBadge(orden.estado)} border`}>
                        {orden.estado}
                      </Badge>
                      {orden.estaVencida && (
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
                        <p className="font-medium line-clamp-1">{orden.descripcion}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Técnico</p>
                        <p className="font-medium flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {orden.tecnico || "Sin asignar"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fecha Estimada Terminación</p>
                        <p className="font-medium">
                          {orden.fechaEstimadaTerminacion
                            ? new Date(orden.fechaEstimadaTerminacion).toLocaleDateString("es-GT")
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {/* Progreso */}
                    {orden.fechaInicio && orden.fechaEstimadaTerminacion && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progreso</span>
                          <span>{orden.progreso}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              orden.estaVencida
                                ? "bg-red-600"
                                : orden.progreso === 100
                                  ? "bg-green-600"
                                  : "bg-blue-600"
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(0, orden.progreso))}%`,
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
      )}

      {!isLoading && ordenes.length === 0 && (
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
