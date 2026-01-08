"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface LoteProduccion {
  id: string
  codigo_lote: string
  codigoLote: string
  fecha: string
  fecha_produccion: string
  agregado: string
  agregado_nombre: string
  volumen_planificado_m3: number
  volumen_producido_m3: number
  volumenPlanificado: number
  volumenProducido: number
  estado: string
  estado_display: string
  calidad: string | null
  operador: string
  operador_nombre: string
  activo: boolean
}

interface ProduccionStats {
  total_lotes: number
  lotes_completados: number
  lotes_en_proceso: number
  volumen_planificado_m3: number
  volumen_producido_m3: number
  eficiencia_porcentaje: number
}

const estadoColors: Record<string, string> = {
  COMPLETADO: "bg-green-100 text-green-800",
  EN_PROCESO: "bg-blue-100 text-blue-800",
  CANCELADO: "bg-red-100 text-red-800",
}

const calidadColors: Record<string, string> = {
  Aprobada: "bg-green-100 text-green-800",
  Rechazada: "bg-red-100 text-red-800",
  Pendiente: "bg-gray-100 text-gray-800",
  Buena: "bg-green-100 text-green-800",
  Excelente: "bg-green-100 text-green-800",
  Regular: "bg-yellow-100 text-yellow-800",
}

export default function PiedrinerapProduccionPage() {
  const { toast } = useToast()
  const [lotes, setLotes] = useState<LoteProduccion[]>([])
  const [allLotes, setAllLotes] = useState<LoteProduccion[]>([])
  const [stats, setStats] = useState<ProduccionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Cargar datos desde Django
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Cargar lotes de producción
        const [lotesResponse, statsResponse] = await Promise.all([
          apiGet<any>(API_ENDPOINTS.PIEDRINERA.PRODUCCION),
          apiGet<ProduccionStats>(API_ENDPOINTS.PIEDRINERA.PRODUCCION_STATS).catch(() => null),
        ])

        // Manejar diferentes formatos de respuesta
        let lotesData: any[] = []
        if (Array.isArray(lotesResponse)) {
          lotesData = lotesResponse
        } else if (lotesResponse && Array.isArray(lotesResponse.results)) {
          lotesData = lotesResponse.results
        } else if (lotesResponse && lotesResponse.data && Array.isArray(lotesResponse.data)) {
          lotesData = lotesResponse.data
        }

        // Mapear datos del backend al formato del frontend
        const mappedLotes: LoteProduccion[] = lotesData.map((lote: any) => ({
          id: String(lote.id || ''),
          codigo_lote: lote.codigo_lote || lote.codigoLote || '',
          codigoLote: lote.codigo_lote || lote.codigoLote || '',
          fecha: lote.fecha || lote.fecha_produccion || lote.fechaProduccion || '',
          fecha_produccion: lote.fecha_produccion || lote.fechaProduccion || lote.fecha || '',
          agregado: lote.agregado_nombre || lote.agregado?.nombre || '',
          agregado_nombre: lote.agregado_nombre || lote.agregado?.nombre || '',
          volumen_planificado_m3: Number(lote.volumen_planificado_m3 ?? lote.volumenPlanificado ?? lote.volumenPlanificadoM3 ?? 0) || 0,
          volumen_producido_m3: Number(lote.volumen_producido_m3 ?? lote.volumenProducido ?? lote.volumenProducidoM3 ?? 0) || 0,
          volumenPlanificado: Number(lote.volumen_planificado_m3 ?? lote.volumenPlanificado ?? lote.volumenPlanificadoM3 ?? 0) || 0,
          volumenProducido: Number(lote.volumen_producido_m3 ?? lote.volumenProducido ?? lote.volumenProducidoM3 ?? 0) || 0,
          estado: lote.estado || '',
          estado_display: lote.estado_display || lote.estado || '',
          calidad: lote.calidad || null,
          operador: lote.operador_nombre || lote.operador?.nombre || '',
          operador_nombre: lote.operador_nombre || lote.operador?.nombre || '',
          activo: lote.activo !== undefined ? lote.activo : true,
        }))

        setLotes(mappedLotes)
        setAllLotes(mappedLotes)
        if (statsResponse) {
          setStats(statsResponse)
        }
      } catch (err: any) {
        console.error('Error al cargar producción:', err)
        toast({
          title: "Error",
          description: "No se pudieron cargar los lotes de producción. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Filtrado local con debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      const filtered = allLotes.filter((lote) => {
        const matchesSearch =
          lote.codigo_lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lote.agregado.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lote.operador.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterEstado === "todos" || lote.estado === filterEstado
        return matchesSearch && matchesFilter
      })

      setLotes(filtered)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchTerm, filterEstado, allLotes])

  // Calcular KPIs desde stats o desde los lotes
  const volumenPlanificado = stats?.volumen_planificado_m3 ?? lotes.reduce((sum, lote) => sum + lote.volumen_planificado_m3, 0)
  const volumenProducido = stats?.volumen_producido_m3 ?? lotes.reduce((sum, lote) => sum + lote.volumen_producido_m3, 0)
  const lotesCompletados = stats?.lotes_completados ?? lotes.filter((l) => l.estado === "COMPLETADO").length
  const lotesEnProceso = stats?.lotes_en_proceso ?? lotes.filter((l) => l.estado === "EN_PROCESO").length
  const eficienciaProduccion = stats?.eficiencia_porcentaje ?? (volumenPlanificado > 0 ? (volumenProducido / volumenPlanificado) * 100 : 0)
  const totalLotes = stats?.total_lotes ?? lotes.length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Cargando producción...</p>
        </div>
      </div>
    )
  }

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
              <span className="text-gray-500">de {totalLotes} totales</span>
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
                  placeholder="Buscar por lote, agregado o operador..."
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
                <SelectItem value="COMPLETADO">Completado</SelectItem>
                <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de lotes de producción */}
      <div className="grid gap-4">
        {lotes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No se encontraron lotes de producción.</p>
            </CardContent>
          </Card>
        ) : (
          lotes.map((lote) => {
            const progreso = lote.volumen_planificado_m3 > 0 ? (lote.volumen_producido_m3 / lote.volumen_planificado_m3) * 100 : 0

            return (
              <Card key={lote.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div>
                        <p className="font-semibold text-blue-600">{lote.codigo_lote}</p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {lote.fecha ? new Date(lote.fecha).toLocaleDateString("es-GT") : ''}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{lote.agregado}</p>
                      </div>
                      <div>
                        <p className="font-medium">Progreso</p>
                        <div className="mt-1">
                          <Progress value={progreso} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">
                            {lote.volumen_producido_m3.toFixed(2)}/{lote.volumen_planificado_m3.toFixed(2)} m³
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{lote.operador}</p>
                      </div>
                      <div className="space-y-1">
                        <Badge className={estadoColors[lote.estado] || "bg-gray-100 text-gray-800"}>
                          {lote.estado_display}
                        </Badge>
                        {lote.calidad && (
                          <Badge className={calidadColors[lote.calidad] || "bg-gray-100 text-gray-800"}>
                            {lote.calidad}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/piedrinera/produccion/${lote.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
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
          })
        )}
      </div>
    </div>
  )
}
