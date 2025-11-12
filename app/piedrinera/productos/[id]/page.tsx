"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Package, MapPin, Truck, AlertTriangle, TrendingUp, TrendingDown, Printer } from "lucide-react"
import Link from "next/link"
import { getSampleAgregadosPiedrinera } from "@/lib/sample-data"

// Función para obtener datos del agregado
const getAgregadoById = async (id: string) => {
  // Simulamos una llamada a la API
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const agregados = getSampleAgregadosPiedrinera()

  return agregados.find((a) => a.id === Number.parseInt(id)) || null
}

// Datos de ejemplo para movimientos recientes
const getMovimientosRecientes = (agregadoId: number) => [
  {
    id: 1,
    fecha: "2024-01-15",
    hora: "14:30",
    tipo: "Salida",
    cantidad: 25,
    motivo: "Venta - Cliente ABC",
    responsable: "Juan Pérez",
  },
  {
    id: 2,
    fecha: "2024-01-15",
    hora: "08:00",
    tipo: "Entrada",
    cantidad: 50,
    motivo: "Recepción de proveedor",
    responsable: "María González",
  },
  {
    id: 3,
    fecha: "2024-01-14",
    hora: "16:45",
    tipo: "Salida",
    cantidad: 15,
    motivo: "Despacho - Orden #DESP-001",
    responsable: "Carlos López",
  },
]

interface ProductoDetallePageProps {
  params: {
    id: string
  }
}

export default function ProductoDetallePage({ params }: ProductoDetallePageProps) {
  const router = useRouter()
  const [agregado, setAgregado] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const agregadoData = await getAgregadoById(params.id)
        if (!agregadoData) {
          router.push("/piedrinera/productos")
          return
        }
        setAgregado(agregadoData)
        setMovimientos(getMovimientosRecientes(Number.parseInt(params.id)))
      } catch (error) {
        console.error("Error loading data:", error)
        router.push("/piedrinera/productos")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!agregado) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Producto no encontrado</h3>
        <p className="text-muted-foreground">El agregado solicitado no existe.</p>
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

  const getCalidadBadge = (calidad: string) => {
    const variants = {
      Excelente: "default",
      Buena: "secondary",
      Regular: "outline",
    } as const

    return <Badge variant={variants[calidad as keyof typeof variants] || "outline"}>{calidad}</Badge>
  }

  const stockStatus = getStockStatus(agregado.stockActualMetrosCubicos, agregado.stockMinimoMetrosCubicos)
  const stockPercentage = (agregado.stockActualMetrosCubicos / agregado.stockMaximoMetrosCubicos) * 100

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
              {agregado.categoria} • {agregado.granulometria}
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
              <span className="font-medium">{agregado.granulometria}</span>
            </div>
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
              <div className="text-3xl font-bold">{agregado.stockActualMetrosCubicos.toLocaleString()} m³</div>
              <Progress value={stockPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: {agregado.stockMinimoMetrosCubicos}</span>
                <span>Max: {agregado.stockMaximoMetrosCubicos}</span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Última Entrada:</span>
                <div className="font-medium">{agregado.ultimaEntrada}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Última Salida:</span>
                <div className="font-medium">{agregado.ultimaSalida}</div>
              </div>
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
              <div>
                <span className="text-muted-foreground">Humedad:</span>
                <div className="font-medium">{agregado.humedad}%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Pureza:</span>
                <div className="font-medium">{agregado.pureza}%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Densidad:</span>
                <div className="font-medium">{agregado.densidad} g/cm³</div>
              </div>
              <div>
                <span className="text-muted-foreground">Absorción:</span>
                <div className="font-medium">{agregado.absorcion}%</div>
              </div>
            </div>

            <Separator />

            <div>
              <span className="text-muted-foreground">Control de Calidad:</span>
              <Badge variant={agregado.controlCalidad ? "default" : "outline"} className="ml-2">
                {agregado.controlCalidad ? "Habilitado" : "Deshabilitado"}
              </Badge>
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
            <div>
              <span className="text-muted-foreground">Ubicación:</span>
              <div className="font-medium text-lg">{agregado.ubicacion}</div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Proveedor</h4>
              <div className="space-y-1 text-sm">
                <div className="font-medium">{agregado.proveedor}</div>
                <div className="text-muted-foreground">{agregado.contactoProveedor}</div>
              </div>
            </div>
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
                <span className="text-muted-foreground">Precio de Costo:</span>
                <div className="font-medium text-lg">Q{agregado.precioCosto.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">por m³</div>
              </div>
              <div>
                <span className="text-muted-foreground">Precio de Venta:</span>
                <div className="font-medium text-lg text-green-600">Q{agregado.precioVenta.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">por m³</div>
              </div>
            </div>

            <Separator />

            <div>
              <span className="text-muted-foreground">Margen de Ganancia:</span>
              <div className="font-medium text-lg">
                {(((agregado.precioVenta - agregado.precioCosto) / agregado.precioCosto) * 100).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Movimientos Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Movimientos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {movimientos.map((movimiento) => (
                <div key={movimiento.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {movimiento.tipo === "Entrada" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{movimiento.motivo}</div>
                      <div className="text-xs text-muted-foreground">
                        {movimiento.fecha} {movimiento.hora} • {movimiento.responsable}
                      </div>
                    </div>
                  </div>
                  <div className={`font-medium ${movimiento.tipo === "Entrada" ? "text-green-600" : "text-red-600"}`}>
                    {movimiento.tipo === "Entrada" ? "+" : "-"}
                    {movimiento.cantidad} m³
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
