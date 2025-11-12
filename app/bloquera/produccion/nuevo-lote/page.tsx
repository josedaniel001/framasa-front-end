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
import { getSampleOrdenesProduccionBloquera } from "@/lib/sample-data"
import type { LoteProduccionBloquera } from "@/types/database"
import { ArrowLeft } from "lucide-react"

export default function NuevoLoteBloqueraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const ordenesProduccion = getSampleOrdenesProduccionBloquera()

  const [ordenSeleccionada, setOrdenSeleccionada] = useState<string>("")
  const [fechaProduccion, setFechaProduccion] = useState<string>(new Date().toISOString().split("T")[0])
  const [cantidadProducida, setCantidadProducida] = useState<number>(0)
  const [cantidadDefectuosa, setCantidadDefectuosa] = useState<number>(0)
  const [calidad, setCalidad] = useState<LoteProduccionBloquera["calidad"]>("Buena")
  const [supervisor, setSupervisor] = useState<string>("")
  const [notas, setNotas] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!ordenSeleccionada || cantidadProducida <= 0 || !fechaProduccion || !supervisor) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    const orden = ordenesProduccion.find((o) => o.id === ordenSeleccionada)
    if (!orden) {
      toast({
        title: "Error",
        description: "Orden de producción seleccionada no válida.",
        variant: "destructive",
      })
      return
    }

    const newLote: LoteProduccionBloquera = {
      id: `lote-${Date.now()}`, // Generar un ID único
      ordenId: orden.id,
      fechaProduccion,
      cantidadProducida,
      cantidadDefectuosa,
      calidad,
      supervisor,
      notas,
    }

    console.log("Nuevo Lote de Producción:", newLote)
    // Aquí integrarías con tu backend para guardar el lote y actualizar la orden
    toast({
      title: "Lote Registrado",
      description: `El lote de ${cantidadProducida} unidades para la orden ${orden.codigo} ha sido registrado.`,
    })
    router.push("/bloquera/produccion")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Registrar Nuevo Lote de Producción</h1>
      </div>
      <p className="text-muted-foreground">Registra un nuevo lote de bloques producido para una orden existente.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Lote</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="orden">Orden de Producción</Label>
              <Select value={ordenSeleccionada} onValueChange={setOrdenSeleccionada}>
                <SelectTrigger id="orden">
                  <SelectValue placeholder="Selecciona una orden" />
                </SelectTrigger>
                <SelectContent>
                  {ordenesProduccion.map((orden) => (
                    <SelectItem key={orden.id} value={orden.id}>
                      {orden.codigo} - {orden.nombreProducto} (Solicitado: {orden.cantidadSolicitada})
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
          <Button type="submit">Registrar Lote</Button>
        </div>
      </form>
    </div>
  )
}
