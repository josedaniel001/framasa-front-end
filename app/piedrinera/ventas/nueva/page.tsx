"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, XCircle, Loader2 } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"
import { AgregarPagosMultiplesDialog } from "@/components/facturacion/agregar-pagos-multiples-dialog"

interface Cliente {
  id: number
  nombre: string
  nit?: string
}

interface AgregadoDisponible {
  id: number | string
  codigo: string
  nombre: string
  precioVentaPorMetroCubico: number
  stockActualMetrosCubicos: number
  granulometria?: string
}

interface DetalleFactura {
  producto_id: number | string
  producto_empresa: string
  producto_codigo: string
  producto_nombre: string
  cantidad: number
  precio_unitario: number
  precio_original: number
  descuento: number
  subtotal: number
}

export default function NuevaVentaPiedrineraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [agregadosDisponibles, setAgregadosDisponibles] = useState<AgregadoDisponible[]>([])

  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("")
  const [fechaVencimiento, setFechaVencimiento] = useState<string>("")
  const [detalles, setDetalles] = useState<DetalleFactura[]>([])
  const [agregadoSeleccionado, setAgregadoSeleccionado] = useState<string>("")
  const [cantidadMetrosCubicos, setCantidadMetrosCubicos] = useState<number>(0)
  const [precioUnitario, setPrecioUnitario] = useState<number>(0)
  const [observaciones, setObservaciones] = useState<string>("")
  const [facturaCreada, setFacturaCreada] = useState<any>(null)
  const [facturaCreadaId, setFacturaCreadaId] = useState<number | null>(null)
  const [showPagosDialog, setShowPagosDialog] = useState(false)

  // Cargar datos al montar
  useEffect(() => {
    loadClientes()
    loadAgregados()
  }, [])

  const loadClientes = async () => {
    try {
      const data = await apiGet<any>(API_ENDPOINTS.FERRETERIA.CLIENTES)
      const clientesData = Array.isArray(data) ? data : data?.results || data?.data || []
      setClientes(clientesData)
    } catch (error) {
      console.error("Error al cargar clientes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAgregados = async () => {
    try {
      const data = await apiGet<any>(API_ENDPOINTS.PIEDRINERA.PRODUCTOS)
      const agregadosData = Array.isArray(data) ? data : data?.results || data?.data || []
      
      const agregados: AgregadoDisponible[] = agregadosData
        .filter((p: any) => p.activo && (p.stockActualMetrosCubicos || p.stockActual || p.stock_actual_m3 || 0) > 0)
        .map((p: any) => ({
          id: p.id,
          codigo: p.codigo || "",
          nombre: p.nombre || "",
          precioVentaPorMetroCubico: p.precioVentaPorMetroCubico || p.precio_venta_m3 || 0,
          stockActualMetrosCubicos: p.stockActualMetrosCubicos || p.stockActual || p.stock_actual_m3 || 0,
          granulometria: p.granulometria || "",
        }))

      setAgregadosDisponibles(agregados)
    } catch (error) {
      console.error("Error al cargar agregados:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los agregados",
        variant: "destructive",
      })
    }
  }

  // Convertir agregados a opciones para el selector con búsqueda
  const agregadosOptions: SearchableSelectOption[] = useMemo(() => {
    return agregadosDisponibles.map((agregado) => ({
      value: `${agregado.id}`,
      label: agregado.nombre,
      description: `${agregado.codigo} | Q${agregado.precioVentaPorMetroCubico.toFixed(2)}/m³ | Stock: ${agregado.stockActualMetrosCubicos.toFixed(2)} m³${agregado.granulometria ? ` | ${agregado.granulometria}` : ""}`,
    }))
  }, [agregadosDisponibles])

  // Convertir clientes a opciones para el selector con búsqueda
  const clientesOptions: SearchableSelectOption[] = useMemo(() => {
    return clientes.map((cliente) => ({
      value: cliente.id.toString(),
      label: cliente.nombre,
      description: cliente.nit ? `NIT: ${cliente.nit}` : "",
    }))
  }, [clientes])

  const handleAgregadoChange = (value: string) => {
    setAgregadoSeleccionado(value)
    const agregado = agregadosDisponibles.find((a) => a.id.toString() === value)
    if (agregado) {
      setPrecioUnitario(agregado.precioVentaPorMetroCubico)
    }
  }

  const handleClearFields = () => {
    setAgregadoSeleccionado("")
    setCantidadMetrosCubicos(0)
    setPrecioUnitario(0)
  }

  const handleAddProduct = () => {
    // Solo validar si hay un producto seleccionado
    if (!agregadoSeleccionado) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un agregado.",
        variant: "destructive",
      })
      return
    }

    const agregado = agregadosDisponibles.find((a) => a.id.toString() === agregadoSeleccionado)
    if (!agregado) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un agregado válido.",
        variant: "destructive",
      })
      return
    }

    if (!cantidadMetrosCubicos || cantidadMetrosCubicos <= 0) {
      toast({
        title: "Error",
        description: "La cantidad debe ser mayor a cero.",
        variant: "destructive",
      })
      return
    }

    if (cantidadMetrosCubicos > agregado.stockActualMetrosCubicos) {
      toast({
        title: "Error",
        description: `Stock insuficiente. Stock disponible: ${agregado.stockActualMetrosCubicos.toFixed(2)} m³`,
        variant: "destructive",
      })
      return
    }

    if (!precioUnitario || precioUnitario <= 0) {
      toast({
        title: "Error",
        description: "El precio unitario debe ser mayor a cero.",
        variant: "destructive",
      })
      return
    }

    const existingItemIndex = detalles.findIndex((item) => item.producto_id.toString() === agregado.id.toString())

    if (existingItemIndex > -1) {
      const updatedItems = [...detalles]
      const nuevaCantidad = updatedItems[existingItemIndex].cantidad + cantidadMetrosCubicos
      if (nuevaCantidad > agregado.stockActualMetrosCubicos) {
        toast({
          title: "Error",
          description: `Stock insuficiente. Stock disponible: ${agregado.stockActualMetrosCubicos.toFixed(2)} m³`,
          variant: "destructive",
        })
        return
      }
      updatedItems[existingItemIndex].cantidad = nuevaCantidad
      updatedItems[existingItemIndex].subtotal = nuevaCantidad * updatedItems[existingItemIndex].precio_unitario
      setDetalles(updatedItems)
    } else {
      const subtotal = cantidadMetrosCubicos * precioUnitario
      setDetalles([
        ...detalles,
        {
          producto_id: agregado.id,
          producto_empresa: "PIEDRINERA",
          producto_codigo: agregado.codigo,
          producto_nombre: agregado.nombre,
          cantidad: cantidadMetrosCubicos,
          precio_unitario: precioUnitario,
          precio_original: agregado.precioVentaPorMetroCubico,
          descuento: 0,
          subtotal: subtotal,
        },
      ])
    }

    handleClearFields()
  }

  const handleRemoveProduct = (productoId: string | number) => {
    setDetalles(detalles.filter((item) => item.producto_id.toString() !== productoId.toString()))
  }

  const handleUpdateDetalle = (index: number, field: "cantidad" | "precio_unitario" | "descuento", value: number) => {
    const updatedItems = [...detalles]
    const item = updatedItems[index]
    const agregado = agregadosDisponibles.find((a) => a.id.toString() === item.producto_id.toString())

    if (field === "cantidad") {
      if (value <= 0) {
        // No mostrar error, solo no actualizar
        return
      }
      if (agregado && value > agregado.stockActualMetrosCubicos) {
        toast({
          title: "Error",
          description: `Stock insuficiente. Stock disponible: ${agregado.stockActualMetrosCubicos.toFixed(2)} m³`,
          variant: "destructive",
        })
        return
      }
      item.cantidad = value
    } else if (field === "precio_unitario") {
      if (value < 0) {
        // No mostrar error, solo no actualizar
        return
      }
      item.precio_unitario = value
    } else if (field === "descuento") {
      if (value < 0) {
        // No mostrar error, solo no actualizar
        return
      }
      item.descuento = value
    }

    item.subtotal = item.cantidad * item.precio_unitario - item.descuento
    setDetalles(updatedItems)
  }

  const calculateSubtotal = () => {
    return detalles.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const calculateDescuentoTotal = () => {
    return detalles.reduce((sum, item) => sum + item.descuento, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!clienteSeleccionado) {
      toast({
        title: "Error de validación",
        description: "Por favor, selecciona un cliente.",
        variant: "destructive",
      })
      return
    }

    if (detalles.length === 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, añade al menos un agregado a la venta.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Calcular descuento total (diferencia entre precio original y con descuentos)
      const subtotalOriginal = detalles.reduce((sum, d) => sum + (d.cantidad * d.precio_original), 0)
      const subtotalConDescuento = calculateSubtotal()
      const descuentoCalculado = subtotalOriginal - subtotalConDescuento

      const facturaData = {
        empresa: "PIEDRINERA",
        cliente: parseInt(clienteSeleccionado),
        descuento: descuentoCalculado > 0 ? descuentoCalculado : 0,
        observaciones: observaciones.trim() || undefined,
        fecha_vencimiento: fechaVencimiento || undefined,
        detalles: detalles.map((det) => ({
          producto_id: typeof det.producto_id === "string" ? parseInt(det.producto_id) : det.producto_id,
          producto_empresa: det.producto_empresa,
          cantidad: det.cantidad,
          precio_unitario: det.precio_unitario,
          descuento: det.descuento || 0,
        })),
      }

      console.log("Enviando datos a la API:", JSON.stringify(facturaData, null, 2))
      
      const factura = await apiPost<any>(API_ENDPOINTS.FACTURACION.FACTURAS, facturaData)
      
      console.log("Respuesta completa de la API:", factura)
      console.log("Tipo de respuesta:", typeof factura)
      console.log("Keys de la respuesta:", factura ? Object.keys(factura) : "null")
      
      // Manejar diferentes estructuras de respuesta
      const facturaId = factura?.id ?? factura?.factura?.id ?? factura?.data?.id ?? null
      const numeroFactura = factura?.numero_factura ?? factura?.factura?.numero_factura ?? factura?.data?.numero_factura ?? "N/A"

      if (!facturaId) {
        console.error("Respuesta completa de la API (sin ID):", JSON.stringify(factura, null, 2))
        throw new Error("No se pudo obtener el ID de la factura generada")
      }

      toast({
        title: "Factura Creada",
        description: `Factura ${numeroFactura} creada exitosamente`,
      })

      // Guardar la factura creada y mostrar diálogo de pagos
      setFacturaCreada(factura)
      setFacturaCreadaId(facturaId)
      setShowPagosDialog(true)
    } catch (error: any) {
      console.error("Error al crear venta:", error)
      toast({
        title: "Error",
        description: error?.response?.data?.error || error?.message || "No se pudo crear la venta",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
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
              <Label htmlFor="cliente">Cliente *</Label>
              <SearchableSelect
                options={clientesOptions}
                value={clienteSeleccionado}
                onValueChange={setClienteSeleccionado}
                placeholder="Selecciona un cliente"
                searchPlaceholder="Buscar cliente..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
              <Input
                id="fechaVencimiento"
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="notas">Observaciones</Label>
              <Textarea
                id="notas"
                placeholder="Cualquier nota relevante sobre la venta..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agregados de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-[3fr_1fr_1fr_auto]">
              <div className="grid gap-2">
                <Label htmlFor="agregado">Agregado</Label>
                <SearchableSelect
                  options={agregadosOptions}
                  value={agregadoSeleccionado}
                  onValueChange={handleAgregadoChange}
                  placeholder="Selecciona un agregado"
                  searchPlaceholder="Buscar agregado..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cantidadMetrosCubicos">Cantidad (m³)</Label>
                <Input
                  id="cantidadMetrosCubicos"
                  type="number"
                  value={cantidadMetrosCubicos || ""}
                  onChange={(e) => setCantidadMetrosCubicos(Number(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precioUnitario">Precio Unitario (Q)</Label>
                <Input
                  id="precioUnitario"
                  type="number"
                  value={precioUnitario || ""}
                  onChange={(e) => setPrecioUnitario(Number(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button type="button" variant="outline" onClick={handleClearFields} disabled={!agregadoSeleccionado && !cantidadMetrosCubicos && !precioUnitario}>
                  Limpiar
                </Button>
                <Button type="button" onClick={handleAddProduct}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar
                </Button>
              </div>
            </div>

            {detalles.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agregado</TableHead>
                    <TableHead>Cantidad (m³)</TableHead>
                    <TableHead>Precio Unitario</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalles.map((item, index) => (
                    <TableRow key={`${item.producto_id}-${index}`}>
                      <TableCell className="font-medium">{item.producto_nombre}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.cantidad}
                          onChange={(e) => handleUpdateDetalle(index, "cantidad", Number(e.target.value))}
                          step="0.01"
                          min="0"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.precio_unitario}
                          onChange={(e) => handleUpdateDetalle(index, "precio_unitario", Number(e.target.value))}
                          step="0.01"
                          min="0"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.descuento}
                          onChange={(e) => handleUpdateDetalle(index, "descuento", Number(e.target.value))}
                          step="0.01"
                          min="0"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>Q{item.subtotal.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveProduct(item.producto_id)}
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {detalles.length === 0 && (
              <p className="text-center text-muted-foreground">No hay agregados añadidos a la venta.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal (Precio Original):</span>
              <span className="font-medium">
                Q{detalles.reduce((sum, d) => sum + (d.cantidad * d.precio_original), 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal (con descuentos aplicados):</span>
              <span className="font-medium">
                Q{calculateSubtotal().toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {calculateDescuentoTotal() > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Descuento Total:</span>
                <span className="font-medium">
                  - Q{calculateDescuentoTotal().toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total a Pagar:</span>
              <span>
                Q{calculateTotal().toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Venta"
            )}
          </Button>
        </div>
      </form>

      {/* Diálogo para agregar pagos múltiples */}
      {facturaCreada && facturaCreadaId && (
        <AgregarPagosMultiplesDialog
          open={showPagosDialog}
          onOpenChange={(open) => {
            setShowPagosDialog(open)
            if (!open) {
              // Si se cierra el diálogo, redirigir al listado de ventas
              router.push(`/piedrinera/ventas`)
            }
          }}
          facturaId={facturaCreadaId}
          clienteId={Number(clienteSeleccionado)}
          totalFactura={facturaCreada.total || calcularTotal()}
          saldoPendiente={facturaCreada.saldo_pendiente || facturaCreada.total || calcularTotal()}
          onPagosAgregados={() => {
            // Después de agregar pagos, redirigir al listado
            router.push(`/piedrinera/ventas`)
          }}
        />
      )}
    </div>
  )
}
