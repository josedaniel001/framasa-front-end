"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function NuevoProductoBloqueraPage() {
  const router = useRouter()
  const { toast } = useToast()

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

    const newProduct = {
      id: `bloq-${Date.now()}`, // Generar un ID único
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
      fechaCreacion: new Date().toISOString().split("T")[0],
      ultimaActualizacion: new Date().toISOString().split("T")[0],
    }

    console.log("Nuevo Producto Bloquera:", newProduct)
    // Aquí integrarías con tu backend para guardar el producto
    toast({
      title: "Producto Creado",
      description: `El producto ${newProduct.nombre} ha sido registrado exitosamente.`,
    })
    router.push("/bloquera/productos")
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nuevo Producto (Bloquera)</h1>
      <p className="text-muted-foreground">Registra un nuevo tipo de bloque o adoquín.</p>

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
          <Button type="submit">Crear Producto</Button>
        </div>
      </form>
    </div>
  )
}
