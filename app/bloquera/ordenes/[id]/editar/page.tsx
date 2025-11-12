"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getSampleOrdenesProduccionBloquera, getSampleProductosBloquera } from "@/lib/sample-data"
import type { OrdenProduccionBloquera } from "@/types/database"
import { ArrowLeft } from "lucide-react"

interface EditarOrdenBloqueraPageProps {
  params: {
    id: string
  }
}

export default function EditarOrdenBloqueraPage({ params }: EditarOrdenBloqueraPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const ordenesExistentes = getSampleOrdenesProduccionBloquera()
  const productosBloquera = getSampleProductosBloquera()
  const ordenOriginal = ordenesExistentes.find((o) => o.id === params.id)

  const [productoSeleccionado, setProductoSeleccionado] = useState<string>(ordenOriginal?.productoId || "")
  const [cantidadSolicitada, setCantidadSolicitada] = useState<number>(ordenOriginal?.cantidadSolicitada || 0)
  const [cantidadProducida, setCantidadProducida] = useState<number>(ordenOriginal?.cantidadProducida || 0)
  const [fechaInicio, setFechaInicio] = useState<string>(ordenOriginal?.fechaInicio || "")
  const [fechaFinEstimada, setFechaFinEstimada] = useState<string>(ordenOriginal?.fechaFinEstimada || "")
  const [responsable, setResponsable] = useState<string>(ordenOriginal?.responsable || "")
  const [notas, setNotas] = useState<string>(ordenOriginal?.notas || "")
  const [estadoOrden, setEstadoOrden] = useState<OrdenProduccionBloquera["estado"]>(
    ordenOriginal?.estado || "Pendiente",
  )

  useEffect(() => {
    if (!ordenOriginal) {
      toast({
        title: "Orden de Producción no encontrada",
        description: `La orden con ID ${params.id} no existe.`,
        variant: "destructive",
      })
      router.replace("/bloquera/ordenes")
    }
  }, [ordenOriginal, params.id, router, toast])

  if (!ordenOriginal) {
    return null // O un componente de carga/error
  }

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

    const updatedOrden: OrdenProduccionBloquera = {
      ...ordenOriginal,
      productoId: producto.id,
      nombreProducto: producto.nombre,
      cantidadSolicitada,
      cantidadProducida,
      fechaInicio,
      fechaFinEstimada,
      responsable,
      notas,
      estado: estadoOrden,
    }

    console.log("Orden de Producción Actualizada:", updatedOrden)
    // Aquí integrarías con tu backend para guardar los cambios
    toast({
      title: "Orden de Producción Actualizada",
      description: `La orden ${updatedOrden.codigo} ha sido actualizada exitosamente.`,
    })
    router.push(`/bloquera/ordenes/${updatedOrden.id}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Orden: {ordenOriginal.codigo}</h1>
      </div>
      <p className="text-muted-foreground">Modifica los detalles de la orden de producción existente.</p>

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
              <Label htmlFor="cantidadProducida">Cantidad Producida</Label>
              <Input
                id="cantidadProducida"
                type="number"
                value={cantidadProducida}
                onChange={(e) => setCantidadProducida(Number(e.target.value))}
                min="0"
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
            <div className="grid gap-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Input
                id="responsable"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Nombre del encargado de la producción"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado de la Orden</Label>
              <Select
                value={estadoOrden}
                onValueChange={(value: OrdenProduccionBloquera["estado"]) => setEstadoOrden(value)}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="En Proceso">En Proceso</SelectItem>
                  <SelectItem value="Completada">Completada</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
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
          <Button type="submit">Guardar Cambios</Button>
        </div>
      </form>
    </div>
  )
}
