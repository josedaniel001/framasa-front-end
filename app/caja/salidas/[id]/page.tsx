"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Loader2, Calendar, User, Building2, FileText, DollarSign, TrendingDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface MovimientoCaja {
  id: number
  tipo: 'ENTRADA' | 'SALIDA'
  monto: number
  descripcion: string
  empresa: string
  empresa_display: string
  fecha: string
  usuario: string
  referencia?: string
  created_at?: string
  updated_at?: string
}

export default function DetalleSalidaCajaPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [movimiento, setMovimiento] = useState<MovimientoCaja | null>(null)
  const [error, setError] = useState<string | null>(null)

  const id = params.id as string

  useEffect(() => {
    loadMovimiento()
  }, [id])

  const loadMovimiento = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulación de carga de datos - en producción vendría de la API
      const mockData: MovimientoCaja = {
        id: parseInt(id),
        tipo: 'SALIDA',
        monto: 300.00,
        descripcion: 'Pago de servicios eléctricos - Recibo #001',
        empresa: 'BLOQUERA',
        empresa_display: 'Bloquera',
        fecha: '2025-12-15T11:15:00Z',
        usuario: 'María García',
        referencia: 'REC-001',
        created_at: '2025-12-15T11:15:00Z',
        updated_at: '2025-12-15T11:15:00Z',
      }

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500))

      setMovimiento(mockData)
    } catch (err: any) {
      console.error("Error al cargar movimiento:", err)
      setError(err.message || "Error al cargar el movimiento de caja")
      toast({
        title: "Error",
        description: "No se pudo cargar el movimiento de caja",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatMonto = (monto: number) => {
    return `Q${monto.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link href="/caja">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Detalle de Salida</h1>
            <p className="text-muted-foreground">Cargando información del movimiento...</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !movimiento) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link href="/caja">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Detalle de Salida</h1>
            <p className="text-muted-foreground">Error al cargar la información</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              {error || "No se encontró el movimiento de caja solicitado."}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/caja">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Detalle de Salida</h1>
            <p className="text-muted-foreground">Información completa del movimiento de caja</p>
          </div>
        </div>

        <Link href={`/caja/salidas/${movimiento.id}/editar`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar Salida
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Información Principal */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Información del Movimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  Empresa
                </div>
                <Badge variant="outline" className="text-base py-1">
                  {movimiento.empresa_display}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Monto
                </div>
                <div className="text-2xl font-bold text-red-600">
                  -{formatMonto(movimiento.monto)}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Descripción
              </div>
              <p className="text-base">{movimiento.descripcion}</p>
            </div>

            {movimiento.referencia && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Referencia</div>
                  <Badge variant="secondary">{movimiento.referencia}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Información del Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Fecha y Hora
              </div>
              <div className="text-sm font-medium">
                {formatFecha(movimiento.fecha)}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Usuario
              </div>
              <div className="text-sm font-medium">{movimiento.usuario}</div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">ID del Movimiento</div>
              <div className="text-xs font-mono bg-muted p-2 rounded">
                {movimiento.id}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Tipo</div>
              <Badge variant="destructive" className="bg-red-100 text-red-800">
                Salida de Caja
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de Auditoría */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Auditoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Fecha de Creación</div>
              <div className="text-sm font-medium">
                {movimiento.created_at ? formatFecha(movimiento.created_at) : "No disponible"}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Última Modificación</div>
              <div className="text-sm font-medium">
                {movimiento.updated_at ? formatFecha(movimiento.updated_at) : "No disponible"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
