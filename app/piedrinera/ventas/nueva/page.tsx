"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, XCircle } from "lucide-react"
import { getSampleAgregadosPiedrinera, getSampleClientesFerreteria } from "@/lib/sample-data"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface VentaItem {
  agregadoId: string
  nombreAgregado: string
  cantidadMetrosCubicos: number
  precioUnitario: number
  subtotal: number
}

export default function NuevaVentaPiedrineraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const agregadosDisponibles = getSampleAgregadosPiedrinera()
  const clientesDisponibles = getSampleClientesFerreteria()

  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("")
  const [fechaVenta, setFechaVenta] = useState<string>(new Date().toISOString().split("T")[0])
  const [itemsVenta, setItemsVenta] = useState<VentaItem[]>([])
  const [agregadoSeleccionado, setAgregadoSeleccionado] = useState<string>("")
  const [cantidadMetrosCubicos, setCantidadMetrosCubicos] = useState<number>(0)
  const [notas, setNotas] = useState<string>("")

  const handleAddProduct = () => {
    const agregado = agregadosDisponibles.find((a) => a.id === agregadoSeleccionado)
    if (agregado && cantidadMetrosCubicos > 0) {
      const existingItemIndex = itemsVenta.findIndex((item) => item.agregadoId === agregado.id)

      if (existingItemIndex > -1) {
        const updatedItems = [...itemsVenta]
        updatedItems[existingItemIndex].cantidadMetrosCubicos += cantidadMetrosCubicos
        updatedItems[existingItemIndex].subtotal =
          updatedItems[existingItemIndex].cantidadMetrosCubicos * updatedItems[existingItemIndex].precioUnitario
        setItemsVenta(updatedItems)
      } else {
        setItemsVenta([
          ...itemsVenta,
          {
            agregadoId: agregado.id,
            nombreAgregado: agregado.nombre,
            cantidadMetrosCubicos,
            precioUnitario: agregado.precioVentaPorMetroCubico,
            subtotal: cantidadMetrosCubicos * agregado.precioVentaPorMetroCubico,
          },
        ])
      }
      setAgregadoSeleccionado("")
      setCantidadMetrosCubicos(0)
    } else {
      toast({
        title: "Error al agregar agregado",
        description: "Por favor, selecciona un agregado y una cantidad válida.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveProduct = (agregadoId: string) => {
    setItemsVenta(itemsVenta.filter((item) => item.agregadoId !== agregadoId))
  }

  const calculateTotal = () => {
    return itemsVenta.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteSeleccionado || itemsVenta.length === 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, selecciona un cliente y añade al menos un agregado.",
        variant: "destructive",
      })
      return
    }

    const newVenta = {
      id: `venta-${Date.now()}`, // Generar un ID único
      codigo: `VP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      fecha: fechaVenta,
      cliente: clientesDisponibles.find((c) => c.id === clienteSeleccionado)?.nombre || "Cliente Desconocido",
      total: calculateTotal(),
      estado: "Pendiente" as const, // Estado inicial
      items: itemsVenta,
      notas: notas,
    }

    console.log("Nueva Venta:", newVenta)
    // Aquí integrarías con tu backend para guardar la venta
    toast({
      title: "Venta Creada",
      description: `La venta ${newVenta.codigo} ha sido registrada exitosamente.`,
    })
    router.push("/piedrinera/ventas")
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nueva Venta (Piedrinera)</h1>
      <p className="text-muted-foreground">Registra una nueva transacción de venta de agregados.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Venta</CardTitle>
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
              <Label htmlFor="fecha">Fecha de Venta</Label>
              <Input
                id="fecha"
                type="date"
                value={fechaVenta}
                onChange={(e) => setFechaVenta(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea
                id="notas"
                placeholder="Cualquier nota relevante sobre la venta..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agregados de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-[3fr_1fr_auto]">
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
              <div className="flex items-end">
                <Button type="button" onClick={handleAddProduct}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar
                </Button>
              </div>
            </div>

            {itemsVenta.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agregado</TableHead>
                    <TableHead>Cantidad (m³)</TableHead>
                    <TableHead>Precio Unitario</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsVenta.map((item) => (
                    <TableRow key={item.agregadoId}>
                      <TableCell className="font-medium">{item.nombreAgregado}</TableCell>
                      <TableCell>{item.cantidadMetrosCubicos}</TableCell>
                      <TableCell>Q{item.precioUnitario.toFixed(2)}</TableCell>
                      <TableCell>Q{item.subtotal.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(item.agregadoId)}>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {itemsVenta.length === 0 && (
              <p className="text-center text-muted-foreground">No hay agregados añadidos a la venta.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <Label className="text-lg font-semibold">Total:</Label>
            <span className="text-2xl font-bold">Q{calculateTotal().toFixed(2)}</span>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit">Crear Venta</Button>
        </div>
      </form>
    </div>
  )
}
