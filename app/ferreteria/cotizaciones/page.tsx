"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, FileText, Clock, CheckCircle, XCircle, Eye, Edit, Filter, X, Download, RefreshCw, DollarSign, TrendingUp, Percent, Calendar, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "lucide-react"
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
import { getSampleCotizacionesFerreteria } from "@/lib/sample-data"

const ITEMS_PER_PAGE = 5

export default function CotizacionesFerreteriaPage() {
  const cotizaciones = getSampleCotizacionesFerreteria()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    estado: "todos",
    periodo: "todos",
    rangoTotal: "todos",
  })

  // Obtener clientes únicos
  const clientes = useMemo(() => {
    const clientesUnicos = new Set(cotizaciones.map((c) => c.cliente))
    return Array.from(clientesUnicos).sort()
  }, [cotizaciones])

  // Filtrar cotizaciones
  const filteredCotizaciones = useMemo(() => {
    return cotizaciones.filter((cotizacion) => {
      // Búsqueda por texto
      const matchesSearch =
        cotizacion.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cotizacion.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cotizacion.estado.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por estado
      const matchesEstado = filters.estado === "todos" || cotizacion.estado === filters.estado

      // Filtro por periodo
      const cotizacionFecha = new Date(cotizacion.fecha)
      const hoy = new Date()
      let matchesPeriodo = true

      if (filters.periodo === "hoy") {
        matchesPeriodo =
          cotizacionFecha.getDate() === hoy.getDate() &&
          cotizacionFecha.getMonth() === hoy.getMonth() &&
          cotizacionFecha.getFullYear() === hoy.getFullYear()
      } else if (filters.periodo === "mes") {
        matchesPeriodo =
          cotizacionFecha.getMonth() === hoy.getMonth() && cotizacionFecha.getFullYear() === hoy.getFullYear()
      } else if (filters.periodo === "semana") {
        const semanaAtras = new Date(hoy)
        semanaAtras.setDate(hoy.getDate() - 7)
        matchesPeriodo = cotizacionFecha >= semanaAtras
      }

      // Filtro por rango de total
      let matchesRango = true
      if (filters.rangoTotal === "bajo") {
        matchesRango = cotizacion.total < 500
      } else if (filters.rangoTotal === "medio") {
        matchesRango = cotizacion.total >= 500 && cotizacion.total < 2000
      } else if (filters.rangoTotal === "alto") {
        matchesRango = cotizacion.total >= 2000
      }

      return matchesSearch && matchesEstado && matchesPeriodo && matchesRango
    })
  }, [cotizaciones, searchTerm, filters])

  // Paginación
  const totalPages = Math.ceil(filteredCotizaciones.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedCotizaciones = filteredCotizaciones.slice(startIndex, endIndex)

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
    setFilters({ estado: "todos", periodo: "todos", rangoTotal: "todos" })
    setSearchTerm("")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    filters.estado !== "todos" || filters.periodo !== "todos" || filters.rangoTotal !== "todos"

  // Estadísticas
  const totalCotizaciones = cotizaciones.length
  const cotizacionesPendientes = cotizaciones.filter((c) => c.estado === "Pendiente").length
  const cotizacionesAceptadas = cotizaciones.filter((c) => c.estado === "Aceptada").length
  const cotizacionesRechazadas = cotizaciones.filter((c) => c.estado === "Rechazada").length
  const valorTotalCotizaciones = cotizaciones.reduce((sum, c) => sum + c.total, 0)
  const valorCotizacionesAceptadas = cotizaciones
    .filter((c) => c.estado === "Aceptada")
    .reduce((sum, c) => sum + c.total, 0)
  const valorCotizacionesPendientes = cotizaciones
    .filter((c) => c.estado === "Pendiente")
    .reduce((sum, c) => sum + c.total, 0)
  const tasaConversion =
    totalCotizaciones > 0 ? ((cotizacionesAceptadas / totalCotizaciones) * 100).toFixed(1) : "0"
  
  // Cotizaciones del mes actual
  const cotizacionesMesActual = useMemo(() => {
    const hoy = new Date()
    return cotizaciones.filter(
      (c) =>
        new Date(c.fecha).getMonth() === hoy.getMonth() &&
        new Date(c.fecha).getFullYear() === hoy.getFullYear(),
    )
  }, [cotizaciones])
  
  const valorMesActual = cotizacionesMesActual.reduce((sum, c) => sum + c.total, 0)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Aceptada":
        return "default"
      case "Pendiente":
        return "secondary"
      case "Rechazada":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cotizaciones</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Función para exportar a CSV
              const headers = ["Código", "Fecha", "Cliente", "Total", "Estado", "Items"]
              const rows = filteredCotizaciones.map((cotizacion) => [
                cotizacion.codigo,
                cotizacion.fecha,
                cotizacion.cliente,
                cotizacion.total.toFixed(2),
                cotizacion.estado,
                cotizacion.items.length.toString(),
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
                            <SelectItem value="Pendiente">Pendientes</SelectItem>
                            <SelectItem value="Aceptada">Aceptadas</SelectItem>
                            <SelectItem value="Rechazada">Rechazadas</SelectItem>
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
                        <Label htmlFor="rangoTotal">Rango de Total</Label>
                        <Select
                          value={filters.rangoTotal}
                          onValueChange={(value) => handleFilterChange("rangoTotal", value)}
                        >
                          <SelectTrigger id="rangoTotal">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="bajo">Menor a Q500</SelectItem>
                            <SelectItem value="medio">Q500 - Q2,000</SelectItem>
                            <SelectItem value="alto">Mayor a Q2,000</SelectItem>
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
                {filters.rangoTotal !== "todos" && (
                  <Badge variant="secondary" className="gap-1">
                    Total:{" "}
                    {filters.rangoTotal === "bajo"
                      ? "< Q500"
                      : filters.rangoTotal === "medio"
                        ? "Q500 - Q2,000"
                        : "> Q2,000"}
                    <button
                      onClick={() => handleFilterChange("rangoTotal", "todos")}
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
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredCotizaciones.length)} de {filteredCotizaciones.length} cotizaciones
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCotizaciones.map((cotizacion) => (
                <TableRow key={cotizacion.id}>
                  <TableCell className="font-medium">{cotizacion.codigo}</TableCell>
                  <TableCell>
                    {new Date(cotizacion.fecha).toLocaleDateString("es-GT", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{cotizacion.cliente}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{cotizacion.items.length} producto{cotizacion.items.length !== 1 ? "s" : ""}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">Q{cotizacion.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(cotizacion.estado)}>{cotizacion.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/ferreteria/cotizaciones/${cotizacion.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                      </Link>
                      <Link href={`/ferreteria/cotizaciones/${cotizacion.id}/editar`}>
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
          {paginatedCotizaciones.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">No se encontraron cotizaciones.</p>
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
