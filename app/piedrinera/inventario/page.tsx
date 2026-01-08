"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PlusCircle,
  Search,
  Package,
  DollarSign,
  ArrowDownCircle,
  RefreshCw,
  Loader2,
  Filter,
  X,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Eye,
  Edit,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiFetch, apiGet } from "@/lib/api-client"
import type { MovimientoInventario } from "@/types/database"
import { useToast } from "@/hooks/use-toast"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ITEMS_PER_PAGE = 10
const MOVIMIENTOS_PER_PAGE = 5

interface ProductoPiedrinera {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  tipo: string
  granulometria?: string
  precioVenta: number
  costoProduccion: number
  stock: number
  stockMinimo: number
  activo: boolean
  ubicacion?: string
  calidad?: string
  proveedor?: string
  ultimaActualizacion?: string
}

interface ProductosStats {
  total_productos?: number
  productos_activos?: number
  productos_inactivos?: number
  productos_stock_bajo?: number
  stock_total_metros_cubicos?: number
  valor_total?: number
}

export default function InventarioPiedrineraPage() {
  const { toast } = useToast()
  const [productos, setProductos] = useState<ProductoPiedrinera[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([])
  const [stats, setStats] = useState<ProductosStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    estado: "todos",
    tipo: "todos",
    tipoMovimiento: "todos",
    fechaDesde: "",
    fechaHasta: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [movimientosPage, setMovimientosPage] = useState(1)

  const loadData = useCallback(
    async (showFullLoader = false) => {
      try {
        if (showFullLoader) {
          setLoading(true)
        } else {
          setIsRefreshing(true)
        }
        setError(null)

        const productosUrl = API_ENDPOINTS.PIEDRINERA.PRODUCTOS

        // Parámetros para movimientos
        const movParams = new URLSearchParams()
        if (filters.tipoMovimiento !== 'todos') {
          movParams.append('tipo', filters.tipoMovimiento)
        }
        if (filters.fechaDesde) {
          movParams.append('fecha_desde', filters.fechaDesde)
        }
        if (filters.fechaHasta) {
          movParams.append('fecha_hasta', filters.fechaHasta)
        }
        // La paginación se hace en el frontend, no enviamos 'page' al backend
        const movimientosUrl = movParams.toString() 
          ? `${API_ENDPOINTS.PIEDRINERA.MOVIMIENTOS_INVENTARIO}?${movParams.toString()}`
          : API_ENDPOINTS.PIEDRINERA.MOVIMIENTOS_INVENTARIO

        const [productosResult, statsResult, movimientosResult] = await Promise.allSettled([
          apiGet<any>(productosUrl),
          (async () => {
            try {
              const response = await apiFetch(API_ENDPOINTS.PIEDRINERA.PRODUCTOS_STATS)
              if (response.ok) {
                return await response.json()
              }
              return null
            } catch {
              return null
            }
          })(),
          apiGet<any>(movimientosUrl),
        ])

        let productosData: ProductoPiedrinera[] = []
        if (productosResult.status === "fulfilled") {
          const productosResponse = productosResult.value
          if (Array.isArray(productosResponse)) {
            productosData = productosResponse
          } else if (productosResponse && Array.isArray(productosResponse.results)) {
            productosData = productosResponse.results
          } else if (productosResponse && productosResponse.data && Array.isArray(productosResponse.data)) {
            productosData = productosResponse.data
          }
        } else {
          throw productosResult.reason
        }

        const mappedProductos = productosData.map((producto: any) => {
          // Debug: Log para ver qué campos tiene el producto
          if (productosData.length > 0 && productosData.indexOf(producto) === 0) {
            console.log('🔍 [Inventario Piedrinera] Primer producto de la API:', producto)
          }
          
          // Mapear costo de producción - el serializer puede devolverlo en diferentes formatos
          const costoProduccionValue = producto.costo_produccion_m3 ?? 
                                      producto.costoProduccionPorMetroCubico ?? 
                                      producto.costoProduccion ?? 
                                      0
          
          // Mapear stock - el serializer puede devolverlo en diferentes formatos
          const stockValue = producto.stock_actual_m3 ?? 
                            producto.stockActualMetrosCubicos ?? 
                            producto.stock ?? 
                            producto.stock_actual ?? 
                            0
          
          return {
            id: String(producto.id ?? producto.pk ?? ""),
            codigo: producto.codigo ?? "",
            nombre: producto.nombre ?? "",
            descripcion: producto.descripcion ?? null,
            tipo: producto.tipo ?? "",
            granulometria: producto.granulometria ?? null,
            precioVenta: producto.precioVenta ?? producto.precio_venta_m3 ?? producto.precioVentaPorMetroCubico ?? 0,
            costoProduccion: Number(costoProduccionValue) || 0,
            stock: Number(stockValue) || 0,
            stockMinimo: Number(producto.stock_minimo_m3 ?? 
                      producto.stockMinimoMetrosCubicos ?? 
                      producto.stockMinimo ?? 
                      producto.stock_minimo ?? 
                      0) || 0,
            activo: producto.activo !== undefined ? producto.activo : true,
            ubicacion: producto.ubicacion ?? null,
            calidad: producto.calidad ?? null,
            proveedor: producto.proveedor ?? null,
            ultimaActualizacion: producto.updated_at ?? producto.ultimaActualizacion ?? producto.fecha_actualizacion ?? producto.created_at ?? null,
          }
        })
        
        // Debug: Log del cálculo del valor total
        const valorCalculado = mappedProductos.reduce((sum, p) => {
          const valorProducto = (Number(p.stock) || 0) * (Number(p.costoProduccion) || 0)
          if (valorProducto > 0) {
            console.log(`🔍 [Inventario Piedrinera] Producto ${p.nombre}: stock=${p.stock}, costo=${p.costoProduccion}, valor=${valorProducto}`)
          }
          return sum + valorProducto
        }, 0)
        console.log('🔍 [Inventario Piedrinera] Valor total calculado:', valorCalculado)

        let statsData: ProductosStats | null = null
        if (statsResult.status === "fulfilled" && statsResult.value) {
          statsData = statsResult.value
        }

        // Procesar movimientos
        let movimientosData: MovimientoInventario[] = []
        if (movimientosResult.status === "fulfilled") {
          const movimientosResponse = movimientosResult.value
          if (Array.isArray(movimientosResponse)) {
            movimientosData = movimientosResponse
          } else if (movimientosResponse && Array.isArray(movimientosResponse.results)) {
            movimientosData = movimientosResponse.results
          } else if (movimientosResponse && movimientosResponse.data && Array.isArray(movimientosResponse.data)) {
            movimientosData = movimientosResponse.data
          }

          // Mapear datos del backend al formato del frontend
          movimientosData = movimientosData.map((mov: any) => ({
            id: mov.id,
            producto_id: mov.producto_id || mov.producto?.id,
            producto: mov.producto,
            tipo: mov.tipo || mov.tipo_ajuste || 'ENTRADA',
            tipoDisplay: mov.tipoDisplay || mov.tipo || mov.tipo_ajuste,
            cantidad: mov.cantidad,
            stockAnterior: mov.stockAnterior || mov.stock_anterior,
            stock_anterior: mov.stock_anterior || mov.stockAnterior,
            stockNuevo: mov.stockNuevo || mov.stock_nuevo,
            stock_nuevo: mov.stock_nuevo || mov.stockNuevo,
            motivo: mov.motivo || mov.razon,
            observaciones: mov.observaciones || mov.referencia,
            usuario_id: mov.usuario_id || mov.usuario?.id,
            usuario: mov.usuario,
            fechaMovimiento: mov.fechaMovimiento || mov.fecha_movimiento || mov.fecha_creacion || mov.created_at,
            fecha_movimiento: mov.fecha_movimiento || mov.fechaMovimiento || mov.fecha_creacion || mov.created_at,
            fecha_creacion: mov.fecha_creacion || mov.created_at || mov.fechaMovimiento || mov.fecha_movimiento,
            created_at: mov.created_at || mov.fecha_creacion,
            updated_at: mov.updated_at,
            // Campos legacy
            tipo_ajuste: mov.tipo_ajuste || mov.tipo,
            razon: mov.razon || mov.motivo,
            referencia: mov.referencia || mov.observaciones,
          }))
        } else {
          console.warn('Error al cargar movimientos (continuando sin ellos):', movimientosResult.reason)
        }

        setProductos(mappedProductos)
        setMovimientos(movimientosData)
        setStats(statsData)
      } catch (err) {
        console.error("Error al cargar inventario de piedrinera:", err)
        setError("Error al cargar el inventario. Por favor, intenta de nuevo.")
      } finally {
        if (showFullLoader) {
          setLoading(false)
        } else {
          setIsRefreshing(false)
        }
      }
    },
    [filters.tipoMovimiento, filters.fechaDesde, filters.fechaHasta]
  )

  useEffect(() => {
    loadData(true)
  }, [loadData])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
    setMovimientosPage(1)
  }

  const clearFilters = () => {
    setFilters({ estado: "todos", tipo: "todos", tipoMovimiento: "todos", fechaDesde: "", fechaHasta: "" })
    setCurrentPage(1)
    setMovimientosPage(1)
  }

  const handleManualRefresh = () => {
    if (!isRefreshing) {
      loadData(false)
      toast({
        title: "Inventario",
        description: "Actualizando datos del inventario...",
      })
    }
  }

  // Filtrar movimientos
  const filteredMovimientos = useMemo(() => {
    let filtered = movimientos

    if (filters.tipoMovimiento !== 'todos') {
      filtered = filtered.filter(m => {
        const tipo = m.tipo || m.tipo_ajuste
        return tipo === filters.tipoMovimiento
      })
    }

    // Ordenar por fecha más reciente
    return filtered.sort((a, b) => {
      const fechaA = new Date(a.fecha_creacion || a.fecha_movimiento || a.fechaMovimiento || a.created_at || '').getTime()
      const fechaB = new Date(b.fecha_creacion || b.fecha_movimiento || b.fechaMovimiento || b.created_at || '').getTime()
      return fechaB - fechaA
    })
  }, [movimientos, filters.tipoMovimiento])

  // Paginación de movimientos
  const movimientosTotalPages = Math.ceil(filteredMovimientos.length / MOVIMIENTOS_PER_PAGE)
  const movimientosStartIndex = (movimientosPage - 1) * MOVIMIENTOS_PER_PAGE
  const movimientosEndIndex = movimientosStartIndex + MOVIMIENTOS_PER_PAGE
  const paginatedMovimientos = filteredMovimientos.slice(movimientosStartIndex, movimientosEndIndex)

  const getTipoMovimientoBadge = (tipo: string) => {
    switch (tipo) {
      case "ENTRADA":
        return <Badge variant="default" className="bg-green-500">Entrada</Badge>
      case "SALIDA":
        return <Badge variant="destructive">Salida</Badge>
      case "AJUSTE":
        return <Badge variant="secondary">Ajuste</Badge>
      case "TRANSFERENCIA":
        return <Badge variant="outline" className="bg-blue-500 text-white">Transferencia</Badge>
      case "DEVOLUCION":
        return <Badge variant="outline" className="bg-purple-500 text-white">Devolución</Badge>
      default:
        return <Badge variant="outline">{tipo}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const hasActiveFilters =
    filters.estado !== "todos" ||
    filters.tipo !== "todos" ||
    filters.tipoMovimiento !== "todos" ||
    filters.fechaDesde !== "" ||
    filters.fechaHasta !== ""

  const tiposProducto = useMemo(() => {
    const set = new Set(
      productos
        .map((p) => p.tipo)
        .filter((tipo): tipo is string => Boolean(tipo))
    )
    return Array.from(set).sort()
  }, [productos])

  const filteredProductos = useMemo(() => {
    return productos.filter((producto) => {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        producto.nombre?.toLowerCase().includes(search) ||
        producto.codigo?.toLowerCase().includes(search) ||
        producto.tipo?.toLowerCase().includes(search) ||
        producto.granulometria?.toLowerCase().includes(search)

      const matchesEstado =
        filters.estado === "todos" ||
        (filters.estado === "bajo" && producto.stock <= (producto.stockMinimo || 0)) ||
        (filters.estado === "suficiente" && producto.stock > (producto.stockMinimo || 0))

      const matchesTipo =
        filters.tipo === "todos" ||
        (producto.tipo ?? "").toLowerCase() === filters.tipo.toLowerCase()

      return matchesSearch && matchesEstado && matchesTipo
    })
  }, [productos, searchTerm, filters])

  const totalPages = Math.max(1, Math.ceil(filteredProductos.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedProductos = filteredProductos.slice(startIndex, endIndex)

  const totalArticulos = stats?.total_productos ?? stats?.total_agregados ?? productos.length
  const agregadosActivos = stats?.productos_activos ?? stats?.agregados_activos ?? productos.filter((p) => p.activo).length
  const stockBajo = stats?.productos_stock_bajo ?? stats?.agregados_stock_bajo ?? productos.filter((p) => p.stock <= (p.stockMinimo || 0)).length
  const stockTotalMetrosCubicos =
    stats?.stock_total_metros_cubicos ?? productos.reduce((sum, p) => sum + (p.stock || 0), 0)
  // Valor inventario = suma de (stock_actual_m3 * costo_produccion_m3) para cada producto
  const valorTotalInventario =
    stats?.valor_total ??
    productos.reduce((sum, p) => sum + (Number(p.stock) || 0) * (Number(p.costoProduccion) || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Cargando inventario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-destructive">{error}</p>
              <Button onClick={() => loadData(true)}>Reintentar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventario de Piedrinera</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleManualRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
              </>
            )}
          </Button>
        <Link href="/piedrinera/inventario/ajustar">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajustar Inventario
          </Button>
        </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agregados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArticulos}</div>
            <p className="text-xs text-muted-foreground">Tipos de agregados únicos en stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agregados Activos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agregadosActivos}</div>
            <p className="text-xs text-muted-foreground">Disponibles para producción/venta</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockBajo}</div>
            <p className="text-xs text-muted-foreground">Agregados que necesitan producción</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Q{" "}
              {valorTotalInventario.toLocaleString("es-GT", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Costo total de agregados en stock</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agregados en Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                  placeholder="Buscar por código, nombre, tipo o granulometría..."
                className="w-full rounded-lg bg-background pl-8"
                value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2 px-1.5 py-0">
                        Activos
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filtros avanzados</h4>
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
                          <X className="h-3 w-3 mr-1" />
                          Limpiar
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Estado de Stock</Label>
                        <Select
                          value={filters.estado}
                          onValueChange={(value) => handleFilterChange("estado", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="bajo">Stock Bajo</SelectItem>
                            <SelectItem value="suficiente">Stock Suficiente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de Agregado</Label>
                        <Select
                          value={filters.tipo}
                          onValueChange={(value) => handleFilterChange("tipo", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Todos los tipos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            {tiposProducto.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {filters.estado !== "todos" && (
                  <Badge variant="secondary" className="gap-1">
                    Estado: {filters.estado === "bajo" ? "Stock Bajo" : "Stock Suficiente"}
                    <button
                      onClick={() => handleFilterChange("estado", "todos")}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.tipo !== "todos" && (
                  <Badge variant="secondary" className="gap-1">
                    Tipo: {filters.tipo}
                    <button
                      onClick={() => handleFilterChange("tipo", "todos")}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="mb-4 text-sm text-muted-foreground">
            Mostrando {filteredProductos.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredProductos.length)} de {filteredProductos.length} agregados
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Granulometría</TableHead>
                <TableHead>Stock (m³)</TableHead>
                <TableHead>Stock Mínimo (m³)</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Calidad</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProductos.map((producto) => {
                const stockBajoProducto = producto.stock <= (producto.stockMinimo || 0)
                return (
                  <TableRow key={producto.id} className={!producto.activo ? "opacity-75 bg-muted/30" : ""}>
                    <TableCell className="font-medium">{producto.codigo}</TableCell>
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell>{producto.tipo || "-"}</TableCell>
                    <TableCell>{producto.granulometria || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={stockBajoProducto ? "text-red-600 font-semibold" : ""}>
                          {producto.stock.toFixed(2)} m³
                        </span>
                        {stockBajoProducto && (
                          <span className="text-xs text-muted-foreground">Necesita reposición</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{producto.stockMinimo.toFixed(2)} m³</TableCell>
                    <TableCell>{producto.ubicacion || "-"}</TableCell>
                    <TableCell>
                      {producto.calidad ? (
                        <Badge variant={producto.calidad === "Excelente" ? "default" : producto.calidad === "Buena" ? "secondary" : "outline"}>
                          {producto.calidad}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{producto.proveedor || "-"}</TableCell>
                  <TableCell>
                      <Badge variant={stockBajoProducto ? "destructive" : "secondary"}>
                        {stockBajoProducto ? "Bajo" : "Suficiente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/piedrinera/productos/${producto.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/piedrinera/productos/${producto.id}/editar`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/piedrinera/inventario/${producto.id}/ajustar`}>
                          <Button variant="outline" size="sm">
                            Ajustar
                          </Button>
                        </Link>
                      </div>
                  </TableCell>
                </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {paginatedProductos.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">No se encontraron agregados en inventario.</p>
          )}

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="gap-1"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      <span className="hidden sm:block">Anterior</span>
                    </Button>
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <Button
                            variant={currentPage === page ? "outline" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? "font-semibold" : ""}
                          >
                            {page}
                          </Button>
                        </PaginationItem>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    return null
                  })}
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="gap-1"
                    >
                      <span className="hidden sm:block">Siguiente</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección de Movimientos Recientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Movimientos de Inventario Recientes</CardTitle>
            <Select
              value={filters.tipoMovimiento}
              onValueChange={(value) => handleFilterChange("tipoMovimiento", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="ENTRADA">Entradas</SelectItem>
                <SelectItem value="SALIDA">Salidas</SelectItem>
                <SelectItem value="AJUSTE">Ajustes</SelectItem>
                <SelectItem value="TRANSFERENCIA">Transferencias</SelectItem>
                <SelectItem value="DEVOLUCION">Devoluciones</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMovimientos.length === 0 ? (
            <p className="text-center text-muted-foreground mt-4">No se encontraron movimientos.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cantidad (m³)</TableHead>
                    <TableHead>Stock Anterior (m³)</TableHead>
                    <TableHead>Stock Nuevo (m³)</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMovimientos.map((movimiento) => (
                    <TableRow key={movimiento.id}>
                      <TableCell>{formatDate(movimiento.fecha_creacion || movimiento.fecha_movimiento || movimiento.fechaMovimiento || movimiento.created_at || '')}</TableCell>
                      <TableCell>
                        {movimiento.producto?.nombre || `Producto #${movimiento.producto_id}`}
                        {movimiento.producto?.codigo && (
                          <span className="text-xs text-muted-foreground ml-1">({movimiento.producto.codigo})</span>
                        )}
                      </TableCell>
                      <TableCell>{getTipoMovimientoBadge(movimiento.tipo || movimiento.tipo_ajuste || 'ENTRADA')}</TableCell>
                      <TableCell>{Math.abs(movimiento.cantidad).toFixed(2)} m³</TableCell>
                      <TableCell>{movimiento.stock_anterior ? `${movimiento.stock_anterior.toFixed(2)} m³` : '-'}</TableCell>
                      <TableCell className="font-medium">{movimiento.stock_nuevo ? `${movimiento.stock_nuevo.toFixed(2)} m³` : '-'}</TableCell>
                      <TableCell className="max-w-xs truncate" title={movimiento.motivo || movimiento.razon || ''}>
                        {movimiento.motivo || movimiento.razon || '-'}
                      </TableCell>
                      <TableCell>{movimiento.observaciones || movimiento.referencia || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {movimientosTotalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMovimientosPage((prev) => Math.max(1, prev - 1))}
                          disabled={movimientosPage === 1}
                          className="gap-1"
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                          <span className="hidden sm:block">Anterior</span>
                        </Button>
                      </PaginationItem>
                      {Array.from({ length: movimientosTotalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === movimientosTotalPages ||
                          (page >= movimientosPage - 1 && page <= movimientosPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <Button
                                variant={movimientosPage === page ? "outline" : "ghost"}
                                size="sm"
                                onClick={() => setMovimientosPage(page)}
                                className={movimientosPage === page ? "font-semibold" : ""}
                              >
                                {page}
                              </Button>
                            </PaginationItem>
                          )
                        } else if (page === movimientosPage - 2 || page === movimientosPage + 2) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        }
                        return null
                      })}
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMovimientosPage((prev) => Math.min(movimientosTotalPages, prev + 1))}
                          disabled={movimientosPage === movimientosTotalPages}
                          className="gap-1"
                        >
                          <span className="hidden sm:block">Siguiente</span>
                          <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
