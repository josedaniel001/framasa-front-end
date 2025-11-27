"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, XCircle, Search, Loader2 } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { AgregarPagosMultiplesDialog } from "@/components/facturacion/agregar-pagos-multiples-dialog"

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
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoDisponible[]>([])
  const [empresaFiltro, setEmpresaFiltro] = useState<"TODAS" | "FERRETERIA" | "BLOQUERA" | "PIEDRINERA">("TODAS")
  const [searchProducto, setSearchProducto] = useState("")

  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("")
  const [fechaVencimiento, setFechaVencimiento] = useState<string>("")
  const [detalles, setDetalles] = useState<DetalleFactura[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("")
  const [cantidadProducto, setCantidadProducto] = useState<number>(1)
  const [precioProducto, setPrecioProducto] = useState<number>(0)
  const [descuento, setDescuento] = useState<number>(0)
  const [observaciones, setObservaciones] = useState<string>("")
  const [facturaCreada, setFacturaCreada] = useState<any>(null)
  const [facturaCreadaId, setFacturaCreadaId] = useState<number | null>(null)
  const [showPagosDialog, setShowPagosDialog] = useState(false)

  // Cargar datos al montar
  useEffect(() => {
    loadClientes()
    loadProductos()
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

  const loadProductos = async () => {
    try {
      const [ferreteria, bloquera, piedrinera] = await Promise.allSettled([
        apiGet<any>(API_ENDPOINTS.FERRETERIA.PRODUCTOS),
        apiGet<any>(API_ENDPOINTS.BLOQUERA.PRODUCTOS),
        apiGet<any>(API_ENDPOINTS.PIEDRINERA.PRODUCTOS),
      ])

      const productos: ProductoDisponible[] = []

      if (ferreteria.status === "fulfilled") {
        const data = ferreteria.value
        const productosData = Array.isArray(data) ? data : data?.results || data?.data || []
        productosData.forEach((p: any) => {
          if (p.activo && (p.stockActual || p.stock || 0) > 0) {
            productos.push({
              id: p.id,
              codigo: p.codigo || "",
              nombre: p.nombre || "",
              precioVenta: p.precioVenta || p.precio_venta || 0,
              stock: p.stockActual || p.stock || 0,
              empresa: "FERRETERIA",
              unidadMedida: p.unidadMedida || p.unidad_medida || "unidades",
            })
          }
        })
      }

      if (bloquera.status === "fulfilled") {
        const data = bloquera.value
        const productosData = Array.isArray(data) ? data : data?.results || data?.data || []
        productosData.forEach((p: any) => {
          if (p.activo && (p.stockActual || p.stock || 0) > 0) {
            productos.push({
              id: p.id,
              codigo: p.codigo || "",
              nombre: p.nombre || "",
              precioVenta: p.precioVentaUnitario || p.precio_venta_unitario || 0,
              stock: p.stockActual || p.stock || 0,
              empresa: "BLOQUERA",
              unidadMedida: "unidades",
            })
          }
        })
      }

      if (piedrinera.status === "fulfilled") {
        const data = piedrinera.value
        const productosData = Array.isArray(data) ? data : data?.results || data?.data || []
        productosData.forEach((p: any) => {
          if (p.activo && (p.stock || p.stockActual || 0) > 0) {
            productos.push({
              id: p.id,
              codigo: p.codigo || "",
              nombre: p.nombre || "",
              precioVenta: p.precioVenta || p.precio_venta || 0,
              stock: p.stock || p.stockActual || 0,
              empresa: "PIEDRINERA",
              unidadMedida: "m³",
            })
          }
        })
      }

      setProductosDisponibles(productos)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    }
  }

  const productosFiltrados = productosDisponibles.filter((p) => {
    const matchesEmpresa = empresaFiltro === "TODAS" || p.empresa === empresaFiltro
    const matchesSearch =
      !searchProducto ||
      p.nombre.toLowerCase().includes(searchProducto.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchProducto.toLowerCase())
    return matchesEmpresa && matchesSearch && p.stock > 0
  })

  const handleProductoChange = (productoValue: string) => {
    setProductoSeleccionado(productoValue)
    // El value viene en formato "EMPRESA-ID"
    const [empresa, id] = productoValue.split("-")
    const producto = productosDisponibles.find((p) => p.empresa === empresa && String(p.id) === id)
    if (producto) {
      setPrecioProducto(producto.precioVenta)
    }
  }

  const handleAgregarProducto = () => {
    if (!productoSeleccionado || cantidadProducto <= 0) {
      toast({
        title: "Error",
        description: "Selecciona un producto y una cantidad válida",
        variant: "destructive",
      })
      return
    }

    // El value viene en formato "EMPRESA-ID"
    const [empresa, id] = productoSeleccionado.split("-")
    const producto = productosDisponibles.find((p) => p.empresa === empresa && String(p.id) === id)
    if (!producto) return

    if (cantidadProducto > producto.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Stock disponible: ${producto.stock} ${producto.unidadMedida || ""}`,
        variant: "destructive",
      })
      return
    }

    const precio = precioProducto > 0 ? precioProducto : producto.precioVenta
    const subtotal = cantidadProducto * precio

    const existeIndex = detalles.findIndex(
      (d) => d.producto_id === producto.id && d.producto_empresa === producto.empresa
    )

    if (existeIndex >= 0) {
      const nuevosDetalles = [...detalles]
      nuevosDetalles[existeIndex].cantidad += cantidadProducto
      nuevosDetalles[existeIndex].subtotal = nuevosDetalles[existeIndex].cantidad * nuevosDetalles[existeIndex].precio_unitario
      setDetalles(nuevosDetalles)
    } else {
      setDetalles([
        ...detalles,
        {
          producto_id: producto.id,
          producto_empresa: producto.empresa,
          producto_codigo: producto.codigo,
          producto_nombre: producto.nombre,
          cantidad: cantidadProducto,
          precio_unitario: precio,
          descuento: 0,
          subtotal: subtotal,
        },
      ])
    }

    setProductoSeleccionado("")
    setCantidadProducto(1)
    setPrecioProducto(0)
  }

  const handleEliminarDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index))
  }

  const calcularSubtotal = () => {
    return detalles.reduce((sum, d) => sum + d.subtotal, 0)
  }

  const calcularTotal = () => {
    return calcularSubtotal() - descuento
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clienteSeleccionado) {
      toast({
        title: "Error",
        description: "Selecciona un cliente",
        variant: "destructive",
      })
      return
    }

    if (detalles.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un producto",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const empresas = Array.from(new Set(detalles.map((d) => d.producto_empresa)))
      const empresa = empresas.length === 1 ? empresas[0] : "MIXTA"

      const facturaData = {
        cliente: Number(clienteSeleccionado),
        empresa,
        descuento: descuento || 0,
        observaciones: observaciones.trim() || undefined,
        fecha_vencimiento: fechaVencimiento || undefined,
        detalles: detalles.map((d) => ({
          producto_id: Number(d.producto_id),
          producto_empresa: d.producto_empresa,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          descuento: d.descuento || 0,
        })),
      }

      const factura = await apiPost<any>(API_ENDPOINTS.FACTURACION.FACTURAS, facturaData)
      const facturaId = factura?.id ?? factura?.factura?.id ?? null

      if (!facturaId) {
        throw new Error("No se pudo obtener el ID de la factura generada")
      }

      toast({
        title: "Factura Creada",
        description: `Factura ${factura.numero_factura} creada exitosamente`,
      })

      // Guardar la factura creada y mostrar diálogo de pagos
      setFacturaCreada(factura)
      setFacturaCreadaId(facturaId)
      setShowPagosDialog(true)
    } catch (error: any) {
      console.error("Error al crear factura:", error)
      const errorMessage =
        error.message || error.response?.data?.error || "No se pudo crear la factura"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
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
                  {loading ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : (
                    clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={String(cliente.id)}>
                        {cliente.nombre} {cliente.nit && `(${cliente.nit})`}
                    </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaVencimiento">Fecha de Vencimiento (Opcional)</Label>
              <Input
                id="fechaVencimiento"
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                placeholder="Notas adicionales sobre la factura..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-4">
              <div>
                <Label>Empresa</Label>
                <Select value={empresaFiltro} onValueChange={(value: any) => setEmpresaFiltro(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODAS">Todas</SelectItem>
                    <SelectItem value="FERRETERIA">Ferretería</SelectItem>
                    <SelectItem value="BLOQUERA">Bloquera</SelectItem>
                    <SelectItem value="PIEDRINERA">Piedrinera</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Buscar Producto</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código o nombre..."
                    value={searchProducto}
                    onChange={(e) => setSearchProducto(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-[3fr_1fr_1fr_auto]">
              <div className="grid gap-2">
                <Label htmlFor="producto">Producto</Label>
                <Select value={productoSeleccionado} onValueChange={handleProductoChange}>
                  <SelectTrigger id="producto">
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productosFiltrados.map((producto) => (
                      <SelectItem key={`${producto.empresa}-${producto.id}`} value={`${producto.empresa}-${producto.id}`}>
                        <div className="flex flex-col">
                          <span>{producto.nombre}</span>
                          <span className="text-xs text-muted-foreground">
                            {producto.codigo} - Stock: {producto.stock} {producto.unidadMedida}
                          </span>
                        </div>
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
                  min="0.01"
                  step={productoSeleccionado && (() => {
                    const [empresa] = productoSeleccionado.split("-")
                    return empresa === "PIEDRINERA" ? "0.01" : "1"
                  })()}
                  value={cantidadProducto}
                  onChange={(e) => setCantidadProducto(Number(e.target.value))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precio">Precio Unitario</Label>
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={precioProducto}
                  onChange={(e) => setPrecioProducto(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={handleAgregarProducto}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar
                </Button>
              </div>
            </div>

            {detalles.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio Unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalles.map((detalle, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{detalle.producto_nombre}</div>
                          <div className="text-xs text-muted-foreground">{detalle.producto_codigo}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            detalle.producto_empresa === "FERRETERIA"
                              ? "bg-blue-500"
                              : detalle.producto_empresa === "BLOQUERA"
                              ? "bg-green-500"
                              : "bg-orange-500"
                          }
                        >
                          {detalle.producto_empresa}
                        </Badge>
                      </TableCell>
                      <TableCell>{detalle.cantidad}</TableCell>
                      <TableCell>
                        Q {detalle.precio_unitario.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        Q {detalle.subtotal.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEliminarDetalle(index)}>
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
              <p className="text-center text-muted-foreground">No hay productos añadidos a la venta.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">
                Q {calcularSubtotal().toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <Label>Descuento:</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={descuento}
                  onChange={(e) => setDescuento(Number(e.target.value))}
                  className="w-32"
                />
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>
                Q {calcularTotal().toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting || detalles.length === 0 || !clienteSeleccionado}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Factura"
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
              // Si se cierra el diálogo, redirigir al detalle de la factura
              router.push(`/ferreteria/ventas/${facturaCreadaId}`)
            }
          }}
          facturaId={facturaCreadaId}
          clienteId={Number(clienteSeleccionado)}
          totalFactura={facturaCreada.total || calcularTotal()}
          saldoPendiente={facturaCreada.saldo_pendiente || facturaCreada.total || calcularTotal()}
          onPagosAgregados={() => {
            // Después de agregar pagos, redirigir al detalle
            router.push(`/ferreteria/ventas/${facturaCreadaId}`)
          }}
        />
      )}
    </div>
  )
}
