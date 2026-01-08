"use client"

import { useEffect, use, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Factory, Calendar, MapPin, User, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface VerProduccionPageProps {
  params: Promise<{
    id: string
  }>
}

interface LoteProduccion {
  id: string
  codigo_lote: string
  codigoLote: string
  fecha: string
  fecha_produccion: string
  agregado: {
    id: string
    codigo: string
    nombre: string
  }
  agregado_nombre: string
  volumen_planificado_m3: number
  volumen_producido_m3: number
  volumenPlanificado: number
  volumenProducido: number
  costo_total_q: number
  costoTotal: number
  estado: string
  estado_display: string
  calidad: string | null
  supervisor: {
    id: string
    nombre: string
  } | null
  supervisor_nombre: string | null
  operador: {
    id: string
    nombre: string
  } | null
  operador_nombre: string | null
  hora_inicio_produccion: string
  hora_fin_produccion: string | null
  equipos_usados: string[]
  equiposUsados: string[]
  observaciones: string | null
  eficiencia_produccion: number
  costo_por_m3: number
  duracion_produccion: number
}

export default function VerProduccionPage({ params }: VerProduccionPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = use(params)

  const [lote, setLote] = useState<LoteProduccion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLote = async () => {
      try {
        setLoading(true)
        setError(null)

        const loteUrl = API_ENDPOINTS.PIEDRINERA.PRODUCCION.endsWith('/')
          ? `${API_ENDPOINTS.PIEDRINERA.PRODUCCION}${id}/`
          : `${API_ENDPOINTS.PIEDRINERA.PRODUCCION}/${id}/`

        const loteData = await apiGet<any>(loteUrl)

        // Mapear datos del backend al formato del frontend
        const mappedLote: LoteProduccion = {
          id: String(loteData.id || ''),
          codigo_lote: loteData.codigo_lote || loteData.codigoLote || '',
          codigoLote: loteData.codigo_lote || loteData.codigoLote || '',
          fecha: loteData.fecha_produccion || loteData.fechaProduccion || loteData.fecha || '',
          fecha_produccion: loteData.fecha_produccion || loteData.fechaProduccion || loteData.fecha || '',
          agregado: loteData.agregado || { id: '', codigo: '', nombre: loteData.agregado_nombre || '' },
          agregado_nombre: loteData.agregado_nombre || loteData.agregado?.nombre || '',
          volumen_planificado_m3: Number(loteData.volumen_planificado_m3 ?? loteData.volumenPlanificado ?? loteData.volumenPlanificadoM3 ?? 0) || 0,
          volumen_producido_m3: Number(loteData.volumen_producido_m3 ?? loteData.volumenProducido ?? loteData.volumenProducidoM3 ?? 0) || 0,
          volumenPlanificado: Number(loteData.volumen_planificado_m3 ?? loteData.volumenPlanificado ?? loteData.volumenPlanificadoM3 ?? 0) || 0,
          volumenProducido: Number(loteData.volumen_producido_m3 ?? loteData.volumenProducido ?? loteData.volumenProducidoM3 ?? 0) || 0,
          costo_total_q: Number(loteData.costo_total_q ?? loteData.costoTotal ?? loteData.costoTotalQ ?? 0) || 0,
          costoTotal: Number(loteData.costo_total_q ?? loteData.costoTotal ?? loteData.costoTotalQ ?? 0) || 0,
          estado: loteData.estado || '',
          estado_display: loteData.estado_display || loteData.estado || '',
          calidad: loteData.calidad || null,
          supervisor: loteData.supervisor || null,
          supervisor_nombre: loteData.supervisor_nombre || loteData.supervisor?.nombre || null,
          operador: loteData.operador || null,
          operador_nombre: loteData.operador_nombre || loteData.operador?.nombre || null,
          hora_inicio_produccion: loteData.hora_inicio_produccion || loteData.horaInicio || loteData.horaInicioProduccion || '',
          hora_fin_produccion: loteData.hora_fin_produccion || loteData.horaFin || loteData.horaFinProduccion || null,
          equipos_usados: loteData.equipos_usados || loteData.equiposUsados || [],
          equiposUsados: loteData.equipos_usados || loteData.equiposUsados || [],
          observaciones: loteData.observaciones || null,
          eficiencia_produccion: Number(loteData.eficiencia_produccion ?? 0) || 0,
          costo_por_m3: Number(loteData.costo_por_m3 ?? 0) || 0,
          duracion_produccion: Number(loteData.duracion_produccion ?? 0) || 0,
        }

        setLote(mappedLote)
      } catch (err: any) {
        console.error('Error al cargar lote:', err)
        setError(err.message || 'No se pudo cargar el lote de producción')
        toast({
          title: "Error",
          description: err.message || "No se pudo cargar el lote de producción.",
          variant: "destructive",
        })
        router.replace("/piedrinera/produccion")
      } finally {
        setLoading(false)
      }
    }

    loadLote()
  }, [id, router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Cargando lote de producción...</p>
        </div>
      </div>
    )
  }

  if (error || !lote) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-3xl font-bold">Lote no encontrado</h1>
        <p className="text-muted-foreground">
          {error || `El lote con ID ${id} no existe.`}
        </p>
        <Button onClick={() => router.push("/piedrinera/produccion")}>Volver a Producción</Button>
      </div>
    )
  }

  const progreso = lote.volumen_planificado_m3 > 0 ? (lote.volumen_producido_m3 / lote.volumen_planificado_m3) * 100 : 0
  const eficiencia = lote.eficiencia_produccion || progreso

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/piedrinera/produccion">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Lote {lote.codigo_lote}</h1>
            <p className="text-muted-foreground">{lote.agregado_nombre}</p>
          </div>
        </div>
        <Link href={`/piedrinera/produccion/${lote.id}/editar`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar Lote
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            {lote.estado === "COMPLETADO" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Clock className="h-4 w-4 text-blue-500" />
            )}
          </CardHeader>
          <CardContent>
            <Badge className={`${estadoColors[lote.estado] || "bg-gray-100 text-gray-800"} text-base px-3 py-1`}>
              {lote.estado_display}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volumen Producido</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lote.volumen_producido_m3.toFixed(2)} m³</div>
            <p className="text-xs text-muted-foreground">
              de {lote.volumen_planificado_m3.toFixed(2)} m³ planificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eficiencia.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">del volumen planificado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calidad</CardTitle>
            {lote.calidad === "Aprobada" || lote.calidad === "Buena" || lote.calidad === "Excelente" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : lote.calidad === "Rechazada" ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <Clock className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            {lote.calidad ? (
              <Badge className={`${calidadColors[lote.calidad] || "bg-gray-100 text-gray-800"} text-base px-3 py-1`}>
                {lote.calidad}
              </Badge>
            ) : (
              <p className="text-sm text-muted-foreground">Sin calificar</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID del Lote</p>
                <p className="text-base font-semibold">{lote.codigo_lote}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                <p className="text-base font-semibold flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {lote.fecha ? new Date(lote.fecha).toLocaleDateString("es-GT", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) : ''}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Agregado</p>
                <p className="text-base font-semibold">{lote.agregado_nombre}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                <p className="text-base font-semibold flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {lote.supervisor_nombre || 'No asignado'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operador</p>
                <p className="text-base font-semibold flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {lote.operador_nombre || 'No asignado'}
                </p>
              </div>
              {lote.hora_inicio_produccion && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hora Inicio</p>
                  <p className="text-base font-semibold flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {lote.hora_inicio_produccion}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progreso de Producción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Volumen Planificado</p>
                <p className="text-2xl font-bold">{lote.volumen_planificado_m3.toFixed(2)} m³</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Volumen Producido</p>
                <p className="text-2xl font-bold">{lote.volumen_producido_m3.toFixed(2)} m³</p>
              </div>
            </div>
            <Separator />
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso</span>
                <span>{progreso.toFixed(1)}%</span>
              </div>
              <Progress value={progreso} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eficiencia</p>
                <p className="text-lg font-semibold text-green-600">{eficiencia.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Costo Total</p>
                <p className="text-lg font-semibold">Q {lote.costo_total_q.toFixed(2)}</p>
              </div>
              {lote.volumen_producido_m3 > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Costo por m³</p>
                  <p className="text-lg font-semibold">Q {lote.costo_por_m3.toFixed(2)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {lote.equipos_usados && lote.equipos_usados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Equipos Utilizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lote.equipos_usados.map((equipo, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Factory className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">{equipo}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Calidad y Observaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lote.calidad && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Estado de Calidad</p>
                <Badge className={`${calidadColors[lote.calidad] || "bg-gray-100 text-gray-800"} text-base px-3 py-1`}>
                  {lote.calidad}
                </Badge>
              </div>
            )}
            {lote.observaciones && (
              <>
                {lote.calidad && <Separator />}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Observaciones</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{lote.observaciones}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
