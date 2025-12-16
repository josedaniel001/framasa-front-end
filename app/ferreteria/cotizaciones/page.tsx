"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, FileText, Clock, CheckCircle, XCircle, Eye, Edit, Filter, X, Download, RefreshCw, DollarSign, TrendingUp, Percent, Calendar, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Loader2, Trash2 } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const ITEMS_PER_PAGE = 10

interface Cotizacion {
  id: number
  numero_cotizacion: string
  empresa: string
  empresa_display: string
  cliente_id: number
  cliente_nombre: string
  cliente_nit: string | null
  subtotal: number
  descuento: number
  total: number
  estado: string
  estado_display: string
  fecha_cotizacion: string
  fecha_vencimiento: string
  fecha_aceptacion: string | null
  factura_generada: number | null
  factura_generada_numero: string | null
  observaciones: string | null
  condiciones: string | null
  detalles: Array<{
    id: number
    producto_id: number
    producto_empresa: string
    producto_codigo: string
    producto_nombre: string
    cantidad: number
    precio_unitario: number
    descuento: number
    subtotal: number
  }>
}

interface CotizacionListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Cotizacion[]
}

export default function CotizacionesFerreteriaPage() {
  const { toast } = useToast()
  const { token } = useAuth()
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [filters, setFilters] = useState({
    estado: "todos",
    periodo: "todos",
    empresa: "todos",
  })

  // Cargar cotizaciones desde la API
  useEffect(() => {
    loadCotizaciones()
  }, [currentPage, filters, searchTerm])

  const loadCotizaciones = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.append("page", String(currentPage))
      params.append("limit", String(ITEMS_PER_PAGE))

      // Filtros
      if (filters.estado !== "todos") {
        const estadoMap: Record<string, string> = {
          "Pendiente": "ENVIADA",
          "Aceptada": "ACEPTADA",
          "Rechazada": "RECHAZADA",
          "Borrador": "BORRADOR",
          "Vencida": "VENCIDA",
        }
        params.append("estado", estadoMap[filters.estado] || filters.estado)
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

      const url = `${API_ENDPOINTS.FACTURACION.COTIZACIONES}?${params.toString()}`
      const data = await apiGet<CotizacionListResponse>(url)

      setCotizaciones(data.results || [])
      setTotalCount(data.count || 0)
      setTotalPages(Math.ceil((data.count || 0) / ITEMS_PER_PAGE))
    } catch (err: any) {
      console.error("Error al cargar cotizaciones:", err)
      setError(err.message || "Error al cargar las cotizaciones")
      toast({
        title: "Error",
        description: "No se pudieron cargar las cotizaciones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  const hasActiveFilters =
    filters.estado !== "todos" || filters.periodo !== "todos" || filters.empresa !== "todos"

  // Función para eliminar cotización
  const handleDeleteCotizacion = async (id: number) => {
    if (!token) {
      toast({
        title: "Error",
        description: "No estás autenticado",
        variant: "destructive",
      })
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/facturacion/cotizaciones/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.detail || "Error al eliminar la cotización")
      }

      toast({
        title: "Cotización eliminada",
        description: "La cotización ha sido eliminada exitosamente",
      })

      // Recargar la lista
      loadCotizaciones()
    } catch (err: any) {
      console.error("Error al eliminar cotización:", err)
      toast({
        title: "Error",
        description: err.message || "No se pudo eliminar la cotización",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  // Función para calcular el total correcto de una cotización
  // El total es la suma de los subtotales de los detalles (con descuentos ya aplicados)
  // IMPORTANTE: Convertir a Number porque los valores pueden venir como strings del backend
  const calcularTotalCotizacion = (c: Cotizacion) => {
    return c.detalles?.reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0) || 0
  }

  // Estadísticas
  const totalCotizaciones = totalCount
  const cotizacionesPendientes = cotizaciones.filter((c) => c.estado === "ENVIADA" || c.estado === "BORRADOR").length
  const cotizacionesAceptadas = cotizaciones.filter((c) => c.estado === "ACEPTADA").length
  const cotizacionesRechazadas = cotizaciones.filter((c) => c.estado === "RECHAZADA").length
  const valorTotalCotizaciones = cotizaciones.reduce((sum, c) => sum + calcularTotalCotizacion(c), 0)
  const valorCotizacionesAceptadas = cotizaciones
    .filter((c) => c.estado === "ACEPTADA")
    .reduce((sum, c) => sum + calcularTotalCotizacion(c), 0)
  const valorCotizacionesPendientes = cotizaciones
    .filter((c) => c.estado === "ENVIADA" || c.estado === "BORRADOR")
    .reduce((sum, c) => sum + calcularTotalCotizacion(c), 0)
  const tasaConversion =
    totalCotizaciones > 0 ? ((cotizacionesAceptadas / totalCotizaciones) * 100).toFixed(1) : "0"
  
  // Cotizaciones del mes actual
  const cotizacionesMesActual = useMemo(() => {
    const hoy = new Date()
    return cotizaciones.filter(
      (c) =>
        new Date(c.fecha_cotizacion).getMonth() === hoy.getMonth() &&
        new Date(c.fecha_cotizacion).getFullYear() === hoy.getFullYear(),
    )
  }, [cotizaciones])
  
  const valorMesActual = cotizacionesMesActual.reduce((sum, c) => sum + calcularTotalCotizacion(c), 0)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACEPTADA":
        return "default"
      case "ENVIADA":
      case "BORRADOR":
        return "secondary"
      case "RECHAZADA":
      case "VENCIDA":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cotizaciones</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadCotizaciones()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualizar
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Función para exportar a CSV
                              const headers = ["Código", "Fecha", "Cliente", "Total", "Estado", "Items"]
                              const rows = cotizaciones.map((cotizacion) => [
                                cotizacion.numero_cotizacion,
                                formatDate(cotizacion.fecha_cotizacion),
                                cotizacion.cliente_nombre,
                                calcularTotalCotizacion(cotizacion).toFixed(2),
                                cotizacion.estado_display || cotizacion.estado,
                                (cotizacion.detalles?.length || 0).toString(),
                              ])
              const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
              const blob = new Blob([csv], { type: "text/csv" })
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `cotizaciones-ferreteria-${new Date().toISOString().split("T")[0]}.csv`
              a.click()
            }}
          >
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
          <Link href="/ferreteria/cotizaciones/nueva">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nueva Cotización
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cotizaciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCotizaciones}</div>
            <p className="text-xs text-muted-foreground">Cotizaciones registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Q{valorTotalCotizaciones.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Valor de todas las cotizaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasaConversion}%</div>
            <p className="text-xs text-muted-foreground">
              {cotizacionesAceptadas} de {totalCotizaciones} aceptadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor del Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Q{valorMesActual.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{cotizacionesMesActual.length} cotizaciones este mes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cotizaciones Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cotizacionesPendientes}</div>
            <p className="text-xs text-muted-foreground">
              Valor: Q{valorCotizacionesPendientes.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cotizaciones Aceptadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cotizacionesAceptadas}</div>
            <p className="text-xs text-muted-foreground">
              Valor: Q{valorCotizacionesAceptadas.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cotizaciones Rechazadas</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cotizacionesRechazadas}</div>
            <p className="text-xs text-muted-foreground">No procedieron</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Cotización</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Q{totalCotizaciones > 0 ? (valorTotalCotizaciones / totalCotizaciones).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Valor promedio</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cotizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar cotizaciones por código, cliente o estado..."
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
                            <SelectItem value="Borrador">Borrador</SelectItem>
                            <SelectItem value="Pendiente">Enviadas</SelectItem>
                            <SelectItem value="Aceptada">Aceptadas</SelectItem>
                            <SelectItem value="Rechazada">Rechazadas</SelectItem>
                            <SelectItem value="Vencida">Vencidas</SelectItem>
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
                      onClick={() => handleFilterChange("estado", "todos")}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
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
                      onClick={() => handleFilterChange("periodo", "todos")}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.empresa !== "todos" && (
                  <Badge variant="secondary" className="gap-1">
                    Empresa: {filters.empresa}
                    <button
                      onClick={() => handleFilterChange("empresa", "todos")}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-8">{error}</div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount} cotizaciones
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cotizaciones.map((cotizacion) => (
                    <TableRow key={cotizacion.id}>
                      <TableCell className="font-medium">{cotizacion.numero_cotizacion}</TableCell>
                      <TableCell>{formatDate(cotizacion.fecha_cotizacion)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cotizacion.cliente_nombre}</div>
                          {cotizacion.cliente_nit && (
                            <div className="text-xs text-muted-foreground">NIT: {cotizacion.cliente_nit}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cotizacion.empresa_display || cotizacion.empresa}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cotizacion.detalles?.length || 0} producto{(cotizacion.detalles?.length || 0) !== 1 ? "s" : ""}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        Q{calcularTotalCotizacion(cotizacion).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(cotizacion.estado)}>{cotizacion.estado_display || cotizacion.estado}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/ferreteria/cotizaciones/${cotizacion.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver</span>
                            </Button>
                          </Link>
                          {cotizacion.estado === "BORRADOR" && (
                            <Link href={`/ferreteria/cotizaciones/${cotizacion.id}/editar`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            </Link>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={deletingId === cotizacion.id}
                              >
                                {deletingId === cotizacion.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                )}
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Estás seguro de que deseas eliminar la cotización <strong>{cotizacion.numero_cotizacion}</strong>? 
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCotizacion(cotizacion.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {cotizaciones.length === 0 && (
                <p className="text-center text-muted-foreground mt-4">No se encontraron cotizaciones.</p>
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
