"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getSampleProductosBloquera } from "@/lib/sample-data"

export default function NuevaOrdenBloqueraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const productosBloquera = getSampleProductosBloquera()

  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("")
  const [cantidadSolicitada, setCantidadSolicitada] = useState<number>(0)
  const [fechaInicio, setFechaInicio] = useState<string>(new Date().toISOString().split("T")[0])
  const [fechaFinEstimada, setFechaFinEstimada] = useState<string>("")
  const [responsable, setResponsable] = useState<string>("")
  const [notas, setNotas] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!productoSeleccionado || cantidadSolicitada <= 0 || !fechaInicio || !responsable) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    const producto = productosBloquera.find((p) => p.id === productoSeleccionado)
    if (!producto) {
      toast({
        title: "Error",
        description: "Producto seleccionado no válido.",
        variant: "destructive",
      })
      return
    }

    const newOrden = {
      id: `opb-${Date.now()}`, // Generar un ID único
      codigo: `OP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      fechaCreacion: new Date().toISOString().split("T")[0],
      fechaInicio,
      fechaFinEstimada,
      productoId: producto.id,
      nombreProducto: producto.nombre,
      cantidadSolicitada,
      cantidadProducida: 0, // Inicialmente 0
      estado: "Pendiente" as const,
      responsable,
      notas,
      lotes: [],
    }

    console.log("Nueva Orden de Producción:", newOrden)
    // Aquí integrarías con tu backend para guardar la orden
    toast({
      title: "Orden de Producción Creada",
      description: `La orden ${newOrden.codigo} ha sido registrada exitosamente.`,
    })
    router.push("/bloquera/ordenes")
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nueva Orden de Producción</h1>
      <p className="text-muted-foreground">Crea una nueva orden para la fabricación de bloques.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Orden</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="producto">Producto a Producir</Label>
              <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
                <SelectTrigger id="producto">
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {productosBloquera.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id}>
                      {producto.nombre} ({producto.dimensiones})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cantidadSolicitada">Cantidad Solicitada</Label>
              <Input
                id="cantidadSolicitada"
                type="number"
                value={cantidadSolicitada}
                onChange={(e) => setCantidadSolicitada(Number(e.target.value))}
                min="1"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaFinEstimada">Fecha Fin Estimada</Label>
              <Input
                id="fechaFinEstimada"
                type="date"
                value={fechaFinEstimada}
                onChange={(e) => setFechaFinEstimada(e.target.value)}
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Input
                id="responsable"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Nombre del encargado de la producción"
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea
                id="notas"
                placeholder="Cualquier nota relevante sobre la orden de producción..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit">Crear Orden</Button>
        </div>
      </form>
    </div>
  )
}
