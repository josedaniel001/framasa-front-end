"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Package, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { getSampleProductosFerreteria } from "@/lib/sample-data"

interface VerProductoPageProps {
  params: {
    id: string
  }
}

export default function VerProductoPage({ params }: VerProductoPageProps) {
  const router = useRouter()
  const productos = getSampleProductosFerreteria()
  const producto = productos.find((p) => p.id === params.id)

  useEffect(() => {
    if (!producto) {
      router.replace("/ferreteria/productos")
    }
  }, [producto, router])

  if (!producto) {
    return null
  }

  const margenGanancia = producto.precioVenta - producto.costoUnitario
  const porcentajeGanancia = producto.costoUnitario > 0 
    ? ((margenGanancia / producto.costoUnitario) * 100).toFixed(2)
    : "0"

  const stockBajo = producto.stockActual <= producto.stockMinimo

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/ferreteria/productos">
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
        <Link href={`/ferreteria/productos/${producto.id}/editar`}>
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
            <div className="text-2xl font-bold">{producto.stockActual}</div>
            <p className="text-xs text-muted-foreground">
              {producto.unidadMedida} disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio de Venta</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Q{producto.precioVenta.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Por {producto.unidadMedida}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                <p className="text-base font-semibold">{producto.categoria}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unidad de Medida</p>
                <p className="text-base font-semibold capitalize">{producto.unidadMedida}</p>
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
                <p className="text-2xl font-bold">{producto.stockActual}</p>
                <p className="text-xs text-muted-foreground">{producto.unidadMedida}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Mínimo</p>
                <p className="text-2xl font-bold">{producto.stockMinimo}</p>
                <p className="text-xs text-muted-foreground">{producto.unidadMedida}</p>
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
                <p className="text-2xl font-bold">Q{producto.precioVenta.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Por {producto.unidadMedida}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Costo Unitario</p>
                <p className="text-2xl font-bold">Q{producto.costoUnitario.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Por {producto.unidadMedida}</p>
              </div>
            </div>
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
                  {new Date(producto.fechaCreacion).toLocaleDateString("es-GT", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                <p className="text-base">
                  {new Date(producto.ultimaActualizacion).toLocaleDateString("es-GT", {
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

