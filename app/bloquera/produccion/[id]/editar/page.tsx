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
import { getSampleOrdenesProduccionBloquera } from "@/lib/sample-data"
import type { LoteProduccionBloquera } from "@/types/database"
import { ArrowLeft } from "lucide-react"

interface EditarLoteBloqueraPageProps {
  params: {
    id: string
  }
}

export default function EditarLoteBloqueraPage({ params }: EditarLoteBloqueraPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const ordenesProduccion = getSampleOrdenesProduccionBloquera()

  // Encontrar el lote específico y su orden padre
  const ordenConLote = ordenesProduccion.find((orden) => orden.lotes.some((lote) => lote.id === params.id))
  const loteOriginal = ordenConLote?.lotes.find((lote) => lote.id === params.id)

  const [fechaProduccion, setFechaProduccion] = useState<string>(loteOriginal?.fechaProduccion || "")
  const [cantidadProducida, setCantidadProducida] = useState<number>(loteOriginal?.cantidadProducida || 0)
  const [cantidadDefectuosa, setCantidadDefectuosa] = useState<number>(loteOriginal?.cantidadDefectuosa || 0)
  const [calidad, setCalidad] = useState<LoteProduccionBloquera["calidad"]>(loteOriginal?.calidad || "Buena")
  const [supervisor, setSupervisor] = useState<string>(loteOriginal?.supervisor || "")
  const [notas, setNotas] = useState<string>(loteOriginal?.notas || "")

  useEffect(() => {
    if (!loteOriginal) {
      toast({
        title: "Lote no encontrado",
        description: `El lote con ID ${params.id} no existe.`,
        variant: "destructive",
      })
      router.replace("/bloquera/produccion")
    }
  }, [loteOriginal, params.id, router, toast])

  if (!loteOriginal) {
    return null // O un componente de carga/error
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (cantidadProducida <= 0 || !fechaProduccion || !supervisor) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    const updatedLote: LoteProduccionBloquera = {
      ...loteOriginal,
      fechaProduccion,
      cantidadProducida,
      cantidadDefectuosa,
      calidad,
      supervisor,
      notas,
    }

    console.log("Lote de Producción Actualizado:", updatedLote)
    // Aquí integrarías con tu backend para guardar los cambios del lote
    // y posiblemente actualizar la orden padre si la cantidad producida total cambia
    toast({
      title: "Lote Actualizado",
      description: `El lote para la orden ${ordenConLote?.codigo} ha sido actualizado exitosamente.`,
    })
    router.push("/bloquera/produccion") // Redirigir a la lista de lotes
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
            <CardTitle>Detalles del Lote</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="orden">Orden de Producción Asociada</Label>
              <Input id="orden" value={ordenConLote?.codigo || "N/A"} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="producto">Producto</Label>
              <Input id="producto" value={ordenConLote?.nombreProducto || "N/A"} disabled />
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
              <Label htmlFor="cantidadProducida">Cantidad Producida</Label>
              <Input
                id="cantidadProducida"
                type="number"
                value={cantidadProducida}
                onChange={(e) => setCantidadProducida(Number(e.target.value))}
                min="1"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cantidadDefectuosa">Cantidad Defectuosa</Label>
              <Input
                id="cantidadDefectuosa"
                type="number"
                value={cantidadDefectuosa}
                onChange={(e) => setCantidadDefectuosa(Number(e.target.value))}
                min="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="calidad">Calidad del Lote</Label>
              <Select value={calidad} onValueChange={(value: LoteProduccionBloquera["calidad"]) => setCalidad(value)}>
                <SelectTrigger id="calidad">
                  <SelectValue placeholder="Selecciona calidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excelente">Excelente</SelectItem>
                  <SelectItem value="Buena">Buena</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Mala">Mala</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
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
