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
import { getSampleAgregadosPiedrinera } from "@/lib/sample-data"
import type { ProduccionPiedrineraLote } from "@/types/database"

export default function NuevoLoteProduccionPiedrineraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const agregadosDisponibles = getSampleAgregadosPiedrinera()

  const [agregadoSeleccionado, setAgregadoSeleccionado] = useState<string>("")
  const [fechaProduccion, setFechaProduccion] = useState<string>(new Date().toISOString().split("T")[0])
  const [cantidadProducidaMetrosCubicos, setCantidadProducidaMetrosCubicos] = useState<number>(0)
  const [costoTotalLote, setCostoTotalLote] = useState<number>(0)
  const [supervisor, setSupervisor] = useState<string>("")
  const [notas, setNotas] = useState<string>("")

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

    const newLote: ProduccionPiedrineraLote = {
      id: `ppl-${Date.now()}`, // Generar un ID único
      fechaProduccion,
      agregadoId: agregado.id,
      nombreAgregado: agregado.nombre,
      cantidadProducidaMetrosCubicos,
      costoTotalLote,
      supervisor,
      notas,
    }

    console.log("Nuevo Lote de Producción Piedrinera:", newLote)
    // Aquí integrarías con tu backend para guardar el lote
    toast({
      title: "Lote de Producción Registrado",
      description: `El lote de ${cantidadProducidaMetrosCubicos} m³ de ${agregado.nombre} ha sido registrado.`,
    })
    router.push("/piedrinera/produccion")
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Registrar Nuevo Lote de Producción</h1>
      <p className="text-muted-foreground">Registra un nuevo lote de agregados producido.</p>

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
          <Button type="submit">Registrar Lote</Button>
        </div>
      </form>
    </div>
  )
}
