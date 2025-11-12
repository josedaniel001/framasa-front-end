"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
  Search,
  Filter,
  X,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Eye,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { getSampleVentasFerreteria, getSampleClientesFerreteria, getSamplePagos } from "@/lib/sample-data"
import { TipoVenta, EstadoPago } from "@/types/database"
import { RegistrarPagoDialog } from "@/components/ventas/registrar-pago-dialog"
import type { VentaFerreteria, Pago } from "@/types/database"

const ITEMS_PER_PAGE = 10

export default function CuentasPorCobrarPage() {
  const [ventas, setVentas] = useState(getSampleVentasFerreteria())
  const [pagos, setPagos] = useState(getSamplePagos())
  const clientes = getSampleClientesFerreteria()
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaFerreteria | null>(null)
  const [showPagoDialog, setShowPagoDialog] = useState(false)

  const handlePagoRegistrado = (pago: Pago) => {
    if (!ventaSeleccionada) return

    // Agregar el pago a la lista
    setPagos([...pagos, pago])

    // Actualizar la venta con el nuevo estado de pago
    const ventaActualizada = { ...ventaSeleccionada }
    const montoPagadoAnterior = ventaSeleccionada.montoPagado || 0
    const nuevoMontoPagado = montoPagadoAnterior + pago.monto
    const nuevoSaldoPendiente = ventaSeleccionada.total - nuevoMontoPagado

    ventaActualizada.montoPagado = nuevoMontoPagado
    ventaActualizada.saldoPendiente = nuevoSaldoPendiente

    if (nuevoSaldoPendiente <= 0) {
      ventaActualizada.estadoPago = EstadoPago.PAGADO
      ventaActualizada.estado = "Completada"
    } else if (nuevoMontoPagado > 0 && nuevoMontoPagado < ventaSeleccionada.total) {
      ventaActualizada.estadoPago = EstadoPago.PARCIAL
    } else {
      ventaActualizada.estadoPago = EstadoPago.PENDIENTE
    }

    // Actualizar la lista de ventas
    setVentas(ventas.map((v) => (v.id === ventaSeleccionada.id ? ventaActualizada : v)))
    setVentaSeleccionada(null)
  }

  const handleRegistrarPago = (venta: any) => {
    setVentaSeleccionada(venta)
    setShowPagoDialog(true)
  }

  // Filtrar solo ventas a crédito con saldo pendiente
  const ventasPendientes = useMemo(() => {
    return ventas
      .filter(
        (v) =>
          v.tipoVenta === TipoVenta.CREDITO &&
          v.estadoPago !== EstadoPago.PAGADO &&
          v.estado !== "Cancelada"
      )
      .map((venta) => {
        const cliente = clientes.find((c) => c.id === venta.clienteId)
        const diasVencidos = venta.fechaVencimiento
          ? Math.floor(
              (new Date().getTime() - new Date(venta.fechaVencimiento).getTime()) / (1000 * 60 * 60 * 24)
            )
          : 0

        return {
          ...venta,
          clienteObj: cliente,
          diasVencidos: diasVencidos,
          estaVencida: diasVencidos > 0,
        }
      })
  }, [ventas, clientes])

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    estado: "todos",
    vencimiento: "todos",
  })

  // Filtrar ventas
  const filteredVentas = useMemo(() => {
    return ventasPendientes.filter((venta) => {
      // Búsqueda por texto
      const matchesSearch =
        venta.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venta.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (venta.clienteObj?.nit || "").toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por estado de pago
      const matchesEstado =
        filters.estado === "todos" ||
        (filters.estado === "vencido" && venta.estaVencida) ||
        (filters.estado === "pendiente" && !venta.estaVencida && venta.estadoPago === EstadoPago.PENDIENTE) ||
        (filters.estado === "parcial" && venta.estadoPago === EstadoPago.PARCIAL)

      // Filtro por vencimiento
      let matchesVencimiento = true
      if (filters.vencimiento === "vencidas") {
        matchesVencimiento = venta.estaVencida
      } else if (filters.vencimiento === "por_vencer") {
        matchesVencimiento = !venta.estaVencida && venta.fechaVencimiento && new Date(venta.fechaVencimiento) >= new Date()
      }

      return matchesSearch && matchesEstado && matchesVencimiento
    })
  }, [ventasPendientes, searchTerm, filters])

  // Ordenar por fecha de vencimiento (vencidas primero)
  const sortedVentas = useMemo(() => {
    return [...filteredVentas].sort((a, b) => {
      if (a.estaVencida && !b.estaVencida) return -1
      if (!a.estaVencida && b.estaVencida) return 1
      if (a.fechaVencimiento && b.fechaVencimiento) {
        return new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime()
      }
      return 0
    })
  }, [filteredVentas])

  // Paginación
  const totalPages = Math.ceil(sortedVentas.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedVentas = sortedVentas.slice(startIndex, endIndex)

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
    setFilters({ estado: "todos", vencimiento: "todos" })
    setSearchTerm("")
    setCurrentPage(1)
  }

  const hasActiveFilters = filters.estado !== "todos" || filters.vencimiento !== "todos"

  // Estadísticas
  const totalDeuda = ventasPendientes.reduce((sum, v) => sum + (v.saldoPendiente || 0), 0)
  const deudaVencida = ventasPendientes
    .filter((v) => v.estaVencida)
    .reduce((sum, v) => sum + (v.saldoPendiente || 0), 0)
  const totalVentas = ventasPendientes.length
  const ventasVencidas = ventasPendientes.filter((v) => v.estaVencida).length

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
        <div>
          <h1 className="text-3xl font-bold">Cuentas por Cobrar</h1>
          <p className="text-muted-foreground">Gestiona y monitorea las deudas pendientes de tus clientes</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deuda</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Q{totalDeuda.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Deuda total pendiente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deuda Vencida</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Q{deudaVencida.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">{ventasVencidas} venta(s) vencida(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVentas}</div>
            <p className="text-xs text-muted-foreground">Ventas a crédito pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Venta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Q{totalVentas > 0 ? (totalDeuda / totalVentas).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Promedio de deuda pendiente</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Ventas Pendientes */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Pendientes de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por código, cliente o NIT..."
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
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="parcial">Pago Parcial</SelectItem>
                            <SelectItem value="vencido">Vencido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vencimiento">Vencimiento</Label>
                        <Select
                          value={filters.vencimiento}
                          onValueChange={(value) => handleFilterChange("vencimiento", value)}
                        >
                          <SelectTrigger id="vencimiento">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="vencidas">Vencidas</SelectItem>
                            <SelectItem value="por_vencer">Por Vencer</SelectItem>
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
                    Estado:{" "}
                    {filters.estado === "vencido"
                      ? "Vencido"
                      : filters.estado === "parcial"
                        ? "Pago Parcial"
                        : "Pendiente"}
                    <button
                      onClick={() => handleFilterChange("estado", "todos")}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.vencimiento !== "todos" && (
                  <Badge variant="secondary" className="gap-1">
                    Vencimiento: {filters.vencimiento === "vencidas" ? "Vencidas" : "Por Vencer"}
                    <button
                      onClick={() => handleFilterChange("vencimiento", "todos")}
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
            Mostrando {startIndex + 1}-{Math.min(endIndex, sortedVentas.length)} de {sortedVentas.length} ventas
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha Venta</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pagado</TableHead>
                <TableHead>Saldo Pendiente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVentas.map((venta) => (
                <TableRow key={venta.id} className={venta.estaVencida ? "bg-red-50 dark:bg-red-950/20" : ""}>
                  <TableCell className="font-medium">{venta.codigo}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{venta.cliente}</div>
                      {venta.clienteObj?.nit && (
                        <div className="text-xs text-muted-foreground">NIT: {venta.clienteObj.nit}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(venta.fecha)}</TableCell>
                  <TableCell>
                    <div className={`${venta.estaVencida ? "text-red-600 font-semibold" : ""}`}>
                      {venta.fechaVencimiento ? formatDate(venta.fechaVencimiento) : "N/A"}
                      {venta.estaVencida && venta.diasVencidos > 0 && (
                        <div className="text-xs text-red-600">
                          ({venta.diasVencidos} día(s) vencido(s))
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>Q{venta.total.toFixed(2)}</TableCell>
                  <TableCell>Q{(venta.montoPagado || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="font-semibold">Q{(venta.saldoPendiente || 0).toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    {venta.estaVencida ? (
                      <Badge variant="destructive">Vencido</Badge>
                    ) : venta.estadoPago === EstadoPago.PARCIAL ? (
                      <Badge variant="secondary">Pago Parcial</Badge>
                    ) : (
                      <Badge variant="outline">Pendiente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleRegistrarPago(venta)}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Pagar
                      </Button>
                      <Link href={`/ferreteria/ventas/${venta.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {paginatedVentas.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">
              {sortedVentas.length === 0
                ? "No hay ventas pendientes de pago."
                : "No se encontraron ventas con los filtros aplicados."}
            </p>
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

      {ventaSeleccionada && (
        <RegistrarPagoDialog
          open={showPagoDialog}
          onOpenChange={(open) => {
            setShowPagoDialog(open)
            if (!open) {
              setVentaSeleccionada(null)
            }
          }}
          venta={ventaSeleccionada}
          onPagoRegistrado={handlePagoRegistrado}
        />
      )}
    </div>
  )
}

