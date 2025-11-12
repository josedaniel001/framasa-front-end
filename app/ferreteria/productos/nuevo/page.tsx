"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function NuevoProductoPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [codigo, setCodigo] = useState<string>("")
  const [nombre, setNombre] = useState<string>("")
  const [descripcion, setDescripcion] = useState<string>("")
  const [categoria, setCategoria] = useState<string>("")
  const [precioVenta, setPrecioVenta] = useState<number>(0)
  const [costoUnitario, setCostoUnitario] = useState<number>(0)
  const [unidadMedida, setUnidadMedida] = useState<string>("")
  const [stockActual, setStockActual] = useState<number>(0)
  const [stockMinimo, setStockMinimo] = useState<number>(0)
  const [activo, setActivo] = useState<boolean>(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigo || !nombre || !categoria || precioVenta <= 0 || costoUnitario <= 0 || !unidadMedida) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios y asegúrate de que los precios sean válidos.",
        variant: "destructive",
      })
      return
    }

    const newProduct = {
      id: `prod-${Date.now()}`, // Generar un ID único
      codigo,
      nombre,
      descripcion,
      categoria,
      precioVenta,
      costoUnitario,
      unidadMedida,
      stockActual,
      stockMinimo,
      activo,
      fechaCreacion: new Date().toISOString().split("T")[0],
      ultimaActualizacion: new Date().toISOString().split("T")[0],
    }

    console.log("Nuevo Producto:", newProduct)
    // Aquí integrarías con tu backend para guardar el producto
    toast({
      title: "Producto Creado",
      description: `El producto ${newProduct.nombre} ha sido registrado exitosamente.`,
    })
    router.push("/ferreteria/productos")
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nuevo Producto</h1>
      <p className="text-muted-foreground">Registra un nuevo producto en el catálogo de ferretería.</p>

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
                placeholder="Nombre del producto"
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
              <Label htmlFor="categoria">Categoría</Label>
              <Input
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ej: Herramientas, Pinturas, Fijaciones"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unidadMedida">Unidad de Medida</Label>
              <Select value={unidadMedida} onValueChange={setUnidadMedida}>
                <SelectTrigger id="unidadMedida">
                  <SelectValue placeholder="Selecciona unidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidad">Unidad</SelectItem>
                  <SelectItem value="caja">Caja</SelectItem>
                  <SelectItem value="galon">Galón</SelectItem>
                  <SelectItem value="litro">Litro</SelectItem>
                  <SelectItem value="metro">Metro</SelectItem>
                  <SelectItem value="pie">Pie</SelectItem>
                  <SelectItem value="kilogramo">Kilogramo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="precioVenta">Precio de Venta (Q)</Label>
              <Input
                id="precioVenta"
                type="number"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(Number(e.target.value))}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="costoUnitario">Costo Unitario (Q)</Label>
              <Input
                id="costoUnitario"
                type="number"
                value={costoUnitario}
                onChange={(e) => setCostoUnitario(Number(e.target.value))}
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
