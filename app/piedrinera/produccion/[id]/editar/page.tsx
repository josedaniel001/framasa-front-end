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
import { getSampleAgregadosPiedrinera, getSampleProduccionPiedrinera } from "@/lib/sample-data"
import type { ProduccionPiedrineraLote } from "@/types/database"
import { ArrowLeft } from "lucide-react"

interface EditarLoteProduccionPiedrineraPageProps {
  params: {
    id: string
  }
}

export default function EditarLoteProduccionPiedrineraPage({ params }: EditarLoteProduccionPiedrineraPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const lotesProduccion = getSampleProduccionPiedrinera()
  const agregadosDisponibles = getSampleAgregadosPiedrinera()
  const loteOriginal = lotesProduccion.find((l) => l.id === params.id)

  const [agregadoSeleccionado, setAgregadoSeleccionado] = useState<string>(loteOriginal?.agregadoId || "")
  const [fechaProduccion, setFechaProduccion] = useState<string>(loteOriginal?.fechaProduccion || "")
  const [cantidadProducidaMetrosCubicos, setCantidadProducidaMetrosCubicos] = useState<number>(
    loteOriginal?.cantidadProducidaMetrosCubicos || 0,
  )
  const [costoTotalLote, setCostoTotalLote] = useState<number>(loteOriginal?.costoTotalLote || 0)
  const [supervisor, setSupervisor] = useState<string>(loteOriginal?.supervisor || "")
  const [notas, setNotas] = useState<string>(loteOriginal?.notas || "")

  useEffect(() => {
    if (!loteOriginal) {
      toast({
        title: "Lote no encontrado",
        description: `El lote con ID ${params.id} no existe.`,
        variant: "destructive",
      })
      router.replace("/piedrinera/produccion")
    }
  }, [loteOriginal, params.id, router, toast])

  if (!loteOriginal) {
    return null // O un componente de carga/error
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !agregadoSeleccionado ||
      cantidadProducidaMetrosCubicos <= 0 ||
      costoTotalLote <= 0 ||
      !fechaProduccion ||
      !supervisor
    ) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios y asegúrate de que los valores sean válidos.",
        variant: "destructive",
      })
      return
    }

    const agregado = agregadosDisponibles.find((a) => a.id === agregadoSeleccionado)
    if (!agregado) {
      toast({
        title: "Error",
        description: "Agregado seleccionado no válido.",
        variant: "destructive",
      })
      return
    }

    const updatedLote: ProduccionPiedrineraLote = {
      ...loteOriginal,
      fechaProduccion,
      agregadoId: agregado.id,
      nombreAgregado: agregado.nombre,
      cantidadProducidaMetrosCubicos,
      costoTotalLote,
      supervisor,
      notas,
    }

    console.log("Lote de Producción Actualizado:", updatedLote)
    // Aquí integrarías con tu backend para guardar los cambios del lote
    toast({
      title: "Lote Actualizado",
      description: `El lote de ${updatedLote.cantidadProducidaMetrosCubicos} m³ de ${updatedLote.nombreAgregado} ha sido actualizado exitosamente.`,
    })
    router.push("/piedrinera/produccion")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Lote: {loteOriginal.id.substring(0, 8)}...</h1>
      </div>
      <p className="text-muted-foreground">Modifica los detalles del lote de producción.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Lote de Producción</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="agregado">Agregado Producido</Label>
              <Select value={agregadoSeleccionado} onValueChange={setAgregadoSeleccionado}>
                <SelectTrigger id="agregado">
                  <SelectValue placeholder="Selecciona un agregado" />
                </SelectTrigger>
                <SelectContent>
                  {agregadosDisponibles.map((agregado) => (
                    <SelectItem key={agregado.id} value={agregado.id}>
                      {agregado.nombre} ({agregado.granulometria})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaProduccion">Fecha de Producción</Label>
              <Input
                id="fechaProduccion"
                type="date"
                value={fechaProduccion}
                onChange={(e) => setFechaProduccion(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cantidadProducidaMetrosCubicos">Cantidad Producida (m³)</Label>
              <Input
                id="cantidadProducidaMetrosCubicos"
                type="number"
                value={cantidadProducidaMetrosCubicos}
                onChange={(e) => setCantidadProducidaMetrosCubicos(Number(e.target.value))}
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="costoTotalLote">Costo Total del Lote (Q)</Label>
              <Input
                id="costoTotalLote"
                type="number"
                value={costoTotalLote}
                onChange={(e) => setCostoTotalLote(Number(e.target.value))}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="supervisor">Supervisor</Label>
              <Input
                id="supervisor"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                placeholder="Nombre del supervisor"
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea
                id="notas"
                placeholder="Cualquier nota relevante sobre el lote de producción..."
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
