"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, ArrowUpCircle, ArrowDownCircle, Package, DollarSign, Filter, X, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Eye, Download, RefreshCw, Loader2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import type { MovimientoInventario } from "@/types/database"

const ITEMS_PER_PAGE = 10
const MOVIMIENTOS_PER_PAGE = 5

interface ProductoFerreteria {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  categoria: string
  precioVenta: number
  costoUnitario: number
  unidadMedida: string
  stockActual: number
  stockMinimo: number
  activo: boolean
  fechaCreacion: string
  ultimaActualizacion: string
}

interface MovimientosStats {
  total_movimientos: number
  movimientos_hoy: number
  entradas_total: number
  salidas_total: number
}

export default function InventarioFerreteriaPage() {
  const [productos, setProductos] = useState<ProductoFerreteria[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([])
  const [stats, setStats] = useState<MovimientosStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [movimientosPage, setMovimientosPage] = useState(1)
  const [filters, setFilters] = useState({
    estado: "todos",
    categoria: "todas",
    tipoMovimiento: "todos",
  })

  // Cargar datos desde la API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Construir query params para filtros
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (filters.categoria !== 'todas') params.append('categoria', filters.categoria)

        const queryString = params.toString()
        const productosUrl = queryString 
          ? `${API_ENDPOINTS.FERRETERIA.PRODUCTOS}?${queryString}`
          : API_ENDPOINTS.FERRETERIA.PRODUCTOS

        // Parámetros para movimientos
        const movParams = new URLSearchParams()
        if (filters.tipoMovimiento !== 'todos') {
          movParams.append('tipo_ajuste', filters.tipoMovimiento)
        }
        movParams.append('limit', '50') // Obtener los últimos 50 movimientos
        const movimientosUrl = `${API_ENDPOINTS.FERRETERIA.MOVIMIENTOS_INVENTARIO}?${movParams.toString()}`

        // Cargar productos y movimientos en paralelo
        const [productosResult, movimientosResult] = await Promise.allSettled([
          apiGet<any>(productosUrl),
          apiGet<any>(movimientosUrl),
        ])

        // Procesar productos
        let productosData: ProductoFerreteria[] = []
        if (productosResult.status === 'fulfilled') {
          const productosResponse = productosResult.value
          if (Array.isArray(productosResponse)) {
            productosData = productosResponse
          } else if (productosResponse && Array.isArray(productosResponse.results)) {
            productosData = productosResponse.results
          } else if (productosResponse && productosResponse.data && Array.isArray(productosResponse.data)) {
            productosData = productosResponse.data
          }
        } else {
          console.error('Error al cargar productos:', productosResult.reason)
          throw productosResult.reason
        }

        // Procesar movimientos
        let movimientosData: MovimientoInventario[] = []
        if (movimientosResult.status === 'fulfilled') {
          const movimientosResponse = movimientosResult.value
          if (Array.isArray(movimientosResponse)) {
            movimientosData = movimientosResponse
          } else if (movimientosResponse && Array.isArray(movimientosResponse.results)) {
            movimientosData = movimientosResponse.results
          } else if (movimientosResponse && movimientosResponse.data && Array.isArray(movimientosResponse.data)) {
            movimientosData = movimientosResponse.data
          }
        } else {
          console.warn('Error al cargar movimientos (continuando sin ellos):', movimientosResult.reason)
        }

        // Calcular estadísticas de movimientos
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const movimientosHoy = movimientosData.filter(mov => {
          const fechaMov = new Date(mov.fecha_creacion)
          fechaMov.setHours(0, 0, 0, 0)
          return fechaMov.getTime() === hoy.getTime()
        })

        const statsData: MovimientosStats = {
          total_movimientos: movimientosData.length,
          movimientos_hoy: movimientosHoy.length,
          entradas_total: movimientosData.filter(m => m.tipo_ajuste === 'ENTRADA').reduce((sum, m) => sum + m.cantidad, 0),
          salidas_total: movimientosData.filter(m => m.tipo_ajuste === 'SALIDA').reduce((sum, m) => sum + m.cantidad, 0),
        }

        setProductos(productosData)
        setMovimientos(movimientosData)
        setStats(statsData)
      } catch (err) {
        console.error('Error al cargar datos de inventario:', err)
        setError('Error al cargar los datos de inventario. Por favor, intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [searchTerm, filters.categoria, filters.tipoMovimiento])

  // Obtener categorías únicas
  const categorias = useMemo(() => {
    const cats = new Set(productos.map((item) => item.categoria).filter(Boolean))
    return Array.from(cats).sort()
  }, [productos])

  // Filtrar productos
  const filteredProductos = useMemo(() => {
    return productos.filter((item) => {
      // Búsqueda por texto
      const matchesSearch =
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por estado
      const matchesEstado =
        filters.estado === "todos" ||
        (filters.estado === "bajo" && item.stockActual <= item.stockMinimo) ||
        (filters.estado === "suficiente" && item.stockActual > item.stockMinimo)

      // Filtro por categoría
      const matchesCategoria = filters.categoria === "todas" || item.categoria === filters.categoria

      // Solo productos activos
      return item.activo && matchesSearch && matchesEstado && matchesCategoria
    })
  }, [productos, searchTerm, filters])

  // Filtrar movimientos
  const filteredMovimientos = useMemo(() => {
    let filtered = movimientos

    if (filters.tipoMovimiento !== 'todos') {
      filtered = filtered.filter(m => m.tipo_ajuste === filters.tipoMovimiento)
    }

    // Ordenar por fecha más reciente
    return filtered.sort((a, b) => {
      const fechaA = new Date(a.fecha_creacion).getTime()
      const fechaB = new Date(b.fecha_creacion).getTime()
      return fechaB - fechaA
    })
  }, [movimientos, filters.tipoMovimiento])

  // Paginación de productos
  const totalPages = Math.ceil(filteredProductos.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedProductos = filteredProductos.slice(startIndex, endIndex)

  // Paginación de movimientos
  const movimientosTotalPages = Math.ceil(filteredMovimientos.length / MOVIMIENTOS_PER_PAGE)
  const movimientosStartIndex = (movimientosPage - 1) * MOVIMIENTOS_PER_PAGE
  const movimientosEndIndex = movimientosStartIndex + MOVIMIENTOS_PER_PAGE
  const paginatedMovimientos = filteredMovimientos.slice(movimientosStartIndex, movimientosEndIndex)

  // Resetear página cuando cambian los filtros
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
    setMovimientosPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({ estado: "todos", categoria: "todas", tipoMovimiento: "todos" })
    setSearchTerm("")
    setCurrentPage(1)
    setMovimientosPage(1)
  }

  const hasActiveFilters =
    filters.estado !== "todos" || filters.categoria !== "todas" || filters.tipoMovimiento !== "todos"

  // Calcular estadísticas
  const totalProductos = productos.filter(p => p.activo).length
  const productosStockBajo = productos.filter(p => p.activo && p.stockActual <= p.stockMinimo).length
  const valorTotalInventario = productos
    .filter(p => p.activo)
    .reduce((sum, item) => sum + item.stockActual * (item.costoUnitario || 0), 0)

  const getTipoMovimientoBadge = (tipo: string) => {
    switch (tipo) {
      case "ENTRADA":
        return <Badge variant="default" className="bg-green-500">Entrada</Badge>
      case "SALIDA":
        return <Badge variant="destructive">Salida</Badge>
      case "CORRECCION":
        return <Badge variant="secondary">Corrección</Badge>
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
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-center text-destructive">{error}</p>
              <Button onClick={() => window.location.reload()}>Reintentar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventario de Ferretería</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
          </Button>
          <Button variant="outline" onClick={() => {
            // Función para exportar a CSV
            const headers = ["Código", "Nombre", "Categoría", "Cantidad", "Stock Mínimo", "Estado", "Valor Total"]
            const rows = filteredProductos.map(item => [
              item.codigo,
              item.nombre,
              item.categoria,
              item.stockActual,
              item.stockMinimo,
              item.stockActual <= item.stockMinimo ? "Bajo" : "Suficiente",
              (item.stockActual * (item.costoUnitario || 0)).toFixed(2)
            ])
            const csv = [headers, ...rows].map(row => row.join(",")).join("\n")
            const blob = new Blob([csv], { type: "text/csv" })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `inventario-ferreteria-${new Date().toISOString().split("T")[0]}.csv`
            a.click()
          }}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
          <Link href="/ferreteria/inventario/ajustar">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajustar Inventario
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artículos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductos}</div>
            <p className="text-xs text-muted-foreground">Artículos únicos en stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Q{" "}
              {valorTotalInventario.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Costo total de los productos en stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productosStockBajo}</div>
            <p className="text-xs text-muted-foreground">Artículos que necesitan reabastecimiento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos Hoy</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.movimientos_hoy ?? 0}</div>
            <p className="text-xs text-muted-foreground">Movimientos en las últimas 24h</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Artículos en Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por código o nombre..."
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
                      <h4 className="font-medium">Filtros Avanzados</h4>
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
                          <X className="h-3 w-3 mr-1" />
                          Limpiar
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado de Stock</Label>
                        <Select
                          value={filters.estado}
                          onValueChange={(value) => handleFilterChange("estado", value)}
                        >
                          <SelectTrigger id="estado">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="bajo">Stock Bajo</SelectItem>
                            <SelectItem value="suficiente">Stock Suficiente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoría</Label>
                        <Select
                          value={filters.categoria}
                          onValueChange={(value) => handleFilterChange("categoria", value)}
                        >
                          <SelectTrigger id="categoria">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todas">Todas</SelectItem>
                            {categorias.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
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
                {filters.categoria !== "todas" && (
                  <Badge variant="secondary" className="gap-1">
                    Categoría: {filters.categoria}
                    <button
                      onClick={() => handleFilterChange("categoria", "todas")}
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
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProductos.length)} de {filteredProductos.length} artículos
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre del Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Stock Mínimo</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProductos.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.codigo}</TableCell>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>{item.categoria}</TableCell>
                  <TableCell>{item.stockActual}</TableCell>
                  <TableCell>{item.stockMinimo}</TableCell>
                  <TableCell className="font-medium">
                    Q{((item.stockActual || 0) * (item.costoUnitario || 0)).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.stockActual <= item.stockMinimo ? "destructive" : "secondary"}>
                      {item.stockActual <= item.stockMinimo ? "Bajo" : "Suficiente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/ferreteria/productos/${item.id}`}>
                        <Button variant="ghost" size="sm" title="Ver detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/ferreteria/inventario/${item.id}/ajustar`}>
                        <Button variant="outline" size="sm">
                          Ajustar
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {paginatedProductos.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">No se encontraron artículos.</p>
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
                <SelectItem value="CORRECCION">Correcciones</SelectItem>
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
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Stock Anterior</TableHead>
                    <TableHead>Stock Nuevo</TableHead>
                    <TableHead>Razón</TableHead>
                    <TableHead>Referencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMovimientos.map((movimiento) => (
                    <TableRow key={movimiento.id}>
                      <TableCell>{formatDate(movimiento.fecha_creacion)}</TableCell>
                      <TableCell>
                        {movimiento.producto?.nombre || `Producto #${movimiento.producto_id}`}
                        {movimiento.producto?.codigo && (
                          <span className="text-xs text-muted-foreground ml-1">({movimiento.producto.codigo})</span>
                        )}
                      </TableCell>
                      <TableCell>{getTipoMovimientoBadge(movimiento.tipo_ajuste)}</TableCell>
                      <TableCell>{movimiento.cantidad}</TableCell>
                      <TableCell>{movimiento.stock_anterior}</TableCell>
                      <TableCell className="font-medium">{movimiento.stock_nuevo}</TableCell>
                      <TableCell className="max-w-xs truncate" title={movimiento.razon}>
                        {movimiento.razon}
                      </TableCell>
                      <TableCell>{movimiento.referencia || "-"}</TableCell>
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
