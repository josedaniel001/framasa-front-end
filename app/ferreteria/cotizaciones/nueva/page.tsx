"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, XCircle } from "lucide-react"
import { getSampleProductosFerreteria, getSampleClientesFerreteria } from "@/lib/sample-data"
import { useToast } from "@/hooks/use-toast"

interface CotizacionItem {
  productoId: string
  nombreProducto: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export default function NuevaCotizacionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const productosDisponibles = getSampleProductosFerreteria()
  const clientesDisponibles = getSampleClientesFerreteria()

  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("")
  const [fechaCotizacion, setFechaCotizacion] = useState<string>(new Date().toISOString().split("T")[0])
  const [itemsCotizacion, setItemsCotizacion] = useState<CotizacionItem[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("")
  const [cantidadProducto, setCantidadProducto] = useState<number>(1)
  const [notas, setNotas] = useState<string>("")

  const handleAddProduct = () => {
    const product = productosDisponibles.find((p) => p.id === productoSeleccionado)
    if (product && cantidadProducto > 0) {
      const existingItemIndex = itemsCotizacion.findIndex((item) => item.productoId === product.id)

      if (existingItemIndex > -1) {
        // Update existing item
        const updatedItems = [...itemsCotizacion]
        updatedItems[existingItemIndex].cantidad += cantidadProducto
        updatedItems[existingItemIndex].subtotal =
          updatedItems[existingItemIndex].cantidad * updatedItems[existingItemIndex].precioUnitario
        setItemsCotizacion(updatedItems)
      } else {
        // Add new item
        setItemsCotizacion([
          ...itemsCotizacion,
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
    setItemsCotizacion(itemsCotizacion.filter((item) => item.productoId !== productId))
  }

  const calculateTotal = () => {
    return itemsCotizacion.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteSeleccionado || itemsCotizacion.length === 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, selecciona un cliente y añade al menos un producto.",
        variant: "destructive",
      })
      return
    }

    const newCotizacion = {
      id: `cot-${Date.now()}`, // Generar un ID único
      codigo: `C-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      fecha: fechaCotizacion,
      cliente: clientesDisponibles.find((c) => c.id === clienteSeleccionado)?.nombre || "Cliente Desconocido",
      total: calculateTotal(),
      estado: "Pendiente" as const, // Estado inicial
      items: itemsCotizacion,
      notas: notas,
    }

    console.log("Nueva Cotización:", newCotizacion)
    // Aquí integrarías con tu backend para guardar la cotización
    toast({
      title: "Cotización Creada",
      description: `La cotización ${newCotizacion.codigo} ha sido registrada exitosamente.`,
    })
    router.push("/ferreteria/cotizaciones")
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nueva Cotización</h1>
      <p className="text-muted-foreground">Genera una nueva cotización para un cliente.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Cotización</CardTitle>
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
              <Label htmlFor="fecha">Fecha de Cotización</Label>
              <Input
                id="fecha"
                type="date"
                value={fechaCotizacion}
                onChange={(e) => setFechaCotizacion(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea
                id="notas"
                placeholder="Cualquier nota relevante sobre la cotización..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos de la Cotización</CardTitle>
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

            {itemsCotizacion.length > 0 && (
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
                  {itemsCotizacion.map((item) => (
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
            {itemsCotizacion.length === 0 && (
              <p className="text-center text-muted-foreground">No hay productos añadidos a la cotización.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de la Cotización</CardTitle>
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
          <Button type="submit">Crear Cotización</Button>
        </div>
      </form>
    </div>
  )
}
