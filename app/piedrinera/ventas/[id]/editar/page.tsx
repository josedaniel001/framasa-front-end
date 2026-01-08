"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, XCircle, ArrowLeft, Loader2 } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPut } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"

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

interface Factura {
  id: number
  numero_factura: string
  empresa: string
  cliente_id: number
  cliente_nombre: string
  cliente_nit?: string
  subtotal: number | string
  descuento: number | string
  total: number | string
  estado: string
  estado_display: string
  fecha_factura: string
  fecha_vencimiento?: string
  observaciones?: string
  detalles: {
    id: number
    producto_id: number | string
    producto_codigo: string
    producto_nombre: string
    producto_empresa: string
    cantidad: number | string
    precio_unitario: number | string
    descuento: number | string
    subtotal: number | string
  }[]
}

interface DetalleFactura {
  id?: number
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

interface EditarVentaPiedrineraPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditarVentaPiedrineraPage({ params }: EditarVentaPiedrineraPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { token } = useAuth()
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [agregadosDisponibles, setAgregadosDisponibles] = useState<AgregadoDisponible[]>([])
  const [facturaOriginal, setFacturaOriginal] = useState<Factura | null>(null)

  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("")
  const [fechaVencimiento, setFechaVencimiento] = useState<string>("")
  const [detalles, setDetalles] = useState<DetalleFactura[]>([])
  const [agregadoSeleccionado, setAgregadoSeleccionado] = useState<string>("")
  const [cantidadMetrosCubicos, setCantidadMetrosCubicos] = useState<number>(0)
  const [precioUnitario, setPrecioUnitario] = useState<number>(0)
  const [observaciones, setObservaciones] = useState<string>("")
  const [estadoVenta, setEstadoVenta] = useState<string>("PENDIENTE")

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadClientes(), loadAgregados(), loadFactura()])
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadClientes = async () => {
    try {
      const data = await apiGet<any>(API_ENDPOINTS.FERRETERIA.CLIENTES)
      const clientesData = Array.isArray(data) ? data : data?.results || data?.data || []
      setClientes(clientesData)
    } catch (error) {
      console.error("Error al cargar clientes:", error)
    }
  }

  const loadAgregados = async () => {
    try {
      const data = await apiGet<any>(API_ENDPOINTS.PIEDRINERA.PRODUCTOS)
      const agregadosData = Array.isArray(data) ? data : data?.results || data?.data || []
      
      const agregados: AgregadoDisponible[] = agregadosData
        .filter((p: any) => p.activo)
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
    }
  }

  const loadFactura = async () => {
    try {
      const factura = await apiGet<Factura>(API_ENDPOINTS.FACTURACION.FACTURA(id))
      
      // Verificar que sea de PIEDRINERA
      if (factura.empresa !== "PIEDRINERA") {
        toast({
          title: "Error",
          description: "Esta factura no pertenece a Piedrinera",
          variant: "destructive",
        })
        router.replace("/piedrinera/ventas")
        return
      }

      setFacturaOriginal(factura)
      setClienteSeleccionado(factura.cliente_id.toString())
      setFechaVencimiento(factura.fecha_vencimiento || "")
      setObservaciones(factura.observaciones || "")
      setEstadoVenta(factura.estado)

      // Mapear detalles
      const detallesArray = Array.isArray(factura.detalles) ? factura.detalles : []
      
      const detallesMapeados: DetalleFactura[] = detallesArray.map((det) => {
        // Obtener producto_id desde producto_id o object_id
        const productoIdRaw = det.producto_id || det.object_id || det.productoId || det.objectId
        
        if (!productoIdRaw && productoIdRaw !== 0) {
          console.error("Detalle sin producto_id:", det)
          toast({
            title: "Error",
            description: `El detalle "${det.producto_nombre || "N/A"}" no tiene producto_id válido. Por favor, recarga la página.`,
            variant: "destructive",
          })
          throw new Error(`Detalle sin producto_id válido: ${det.producto_nombre || "N/A"}`)
        }
        
        const productoId = typeof productoIdRaw === "string" ? parseInt(productoIdRaw) : Number(productoIdRaw)
        
        if (isNaN(productoId) || productoId <= 0) {
          console.error("Producto ID inválido después de conversión:", productoIdRaw, "->", productoId)
          toast({
            title: "Error",
            description: `El detalle "${det.producto_nombre || "N/A"}" tiene un producto_id inválido. Por favor, recarga la página.`,
            variant: "destructive",
          })
          throw new Error(`Producto ID inválido: ${productoIdRaw}`)
        }
        
        return {
          id: det.id,
          producto_id: productoId,
          producto_empresa: det.producto_empresa || "PIEDRINERA",
          producto_codigo: det.producto_codigo || "",
          producto_nombre: det.producto_nombre || "",
          cantidad: typeof det.cantidad === "string" ? parseFloat(det.cantidad) : (det.cantidad || 0),
          precio_unitario: typeof det.precio_unitario === "string" ? parseFloat(det.precio_unitario) : (det.precio_unitario || 0),
          precio_original: typeof det.precio_unitario === "string" ? parseFloat(det.precio_unitario) : (det.precio_unitario || 0),
          descuento: typeof det.descuento === "string" ? parseFloat(det.descuento) : (det.descuento || 0),
          subtotal: typeof det.subtotal === "string" ? parseFloat(det.subtotal) : (det.subtotal || 0),
        }
      })

      setDetalles(detallesMapeados)
    } catch (error: any) {
      console.error("Error al cargar factura:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la factura",
        variant: "destructive",
      })
      router.replace("/piedrinera/ventas")
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

  const handleClearFields = () => {
    setAgregadoSeleccionado("")
    setCantidadMetrosCubicos(0)
    setPrecioUnitario(0)
  }

  const handleAgregadoChange = (value: string) => {
    setAgregadoSeleccionado(value)
    const agregado = agregadosDisponibles.find((a) => a.id.toString() === value)
    if (agregado) {
      setPrecioUnitario(agregado.precioVentaPorMetroCubico)
    }
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
      updatedItems[existingItemIndex].cantidad += cantidadMetrosCubicos
      updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].cantidad * updatedItems[existingItemIndex].precio_unitario - updatedItems[existingItemIndex].descuento
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

    if (field === "cantidad") {
      if (value <= 0) {
        // No mostrar error, solo no actualizar
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

    // Validar que todos los detalles tengan producto_id válido
    const detallesInvalidos = detalles.filter((det) => {
      const productoId = det.producto_id || det.object_id || det.productoId || det.objectId
      return !productoId || productoId === undefined || productoId === null || productoId === ""
    })

    if (detallesInvalidos.length > 0) {
      toast({
        title: "Error de validación",
        description: `Hay ${detallesInvalidos.length} detalle(s) sin producto válido. Por favor, elimínalos o recarga la página.`,
        variant: "destructive",
      })
      return
    }

    if (!facturaOriginal) {
      toast({
        title: "Error",
        description: "No se pudo cargar la factura original.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Validar y preparar detalles antes de enviar
      const detallesParaEnviar = detalles
        .map((det, index) => {
          // Obtener producto_id desde múltiples fuentes posibles
          const productoIdRaw = det.producto_id || det.object_id || det.productoId || det.objectId
          
          if (!productoIdRaw && productoIdRaw !== 0) {
            console.error(`Detalle ${index} sin producto_id:`, det)
            return null
          }
          
          const productoId = typeof productoIdRaw === "string" ? parseInt(productoIdRaw) : Number(productoIdRaw)
          
          if (!productoId || isNaN(productoId) || productoId <= 0) {
            console.error(`Detalle ${index} con producto_id inválido:`, det, "productoId:", productoId)
            return null
          }
          
          return {
            producto_id_write: productoId,
            producto_empresa: det.producto_empresa || "PIEDRINERA",
            cantidad: Number(det.cantidad) || 0,
            precio_unitario: Number(det.precio_unitario) || 0,
            descuento: Number(det.descuento) || 0,
          }
        })
        .filter((det) => det !== null) as Array<{
          producto_id_write: number
          producto_empresa: string
          cantidad: number
          precio_unitario: number
          descuento: number
        }>

      if (detallesParaEnviar.length === 0) {
        toast({
          title: "Error de validación",
          description: "No hay detalles válidos para enviar. Por favor, verifica que todos los detalles tengan un producto válido.",
          variant: "destructive",
        })
        setSubmitting(false)
        return
      }

      const facturaData = {
        empresa: "PIEDRINERA",
        cliente: parseInt(clienteSeleccionado),
        descuento: calculateDescuentoTotal(),
        observaciones: observaciones || undefined,
        fecha_vencimiento: fechaVencimiento || undefined,
        estado: estadoVenta,
        detalles_write: detallesParaEnviar,
      }

      // Log completo del payload que se envía a Django
      console.log("=".repeat(80))
      console.log("PAYLOAD COMPLETO PARA PUT A DJANGO:")
      console.log("=".repeat(80))
      console.log("URL:", API_ENDPOINTS.FACTURACION.FACTURA(id))
      console.log("Datos completos:", JSON.stringify(facturaData, null, 2))
      console.log("")
      console.log("Detalles para enviar (detalles_write):")
      detallesParaEnviar.forEach((det, index) => {
        console.log(`  Detalle ${index + 1}:`, JSON.stringify(det, null, 2))
      })
      console.log("")
      console.log("Estado de detalles originales:")
      detalles.forEach((det, index) => {
        console.log(`  Detalle original ${index + 1}:`, {
          producto_id: det.producto_id,
          producto_id_type: typeof det.producto_id,
          producto_empresa: det.producto_empresa,
          cantidad: det.cantidad,
          precio_unitario: det.precio_unitario,
          descuento: det.descuento,
        })
      })
      console.log("=".repeat(80))

      await apiPut<any>(API_ENDPOINTS.FACTURACION.FACTURA(id), facturaData)

      toast({
        title: "Venta Actualizada",
        description: `La factura ${facturaOriginal.numero_factura} ha sido actualizada exitosamente.`,
      })

      router.push("/piedrinera/ventas")
    } catch (error: any) {
      console.error("Error al actualizar venta:", error)
      toast({
        title: "Error",
        description: error?.response?.data?.error || error?.message || "No se pudo actualizar la venta",
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

  if (!facturaOriginal) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Venta: {facturaOriginal.numero_factura}</h1>
      </div>
      <p className="text-muted-foreground">Modifica los detalles de la venta existente.</p>

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
              <Label htmlFor="estado">Estado de la Venta</Label>
              <Select value={estadoVenta} onValueChange={setEstadoVenta}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BORRADOR">Borrador</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="PARCIAL">Pago Parcial</SelectItem>
                  <SelectItem value="PAGADA">Pagada</SelectItem>
                  <SelectItem value="ANULADA">Anulada</SelectItem>
                  <SelectItem value="MORA">En Mora</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="flex justify-between">
              <Label className="text-lg">Subtotal:</Label>
              <span className="text-lg font-semibold">Q{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <Label className="text-lg">Descuento Total:</Label>
              <span className="text-lg font-semibold">Q{calculateDescuentoTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <Label className="text-xl font-bold">Total:</Label>
              <span className="text-2xl font-bold">Q{calculateTotal().toFixed(2)}</span>
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
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
