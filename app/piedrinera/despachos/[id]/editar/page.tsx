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
import {
  getSampleAgregadosPiedrinera,
  getSampleCamionesPiedrinera,
  getSampleClientesFerreteria,
  getSampleDespachosPiedrinera,
} from "@/lib/sample-data"
import type { DespachoPiedrinera } from "@/types/database"
import { ArrowLeft } from "lucide-react"

interface EditarDespachoPiedrineraPageProps {
  params: {
    id: string
  }
}

export default function EditarDespachoPiedrineraPage({ params }: EditarDespachoPiedrineraPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const agregadosDisponibles = getSampleAgregadosPiedrinera()
  const camionesDisponibles = getSampleCamionesPiedrinera()
  const clientesDisponibles = getSampleClientesFerreteria()
  const despachosExistentes = getSampleDespachosPiedrinera()
  const despachoOriginal = despachosExistentes.find((d) => d.id === params.id)

  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>(despachoOriginal?.cliente || "")
  const [fechaDespacho, setFechaDespacho] = useState<string>(
    despachoOriginal?.fecha || new Date().toISOString().split("T")[0],
  )
  const [camionSeleccionado, setCamionSeleccionado] = useState<string>(despachoOriginal?.camionId || "")
  const [agregadoSeleccionado, setAgregadoSeleccionado] = useState<string>(despachoOriginal?.agregadoId || "")
  const [cantidadMetrosCubicos, setCantidadMetrosCubicos] = useState<number>(
    despachoOriginal?.cantidadMetrosCubicos || 0,
  )
  const [piloto, setPiloto] = useState<string>(despachoOriginal?.piloto || "")
  const [notas, setNotas] = useState<string>(despachoOriginal?.notas || "")
  const [estadoDespacho, setEstadoDespacho] = useState<DespachoPiedrinera["estado"]>(
    despachoOriginal?.estado || "Pendiente",
  )

  useEffect(() => {
    if (!despachoOriginal) {
      toast({
        title: "Despacho no encontrado",
        description: `El despacho con ID ${params.id} no existe.`,
        variant: "destructive",
      })
      router.replace("/piedrinera/despachos")
    } else {
      // Asegurarse de que el cliente seleccionado sea el ID del cliente, no el nombre
      const clienteId = clientesDisponibles.find((c) => c.nombre === despachoOriginal.cliente)?.id || ""
      setClienteSeleccionado(clienteId)
    }
  }, [despachoOriginal, params.id, router, toast, clientesDisponibles])

  if (!despachoOriginal) {
    return null // O un componente de carga/error
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!clienteSeleccionado || !camionSeleccionado || !agregadoSeleccionado || cantidadMetrosCubicos <= 0 || !piloto) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    const cliente = clientesDisponibles.find((c) => c.id === clienteSeleccionado)
    const camion = camionesDisponibles.find((c) => c.id === camionSeleccionado)
    const agregado = agregadosDisponibles.find((a) => a.id === agregadoSeleccionado)

    if (!cliente || !camion || !agregado) {
      toast({
        title: "Error",
        description: "Selecciones inválidas de cliente, camión o agregado.",
        variant: "destructive",
      })
      return
    }

    const precioTotal = cantidadMetrosCubicos * agregado.precioVentaPorMetroCubico

    const updatedDespacho: DespachoPiedrinera = {
      ...despachoOriginal,
      fecha: fechaDespacho,
      cliente: cliente.nombre,
      camionId: camion.id,
      placaCamion: camion.placa,
      piloto,
      agregadoId: agregado.id,
      nombreAgregado: agregado.nombre,
      cantidadMetrosCubicos,
      precioTotal,
      estado: estadoDespacho,
      notas,
    }

    console.log("Despacho Actualizado:", updatedDespacho)
    // Aquí integrarías con tu backend para guardar el despacho
    toast({
      title: "Despacho Actualizado",
      description: `El despacho ${updatedDespacho.codigo} ha sido actualizado exitosamente.`,
    })
    router.push(`/piedrinera/despachos/${updatedDespacho.id}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Despacho: {despachoOriginal.codigo}</h1>
      </div>
      <p className="text-muted-foreground">Modifica los detalles del despacho existente.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Despacho</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Select value={clienteSeleccionado} onValueChange={setClienteSeleccionado}>
                <SelectTrigger id="cliente">
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientesDisponibles.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre} ({cliente.nit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha de Despacho</Label>
              <Input
                id="fecha"
                type="date"
                value={fechaDespacho}
                onChange={(e) => setFechaDespacho(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="camion">Camión</Label>
              <Select value={camionSeleccionado} onValueChange={setCamionSeleccionado}>
                <SelectTrigger id="camion">
                  <SelectValue placeholder="Selecciona un camión" />
                </SelectTrigger>
                <SelectContent>
                  {camionesDisponibles.map((camion) => (
                    <SelectItem key={camion.id} value={camion.id}>
                      {camion.placa} ({camion.marca} {camion.modelo}) - Cap: {camion.capacidadMetrosCubicos}m³
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="piloto">Piloto</Label>
              <Input
                id="piloto"
                value={piloto}
                onChange={(e) => setPiloto(e.target.value)}
                placeholder="Nombre del piloto"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="agregado">Agregado</Label>
              <Select value={agregadoSeleccionado} onValueChange={setAgregadoSeleccionado}>
                <SelectTrigger id="agregado">
                  <SelectValue placeholder="Selecciona un agregado" />
                </SelectTrigger>
                <SelectContent>
                  {agregadosDisponibles.map((agregado) => (
                    <SelectItem key={agregado.id} value={agregado.id}>
                      {agregado.nombre} ({agregado.granulometria}) - Stock: {agregado.stockActualMetrosCubicos}m³
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cantidadMetrosCubicos">Cantidad (m³)</Label>
              <Input
                id="cantidadMetrosCubicos"
                type="number"
                value={cantidadMetrosCubicos}
                onChange={(e) => setCantidadMetrosCubicos(Number(e.target.value))}
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado del Despacho</Label>
              <Select
                value={estadoDespacho}
                onValueChange={(value: DespachoPiedrinera["estado"]) => setEstadoDespacho(value)}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Despachado">Despachado</SelectItem>
                  <SelectItem value="Entregado">Entregado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea
                id="notas"
                placeholder="Cualquier nota relevante sobre el despacho..."
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
