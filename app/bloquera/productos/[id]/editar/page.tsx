"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPut } from "@/lib/api-client"
import type { ProductoBloquera } from "@/types/database"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"

interface EditarProductoBloqueraPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditarProductoBloqueraPage({ params }: EditarProductoBloqueraPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [producto, setProducto] = useState<ProductoBloquera | null>(null)
  const [codigo, setCodigo] = useState<string>("")
  const [nombre, setNombre] = useState<string>("")
  const [descripcion, setDescripcion] = useState<string>("")
  const [tipoBloque, setTipoBloque] = useState<string>("")
  const [dimensiones, setDimensiones] = useState<string>("")
  const [precioVentaUnitario, setPrecioVentaUnitario] = useState<number>(0)
  const [costoProduccionUnitario, setCostoProduccionUnitario] = useState<number>(0)
  const [stockActual, setStockActual] = useState<number>(0)
  const [stockMinimo, setStockMinimo] = useState<number>(0)
  const [activo, setActivo] = useState<boolean>(true)

  // Cargar producto
  useEffect(() => {
    const loadProducto = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiGet<ProductoBloquera>(`${API_ENDPOINTS.BLOQUERA.PRODUCTOS}/${id}`)
        setProducto(data)
        setCodigo(data.codigo)
        setNombre(data.nombre)
        setDescripcion(data.descripcion || "")
        setTipoBloque(data.tipoBloque || data.tipo_bloque || "")
        setDimensiones(data.dimensiones || "")
        setPrecioVentaUnitario(data.precioVentaUnitario || data.precio_unitario || 0)
        setCostoProduccionUnitario(data.costoProduccionUnitario || data.costo_produccion || 0)
        setStockActual(data.stockActual || data.stock_actual || 0)
        setStockMinimo(data.stockMinimo || data.stock_minimo || 0)
        setActivo(data.activo)
      } catch (err: any) {
        console.error("Error al cargar producto:", err)
        setError(err.message || "Error al cargar el producto")
        toast({
          title: "Error",
          description: "No se pudo cargar el producto. Por favor, inténtelo de nuevo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadProducto()
    }
  }, [id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigo || !nombre || !tipoBloque || precioVentaUnitario <= 0 || costoProduccionUnitario <= 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios y asegúrate de que los precios sean válidos.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const updatedProduct = {
        codigo,
        nombre,
        descripcion: descripcion || null,
        tipoBloque,
        dimensiones: dimensiones || null,
        precioVentaUnitario,
        costoProduccionUnitario,
        stockActual,
        stockMinimo,
        activo,
      }

      await apiPut<any>(`${API_ENDPOINTS.BLOQUERA.PRODUCTOS}/${id}`, updatedProduct)

      toast({
        title: "Producto Actualizado",
        description: `El producto "${nombre}" ha sido actualizado exitosamente.`,
      })
      router.push("/bloquera/productos")
    } catch (error: any) {
      console.error("Error al actualizar producto:", error)
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el producto. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()} disabled={saving}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Producto: {producto.nombre}</h1>
      </div>
      <p className="text-muted-foreground">Modifica la información del producto de bloquera.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Producto</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Código único del producto"
                required
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Bloque de 15, Ladrillo Rojo"
                required
                disabled={saving}
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción detallada del producto"
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipoBloque">Tipo de Bloque *</Label>
              <Input
                id="tipoBloque"
                value={tipoBloque}
                onChange={(e) => setTipoBloque(e.target.value)}
                placeholder="Ej: Bloque de 15, Ladrillo, Adoquín"
                required
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dimensiones">Dimensiones</Label>
              <Input
                id="dimensiones"
                value={dimensiones}
                onChange={(e) => setDimensiones(e.target.value)}
                placeholder="Ej: 15x20x40 cm, 6x12x24 cm"
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="precioVentaUnitario">Precio de Venta Unitario (Q) *</Label>
              <Input
                id="precioVentaUnitario"
                type="number"
                value={precioVentaUnitario}
                onChange={(e) => setPrecioVentaUnitario(Number(e.target.value))}
                step="0.01"
                min="0"
                required
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="costoProduccionUnitario">Costo de Producción Unitario (Q) *</Label>
              <Input
                id="costoProduccionUnitario"
                type="number"
                value={costoProduccionUnitario}
                onChange={(e) => setCostoProduccionUnitario(Number(e.target.value))}
                step="0.01"
                min="0"
                required
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockActual">Stock Actual</Label>
              <Input
                id="stockActual"
                type="number"
                value={stockActual}
                onChange={(e) => setStockActual(Number(e.target.value))}
                min="0"
                required
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockMinimo">Stock Mínimo</Label>
              <Input
                id="stockMinimo"
                type="number"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(Number(e.target.value))}
                min="0"
                required
                disabled={saving}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="activo" checked={activo} onCheckedChange={setActivo} disabled={saving} />
              <Label htmlFor="activo">Producto Activo</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
