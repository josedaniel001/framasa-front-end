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
import { Badge } from "@/components/ui/badge"
import { PlusCircle, XCircle, AlertCircle, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"

interface CotizacionItem {
  productoId: string
  nombreProducto: string
  productoCodigo: string
  productoEmpresa: string
  cantidad: number
  precioUnitario: number
  precioOriginal: number // Precio sin descuento
  descuento: number
  subtotal: number
  stockDisponible: number
  unidadMedida: string
}

interface ClienteAPI {
  id: number
  nombre: string
  nit?: string
  telefono?: string
  email?: string
  direccion?: string
  activo?: boolean
}

interface ProductoDisponible {
  id: number | string
  codigo: string
  nombre: string
  precioVenta: number
  precioDescuento: number | null
  stock: number
  empresa: "FERRETERIA" | "BLOQUERA" | "PIEDRINERA"
  unidadMedida: string
}

type EmpresaFiltro = "TODAS" | "FERRETERIA" | "BLOQUERA" | "PIEDRINERA"

export default function NuevaCotizacionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { token } = useAuth()

  // Estados para datos de la API
  const [clientes, setClientes] = useState<ClienteAPI[]>([])
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoDisponible[]>([])
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [errorClientes, setErrorClientes] = useState<string | null>(null)
  const [errorProductos, setErrorProductos] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filtros de productos
  const [empresaFiltro, setEmpresaFiltro] = useState<EmpresaFiltro>("TODAS")

  // Estados del formulario
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("")
  const [fechaCotizacion, setFechaCotizacion] = useState<string>(new Date().toISOString().split("T")[0])
  const [fechaVencimiento, setFechaVencimiento] = useState<string>(() => {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() + 15) // Por defecto, 15 días de validez
    return fecha.toISOString().split("T")[0]
  })
  const [itemsCotizacion, setItemsCotizacion] = useState<CotizacionItem[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("")
  const [cantidadProducto, setCantidadProducto] = useState<number>(1)
  const [precioOriginalProducto, setPrecioOriginalProducto] = useState<number>(0)
  const [precioDescuentoProducto, setPrecioDescuentoProducto] = useState<number | null>(null)
  const [notas, setNotas] = useState<string>("")

  // Verificar si hay productos con stock insuficiente
  const productosConStockInsuficiente = useMemo(() => {
    return itemsCotizacion.filter((item) => item.cantidad > item.stockDisponible)
  }, [itemsCotizacion])

  const tieneErroresDeStock = productosConStockInsuficiente.length > 0

  // Verificar stock del producto seleccionado
  const productoSeleccionadoData = useMemo(() => {
    if (!productoSeleccionado) return null
    const [empresa, id] = productoSeleccionado.split("-")
    return productosDisponibles.find((p) => p.empresa === empresa && String(p.id) === id)
  }, [productoSeleccionado, productosDisponibles])

  const stockDelProductoSeleccionado = useMemo(() => {
    if (!productoSeleccionadoData) return 0
    return productoSeleccionadoData.stock
  }, [productoSeleccionadoData])

  const cantidadExcedeStock = cantidadProducto > stockDelProductoSeleccionado && stockDelProductoSeleccionado > 0

  // Cargar clientes desde la API
  useEffect(() => {
    const fetchClientes = async () => {
      if (!token) return

      try {
        setLoadingClientes(true)
        setErrorClientes(null)
        const response = await fetch("/api/ferreteria/clientes", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Error al cargar los clientes")
        }

        const data = await response.json()
        const clientesList = Array.isArray(data) ? data : (data.results || [])
        setClientes(clientesList)
      } catch (error) {
        console.error("Error al cargar clientes:", error)
        setErrorClientes("No se pudieron cargar los clientes. Por favor, intente de nuevo.")
      } finally {
        setLoadingClientes(false)
      }
    }

    fetchClientes()
  }, [token])

  // Cargar productos de las tres empresas
  useEffect(() => {
    const loadProductos = async () => {
      try {
        setLoadingProductos(true)
        setErrorProductos(null)

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
            if (p.activo !== false) {
              const precioVenta = p.precioVenta || p.precio_venta || 0
              const precioDescuento = p.precioDescuento ?? p.precio_descuento ?? null
              productos.push({
                id: p.id,
                codigo: p.codigo || "",
                nombre: p.nombre || "",
                precioVenta,
                precioDescuento,
                stock: p.stockActual || p.stock_actual || p.stock || 0,
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
            if (p.activo !== false) {
              const precioVenta = p.precioVentaUnitario || p.precio_venta_unitario || p.precioVenta || p.precio_venta || 0
              const precioDescuento = p.precioDescuento ?? p.precio_descuento ?? null
              productos.push({
                id: p.id,
                codigo: p.codigo || "",
                nombre: p.nombre || "",
                precioVenta,
                precioDescuento,
                stock: p.stockActual || p.stock_actual || p.stock || 0,
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
            if (p.activo !== false) {
              const precioVenta = p.precioVentaPorMetroCubico || p.precioVenta || p.precio_venta_m3 || p.precio_venta || 0
              const precioDescuento = p.precioDescuentoPorMetroCubico ?? p.precio_descuento_m3 ?? null
              productos.push({
                id: p.id,
                codigo: p.codigo || "",
                nombre: p.nombre || "",
                precioVenta,
                precioDescuento,
                stock: p.stock || p.stockActual || p.stock_actual_m3 || 0,
                empresa: "PIEDRINERA",
                unidadMedida: "m³",
              })
            }
          })
        }

        setProductosDisponibles(productos)
      } catch (error) {
        console.error("Error al cargar productos:", error)
        setErrorProductos("No se pudieron cargar los productos. Por favor, intente de nuevo.")
      } finally {
        setLoadingProductos(false)
      }
    }

    loadProductos()
  }, [])

  // Filtrar productos por empresa y excluir los ya añadidos
  const productosFiltrados = useMemo(() => {
    return productosDisponibles.filter((p) => {
      const matchesEmpresa = empresaFiltro === "TODAS" || p.empresa === empresaFiltro
      // Excluir productos que ya están añadidos a la cotización
      // Comparar por código de producto Y empresa para mayor confiabilidad
      const yaAnadido = itemsCotizacion.some(
        (item) => item.productoCodigo === p.codigo && item.productoEmpresa === p.empresa
      )
      return matchesEmpresa && !yaAnadido
    })
  }, [productosDisponibles, empresaFiltro, itemsCotizacion])

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
      // Establecer el precio original
      setPrecioOriginalProducto(producto.precioVenta)
      // Establecer el precio con descuento si existe
      setPrecioDescuentoProducto(producto.precioDescuento)
    }
  }

  const handleAddProduct = () => {
    if (!productoSeleccionado || cantidadProducto <= 0) {
      toast({
        title: "Error al agregar producto",
        description: "Por favor, selecciona un producto y una cantidad válida.",
        variant: "destructive",
      })
      return
    }

    // El value viene en formato "EMPRESA-ID"
    const [empresa, id] = productoSeleccionado.split("-")
    const producto = productosDisponibles.find((p) => p.empresa === empresa && String(p.id) === id)
    if (!producto) return

    if (cantidadProducto > producto.stock && producto.stock > 0) {
      toast({
        title: "Stock insuficiente",
        description: `Stock disponible: ${producto.stock} ${producto.unidadMedida || ""}`,
        variant: "destructive",
      })
      return
    }

    // Usar el precio con descuento si está disponible, si no usar el precio original
    const precioFinal = precioDescuentoProducto !== null && precioDescuentoProducto > 0 
      ? precioDescuentoProducto 
      : precioOriginalProducto
    const subtotal = cantidadProducto * precioFinal

    const existeIndex = itemsCotizacion.findIndex(
      (item) => item.productoId === String(producto.id) && item.productoEmpresa === producto.empresa
    )

    if (existeIndex >= 0) {
      const nuevosItems = [...itemsCotizacion]
      nuevosItems[existeIndex].cantidad += cantidadProducto
      nuevosItems[existeIndex].subtotal = nuevosItems[existeIndex].cantidad * nuevosItems[existeIndex].precioUnitario
      setItemsCotizacion(nuevosItems)
    } else {
      setItemsCotizacion([
        ...itemsCotizacion,
        {
          productoId: String(producto.id),
          nombreProducto: producto.nombre,
          productoCodigo: producto.codigo,
          productoEmpresa: producto.empresa,
          cantidad: cantidadProducto,
          precioUnitario: precioFinal,
          precioOriginal: precioOriginalProducto, // Guardar el precio original sin descuento
          descuento: 0,
          subtotal: subtotal,
          stockDisponible: producto.stock,
          unidadMedida: producto.unidadMedida,
        },
      ])
    }

    setProductoSeleccionado("")
    setCantidadProducto(1)
    setPrecioOriginalProducto(0)
    setPrecioDescuentoProducto(null)
  }

  const handleRemoveProduct = (productoCodigo: string, productoEmpresa: string) => {
    setItemsCotizacion(itemsCotizacion.filter(
      (item) => !(item.productoCodigo === productoCodigo && item.productoEmpresa === productoEmpresa)
    ))
  }

  // Calcular subtotal con los precios actuales (pueden tener descuento aplicado)
  const calcularSubtotal = () => {
    return itemsCotizacion.reduce((sum, item) => sum + item.subtotal, 0)
  }

  // Calcular el subtotal con precios originales (sin descuento)
  const calcularSubtotalOriginal = () => {
    return itemsCotizacion.reduce((sum, item) => sum + (item.cantidad * item.precioOriginal), 0)
  }

  // Calcular el descuento automático: diferencia entre precio original y precio con descuento
  const descuentoCalculado = useMemo(() => {
    const subtotalOriginal = calcularSubtotalOriginal()
    const subtotalConDescuento = calcularSubtotal()
    const descuento = subtotalOriginal - subtotalConDescuento
    return descuento > 0 ? descuento : 0
  }, [itemsCotizacion])

  const calcularTotal = () => {
    return calcularSubtotal()
  }

  const getEmpresaBadgeColor = (empresa: string) => {
    switch (empresa) {
      case "FERRETERIA":
        return "bg-blue-500 text-white"
      case "BLOQUERA":
        return "bg-green-500 text-white"
      case "PIEDRINERA":
        return "bg-orange-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clienteSeleccionado || itemsCotizacion.length === 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, selecciona un cliente y añade al menos un producto.",
        variant: "destructive",
      })
      return
    }

    // Validar stock
    if (tieneErroresDeStock) {
      toast({
        title: "Error de stock",
        description: "Hay productos con cantidad mayor al stock disponible. Por favor, corrige las cantidades antes de continuar.",
        variant: "destructive",
      })
      return
    }

    if (!token) {
      toast({
        title: "Error de autenticación",
        description: "Por favor, inicia sesión nuevamente.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Determinar la empresa principal de la cotización
      const empresas = Array.from(new Set(itemsCotizacion.map((item) => item.productoEmpresa)))
      const empresa = empresas.length === 1 ? empresas[0] : "MIXTA"

      // Preparar datos para la API
      const cotizacionData = {
        empresa,
        cliente: parseInt(clienteSeleccionado),
        descuento: descuentoCalculado,
        observaciones: notas || null,
        condiciones: null,
        fecha_vencimiento: fechaVencimiento,
        detalles: itemsCotizacion.map((item) => ({
          producto_id: parseInt(item.productoId),
          producto_empresa: item.productoEmpresa,
          cantidad: item.cantidad,
          precio_unitario: item.precioUnitario,
          descuento: item.descuento || 0,
        })),
      }

      const response = await fetch("/api/facturacion/cotizaciones", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cotizacionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.detail || "Error al crear la cotización")
      }

      const data = await response.json()

      toast({
        title: "Cotización Creada",
        description: `La cotización ${data.numero_cotizacion} ha sido registrada exitosamente.`,
      })

      router.push("/ferreteria/cotizaciones")
    } catch (error) {
      console.error("Error al crear cotización:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear la cotización",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nueva Cotización</h1>
      <p className="text-muted-foreground">Genera una nueva cotización para un cliente.</p>

      {(errorClientes || errorProductos) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorClientes && <p>{errorClientes}</p>}
            {errorProductos && <p>{errorProductos}</p>}
          </AlertDescription>
        </Alert>
      )}

      {tieneErroresDeStock && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Advertencia de Stock</AlertTitle>
          <AlertDescription>
            Los siguientes productos tienen cantidad mayor al stock disponible:
            <ul className="list-disc list-inside mt-2">
              {productosConStockInsuficiente.map((item) => (
                <li key={`${item.productoEmpresa}-${item.productoId}`}>
                  <strong>{item.nombreProducto}</strong> ({item.productoEmpresa}): Solicitado {item.cantidad}, Disponible {item.stockDisponible}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Cotización</CardTitle>
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
                loading={loadingClientes}
                disabled={loadingClientes || !!errorClientes}
              />
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
            <div className="grid gap-2">
              <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
              <Input
                id="fechaVencimiento"
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                min={fechaCotizacion}
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="notas">Notas/Observaciones</Label>
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
            {/* Selector de producto con filtro de empresa y cantidad */}
            <div className="grid gap-2 md:grid-cols-[1fr_2fr_1fr_1fr_1fr_auto]">
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
                  loading={loadingProductos}
                  disabled={loadingProductos || !!errorProductos}
                />
                {cantidadExcedeStock && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Stock: {stockDelProductoSeleccionado}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min={productoSeleccionadoData?.empresa === "PIEDRINERA" ? "0.01" : "1"}
                  step={productoSeleccionadoData?.empresa === "PIEDRINERA" ? "0.01" : "1"}
                  value={cantidadProducto}
                  onChange={(e) => setCantidadProducto(Number(e.target.value))}
                  className={cantidadExcedeStock ? "border-amber-500 focus-visible:ring-amber-500" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precioOriginal">Precio Original</Label>
                <Input
                  id="precioOriginal"
                  type="number"
                  value={precioOriginalProducto}
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precioDescuento">Precio c/Desc.</Label>
                <Input
                  id="precioDescuento"
                  type="number"
                  min="0"
                  step="0.01"
                  value={precioDescuentoProducto ?? ""}
                  onChange={(e) => setPrecioDescuentoProducto(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Opcional"
                  className={precioDescuentoProducto !== null && precioDescuentoProducto > 0 ? "border-green-500" : ""}
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={handleAddProduct} disabled={loadingProductos || !!errorProductos}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar
                </Button>
              </div>
            </div>

            {itemsCotizacion.length > 0 && (
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
                  {itemsCotizacion.map((item) => {
                    const tieneErrorStock = item.cantidad > item.stockDisponible && item.stockDisponible > 0
                    return (
                      <TableRow 
                        key={`${item.productoEmpresa}-${item.productoId}`} 
                        className={tieneErrorStock ? "bg-red-50" : ""}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.nombreProducto}
                              {tieneErrorStock && (
                                <AlertTriangle className="h-4 w-4 inline ml-2 text-red-500" />
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{item.productoCodigo}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getEmpresaBadgeColor(item.productoEmpresa)}>
                            {item.productoEmpresa}
                          </Badge>
                        </TableCell>
                        <TableCell className={tieneErrorStock ? "text-red-600 font-semibold" : ""}>
                          {item.cantidad}
                        </TableCell>
                        <TableCell>Q{item.precioUnitario.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">Q{item.subtotal.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveProduct(item.productoCodigo, item.productoEmpresa)}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
            <div className="flex justify-between items-center text-green-600">
              <span>Descuento Total:</span>
              <span className="font-medium">
                - Q{descuentoCalculado.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total a Pagar:</span>
              <span>
                Q{calcularTotal().toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || tieneErroresDeStock}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Cotización"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
