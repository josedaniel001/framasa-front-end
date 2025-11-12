"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, XCircle } from "lucide-react"
import { getSampleProductosFerreteria, getSampleClientesFerreteria } from "@/lib/sample-data"
import { useToast } from "@/hooks/use-toast"
import { TipoVenta } from "@/types/database"

interface VentaItem {
  productoId: string
  nombreProducto: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export default function NuevaVentaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const productosDisponibles = getSampleProductosFerreteria()
  const clientesDisponibles = getSampleClientesFerreteria()

  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("")
  const [fechaVenta, setFechaVenta] = useState<string>(new Date().toISOString().split("T")[0])
  const [tipoVenta, setTipoVenta] = useState<TipoVenta>(TipoVenta.CONTADO)
  const [fechaVencimiento, setFechaVencimiento] = useState<string>("")
  const [itemsVenta, setItemsVenta] = useState<VentaItem[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("")
  const [cantidadProducto, setCantidadProducto] = useState<number>(1)
  const [notas, setNotas] = useState<string>("")

  // Calcular fecha de vencimiento por defecto (30 días después)
  const calcularFechaVencimiento = () => {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() + 30)
    return fecha.toISOString().split("T")[0]
  }

  // Actualizar fecha de vencimiento cuando cambia el tipo de venta
  const handleTipoVentaChange = (nuevoTipo: TipoVenta) => {
    setTipoVenta(nuevoTipo)
    if (nuevoTipo === TipoVenta.CREDITO && !fechaVencimiento) {
      setFechaVencimiento(calcularFechaVencimiento())
    } else if (nuevoTipo === TipoVenta.CONTADO) {
      setFechaVencimiento("")
    }
  }

  const handleAddProduct = () => {
    const product = productosDisponibles.find((p) => p.id === productoSeleccionado)
    if (product && cantidadProducto > 0) {
      const existingItemIndex = itemsVenta.findIndex((item) => item.productoId === product.id)

      if (existingItemIndex > -1) {
        // Update existing item
        const updatedItems = [...itemsVenta]
        updatedItems[existingItemIndex].cantidad += cantidadProducto
        updatedItems[existingItemIndex].subtotal =
          updatedItems[existingItemIndex].cantidad * updatedItems[existingItemIndex].precioUnitario
        setItemsVenta(updatedItems)
      } else {
        // Add new item
        setItemsVenta([
          ...itemsVenta,
          {
            productoId: product.id,
            nombreProducto: product.nombre,
            cantidad: cantidadProducto,
            precioUnitario: product.precioVenta,
            subtotal: cantidadProducto * product.precioVenta,
          },
        ])
      }
      setProductoSeleccionado("")
      setCantidadProducto(1)
    } else {
      toast({
        title: "Error al agregar producto",
        description: "Por favor, selecciona un producto y una cantidad válida.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveProduct = (productId: string) => {
    setItemsVenta(itemsVenta.filter((item) => item.productoId !== productId))
  }

  const calculateTotal = () => {
    return itemsVenta.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteSeleccionado || itemsVenta.length === 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, selecciona un cliente y añade al menos un producto.",
        variant: "destructive",
      })
      return
    }

    if (tipoVenta === TipoVenta.CREDITO && !fechaVencimiento) {
      toast({
        title: "Error de validación",
        description: "Por favor, ingresa la fecha de vencimiento para ventas a crédito.",
        variant: "destructive",
      })
      return
    }

    const newVenta = {
      id: `venta-${Date.now()}`, // Generar un ID único
      codigo: `V-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      fecha: fechaVenta,
      cliente: clientesDisponibles.find((c) => c.id === clienteSeleccionado)?.nombre || "Cliente Desconocido",
      clienteId: clienteSeleccionado,
      total: calculateTotal(),
      estado: tipoVenta === TipoVenta.CONTADO ? "Completada" : "Pendiente",
      tipoVenta: tipoVenta,
      fechaVencimiento: tipoVenta === TipoVenta.CREDITO ? fechaVencimiento : undefined,
      montoPagado: tipoVenta === TipoVenta.CONTADO ? calculateTotal() : 0,
      saldoPendiente: tipoVenta === TipoVenta.CREDITO ? calculateTotal() : 0,
      estadoPago: tipoVenta === TipoVenta.CONTADO ? "pagado" : "pendiente",
      items: itemsVenta,
      notas: notas,
    }

    console.log("Nueva Venta:", newVenta)
    // Aquí integrarías con tu backend para guardar la venta
    toast({
      title: "Venta Creada",
      description: `La venta ${newVenta.codigo} ha sido registrada exitosamente.`,
    })
    router.push("/ferreteria/ventas")
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nueva Venta</h1>
      <p className="text-muted-foreground">Registra una nueva transacción de venta en el sistema.</p>

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
            <div className="grid gap-2">
              <Label htmlFor="tipoVenta">Tipo de Venta</Label>
              <Select value={tipoVenta} onValueChange={(value) => handleTipoVentaChange(value as TipoVenta)}>
                <SelectTrigger id="tipoVenta">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TipoVenta.CONTADO}>Contado</SelectItem>
                  <SelectItem value={TipoVenta.CREDITO}>Crédito / Fiado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {tipoVenta === TipoVenta.CREDITO && (
              <div className="grid gap-2">
                <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
                <Input
                  id="fechaVencimiento"
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  min={fechaVenta}
                  required
                />
              </div>
            )}
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
            <CardTitle>Productos de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-[3fr_1fr_auto]">
              <div className="grid gap-2">
                <Label htmlFor="producto">Producto</Label>
                <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
                  <SelectTrigger id="producto">
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productosDisponibles.map((producto) => (
                      <SelectItem key={producto.id} value={producto.id}>
                        {producto.nombre} (Q{producto.precioVenta.toFixed(2)}) - Stock: {producto.stockActual}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  value={cantidadProducto}
                  onChange={(e) => setCantidadProducto(Number(e.target.value))}
                  min="1"
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
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio Unitario</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsVenta.map((item) => (
                    <TableRow key={item.productoId}>
                      <TableCell className="font-medium">{item.nombreProducto}</TableCell>
                      <TableCell>{item.cantidad}</TableCell>
                      <TableCell>Q{item.precioUnitario.toFixed(2)}</TableCell>
                      <TableCell>Q{item.subtotal.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(item.productoId)}>
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
              <p className="text-center text-muted-foreground">No hay productos añadidos a la venta.</p>
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
