"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PlusCircle,
  Search,
  DollarSign,
  Calendar,
  Package,
  TrendingUp,
  Filter,
  X,
  Eye,
  Edit,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react"
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

const ITEMS_PER_PAGE = 10

// Interfaz para los registros de compra de repuestos externos
interface CompraRepuesto {
  id: string
  codigo: string
  fecha: string
  proveedor: string
  descripcion: string
  cantidad: number
  unidad: string
  costoUnitario: number
  costoTotal: number
  ordenTrabajo?: string
  notas?: string
}

// Datos de ejemplo
const comprasRepuestos: CompraRepuesto[] = [
  {
    id: "1",
    codigo: "CR-001",
    fecha: "2024-01-15",
    proveedor: "Repuestos Automotrices S.A.",
    descripcion: "Filtro de aceite para excavadora CAT 320D",
    cantidad: 2,
    unidad: "Unidad",
    costoUnitario: 125.50,
    costoTotal: 251.00,
    ordenTrabajo: "ORD-001",
    notas: "Compra urgente para mantenimiento preventivo",
  },
  {
    id: "2",
    codigo: "CR-002",
    fecha: "2024-01-16",
    proveedor: "Distribuidora de Refacciones",
    descripcion: "Pastillas de freno para camión Volvo FH16",
    cantidad: 8,
    unidad: "Unidad",
    costoUnitario: 85.00,
    costoTotal: 680.00,
    ordenTrabajo: "ORD-002",
  },
  {
    id: "3",
    codigo: "CR-003",
    fecha: "2024-01-17",
    proveedor: "Repuestos Industriales GT",
    descripcion: "Mangueras hidráulicas para retroexcavadora",
    cantidad: 3,
    unidad: "Unidad",
    costoUnitario: 320.00,
    costoTotal: 960.00,
    ordenTrabajo: "ORD-003",
  },
  {
    id: "4",
    codigo: "CR-004",
    fecha: "2024-01-18",
    proveedor: "Repuestos Automotrices S.A.",
    descripcion: "Aceite hidráulico ISO 46 - 20 litros",
    cantidad: 4,
    unidad: "Galón",
    costoUnitario: 45.75,
    costoTotal: 183.00,
    notas: "Reposición de inventario de aceite",
  },
  {
    id: "5",
    codigo: "CR-005",
    fecha: "2024-01-19",
    proveedor: "Distribuidora de Refacciones",
    descripcion: "Batería 12V para grúa Liebherr",
    cantidad: 1,
    unidad: "Unidad",
    costoUnitario: 580.00,
    costoTotal: 580.00,
    ordenTrabajo: "ORD-004",
  },
  {
    id: "6",
    codigo: "CR-006",
    fecha: "2024-01-20",
    proveedor: "Repuestos Industriales GT",
    descripcion: "Llanta 17.5R25 para compactadora",
    cantidad: 2,
    unidad: "Unidad",
    costoUnitario: 420.00,
    costoTotal: 840.00,
    ordenTrabajo: "ORD-005",
  },
]

export default function CompraRepuestosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    periodo: "todos",
    fechaDesde: "",
    fechaHasta: "",
  })

  // Filtrar compras
  const filteredCompras = useMemo(() => {
    return comprasRepuestos.filter((compra) => {
      // Búsqueda por texto
      const matchesSearch =
        compra.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        compra.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        compra.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (compra.ordenTrabajo || "").toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por periodo
      const compraFecha = new Date(compra.fecha)
      const hoy = new Date()
      let matchesPeriodo = true

      if (filters.periodo === "hoy") {
        matchesPeriodo =
          compraFecha.getDate() === hoy.getDate() &&
          compraFecha.getMonth() === hoy.getMonth() &&
          compraFecha.getFullYear() === hoy.getFullYear()
      } else if (filters.periodo === "mes") {
        matchesPeriodo =
          compraFecha.getMonth() === hoy.getMonth() && compraFecha.getFullYear() === hoy.getFullYear()
      } else if (filters.periodo === "semana") {
        const semanaAtras = new Date(hoy)
        semanaAtras.setDate(hoy.getDate() - 7)
        matchesPeriodo = compraFecha >= semanaAtras
      }

      // Filtro por rango de fechas
      let matchesFechaDesde = true
      let matchesFechaHasta = true

      if (filters.fechaDesde) {
        const fechaDesde = new Date(filters.fechaDesde)
        fechaDesde.setHours(0, 0, 0, 0)
        matchesFechaDesde = compraFecha >= fechaDesde
      }

      if (filters.fechaHasta) {
        const fechaHasta = new Date(filters.fechaHasta)
        fechaHasta.setHours(23, 59, 59, 999)
        matchesFechaHasta = compraFecha <= fechaHasta
      }

      return matchesSearch && matchesPeriodo && matchesFechaDesde && matchesFechaHasta
    })
  }, [comprasRepuestos, searchTerm, filters])

  // Ordenar por fecha (más reciente primero)
  const sortedCompras = useMemo(() => {
    return [...filteredCompras].sort((a, b) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    })
  }, [filteredCompras])

  // Paginación
  const totalPages = Math.ceil(sortedCompras.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedCompras = sortedCompras.slice(startIndex, endIndex)

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
    setFilters({ periodo: "todos", fechaDesde: "", fechaHasta: "" })
    setSearchTerm("")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    filters.periodo !== "todos" || filters.fechaDesde !== "" || filters.fechaHasta !== ""

  // Estadísticas
  const totalCompras = comprasRepuestos.length
  const comprasMes = comprasRepuestos.filter((c) => {
    const fecha = new Date(c.fecha)
    return fecha.getMonth() === new Date().getMonth() && fecha.getFullYear() === new Date().getFullYear()
  })
  const totalMes = comprasMes.reduce((sum, c) => sum + c.costoTotal, 0)
  const totalGeneral = comprasRepuestos.reduce((sum, c) => sum + c.costoTotal, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compra de Repuestos Externos</h1>
          <p className="text-muted-foreground">Registro de compras de repuestos externos del taller</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Nueva Compra
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Compras</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompras}</div>
            <p className="text-xs text-muted-foreground">Registros totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras del Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comprasMes.length}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Q{totalMes.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Gasto este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total General</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Q{totalGeneral.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Gasto total registrado</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Compras */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por código, proveedor, descripción u orden de trabajo..."
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
                        <Label htmlFor="fecha_desde">Fecha Desde</Label>
                        <Input
                          id="fecha_desde"
                          type="date"
                          value={filters.fechaDesde}
                          onChange={(e) => handleFilterChange("fechaDesde", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fecha_hasta">Fecha Hasta</Label>
                        <Input
                          id="fecha_hasta"
                          type="date"
                          value={filters.fechaHasta}
                          onChange={(e) => handleFilterChange("fechaHasta", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
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
                {filters.fechaDesde && (
                  <Badge variant="secondary" className="gap-1">
                    Desde: {new Date(filters.fechaDesde).toLocaleDateString("es-GT")}
                    <button
                      onClick={() => handleFilterChange("fechaDesde", "")}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.fechaHasta && (
                  <Badge variant="secondary" className="gap-1">
                    Hasta: {new Date(filters.fechaHasta).toLocaleDateString("es-GT")}
                    <button
                      onClick={() => handleFilterChange("fechaHasta", "")}
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
            Mostrando {startIndex + 1}-{Math.min(endIndex, sortedCompras.length)} de{" "}
            {sortedCompras.length} compras
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Costo Unitario</TableHead>
                <TableHead>Costo Total</TableHead>
                <TableHead>Orden Trabajo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCompras.map((compra) => (
                <TableRow key={compra.id}>
                  <TableCell className="font-medium">{compra.codigo}</TableCell>
                  <TableCell>
                    {new Date(compra.fecha).toLocaleDateString("es-GT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{compra.proveedor}</TableCell>
                  <TableCell className="max-w-xs truncate" title={compra.descripcion}>
                    {compra.descripcion}
                  </TableCell>
                  <TableCell>
                    {compra.cantidad} {compra.unidad}
                  </TableCell>
                  <TableCell>Q{compra.costoUnitario.toFixed(2)}</TableCell>
                  <TableCell className="font-semibold">Q{compra.costoTotal.toFixed(2)}</TableCell>
                  <TableCell>
                    {compra.ordenTrabajo ? (
                      <Badge variant="outline">{compra.ordenTrabajo}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {paginatedCompras.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">No se encontraron compras.</p>
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

