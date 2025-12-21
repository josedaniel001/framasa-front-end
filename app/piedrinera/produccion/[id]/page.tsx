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

interface VerProduccionPageProps {
  params: Promise<{
    id: string
  }>
}

interface LoteProduccion {
  id: string
  fecha: string
  agregado: string
  cantera: string
  volumenPlanificado: number
  volumenProducido: number
  estado: string
  calidad: string
  operador: string
  turno: string
  equipos: string[]
  observaciones: string
}

export default function VerProduccionPage({ params }: VerProduccionPageProps) {
  const router = useRouter()
  const { id } = use(params)

  const [lote, setLote] = useState<LoteProduccion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLote = async () => {
      try {
        setLoading(true)

        // En una implementación real, aquí harías una llamada a la API
        // const loteData = await apiGet(`${API_ENDPOINTS.PIEDRINERA.PRODUCCION}/${id}`)

        // Por ahora, simulamos buscar en los datos de ejemplo
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

        const loteEncontrado = produccionData.find(l => l.id === id)

        if (!loteEncontrado) {
          throw new Error("Lote de producción no encontrado")
        }

        setLote(loteEncontrado)
      } catch (error: any) {
        console.error('Error al cargar lote:', error)
        // En una implementación real, mostrarías un toast de error
        router.replace("/piedrinera/produccion")
      } finally {
        setLoading(false)
      }
    }

    loadLote()
  }, [id, router])

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

  if (!lote) {
    return null
  }

  const progreso = lote.volumenPlanificado > 0 ? (lote.volumenProducido / lote.volumenPlanificado) * 100 : 0
  const eficiencia = lote.volumenPlanificado > 0 ? (lote.volumenProducido / lote.volumenPlanificado) * 100 : 0

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
            <h1 className="text-3xl font-bold">Lote {lote.id}</h1>
            <p className="text-muted-foreground">{lote.agregado} - {lote.cantera}</p>
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
            {lote.estado === "Completado" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Clock className="h-4 w-4 text-blue-500" />
            )}
          </CardHeader>
          <CardContent>
            <Badge className={`${estadoColors[lote.estado as keyof typeof estadoColors]} text-base px-3 py-1`}>
              {lote.estado}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volumen Producido</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lote.volumenProducido} m³</div>
            <p className="text-xs text-muted-foreground">
              de {lote.volumenPlanificado} m³ planificados
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
            {lote.calidad === "Aprobada" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : lote.calidad === "Rechazada" ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <Clock className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <Badge className={`${calidadColors[lote.calidad as keyof typeof calidadColors]} text-base px-3 py-1`}>
              {lote.calidad}
            </Badge>
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
                <p className="text-base font-semibold">{lote.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                <p className="text-base font-semibold flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(lote.fecha).toLocaleDateString("es-GT", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Agregado</p>
                <p className="text-base font-semibold">{lote.agregado}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cantera</p>
                <p className="text-base font-semibold flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {lote.cantera}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operador</p>
                <p className="text-base font-semibold flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {lote.operador}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Turno</p>
                <p className="text-base font-semibold flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {lote.turno}
                </p>
              </div>
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
                <p className="text-2xl font-bold">{lote.volumenPlanificado} m³</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Volumen Producido</p>
                <p className="text-2xl font-bold">{lote.volumenProducido} m³</p>
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
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <Badge className={estadoColors[lote.estado as keyof typeof estadoColors]}>
                  {lote.estado}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipos Utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lote.equipos.map((equipo, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Factory className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">{equipo}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calidad y Observaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Estado de Calidad</p>
              <Badge className={`${calidadColors[lote.calidad as keyof typeof calidadColors]} text-base px-3 py-1`}>
                {lote.calidad}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Observaciones</p>
              <p className="text-sm bg-gray-50 p-3 rounded-lg">{lote.observaciones}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
