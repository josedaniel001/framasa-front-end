"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Printer, Truck, Wrench, Calendar, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface CamionDetallePageProps {
  params: Promise<{
    id: string
  }>
}

export default function CamionDetallePage({ params }: CamionDetallePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [camion, setCamion] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCamion = async () => {
      try {
        setLoading(true)
        setError(null)
        // Construir URL correctamente para evitar dobles slashes
        const camionUrl = API_ENDPOINTS.PIEDRINERA.CAMIONES.endsWith('/')
          ? `${API_ENDPOINTS.PIEDRINERA.CAMIONES}${id}/`
          : `${API_ENDPOINTS.PIEDRINERA.CAMIONES}/${id}/`
        const camionData = await apiGet<any>(camionUrl)
        setCamion(camionData)
      } catch (err: any) {
        console.error("Error al cargar camión:", err)
        setError(err.message || "No se pudo cargar el camión")
        toast({
          title: "Error",
          description: err.message || "No se pudo cargar el camión.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCamion()
  }, [id, toast])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Disponible":
        return "default"
      case "En Ruta":
        return "secondary"
      case "En Mantenimiento":
        return "destructive"
      case "Cargando":
        return "outline"
      case "Descargando":
        return "outline"
      case "Fuera de Servicio":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <h1 className="text-3xl font-bold">Cargando...</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !camion) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-3xl font-bold">Camión no encontrado</h1>
        <p className="text-muted-foreground">
          {error || `El camión con ID ${id} no existe.`}
        </p>
        <Button onClick={() => router.push("/piedrinera/camiones")}>Volver a Camiones</Button>
      </div>
    )
  }

  const placa = camion.placa || ""
  const marca = camion.marca || ""
  const modelo = camion.modelo || ""
  const capacidad = camion.capacidadMetrosCubicos || camion.capacidad_m3 || 0
  const estado = camion.estado || camion.estado_actual || "Desconocido"
  const ultimoMantenimiento = camion.ultimoMantenimiento || camion.fecha_ultimo_mantenimiento || ""
  const proximoMantenimiento = camion.proximoMantenimiento || camion.fecha_proximo_mantenimiento || ""
  const kilometraje = camion.kilometraje || 0
  const horasOperacion = camion.horasOperacion || camion.horas_operacion || 0
  const consumoCombustible = camion.consumoCombustible || camion.consumo_l_100km || 0
  const seguroVigente = camion.seguroVigente !== undefined ? camion.seguroVigente : camion.seguro_vigente !== undefined ? camion.seguro_vigente : true
  const revisionTecnicaVigente = camion.revisionTecnicaVigente !== undefined ? camion.revisionTecnicaVigente : camion.revision_tecnica_vigente !== undefined ? camion.revision_tecnica_vigente : true
  const documentacionVigente = camion.documentacionVigente !== undefined ? camion.documentacionVigente : camion.documentacion_vigente !== undefined ? camion.documentacion_vigente : true
  const activo = camion.activo !== undefined ? camion.activo : true
  const observaciones = camion.observaciones || ""

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <h1 className="text-3xl font-bold">Detalle de Camión: {placa}</h1>
        <div className="flex gap-2">
          <Link href={`/piedrinera/camiones/${id}/editar`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              // Función para imprimir la información del camión
              window.print()
            }}
          >
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Placa:</span>
              <span className="font-medium">{placa}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Marca:</span>
              <span className="font-medium">{marca}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modelo:</span>
              <span className="font-medium">{modelo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Capacidad:</span>
              <span className="font-medium">{capacidad} m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={getStatusVariant(estado)}>{estado}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Activo:</span>
              <div className="flex items-center gap-1">
                {activo ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Activo</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">Inactivo</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Mantenimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Último Mantenimiento:</span>
              <span className="font-medium">
                {ultimoMantenimiento ? new Date(ultimoMantenimiento).toLocaleDateString("es-GT") : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Próximo Mantenimiento:</span>
              <span className="font-medium">
                {proximoMantenimiento ? new Date(proximoMantenimiento).toLocaleDateString("es-GT") : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kilometraje:</span>
              <span className="font-medium">{kilometraje.toLocaleString()} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horas de Operación:</span>
              <span className="font-medium">{horasOperacion.toLocaleString()} hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Consumo:</span>
              <span className="font-medium">{consumoCombustible} L/100km</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Documentación
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Seguro:</span>
              <div className="flex items-center gap-1">
                {seguroVigente ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Vigente</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Vencido</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Revisión Técnica:</span>
              <div className="flex items-center gap-1">
                {revisionTecnicaVigente ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Al día</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Vencida</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Documentación:</span>
              <div className="flex items-center gap-1">
                {documentacionVigente ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Vigente</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Vencida</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {observaciones && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{observaciones}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
