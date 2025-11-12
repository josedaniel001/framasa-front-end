"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Factory,
  TrendingUp,
  Clock,
  Calendar,
  MapPin,
  Gauge,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

// Datos de ejemplo para producción de piedrinera
const produccionData = [
  {
    id: "LOTE-001",
    fecha: "2024-01-15",
    agregado: "Arena Fina",
    cantera: "Cantera San José",
    volumenPlanificado: 150.0,
    volumenProducido: 145.5,
    estado: "Completado",
    calidad: "Aprobada",
    operador: "Juan Pérez",
    turno: "Mañana",
    equipos: ["Excavadora CAT-320", "Criba Vibratoria"],
    observaciones: "Producción normal, calidad excelente",
  },
  {
    id: "LOTE-002",
    fecha: "2024-01-15",
    agregado: 'Grava 3/4"',
    cantera: "Cantera El Roble",
    volumenPlanificado: 200.0,
    volumenProducido: 180.0,
    estado: "En Proceso",
    calidad: "Pendiente",
    operador: "María García",
    turno: "Tarde",
    equipos: ["Excavadora CAT-330", "Trituradora Primaria"],
    observaciones: "En proceso de trituración",
  },
  {
    id: "LOTE-003",
    fecha: "2024-01-14",
    agregado: 'Piedrín 1/2"',
    cantera: "Cantera Los Ángeles",
    volumenPlanificado: 120.0,
    volumenProducido: 0.0,
    estado: "Planificado",
    calidad: "Pendiente",
    operador: "Carlos López",
    turno: "Noche",
    equipos: ["Excavadora CAT-315", "Criba Secundaria"],
    observaciones: "Programado para inicio mañana",
  },
  {
    id: "LOTE-004",
    fecha: "2024-01-14",
    agregado: "Arena Gruesa",
    cantera: "Cantera San José",
    volumenPlanificado: 100.0,
    volumenProducido: 95.0,
    estado: "Completado",
    calidad: "Rechazada",
    operador: "Ana Rodríguez",
    turno: "Mañana",
    equipos: ["Excavadora CAT-320", "Lavadora de Arena"],
    observaciones: "Rechazado por alto contenido de arcilla",
  },
]

const estadoColors = {
  Completado: "bg-green-100 text-green-800",
  "En Proceso": "bg-blue-100 text-blue-800",
  Planificado: "bg-yellow-100 text-yellow-800",
  Suspendido: "bg-red-100 text-red-800",
}

const calidadColors = {
  Aprobada: "bg-green-100 text-green-800",
  Rechazada: "bg-red-100 text-red-800",
  Pendiente: "bg-gray-100 text-gray-800",
}

export default function PiedrinerapProduccionPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [selectedLote, setSelectedLote] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleOpenDetailModal = useCallback((lote: any) => {
    setSelectedLote(lote)
    setIsDetailModalOpen(true)
  }, [])

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false)
    setSelectedLote(null)
  }, [])

  const filteredLotes = produccionData.filter((lote) => {
    const matchesSearch =
      lote.agregado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lote.cantera.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterEstado === "todos" || lote.estado === filterEstado
    return matchesSearch && matchesFilter
  })

  // Cálculos para KPIs
  const volumenPlanificado = produccionData.reduce((sum, lote) => sum + lote.volumenPlanificado, 0)
  const volumenProducido = produccionData.reduce((sum, lote) => sum + lote.volumenProducido, 0)
  const lotesCompletados = produccionData.filter((l) => l.estado === "Completado").length
  const lotesEnProceso = produccionData.filter((l) => l.estado === "En Proceso").length
  const eficienciaProduccion = volumenPlanificado > 0 ? (volumenProducido / volumenPlanificado) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Producción - Piedrinera</h1>
          <p className="text-gray-600">Control de extracción y procesamiento de agregados</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" asChild>
          <Link href="/piedrinera/produccion/nuevo-lote">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Lote
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Volumen Producido</p>
                <p className="text-2xl font-bold">{volumenProducido.toFixed(1)} m³</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Factory className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+15.2%</span>
              <span className="text-gray-500 ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eficiencia</p>
                <p className="text-2xl font-bold">{eficienciaProduccion.toFixed(1)}%</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gauge className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={eficienciaProduccion} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lotes Completados</p>
                <p className="text-2xl font-bold">{lotesCompletados}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">de {produccionData.length} totales</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold">{lotesEnProceso}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">lotes activos</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por lote, agregado o cantera..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Planificado">Planificado</SelectItem>
                <SelectItem value="Suspendido">Suspendido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de lotes de producción */}
      <div className="grid gap-4">
        {filteredLotes.map((lote) => {
          const progreso = lote.volumenPlanificado > 0 ? (lote.volumenProducido / lote.volumenPlanificado) * 100 : 0

          return (
            <Card key={lote.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <p className="font-semibold text-blue-600">{lote.id}</p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {lote.fecha}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">{lote.agregado}</p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {lote.cantera}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Progreso</p>
                      <div className="mt-1">
                        <Progress value={progreso} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {lote.volumenProducido}/{lote.volumenPlanificado} m³
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{lote.operador}</p>
                      <p className="text-sm text-gray-500">Turno {lote.turno}</p>
                    </div>
                    <div className="space-y-1">
                      <Badge className={estadoColors[lote.estado as keyof typeof estadoColors]}>{lote.estado}</Badge>
                      <Badge className={calidadColors[lote.calidad as keyof typeof calidadColors]}>
                        {lote.calidad}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetailModal(lote)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/piedrinera/produccion/${lote.id}/editar`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modal de detalles */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles de Producción - {selectedLote?.id}</DialogTitle>
          </DialogHeader>
          {selectedLote && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Información General</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Fecha:</span> {selectedLote.fecha}
                    </p>
                    <p>
                      <span className="font-medium">Agregado:</span> {selectedLote.agregado}
                    </p>
                    <p>
                      <span className="font-medium">Cantera:</span> {selectedLote.cantera}
                    </p>
                    <p>
                      <span className="font-medium">Operador:</span> {selectedLote.operador}
                    </p>
                    <p>
                      <span className="font-medium">Turno:</span> {selectedLote.turno}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Estado y Calidad</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Estado:</span>
                      <Badge className={`ml-2 ${estadoColors[selectedLote.estado as keyof typeof estadoColors]}`}>
                        {selectedLote.estado}
                      </Badge>
                    </p>
                    <p>
                      <span className="font-medium">Calidad:</span>
                      <Badge className={`ml-2 ${calidadColors[selectedLote.calidad as keyof typeof calidadColors]}`}>
                        {selectedLote.calidad}
                      </Badge>
                    </p>
                    <p>
                      <span className="font-medium">Vol. Planificado:</span> {selectedLote.volumenPlanificado} m³
                    </p>
                    <p>
                      <span className="font-medium">Vol. Producido:</span> {selectedLote.volumenProducido} m³
                    </p>
                    <div className="mt-2">
                      <Progress
                        value={
                          selectedLote.volumenPlanificado > 0
                            ? (selectedLote.volumenProducido / selectedLote.volumenPlanificado) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Equipos Utilizados</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedLote.equipos.map((equipo: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {equipo}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Observaciones</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedLote.observaciones}</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseDetailModal}>
                  Cerrar
                </Button>
                <Button>Editar Lote</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
