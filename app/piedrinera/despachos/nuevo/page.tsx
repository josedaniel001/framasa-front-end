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
import {
  getSampleAgregadosPiedrinera,
  getSampleCamionesPiedrinera,
  getSampleClientesFerreteria,
} from "@/lib/sample-data"

export default function NuevoDespachoPiedrineraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const agregadosDisponibles = getSampleAgregadosPiedrinera()
  const camionesDisponibles = getSampleCamionesPiedrinera()
  const clientesDisponibles = getSampleClientesFerreteria() // Reutilizando clientes de ferretería

  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("")
  const [fechaDespacho, setFechaDespacho] = useState<string>(new Date().toISOString().split("T")[0])
  const [camionSeleccionado, setCamionSeleccionado] = useState<string>("")
  const [agregadoSeleccionado, setAgregadoSeleccionado] = useState<string>("")
  const [cantidadMetrosCubicos, setCantidadMetrosCubicos] = useState<number>(0)
  const [piloto, setPiloto] = useState<string>("")
  const [notas, setNotas] = useState<string>("")

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

    const newDespacho = {
      id: `desp-${Date.now()}`, // Generar un ID único
      codigo: `D-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      fecha: fechaDespacho,
      cliente: cliente.nombre,
      camionId: camion.id,
      placaCamion: camion.placa,
      piloto,
      agregadoId: agregado.id,
      nombreAgregado: agregado.nombre,
      cantidadMetrosCubicos,
      precioTotal,
      estado: "Pendiente" as const, // Estado inicial
      notas,
    }

    console.log("Nuevo Despacho:", newDespacho)
    // Aquí integrarías con tu backend para guardar el despacho
    toast({
      title: "Despacho Creado",
      description: `El despacho ${newDespacho.codigo} ha sido registrado exitosamente.`,
    })
    router.push("/piedrinera/despachos")
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nuevo Despacho</h1>
      <p className="text-muted-foreground">Registra un nuevo despacho de agregados.</p>

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
          <Button type="submit">Crear Despacho</Button>
        </div>
      </form>
    </div>
  )
}
