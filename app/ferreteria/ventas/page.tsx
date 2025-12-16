"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, DollarSign, Clock, CheckCircle, XCircle, Eye, Edit, Filter, X, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Loader2, RefreshCw, Trash2 } from "lucide-react"
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
import { apiGet, apiPost } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

const ITEMS_PER_PAGE = 10

interface Factura {
  id: number
  numero_factura: string
  empresa: string
  empresa_display: string
  cliente_id: number
  cliente_nombre: string
  cliente_nit: string | null
  subtotal: number
  descuento: number
  total: number
  total_pagado: number
  saldo_pendiente: number
  estado: string
  estado_display: string
  fecha_factura: string
  fecha_vencimiento: string | null
  observaciones: string | null
}

interface FacturaListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Factura[]
}

export default function VentasFerreteriaPage() {
  const { toast } = useToast()
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<any>(null)
  const [filters, setFilters] = useState({
    estado: "todos",
    periodo: "todos",
    empresa: "todos",
  })

  // Cargar facturas desde la API
  useEffect(() => {
    loadFacturas()
    loadStats()
  }, [currentPage, filters, searchTerm])

  const loadFacturas = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.append("page", String(currentPage))

      // Filtros
      if (filters.estado !== "todos") {
        // Mapear estados de UI a estados de API
        const estadoMap: Record<string, string> = {
          "Pendiente": "PENDIENTE",
          "Completada": "PAGADA",
          "Cancelada": "ANULADA",
        }
        params.append("estado", estadoMap[filters.estado] || filters.estado)
      } else {
        // Por defecto, excluir facturas canceladas
        params.append("estado_not", "ANULADA")
      }

      if (filters.empresa !== "todos") {
        params.append("empresa", filters.empresa)
      }

      // Filtro por período
      if (filters.periodo !== "todos") {
        const hoy = new Date()
        let fechaDesde = ""
        if (filters.periodo === "hoy") {
          fechaDesde = hoy.toISOString().split("T")[0]
        } else if (filters.periodo === "semana") {
          const semanaAtras = new Date(hoy)
          semanaAtras.setDate(hoy.getDate() - 7)
          fechaDesde = semanaAtras.toISOString().split("T")[0]
        } else if (filters.periodo === "mes") {
          const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
          fechaDesde = inicioMes.toISOString().split("T")[0]
        }
        if (fechaDesde) {
          params.append("fecha_desde", fechaDesde)
        }
        params.append("fecha_hasta", hoy.toISOString().split("T")[0])
      }

      // Búsqueda
      if (searchTerm) {
        params.append("numero", searchTerm)
      }

      const url = `${API_ENDPOINTS.FACTURACION.FACTURAS}?${params.toString()}`
      const data = await apiGet<FacturaListResponse>(url)

      setFacturas(data.results || [])
      setTotalCount(data.count || 0)
      setTotalPages(Math.ceil((data.count || 0) / ITEMS_PER_PAGE))
    } catch (err: any) {
      console.error("Error al cargar facturas:", err)
      setError(err.message || "Error al cargar las facturas")
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const hoy = new Date()
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      const params = new URLSearchParams()
      params.append("fecha_desde", inicioMes.toISOString().split("T")[0])
      params.append("fecha_hasta", hoy.toISOString().split("T")[0])

      const data = await apiGet<any>(`${API_ENDPOINTS.FACTURACION.FACTURAS_ESTADISTICAS}?${params.toString()}`)
      setStats(data)
    } catch (err) {
      console.error("Error al cargar estadísticas:", err)
    }
  }

  // Resetear página cuando cambian los filtros
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({ estado: "todos", periodo: "todos", empresa: "todos" })
    setSearchTerm("")
    setCurrentPage(1)
  }

  // Función para cancelar una factura
  const cancelarFactura = async (factura: Factura) => {
    if (factura.estado === "ANULADA") {
      toast({
        title: "Factura ya cancelada",
        description: "Esta factura ya está en estado cancelado",
        variant: "destructive",
      })
      return
    }

    if (factura.total_pagado > 0) {
      toast({
        title: "No se puede cancelar",
        description: "No se puede cancelar una factura que ya tiene pagos registrados",
        variant: "destructive",
      })
      return
    }

    try {
      await apiPost(API_ENDPOINTS.FACTURACION.FACTURA_ANULAR(factura.id), {})

      toast({
        title: "Factura cancelada",
        description: `La factura ${factura.numero_factura} ha sido cancelada exitosamente`,
      })

      // Recargar datos
      await loadFacturas()
      await loadStats()
    } catch (error: any) {
      console.error("Error al cancelar factura:", error)
      toast({
        title: "Error al cancelar",
        description: error.message || "No se pudo cancelar la factura",
        variant: "destructive",
      })
    }
  }

  const hasActiveFilters = filters.estado !== "todos" || filters.periodo !== "todos" || filters.empresa !== "todos"

  // Calcular estadísticas desde los datos de la API
  const totalVentasMes = stats?.total_ventas || 0
  const ventasPendientes = stats?.por_estado?.find((e: any) => e.estado === "PENDIENTE")?.count || 0
  const ventasCompletadas = stats?.por_estado?.find((e: any) => e.estado === "PAGADA")?.count || 0
  const ventasCanceladas = stats?.por_estado?.find((e: any) => e.estado === "ANULADA")?.count || 0

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PAGADA":
        return "default"
      case "PENDIENTE":
        return "secondary"
      case "PARCIAL":
        return "secondary"
      case "ANULADA":
        return "destructive"
      case "BORRADOR":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PAGADA":
        return "Pagada"
      case "PENDIENTE":
        return "Pendiente"
      case "PARCIAL":
        return "Pago Parcial"
      case "ANULADA":
        return "Anulada"
      case "BORRADOR":
        return "Borrador"
      default:
        return status
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ventas</h1>
        <Link href="/ferreteria/ventas/nueva">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Nueva Venta
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Q{stats?.total_ventas?.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Total de ingresos este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ventasPendientes}</div>
            <p className="text-xs text-muted-foreground">Por completar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ventasCompletadas}</div>
            <p className="text-xs text-muted-foreground">Transacciones finalizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Canceladas</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ventasCanceladas}</div>
            <p className="text-xs text-muted-foreground">Transacciones anuladas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar ventas por código, cliente o estado..."
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
                            <SelectItem value="Pendiente">Pendientes</SelectItem>
                            <SelectItem value="Completada">Pagadas</SelectItem>
                            <SelectItem value="Cancelada">Anuladas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="empresa">Empresa</Label>
                        <Select
                          value={filters.empresa}
                          onValueChange={(value) => handleFilterChange("empresa", value)}
                        >
                          <SelectTrigger id="empresa">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todas</SelectItem>
                            <SelectItem value="FERRETERIA">Ferretería</SelectItem>
                            <SelectItem value="BLOQUERA">Bloquera</SelectItem>
                            <SelectItem value="PIEDRINERA">Piedrinera</SelectItem>
                            <SelectItem value="MIXTA">Mixta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="periodo">Período</Label>
                        <Select
                          value={filters.periodo}
                          onValueChange={(value) => handleFilterChange("periodo", value)}
                        >
                          <SelectTrigger id="periodo">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="hoy">Hoy</SelectItem>
                            <SelectItem value="semana">Última Semana</SelectItem>
                            <SelectItem value="mes">Este Mes</SelectItem>
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
                    Estado: {filters.estado}
                    <button
                      type="button"
                      onClick={() => handleFilterChange("estado", "todos")}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      aria-label={`Quitar filtro de estado: ${filters.estado}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.periodo !== "todos" && (
                  <Badge variant="secondary" className="gap-1">
                    Período:{" "}
                    {filters.periodo === "hoy"
                      ? "Hoy"
                      : filters.periodo === "semana"
                        ? "Última Semana"
                        : "Este Mes"}
                    <button
                      type="button"
                      onClick={() => handleFilterChange("periodo", "todos")}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      aria-label={`Quitar filtro de período: ${filters.periodo === "hoy" ? "Hoy" : filters.periodo === "semana" ? "Última Semana" : "Este Mes"}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.empresa !== "todos" && (
                  <Badge variant="secondary" className="gap-1">
                    Empresa: {filters.empresa}
                    <button
                      type="button"
                      onClick={() => handleFilterChange("empresa", "todos")}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      aria-label={`Quitar filtro de empresa: ${filters.empresa}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {facturas.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount} facturas
            </div>
            <Button variant="outline" size="sm" onClick={() => loadFacturas()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-8">{error}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número Factura</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facturas.map((factura) => (
                    <TableRow key={factura.id}>
                      <TableCell className="font-medium">{factura.numero_factura}</TableCell>
                      <TableCell>{formatFecha(factura.fecha_factura)}</TableCell>
                      <TableCell>
                        <div>
                          <div>{factura.cliente_nombre}</div>
                          {factura.cliente_nit && (
                            <div className="text-xs text-muted-foreground">{factura.cliente_nit}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{factura.empresa_display || factura.empresa}</Badge>
                      </TableCell>
                      <TableCell>
                        Q{factura.total.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {factura.saldo_pendiente > 0 ? (
                          <span className="text-red-600 font-medium">
                            Q{factura.saldo_pendiente.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-green-600">Pagado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(factura.estado)}>
                          {getStatusDisplay(factura.estado)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/ferreteria/ventas/${factura.id}`}>
                            <Button variant="outline" size="sm" aria-label="Ver detalle de factura">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver</span>
                            </Button>
                          </Link>
                          {factura.estado !== "ANULADA" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelarFactura(factura)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              aria-label="Cancelar factura"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Cancelar</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {facturas.length === 0 && (
                <p className="text-center text-muted-foreground mt-4">No se encontraron facturas.</p>
              )}
            </>
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
    </div>
  )
}
