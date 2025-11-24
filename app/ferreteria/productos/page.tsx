"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Package, CheckCircle, XCircle, AlertCircle, Eye, Edit, Filter, X, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Loader2 } from "lucide-react"
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
  proveedor?: string
  activo: boolean
  fechaCreacion: string
  ultimaActualizacion: string
}

interface ProductosStats {
  total_productos: number
  productos_activos: number
  productos_inactivos: number
  productos_stock_bajo: number
}

interface Categoria {
  id: number
  nombre: string
  descripcion: string
  activo: boolean
}

interface PaginationInfo {
  count: number
  next: string | null
  previous: string | null
}

export default function ProductosFerreteriaPage() {
  const [productos, setProductos] = useState<ProductoFerreteria[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [stats, setStats] = useState<ProductosStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
  })
  const [filters, setFilters] = useState({
    estado: "todos",
    categoria: "todas",
    stockMinimo: "todos",
  })

  // Cargar datos desde Django
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Construir query params para filtros y paginación
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (filters.estado !== 'todos') params.append('estado', filters.estado)
        if (filters.categoria !== 'todas') params.append('categoria', filters.categoria)
        if (filters.stockMinimo !== 'todos') params.append('stockMinimo', filters.stockMinimo)
        // Agregar parámetro de página
        params.append('page', String(currentPage))

        const queryString = params.toString()
        const productosUrl = `${API_ENDPOINTS.FERRETERIA.PRODUCTOS}?${queryString}`

        // Cargar productos, estadísticas y categorías en paralelo
        // Usar Promise.allSettled para capturar errores individuales sin detener todo
        const [productosResult, statsResult, categoriasResult] = await Promise.allSettled([
          apiGet<any>(productosUrl),
          apiGet<ProductosStats>(API_ENDPOINTS.FERRETERIA.PRODUCTOS_STATS),
          apiGet<Categoria[]>(API_ENDPOINTS.FERRETERIA.PRODUCTOS_CATEGORIAS),
        ])

        // Procesar resultados con manejo de errores individual
        let productosResponse: any = null
        let statsData: ProductosStats | null = null
        let categoriasData: Categoria[] = []

        if (productosResult.status === 'fulfilled') {
          productosResponse = productosResult.value
        } else {
          console.error('Error al cargar productos:', productosResult.reason)
          throw productosResult.reason
        }

        if (statsResult.status === 'fulfilled') {
          statsData = statsResult.value
        } else {
          console.warn('Error al cargar estadísticas (continuando sin ellas):', statsResult.reason)
        }

        if (categoriasResult.status === 'fulfilled') {
          categoriasData = categoriasResult.value || []
        } else {
          console.warn('Error al cargar categorías (continuando sin ellas):', categoriasResult.reason)
        }

        // Manejar respuesta paginada de Django REST Framework
        let productosRaw: any[] = []
        let paginationInfo: PaginationInfo = {
          count: 0,
          next: null,
          previous: null,
        }

        if (Array.isArray(productosResponse)) {
          // Si es un array directo (sin paginación)
          productosRaw = productosResponse
          paginationInfo.count = productosResponse.length
        } else if (productosResponse && Array.isArray(productosResponse.results)) {
          // Respuesta paginada de DRF (formato estándar)
          productosRaw = productosResponse.results
          paginationInfo = {
            count: productosResponse.count || 0,
            next: productosResponse.next || null,
            previous: productosResponse.previous || null,
          }
        } else if (productosResponse && productosResponse.data && Array.isArray(productosResponse.data)) {
          // Otra posible estructura
          productosRaw = productosResponse.data
          paginationInfo.count = productosResponse.count || productosResponse.data.length
        } else {
          console.warn('Formato de respuesta inesperado:', productosResponse)
          productosRaw = []
        }

        // Mapear datos del backend (snake_case) al formato del frontend (camelCase)
        const productosData: ProductoFerreteria[] = productosRaw.map((producto: any) => ({
          id: String(producto.id || producto.pk || ''),
          codigo: producto.codigo || '',
          nombre: producto.nombre || '',
          descripcion: producto.descripcion || '',
          categoria: producto.categoria || producto.categoria_nombre || producto.categoria?.nombre || '',
          precioVenta: producto.precio_venta || producto.precioVenta || 0,
          costoUnitario: producto.costo_unitario || producto.costoUnitario || 0,
          unidadMedida: producto.unidad_medida || producto.unidad_medida_nombre || producto.unidad_medida?.nombre || producto.unidadMedida || '',
          stockActual: producto.stock_actual || producto.stockActual || 0,
          stockMinimo: producto.stock_minimo || producto.stockMinimo || 0,
          proveedor: producto.proveedor || null,
          activo: producto.activo !== undefined ? producto.activo : true,
          fechaCreacion: producto.fecha_creacion || producto.fechaCreacion || producto.created_at || new Date().toISOString(),
          ultimaActualizacion: producto.ultima_actualizacion || producto.ultimaActualizacion || producto.updated_at || new Date().toISOString(),
        }))

        setProductos(productosData)
        setPagination(paginationInfo)
        setStats(statsData)
        setCategorias(Array.isArray(categoriasData) ? categoriasData : [])
      } catch (err) {
        console.error('Error al cargar productos:', err)
        setError('Error al cargar los productos. Por favor, intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [searchTerm, filters, currentPage])

  // Los productos ya vienen paginados del backend
  const paginatedProductos = Array.isArray(productos) ? productos : []
  
  // Calcular información de paginación desde el backend
  // Django REST Framework típicamente usa 10 items por página por defecto
  const itemsPerPage = paginatedProductos.length > 0 
    ? paginatedProductos.length 
    : (pagination.count > 0 ? 10 : 0) // Si hay count pero no resultados, asumir 10 por página
  
  const totalPages = pagination.count > 0 && itemsPerPage > 0
    ? Math.ceil(pagination.count / itemsPerPage)
    : (paginatedProductos.length > 0 ? 1 : 0)
  
  const startIndex = pagination.count > 0 && itemsPerPage > 0
    ? (currentPage - 1) * itemsPerPage + 1
    : 1
  const endIndex = pagination.count > 0
    ? Math.min(currentPage * itemsPerPage, pagination.count)
    : paginatedProductos.length

  // Resetear página cuando cambian los filtros
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Resetear a la primera página cuando cambian los filtros
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Resetear a la primera página cuando cambia la búsqueda
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll al inicio de la tabla cuando cambia la página
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setFilters({ estado: "todos", categoria: "todas", stockMinimo: "todos" })
    setSearchTerm("")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    filters.estado !== "todos" || filters.categoria !== "todas" || filters.stockMinimo !== "todos"

  // Usar estadísticas del backend
  const totalProductos = stats?.total_productos ?? 0
  const productosActivos = stats?.productos_activos ?? 0
  const productosInactivos = stats?.productos_inactivos ?? 0
  const productosStockBajo = stats?.productos_stock_bajo ?? 0

  const getStatusVariant = (activo: boolean) => {
    return activo ? "default" : "destructive"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Cargando productos...</p>
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
        <h1 className="text-3xl font-bold">Productos</h1>
        <Link href="/ferreteria/productos/nuevo">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Producto
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductos}</div>
            <p className="text-xs text-muted-foreground">Artículos registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productosActivos}</div>
            <p className="text-xs text-muted-foreground">Disponibles para venta</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Inactivos</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productosInactivos}</div>
            <p className="text-xs text-muted-foreground">No disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productosStockBajo}</div>
            <p className="text-xs text-muted-foreground">Necesitan reabastecimiento</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar productos por código, nombre o categoría..."
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
                        <Label htmlFor="estado">Estado</Label>
                        <Select
                          value={filters.estado}
                          onValueChange={(value) => handleFilterChange("estado", value)}
                        >
                          <SelectTrigger id="estado">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="activo">Activos</SelectItem>
                            <SelectItem value="inactivo">Inactivos</SelectItem>
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
                              <SelectItem key={cat.id} value={cat.nombre}>
                                {cat.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Select
                          value={filters.stockMinimo}
                          onValueChange={(value) => handleFilterChange("stockMinimo", value)}
                        >
                          <SelectTrigger id="stock">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="bajo">Stock Bajo</SelectItem>
                            <SelectItem value="suficiente">Stock Suficiente</SelectItem>
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
                    Estado: {filters.estado === "activo" ? "Activos" : "Inactivos"}
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
                {filters.stockMinimo !== "todos" && (
                  <Badge variant="secondary" className="gap-1">
                    Stock: {filters.stockMinimo === "bajo" ? "Bajo" : "Suficiente"}
                    <button
                      onClick={() => handleFilterChange("stockMinimo", "todos")}
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
            {pagination.count > 0 ? (
              <>Mostrando {startIndex}-{endIndex} de {pagination.count} productos</>
            ) : (
              <>No hay productos para mostrar</>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProductos.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell className="font-medium">{producto.codigo}</TableCell>
                  <TableCell>{producto.nombre}</TableCell>
                  <TableCell>{producto.categoria}</TableCell>
                  <TableCell>{producto.proveedor || "-"}</TableCell>
                  <TableCell>Q{producto.precioVenta.toFixed(2)}</TableCell>
                  <TableCell>{producto.stockActual}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(producto.activo)}>{producto.activo ? "Activo" : "Inactivo"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/ferreteria/productos/${producto.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                      </Link>
                      <Link href={`/ferreteria/productos/${producto.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {paginatedProductos.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">No se encontraron productos.</p>
          )}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={!pagination.previous || currentPage === 1}
                      className="gap-1"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      <span className="hidden sm:block">Anterior</span>
                    </Button>
                  </PaginationItem>
                  {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
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
                            onClick={() => handlePageChange(page)}
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
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={!pagination.next || currentPage === totalPages}
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
    </div>
  )
}
