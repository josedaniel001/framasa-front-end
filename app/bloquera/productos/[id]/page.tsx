"use client"

import { useEffect, use, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Package, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface VerProductoBloqueraPageProps {
  params: Promise<{
    id: string
  }>
}

interface ProductoBloquera {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  tipoBloque: string
  dimensiones?: string
  precioVentaUnitario: number
  precioDescuento?: number | null
  costoProduccionUnitario: number
  stockActual: number
  stockMinimo: number
  activo: boolean
  tieneStockBajo?: boolean
  fechaCreacion?: string
  ultimaActualizacion?: string
}

export default function VerProductoBloqueraPage({ params }: VerProductoBloqueraPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = use(params)
  
  const [producto, setProducto] = useState<ProductoBloquera | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProducto = async () => {
      try {
        setLoading(true)
        setError(null)
        const productoRaw = await apiGet<any>(`${API_ENDPOINTS.BLOQUERA.PRODUCTOS}/${id}`)
        
        // Mapear datos del backend (snake_case/camelCase) al formato del frontend
        const productoData: ProductoBloquera = {
          id: String(productoRaw.id || productoRaw.pk || ''),
          codigo: productoRaw.codigo || '',
          nombre: productoRaw.nombre || '',
          descripcion: productoRaw.descripcion || '',
          tipoBloque: productoRaw.tipoBloque || productoRaw.tipo_bloque || '',
          dimensiones: productoRaw.dimensiones || null,
          precioVentaUnitario: productoRaw.precioVentaUnitario || productoRaw.precio_unitario || 0,
          precioDescuento: productoRaw.precioDescuento ?? productoRaw.precio_descuento ?? null,
          costoProduccionUnitario: productoRaw.costoProduccionUnitario || productoRaw.costo_produccion || 0,
          stockActual: productoRaw.stockActual || productoRaw.stock_actual || 0,
          stockMinimo: productoRaw.stockMinimo || productoRaw.stock_minimo || 0,
          activo: productoRaw.activo !== undefined ? productoRaw.activo : true,
          tieneStockBajo: productoRaw.tieneStockBajo ?? productoRaw.tiene_stock_bajo ?? false,
          fechaCreacion: productoRaw.fechaCreacion || productoRaw.created_at || new Date().toISOString(),
          ultimaActualizacion: productoRaw.ultimaActualizacion || productoRaw.updated_at || new Date().toISOString(),
        }
        
        setProducto(productoData)
      } catch (error: any) {
        console.error('Error al cargar producto:', error)
        setError(error.message || "No se pudo cargar el producto.")
        toast({
          title: "Error",
          description: error.message || "No se pudo cargar el producto.",
          variant: "destructive",
        })
        router.replace("/bloquera/productos")
      } finally {
        setLoading(false)
      }
    }

    loadProducto()
  }, [id, router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-center text-destructive">
                {error || "Producto no encontrado"}
              </p>
              <Button onClick={() => router.push("/bloquera/productos")}>
                Volver a Productos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const margenGanancia = producto.precioVentaUnitario - producto.costoProduccionUnitario
  const porcentajeGanancia = producto.costoProduccionUnitario > 0 
    ? ((margenGanancia / producto.costoProduccionUnitario) * 100).toFixed(2)
    : "0"

  const stockBajo = producto.tieneStockBajo || producto.stockActual <= producto.stockMinimo

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/bloquera/productos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{producto.nombre}</h1>
            <p className="text-muted-foreground">Código: {producto.codigo}</p>
          </div>
        </div>
        <Link href={`/bloquera/productos/${producto.id}/editar`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar Producto
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            {producto.activo ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <Badge variant={producto.activo ? "default" : "destructive"} className="text-base px-3 py-1">
              {producto.activo ? "Activo" : "Inactivo"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Actual</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stockBajo ? "text-red-600" : ""}`}>
              {producto.stockActual}
            </div>
            <p className="text-xs text-muted-foreground">
              unidades disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio de Venta</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Q{producto.precioVentaUnitario.toFixed(2)}</div>
            {producto.precioDescuento && producto.precioDescuento > 0 && (
              <p className="text-xs text-muted-foreground line-through">
                Q{producto.precioDescuento.toFixed(2)} con descuento
              </p>
            )}
            <p className="text-xs text-muted-foreground">Por unidad</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen de Ganancia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{porcentajeGanancia}%</div>
            <p className="text-xs text-muted-foreground">
              Q{margenGanancia.toFixed(2)} de ganancia
            </p>
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
                <p className="text-sm font-medium text-muted-foreground">Código</p>
                <p className="text-base font-semibold">{producto.codigo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de Bloque</p>
                <p className="text-base font-semibold">{producto.tipoBloque || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dimensiones</p>
                <p className="text-base font-semibold">{producto.dimensiones || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <Badge variant={producto.activo ? "default" : "destructive"}>
                  {producto.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
            {producto.descripcion && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Descripción</p>
                  <p className="text-base">{producto.descripcion}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Inventario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Actual</p>
                <p className={`text-2xl font-bold ${stockBajo ? "text-red-600" : ""}`}>
                  {producto.stockActual}
                </p>
                <p className="text-xs text-muted-foreground">unidades</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Mínimo</p>
                <p className="text-2xl font-bold">{producto.stockMinimo}</p>
                <p className="text-xs text-muted-foreground">unidades</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              {stockBajo ? (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-500">Stock Bajo</p>
                    <p className="text-xs text-muted-foreground">
                      El stock actual está por debajo del mínimo requerido
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-500">Stock Suficiente</p>
                    <p className="text-xs text-muted-foreground">
                      El stock está por encima del mínimo requerido
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Financiera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precio de Venta</p>
                <p className="text-2xl font-bold">Q{producto.precioVentaUnitario.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Por unidad</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Costo de Producción</p>
                <p className="text-2xl font-bold">Q{producto.costoProduccionUnitario.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Por unidad</p>
              </div>
            </div>
            {producto.precioDescuento && producto.precioDescuento > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Precio con Descuento</p>
                  <p className="text-2xl font-bold text-blue-600">Q{producto.precioDescuento.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Precio promocional</p>
                </div>
              </>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Margen de Ganancia</p>
                <p className="text-2xl font-bold text-green-600">Q{margenGanancia.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Porcentaje</p>
                <p className="text-2xl font-bold text-green-600">{porcentajeGanancia}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
                <p className="text-base">
                  {new Date(producto.fechaCreacion || new Date()).toLocaleDateString("es-GT", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                <p className="text-base">
                  {new Date(producto.ultimaActualizacion || new Date()).toLocaleDateString("es-GT", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

