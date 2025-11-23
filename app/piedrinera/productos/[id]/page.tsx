"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Package, MapPin, Truck, AlertTriangle, TrendingUp, TrendingDown, Printer, Loader2 } from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface ProductoDetallePageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProductoDetallePage({ params }: ProductoDetallePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [agregado, setAgregado] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const agregadoData = await apiGet<any>(`${API_ENDPOINTS.PIEDRINERA.PRODUCTOS}/${id}`)
        if (!agregadoData) {
          router.push("/piedrinera/productos")
          return
        }
        setAgregado(agregadoData)
      } catch (error: any) {
        console.error("Error loading data:", error)
        setError(error.message || "Error al cargar el agregado")
        toast({
          title: "Error",
          description: "No se pudo cargar el agregado. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
        router.push("/piedrinera/productos")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, router, toast])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !agregado) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Producto no encontrado</h3>
        <p className="text-muted-foreground">{error || "El agregado solicitado no existe."}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Productos
        </Button>
      </div>
    )
  }

  const getStockStatus = (stock: number, stockMinimo: number) => {
    if (stock <= stockMinimo * 0.5) {
      return { status: "Crítico", color: "bg-red-500", textColor: "text-red-700" }
    } else if (stock <= stockMinimo) {
      return { status: "Bajo", color: "bg-yellow-500", textColor: "text-yellow-700" }
    } else {
      return { status: "Normal", color: "bg-green-500", textColor: "text-green-700" }
    }
  }

  const getCalidadBadge = (calidad?: string) => {
    if (!calidad) return null
    
    const variants = {
      Excelente: "default",
      Buena: "secondary",
      Regular: "outline",
    } as const

    return <Badge variant={variants[calidad as keyof typeof variants] || "outline"}>{calidad}</Badge>
  }

  const stockActual = agregado.stockActualMetrosCubicos || agregado.stock_actual_m3 || 0
  const stockMinimo = agregado.stockMinimoMetrosCubicos || agregado.stock_minimo_m3 || 0
  const stockStatus = getStockStatus(stockActual, stockMinimo)
  // Calcular porcentaje basado en stock mínimo (asumiendo que el máximo es 2x el mínimo)
  const stockMaximoCalculado = stockMinimo * 2
  const stockPercentage = stockMaximoCalculado > 0 ? (stockActual / stockMaximoCalculado) * 100 : 0

  const getStatusVariant = (activo: boolean) => {
    return activo ? "default" : "destructive"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Detalle de Producto: {agregado.nombre}</h1>
            <p className="text-muted-foreground">
              {agregado.tipo} • {agregado.granulometria || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/piedrinera/inventario/${agregado.id}/ajustar`}>
            <Button variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Ajustar Stock
            </Button>
          </Link>
          <Link href={`/piedrinera/productos/${agregado.id}/editar`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Código:</span>
              <span className="font-medium">{agregado.codigo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <span className="font-medium">{agregado.tipo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Granulometría:</span>
              <span className="font-medium">{agregado.granulometria || 'N/A'}</span>
            </div>
            {agregado.descripcion && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descripción:</span>
                <span className="font-medium text-sm">{agregado.descripcion}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={getStatusVariant(agregado.activo)}>{agregado.activo ? "Activo" : "Inactivo"}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stock e Inventario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Stock e Inventario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stock Actual</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stockStatus.color}`} />
                  <span className={`text-sm font-medium ${stockStatus.textColor}`}>{stockStatus.status}</span>
                </div>
              </div>
              <div className="text-3xl font-bold">{stockActual.toLocaleString()} m³</div>
              <Progress value={stockPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: {stockMinimo} m³</span>
                <span>Max: {stockMaximoCalculado.toFixed(0)} m³</span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              {agregado.fechaUltimaEntrada || agregado.fecha_ultima_entrada ? (
                <div>
                  <span className="text-muted-foreground">Última Entrada:</span>
                  <div className="font-medium">{agregado.fechaUltimaEntrada || agregado.fecha_ultima_entrada}</div>
                </div>
              ) : null}
            </div>

            {stockStatus.status === "Crítico" && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">Stock en nivel crítico</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Especificaciones Técnicas */}
        <Card>
          <CardHeader>
            <CardTitle>Especificaciones Técnicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {(agregado.humedadPorcentaje || agregado.humedad_porcentaje) && (
                <div>
                  <span className="text-muted-foreground">Humedad:</span>
                  <div className="font-medium">{(agregado.humedadPorcentaje || agregado.humedad_porcentaje)}%</div>
                </div>
              )}
              {agregado.calidad && (
                <div>
                  <span className="text-muted-foreground">Calidad:</span>
                  <div>{getCalidadBadge(agregado.calidad)}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información de Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación y Logística
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {agregado.ubicacion && (
              <div>
                <span className="text-muted-foreground">Ubicación:</span>
                <div className="font-medium text-lg">{agregado.ubicacion}</div>
              </div>
            )}

            {agregado.proveedor && (
              <>
                {agregado.ubicacion && <Separator />}
                <div>
                  <h4 className="font-semibold mb-2">Proveedor</h4>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{agregado.proveedor}</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Información de Precios */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Precios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Costo de Producción:</span>
                <div className="font-medium text-lg">
                  Q{(agregado.costoProduccionPorMetroCubico || agregado.costo_produccion_m3 || 0).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">por m³</div>
              </div>
              <div>
                <span className="text-muted-foreground">Precio de Venta:</span>
                <div className="font-medium text-lg text-green-600">
                  Q{(agregado.precioVentaPorMetroCubico || agregado.precio_venta_m3 || 0).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">por m³</div>
              </div>
            </div>

            <Separator />

            <div>
              <span className="text-muted-foreground">Margen de Ganancia:</span>
              <div className="font-medium text-lg">
                {(() => {
                  const costo = agregado.costoProduccionPorMetroCubico || agregado.costo_produccion_m3 || 0
                  const venta = agregado.precioVentaPorMetroCubico || agregado.precio_venta_m3 || 0
                  if (costo > 0) {
                    return (((venta - costo) / costo) * 100).toFixed(1) + '%'
                  }
                  return 'N/A'
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Fecha de Creación:</span>
                <div className="font-medium">
                  {agregado.fechaCreacion || agregado.created_at 
                    ? new Date(agregado.fechaCreacion || agregado.created_at).toLocaleDateString('es-GT')
                    : 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Última Actualización:</span>
                <div className="font-medium">
                  {agregado.ultimaActualizacion || agregado.updated_at
                    ? new Date(agregado.ultimaActualizacion || agregado.updated_at).toLocaleDateString('es-GT')
                    : 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
