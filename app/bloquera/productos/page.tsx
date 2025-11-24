"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Package,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiFetch, apiDelete } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import type { ProductoBloquera } from "@/types/database"
import { Loader2 } from "lucide-react"

const ITEMS_PER_PAGE = 10

interface ProductosStats {
  total_productos?: number
  productos_activos?: number
  productos_inactivos?: number
  productos_stock_bajo?: number
  stock_total_unidades?: number
}

export default function ProductosBloqueraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [productos, setProductos] = useState<ProductoBloquera[]>([])
  const [stats, setStats] = useState<ProductosStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProducto, setSelectedProducto] = useState<ProductoBloquera | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null)

  const loadData = useCallback(
    async (showFullLoader = false) => {
      try {
        if (showFullLoader) {
          setLoading(true)
        } else {
          setIsRefreshing(true)
        }
        setError(null)

        const productosUrl = API_ENDPOINTS.BLOQUERA.PRODUCTOS

        // Cargar productos y estadísticas en paralelo
        const [productosResult, statsResult] = await Promise.allSettled([
          apiGet<any>(productosUrl),
          (async () => {
            try {
              const response = await apiFetch(API_ENDPOINTS.BLOQUERA.PRODUCTOS_STATS)
              if (response.ok) {
                return await response.json()
              }
              return null
            } catch (error) {
              return null
            }
          })(),
        ])

        // Procesar productos
        let productosData: ProductoBloquera[] = []
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
          console.error("Error al cargar productos:", productosResult.reason)
          throw productosResult.reason
        }

        // Procesar estadísticas
        let statsData: ProductosStats | null = null
        if (statsResult.status === "fulfilled" && statsResult.value) {
          statsData = statsResult.value
        }

        setProductos(productosData)
        setStats(statsData)
      } catch (err) {
        console.error("Error al cargar productos:", err)
        setError("Error al cargar los productos. Por favor, intenta de nuevo.")
      } finally {
        if (showFullLoader) {
          setLoading(false)
        } else {
          setIsRefreshing(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    loadData(true)
  }, [loadData])

  // Filtrar productos
  const filteredProductos = useMemo(() => {
    return productos.filter((producto) => {
      const matchesSearch =
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (producto.tipoBloque && producto.tipoBloque.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (producto.dimensiones && producto.dimensiones.toLowerCase().includes(searchTerm.toLowerCase()))

      return matchesSearch
    })
  }, [productos, searchTerm])

  // Paginación
  const totalPages = Math.ceil(filteredProductos.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedProductos = filteredProductos.slice(startIndex, endIndex)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleManualRefresh = () => {
    if (isRefreshing) return
    loadData(false)
  }

  const handleDeleteProducto = useCallback((producto: ProductoBloquera) => {
    // Cerrar el dropdown primero para evitar problemas de accesibilidad
    setOpenDropdownId(null)
    // Usar setTimeout para asegurar que el dropdown se cierre antes de abrir el dialog
    setTimeout(() => {
      setSelectedProducto(producto)
      setShowDeleteDialog(true)
    }, 100)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false)
    setSelectedProducto(null)
  }, [])

  const confirmDelete = async () => {
    if (!selectedProducto) return

    setIsDeleting(true)
    try {
      await apiDelete(`${API_ENDPOINTS.BLOQUERA.PRODUCTOS}/${selectedProducto.id}`)

      toast({
        title: "Producto Desactivado",
        description: `El producto "${selectedProducto.nombre}" ha sido desactivado exitosamente.`,
      })
      closeDeleteDialog()
      
      // Actualizar el estado del producto en la lista local (marcarlo como inactivo)
      setProductos((prev) => 
        prev.map((p) => 
          p.id === selectedProducto.id 
            ? { ...p, activo: false }
            : p
        )
      )
      
      // Actualizar las estadísticas localmente
      setStats((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          productos_activos: Math.max(0, (prev.productos_activos || 0) - 1),
          productos_inactivos: (prev.productos_inactivos || 0) + 1,
        }
      })
    } catch (error: any) {
      console.error("Error al eliminar producto:", error)
      toast({
        title: "Error",
        description: error.message || "Error al desactivar el producto. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Estadísticas
  const totalProductos = stats?.total_productos ?? productos.length
  const productosActivos = stats?.productos_activos ?? productos.filter((p) => p.activo).length
  const stockTotalUnidades = stats?.stock_total_unidades ?? productos.reduce((sum, p) => sum + (p.stockActual || 0), 0)
  const productosStockBajo = stats?.productos_stock_bajo ?? productos.filter((p) => (p.stockActual || 0) <= (p.stockMinimo || 0)).length

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Productos (Bloquera)</h1>
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
          <Link href="/bloquera/productos/nuevo">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Producto
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductos}</div>
            <p className="text-xs text-muted-foreground">Tipos de bloques registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloques Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productosActivos}</div>
            <p className="text-xs text-muted-foreground">Disponibles para producción/venta</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Total (unidades)</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockTotalUnidades}</div>
            <p className="text-xs text-muted-foreground">Unidades de bloques en inventario</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productosStockBajo}</div>
            <p className="text-xs text-muted-foreground">Tipos de bloques que necesitan producción</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos de Bloquera</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos por código, nombre, tipo o dimensiones..."
                className="w-full rounded-lg bg-background pl-8"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-4 text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProductos.length)} de {filteredProductos.length} productos
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Dimensiones</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProductos.map((producto) => (
                <TableRow 
                  key={producto.id}
                  className={!producto.activo ? "opacity-75 bg-muted/30" : ""}
                >
                  <TableCell className="font-medium">{producto.codigo}</TableCell>
                  <TableCell>{producto.nombre}</TableCell>
                  <TableCell>{producto.tipoBloque || producto.tipo_bloque || "-"}</TableCell>
                  <TableCell>{producto.dimensiones || "-"}</TableCell>
                  <TableCell>Q{(producto.precioVentaUnitario || producto.precio_unitario || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={producto.tieneStockBajo || ((producto.stockActual || 0) <= (producto.stockMinimo || 0)) ? "text-red-600 font-semibold" : ""}>
                        {producto.stockActual || producto.stock_actual || 0}
                      </span>
                      {(producto.stockActual || 0) <= (producto.stockMinimo || 0) && (
                        <span className="text-xs text-muted-foreground">
                          Mín: {producto.stockMinimo || producto.stock_minimo || 0}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(producto.activo)}>
                      {producto.activo ? "Activo" : "Desactivado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/bloquera/productos/${producto.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                      </Link>
                      <Link href={`/bloquera/productos/${producto.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                      <DropdownMenu 
                        open={openDropdownId === producto.id} 
                        onOpenChange={(open) => setOpenDropdownId(open ? producto.id : null)}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setOpenDropdownId(null)
                            router.push(`/bloquera/productos/${producto.id}`)
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setOpenDropdownId(null)
                            router.push(`/bloquera/productos/${producto.id}/editar`)
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar producto
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteProducto(producto)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Desactivar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* Dialog de Confirmación de Eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar Producto</DialogTitle>
            <DialogDescription>
              Esta acción desactivará el producto. ¿Está seguro de que desea continuar?
            </DialogDescription>
          </DialogHeader>
          {selectedProducto && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="font-semibold text-destructive">{selectedProducto.nombre}</p>
                <p className="text-sm text-muted-foreground mt-1">Código: {selectedProducto.codigo}</p>
                <p className="text-sm text-muted-foreground">Tipo: {selectedProducto.tipoBloque || selectedProducto.tipo_bloque || "-"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Desactivando..." : "Desactivar Producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
