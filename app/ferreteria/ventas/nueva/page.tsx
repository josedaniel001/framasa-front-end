"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, XCircle, Loader2, FileText } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { AgregarPagosMultiplesDialog } from "@/components/facturacion/agregar-pagos-multiples-dialog"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Cliente {
  id: number
  nombre: string
  nit?: string
}

interface ProductoDisponible {
  id: number | string
  codigo: string
  nombre: string
  precioVenta: number
  stock: number
  empresa: "FERRETERIA" | "BLOQUERA" | "PIEDRINERA"
  unidadMedida: string
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

type EmpresaFiltro = "TODAS" | "FERRETERIA" | "BLOQUERA" | "PIEDRINERA"

interface CotizacionData {
  id: number
  numero_cotizacion: string
  cliente: number
  cliente_nombre: string
  observaciones?: string
  fecha_vencimiento?: string
  detalles: {
    producto_codigo: string
    producto_nombre: string
    producto_empresa: string
    cantidad: number
    precio_unitario: number
    descuento: number
    subtotal: number
  }[]
}

export default function NuevaVentaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadingCotizacion, setLoadingCotizacion] = useState(false)

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoDisponible[]>([])
  const [empresaFiltro, setEmpresaFiltro] = useState<EmpresaFiltro>("TODAS")

  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("")
  const [fechaVencimiento, setFechaVencimiento] = useState<string>("")
  const [detalles, setDetalles] = useState<DetalleFactura[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("")
  const [cantidadProducto, setCantidadProducto] = useState<number>(1)
  const [precioProducto, setPrecioProducto] = useState<number>(0)
  const [observaciones, setObservaciones] = useState<string>("")
  const [facturaCreada, setFacturaCreada] = useState<any>(null)
  const [facturaCreadaId, setFacturaCreadaId] = useState<number | null>(null)
  const [showPagosDialog, setShowPagosDialog] = useState(false)
  
  // Datos de cotización si viene de una
  const [cotizacionOrigen, setCotizacionOrigen] = useState<CotizacionData | null>(null)
  const cotizacionId = searchParams.get("cotizacion_id")

  // Cargar datos al montar
  useEffect(() => {
    loadClientes()
    loadProductos()
  }, [])

  // Cargar cotización si viene de una
  useEffect(() => {
    if (cotizacionId && token && productosDisponibles.length > 0) {
      loadCotizacion(cotizacionId)
    }
  }, [cotizacionId, token, productosDisponibles])

  const loadCotizacion = async (id: string) => {
    if (!token) return

    try {
      setLoadingCotizacion(true)
      const response = await fetch(`/api/facturacion/cotizaciones/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al cargar la cotización")
      }

      const cotizacion: CotizacionData = await response.json()
      setCotizacionOrigen(cotizacion)

      // Pre-cargar cliente
      setClienteSeleccionado(cotizacion.cliente.toString())

      // Pre-cargar fecha de vencimiento si existe
      if (cotizacion.fecha_vencimiento) {
        setFechaVencimiento(cotizacion.fecha_vencimiento)
      }

      // Pre-cargar observaciones
      if (cotizacion.observaciones) {
        setObservaciones(`Generada desde cotización ${cotizacion.numero_cotizacion}. ${cotizacion.observaciones}`)
      } else {
        setObservaciones(`Generada desde cotización ${cotizacion.numero_cotizacion}`)
      }

      // Pre-cargar productos
      const detallesCargados: DetalleFactura[] = cotizacion.detalles.map((det) => {
        // Buscar el producto para obtener su ID y precio original
        const producto = productosDisponibles.find(
          (p) => p.codigo === det.producto_codigo && p.empresa === det.producto_empresa
        ) || productosDisponibles.find((p) => p.codigo === det.producto_codigo)

        // El precio original es el precioVenta del producto
        const precioOriginal = producto?.precioVenta || Number(det.precio_unitario)

        return {
          producto_id: producto?.id || 0,
          producto_empresa: det.producto_empresa,
          producto_codigo: det.producto_codigo,
          producto_nombre: det.producto_nombre,
          cantidad: Number(det.cantidad),
          precio_unitario: Number(det.precio_unitario),
          precio_original: precioOriginal,
          descuento: Number(det.descuento) || 0,
          subtotal: Number(det.subtotal),
        }
      })

      setDetalles(detallesCargados)

      toast({
        title: "Cotización Cargada",
        description: `Datos de la cotización ${cotizacion.numero_cotizacion} cargados. Revisa y crea la factura.`,
      })
    } catch (error) {
      console.error("Error al cargar cotización:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la cotización",
        variant: "destructive",
      })
    } finally {
      setLoadingCotizacion(false)
    }
  }

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

  // Filtrar productos por empresa
  const productosFiltrados = useMemo(() => {
    return productosDisponibles.filter((p) => {
      const matchesEmpresa = empresaFiltro === "TODAS" || p.empresa === empresaFiltro
      return matchesEmpresa && p.stock > 0
    })
  }, [productosDisponibles, empresaFiltro])

  // Convertir productos a opciones para el selector con búsqueda
  const productosOptions: SearchableSelectOption[] = useMemo(() => {
    return productosFiltrados.map((producto) => ({
      value: `${producto.empresa}-${producto.id}`,
      label: producto.nombre,
      description: `${producto.codigo} | Q${producto.precioVenta.toFixed(2)} | Stock: ${producto.stock} ${producto.unidadMedida} | ${producto.empresa}`,
    }))
  }, [productosFiltrados])

  // Convertir clientes a opciones para el selector con búsqueda
  const clientesOptions: SearchableSelectOption[] = useMemo(() => {
    return clientes.map((cliente) => ({
      value: cliente.id.toString(),
      label: cliente.nombre,
      description: cliente.nit ? `NIT: ${cliente.nit}` : undefined,
    }))
  }, [clientes])

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
          precio_original: producto.precioVenta,
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

  // Calcular subtotal con descuentos aplicados (suma de subtotales)
  const calcularSubtotal = () => {
    return detalles.reduce((sum, d) => sum + d.subtotal, 0)
  }

  // Calcular subtotal sin descuentos (con precios originales)
  const calcularSubtotalOriginal = () => {
    return detalles.reduce((sum, d) => sum + (d.cantidad * d.precio_original), 0)
  }

  // Calcular el descuento total (diferencia entre original y con descuentos)
  const descuentoCalculado = useMemo(() => {
    const subtotalOriginal = calcularSubtotalOriginal()
    const subtotalConDescuento = calcularSubtotal()
    const desc = subtotalOriginal - subtotalConDescuento
    return desc > 0 ? desc : 0
  }, [detalles])

  const calcularTotal = () => {
    return calcularSubtotal()
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

    // Validar que todos los productos tengan ID válido
    const productosInvalidos = detalles.filter((d) => !d.producto_id || d.producto_id === 0)
    if (productosInvalidos.length > 0) {
      toast({
        title: "Error",
        description: `Hay ${productosInvalidos.length} producto(s) sin ID válido. Por favor, elimínalos y agrégalos nuevamente.`,
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
        descuento: descuentoCalculado || 0,
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
      
      // Manejar diferentes estructuras de respuesta
      const facturaId = factura?.id ?? factura?.factura?.id ?? factura?.data?.id ?? null
      const numeroFactura = factura?.numero_factura ?? factura?.factura?.numero_factura ?? factura?.data?.numero_factura ?? "N/A"

      if (!facturaId) {
        console.error("Respuesta de la API:", factura)
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

  // Función para crear factura desde cotización (usa endpoint de conversión)
  const handleCrearFacturaDesdeCotizacion = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cotizacionOrigen || !token) {
      toast({
        title: "Error",
        description: "No hay cotización de origen o no estás autenticado",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Usar el endpoint de convertir cotización a factura
      const response = await fetch(`/api/facturacion/cotizaciones/${cotizacionOrigen.id}/convertir_a_factura`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.detail || "Error al crear la factura")
      }

      const data = await response.json()
      const factura = data.factura || data
      const facturaId = factura?.id ?? data?.factura_id ?? null
      const numeroFactura = factura?.numero_factura ?? "N/A"

      if (!facturaId) {
        console.error("Respuesta de convertir_a_factura:", data)
        throw new Error("No se pudo obtener el ID de la factura generada")
      }

      toast({
        title: "Factura Creada",
        description: `Factura ${numeroFactura} creada exitosamente desde cotización ${cotizacionOrigen.numero_cotizacion}`,
      })

      // Guardar la factura creada y mostrar diálogo de pagos
      setFacturaCreada(factura)
      setFacturaCreadaId(facturaId)
      setShowPagosDialog(true)
    } catch (error: any) {
      console.error("Error al crear factura desde cotización:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la factura",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">
        {cotizacionOrigen ? "Nueva Venta desde Cotización" : "Nueva Venta"}
      </h1>
      <p className="text-muted-foreground">
        {cotizacionOrigen 
          ? `Creando factura a partir de la cotización ${cotizacionOrigen.numero_cotizacion}`
          : "Registra una nueva transacción de venta en el sistema."
        }
      </p>

      {loadingCotizacion && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Cargando datos de la cotización...</AlertDescription>
        </Alert>
      )}

      {cotizacionOrigen && !loadingCotizacion && (
        <Alert className="bg-blue-50 border-blue-200">
          <FileText className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Los datos han sido pre-cargados desde la cotización <strong>{cotizacionOrigen.numero_cotizacion}</strong> 
            {" "}para el cliente <strong>{cotizacionOrigen.cliente_nombre}</strong>. 
            Revisa la información y presiona "Crear Factura" para completar la venta.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={cotizacionOrigen ? handleCrearFacturaDesdeCotizacion : handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cliente">Cliente</Label>
              <SearchableSelect
                options={clientesOptions}
                value={clienteSeleccionado}
                onValueChange={setClienteSeleccionado}
                placeholder="Selecciona un cliente"
                searchPlaceholder="Buscar cliente..."
                emptyMessage="No se encontraron clientes."
                loading={loading}
              />
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
            <div className="grid gap-2 md:grid-cols-[1fr_3fr_1fr_1fr_auto]">
              <div>
                <Label>Empresa</Label>
                <Select value={empresaFiltro} onValueChange={(value: EmpresaFiltro) => setEmpresaFiltro(value)}>
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
              <div className="grid gap-2">
                <Label htmlFor="producto">Producto</Label>
                <SearchableSelect
                  options={productosOptions}
                  value={productoSeleccionado}
                  onValueChange={handleProductoChange}
                  placeholder="Selecciona un producto"
                  searchPlaceholder="Buscar por código o nombre..."
                  emptyMessage="No se encontraron productos."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min={productoSeleccionado?.startsWith("PIEDRINERA") ? "0.01" : "1"}
                  step={productoSeleccionado?.startsWith("PIEDRINERA") ? "0.01" : "1"}
                  value={cantidadProducto}
                  onChange={(e) => setCantidadProducto(Number(e.target.value))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precio">Precio Unit.</Label>
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
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal (Precio Original):</span>
              <span className="font-medium">
                Q{calcularSubtotalOriginal().toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal (con descuentos aplicados):</span>
              <span className="font-medium">
                Q{calcularSubtotal().toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {descuentoCalculado > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Descuento Total:</span>
                <span className="font-medium">
                  - Q{descuentoCalculado.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total a Pagar:</span>
              <span>
                Q{calcularTotal().toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
