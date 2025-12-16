"use client"

import type React from "react"

import { useState, useEffect, useMemo, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, XCircle, ArrowLeft, AlertCircle, Loader2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
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

interface CotizacionAPI {
  id: number
  numero_cotizacion: string
  empresa: string
  cliente: number
  cliente_nombre: string
  cliente_nit?: string
  subtotal: number
  descuento: number
  total: number
  estado: string
  estado_display: string
  observaciones?: string
  condiciones?: string
  fecha_vencimiento: string
  fecha_cotizacion: string
  detalles: {
    id: number
    producto_codigo: string
    producto_nombre: string
    producto_empresa: string
    cantidad: number
    precio_unitario: number
    descuento: number
    subtotal: number
  }[]
}

type EstadoCotizacion = "BORRADOR" | "ENVIADA" | "ACEPTADA" | "RECHAZADA" | "VENCIDA"
type EmpresaFiltro = "TODAS" | "FERRETERIA" | "BLOQUERA" | "PIEDRINERA"

interface EditarCotizacionPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditarCotizacionPage({ params }: EditarCotizacionPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { token } = useAuth()

  // Estados para datos de la API
  const [clientes, setClientes] = useState<ClienteAPI[]>([])
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoDisponible[]>([])
  const [cotizacionOriginal, setCotizacionOriginal] = useState<CotizacionAPI | null>(null)
  const [loadingCotizacion, setLoadingCotizacion] = useState(true)
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [errorClientes, setErrorClientes] = useState<string | null>(null)
  const [errorProductos, setErrorProductos] = useState<string | null>(null)
  const [errorCotizacion, setErrorCotizacion] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filtros de productos
  const [empresaFiltro, setEmpresaFiltro] = useState<EmpresaFiltro>("TODAS")

  // Estados del formulario
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("")
  const [fechaVencimiento, setFechaVencimiento] = useState<string>("")
  const [itemsCotizacion, setItemsCotizacion] = useState<CotizacionItem[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("")
  const [cantidadProducto, setCantidadProducto] = useState<number>(1)
  const [precioOriginalProducto, setPrecioOriginalProducto] = useState<number>(0)
  const [precioDescuentoProducto, setPrecioDescuentoProducto] = useState<number | null>(null)
  const [notas, setNotas] = useState<string>("")
  const [estadoCotizacion, setEstadoCotizacion] = useState<EstadoCotizacion>("BORRADOR")
  const [itemsCargadosInicialmente, setItemsCargadosInicialmente] = useState(false)

  // Verificar si hay productos con stock insuficiente
  const productosConStockInsuficiente = useMemo(() => {
    return itemsCotizacion.filter((item) => item.cantidad > item.stockDisponible && item.stockDisponible > 0)
  }, [itemsCotizacion])

  const tieneErroresDeStock = productosConStockInsuficiente.length > 0

  // Verificar stock del producto seleccionado
  const productoSeleccionadoData = useMemo(() => {
    if (!productoSeleccionado) return null
    const [empresa, idProd] = productoSeleccionado.split("-")
    return productosDisponibles.find((p) => p.empresa === empresa && String(p.id) === idProd)
  }, [productoSeleccionado, productosDisponibles])

  const stockDelProductoSeleccionado = useMemo(() => {
    if (!productoSeleccionadoData) return 0
    return productoSeleccionadoData.stock
  }, [productoSeleccionadoData])

  const cantidadExcedeStock = cantidadProducto > stockDelProductoSeleccionado && stockDelProductoSeleccionado > 0

  // Cargar cotización desde la API
  useEffect(() => {
    const fetchCotizacion = async () => {
      if (!token) return

      try {
        setLoadingCotizacion(true)
        setErrorCotizacion(null)
        const response = await fetch(`/api/facturacion/cotizaciones/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Cotización no encontrada")
          }
          throw new Error("Error al cargar la cotización")
        }

        const data: CotizacionAPI = await response.json()
        setCotizacionOriginal(data)
        setClienteSeleccionado(data.cliente.toString())
        setFechaVencimiento(data.fecha_vencimiento)
        setNotas(data.observaciones || "")
        setEstadoCotizacion(data.estado as EstadoCotizacion)
      } catch (error) {
        console.error("Error al cargar cotización:", error)
        setErrorCotizacion(error instanceof Error ? error.message : "Error al cargar la cotización")
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al cargar la cotización",
          variant: "destructive",
        })
      } finally {
        setLoadingCotizacion(false)
      }
    }

    fetchCotizacion()
  }, [token, id, toast])

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
        setErrorClientes("No se pudieron cargar los clientes.")
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
        setErrorProductos("No se pudieron cargar los productos.")
      } finally {
        setLoadingProductos(false)
      }
    }

    loadProductos()
  }, [])

  // Cargar items de la cotización cuando tengamos productos y cotización (solo una vez)
  useEffect(() => {
    if (cotizacionOriginal && productosDisponibles.length > 0 && !itemsCargadosInicialmente) {
      const items: CotizacionItem[] = cotizacionOriginal.detalles.map((detalle) => {
        // Buscar el producto actual para obtener el stock y precio original
        // Primero intenta buscar por código y empresa, luego solo por código
        let producto = productosDisponibles.find(
          (p) => p.codigo === detalle.producto_codigo && p.empresa === detalle.producto_empresa
        )
        
        // Si no encuentra por empresa (puede ser undefined en cotizaciones antiguas), buscar solo por código
        if (!producto && detalle.producto_codigo) {
          producto = productosDisponibles.find((p) => p.codigo === detalle.producto_codigo)
        }
        
        const stockActual = producto ? producto.stock : 0
        const unidadMedida = producto ? producto.unidadMedida : "unidades"
        const precioOriginal = producto ? producto.precioVenta : Number(detalle.precio_unitario)
        // Usar la empresa del producto encontrado o la del detalle, o "FERRETERIA" por defecto
        const empresaProducto = producto?.empresa || detalle.producto_empresa || "FERRETERIA"

        return {
          productoId: producto?.id.toString() || "0",
          nombreProducto: detalle.producto_nombre,
          productoCodigo: detalle.producto_codigo,
          productoEmpresa: empresaProducto,
          cantidad: Number(detalle.cantidad),
          precioUnitario: Number(detalle.precio_unitario),
          precioOriginal: precioOriginal,
          descuento: Number(detalle.descuento) || 0,
          subtotal: Number(detalle.subtotal),
          stockDisponible: stockActual,
          unidadMedida,
        }
      })
      setItemsCotizacion(items)
      setItemsCargadosInicialmente(true)
    }
  }, [cotizacionOriginal, productosDisponibles, itemsCargadosInicialmente])

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
    const [empresa, idProd] = productoValue.split("-")
    const producto = productosDisponibles.find((p) => p.empresa === empresa && String(p.id) === idProd)
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

    const [empresa, idProd] = productoSeleccionado.split("-")
    const producto = productosDisponibles.find((p) => p.empresa === empresa && String(p.id) === idProd)
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
        description: "Hay productos con cantidad mayor al stock disponible. Por favor, corrige las cantidades.",
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

    // Validar que todos los productos tengan IDs válidos
    const productosInvalidos = itemsCotizacion.filter((item) => {
      const producto = productosDisponibles.find(
        (p) => p.codigo === item.productoCodigo && p.empresa === item.productoEmpresa
      )
      if (!producto) {
        // También buscar solo por código
        const productoSoloPorCodigo = productosDisponibles.find((p) => p.codigo === item.productoCodigo)
        if (!productoSoloPorCodigo) {
          return true // Producto no encontrado
        }
      }
      return false
    })

    if (productosInvalidos.length > 0) {
      toast({
        title: "Error de productos",
        description: `Los siguientes productos no se encontraron en el sistema: ${productosInvalidos.map((p) => p.nombreProducto).join(", ")}. Por favor, quítalos y vuelve a agregarlos.`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Determinar la empresa principal de la cotización
      const empresas = Array.from(new Set(itemsCotizacion.map((item) => item.productoEmpresa)))
      const empresa = empresas.length === 1 ? empresas[0] : "MIXTA"

      // Construir los detalles con IDs válidos
      const detalles = itemsCotizacion.map((item) => {
        // Buscar el producto por código para obtener el ID correcto
        let producto = productosDisponibles.find(
          (p) => p.codigo === item.productoCodigo && p.empresa === item.productoEmpresa
        )
        
        // Si no encuentra, buscar solo por código
        if (!producto) {
          producto = productosDisponibles.find((p) => p.codigo === item.productoCodigo)
        }
        
        // Obtener el ID del producto
        const productoId = producto ? (typeof producto.id === 'string' ? parseInt(producto.id) : producto.id as number) : 0
        const empresaProducto = producto?.empresa || item.productoEmpresa
        
        return {
          producto_id: productoId,
          producto_empresa: empresaProducto,
          cantidad: item.cantidad,
          precio_unitario: item.precioUnitario,
          descuento: item.descuento || 0,
        }
      })

      // Para actualizar, usamos PUT para enviar todos los datos incluyendo detalles
      const cotizacionData = {
        cliente: parseInt(clienteSeleccionado),
        empresa,
        descuento: descuentoCalculado,
        observaciones: notas || null,
        fecha_vencimiento: fechaVencimiento,
        estado: estadoCotizacion,
        detalles,
      }

      const response = await fetch(`/api/facturacion/cotizaciones/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cotizacionData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error data del servidor:", errorData)
        console.error("Datos enviados:", cotizacionData)
        const errorMsg = errorData.error || errorData.detail || JSON.stringify(errorData) || "Error al actualizar la cotización"
        throw new Error(errorMsg)
      }

      const data = await response.json()

      toast({
        title: "Cotización Actualizada",
        description: `La cotización ${data.numero_cotizacion} ha sido actualizada exitosamente.`,
      })

      router.push(`/ferreteria/cotizaciones/${id}`)
    } catch (error) {
      console.error("Error al actualizar cotización:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la cotización",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingCotizacion) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Cargando cotización...</p>
      </div>
    )
  }

  if (errorCotizacion || !cotizacionOriginal) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorCotizacion || "No se pudo cargar la cotización"}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.push("/ferreteria/cotizaciones")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Cotizaciones
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Cotización: {cotizacionOriginal.numero_cotizacion}</h1>
      </div>
      <p className="text-muted-foreground">Modifica los detalles de la cotización existente.</p>

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
              <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
              <Input
                id="fechaVencimiento"
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado de la Cotización</Label>
              <Select
                value={estadoCotizacion}
                onValueChange={(value: EstadoCotizacion) => setEstadoCotizacion(value)}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BORRADOR">Borrador</SelectItem>
                  <SelectItem value="ENVIADA">Enviada</SelectItem>
                  <SelectItem value="ACEPTADA">Aceptada</SelectItem>
                  <SelectItem value="RECHAZADA">Rechazada</SelectItem>
                  <SelectItem value="VENCIDA">Vencida</SelectItem>
                </SelectContent>
              </Select>
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
                <Label htmlFor="producto">Agregar Producto</Label>
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
