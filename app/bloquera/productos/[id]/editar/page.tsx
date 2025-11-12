"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getSampleProductosBloquera } from "@/lib/sample-data"
import type { ProductoBloquera } from "@/types/database"
import { ArrowLeft } from "lucide-react"

interface EditarProductoBloqueraPageProps {
  params: {
    id: string
  }
}

export default function EditarProductoBloqueraPage({ params }: EditarProductoBloqueraPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const productos = getSampleProductosBloquera()
  const productoOriginal = productos.find((p) => p.id === params.id)

  const [codigo, setCodigo] = useState<string>(productoOriginal?.codigo || "")
  const [nombre, setNombre] = useState<string>(productoOriginal?.nombre || "")
  const [descripcion, setDescripcion] = useState<string>(productoOriginal?.descripcion || "")
  const [tipoBloque, setTipoBloque] = useState<string>(productoOriginal?.tipoBloque || "")
  const [dimensiones, setDimensiones] = useState<string>(productoOriginal?.dimensiones || "")
  const [precioVentaUnitario, setPrecioVentaUnitario] = useState<number>(productoOriginal?.precioVentaUnitario || 0)
  const [costoProduccionUnitario, setCostoProduccionUnitario] = useState<number>(
    productoOriginal?.costoProduccionUnitario || 0,
  )
  const [stockActual, setStockActual] = useState<number>(productoOriginal?.stockActual || 0)
  const [stockMinimo, setStockMinimo] = useState<number>(productoOriginal?.stockMinimo || 0)
  const [activo, setActivo] = useState<boolean>(productoOriginal?.activo || false)

  useEffect(() => {
    if (!productoOriginal) {
      toast({
        title: "Producto no encontrado",
        description: `El producto con ID ${params.id} no existe.`,
        variant: "destructive",
      })
      router.replace("/bloquera/productos") // Redirigir si el producto no existe
    }
  }, [productoOriginal, params.id, router, toast])

  if (!productoOriginal) {
    return null // O un componente de carga/error
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigo || !nombre || !tipoBloque || !dimensiones || precioVentaUnitario <= 0 || costoProduccionUnitario <= 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios y asegúrate de que los precios sean válidos.",
        variant: "destructive",
      })
      return
    }

    const updatedProduct: ProductoBloquera = {
      ...productoOriginal,
      codigo,
      nombre,
      descripcion,
      tipoBloque,
      dimensiones,
      precioVentaUnitario,
      costoProduccionUnitario,
      stockActual,
      stockMinimo,
      activo,
      ultimaActualizacion: new Date().toISOString().split("T")[0],
    }

    console.log("Producto Bloquera Actualizado:", updatedProduct)
    // Aquí integrarías con tu backend para guardar los cambios
    toast({
      title: "Producto Actualizado",
      description: `El producto ${updatedProduct.nombre} ha sido actualizado exitosamente.`,
    })
    router.push(`/bloquera/productos/${updatedProduct.id}`) // Redirigir a la vista de detalle o lista
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Producto: {productoOriginal.nombre}</h1>
      </div>
      <p className="text-muted-foreground">Modifica la información del producto de bloquera.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Producto</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Código único del producto"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Bloque de 15, Ladrillo Rojo"
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción detallada del producto"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipoBloque">Tipo de Bloque</Label>
              <Input
                id="tipoBloque"
                value={tipoBloque}
                onChange={(e) => setTipoBloque(e.target.value)}
                placeholder="Ej: Bloque de 15, Ladrillo, Adoquín"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dimensiones">Dimensiones</Label>
              <Input
                id="dimensiones"
                value={dimensiones}
                onChange={(e) => setDimensiones(e.target.value)}
                placeholder="Ej: 15x20x40 cm, 6x12x24 cm"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="precioVentaUnitario">Precio de Venta Unitario (Q)</Label>
              <Input
                id="precioVentaUnitario"
                type="number"
                value={precioVentaUnitario}
                onChange={(e) => setPrecioVentaUnitario(Number(e.target.value))}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="costoProduccionUnitario">Costo de Producción Unitario (Q)</Label>
              <Input
                id="costoProduccionUnitario"
                type="number"
                value={costoProduccionUnitario}
                onChange={(e) => setCostoProduccionUnitario(Number(e.target.value))}
                step="0.01"
                min="0"
                required
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
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="activo" checked={activo} onCheckedChange={setActivo} />
              <Label htmlFor="activo">Producto Activo</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Cambios</Button>
        </div>
      </form>
    </div>
  )
}
