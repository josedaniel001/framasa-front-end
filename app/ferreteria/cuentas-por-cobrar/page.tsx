"use client"

import { useState, useMemo, useEffect } from "react"
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
  Loader2,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { RegistrarPagoConMoraDialog } from "@/components/facturacion/registrar-pago-con-mora-dialog"

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
}

interface FacturaListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Factura[]
}

export default function CuentasPorCobrarPage() {
  const { toast } = useToast()
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<Factura | null>(null)
  const [showPagoDialog, setShowPagoDialog] = useState(false)

  // Cargar facturas pendientes
  useEffect(() => {
    loadFacturas()
  }, [])

  // Función para mapear factura del backend al formato del frontend
  const mapFacturaToFrontend = (factura: any): Factura => {
    return {
      id: Number(factura.id),
      numero_factura: factura.numero_factura || factura.numero_factura || "",
      empresa: factura.empresa || "",
      empresa_display: factura.empresa_display || factura.empresa || "",
      cliente_id: Number(factura.cliente_id || factura.cliente || 0),
      cliente_nombre: factura.cliente_nombre || factura.cliente_nombre || "",
      cliente_nit: factura.cliente_nit || factura.cliente_nit || null,
      subtotal: Number(factura.subtotal || 0),
      descuento: Number(factura.descuento || 0),
      total: Number(factura.total || 0),
      total_pagado: Number(factura.total_pagado || factura.total_pagado || 0),
      saldo_pendiente: Number(factura.saldo_pendiente || factura.saldo_pendiente || 0),
      estado: factura.estado || "",
      estado_display: factura.estado_display || factura.estado || "",
      fecha_factura: factura.fecha_factura || factura.fecha_factura || "",
      fecha_vencimiento: factura.fecha_vencimiento || factura.fecha_vencimiento || null,
    }
  }

  const loadFacturas = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener facturas con saldo pendiente (estado PENDIENTE o PARCIAL)
      const params = new URLSearchParams()
      params.append("estado", "PENDIENTE")
      const params2 = new URLSearchParams()
      params2.append("estado", "PARCIAL")

      const [pendientes, parciales] = await Promise.all([
        apiGet<FacturaListResponse>(`${API_ENDPOINTS.FACTURACION.FACTURAS}?${params.toString()}`),
        apiGet<FacturaListResponse>(`${API_ENDPOINTS.FACTURACION.FACTURAS}?${params2.toString()}`),
      ])

      // Combinar y mapear facturas
      const todasFacturas = [
        ...(pendientes.results || []).map(mapFacturaToFrontend),
        ...(parciales.results || []).map(mapFacturaToFrontend),
      ]
      
      // Filtrar solo las que tienen saldo pendiente y no están anuladas
      const facturasConSaldo = todasFacturas.filter(
        (f) => f.saldo_pendiente > 0 && f.estado !== "ANULADA"
      )

      setFacturas(facturasConSaldo)
    } catch (err: any) {
      console.error("Error al cargar facturas:", err)
      setError(err.message || "Error al cargar las facturas pendientes")
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas pendientes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePagoRegistrado = () => {
    // Recargar facturas después de registrar pago
    loadFacturas()
    setFacturaSeleccionada(null)
  }

  const handleRegistrarPago = (factura: Factura) => {
    setFacturaSeleccionada(factura)
    setShowPagoDialog(true)
  }

  // Procesar facturas con información de vencimiento
  const facturasPendientes = useMemo(() => {
    return facturas.map((factura) => {
      const diasVencidos = factura.fecha_vencimiento
        ? Math.max(0, Math.floor((new Date().getTime() - new Date(factura.fecha_vencimiento).getTime()) / (1000 * 60 * 60 * 24)))
        : 0

      return {
        ...factura,
        diasVencidos,
        estaVencida: diasVencidos > 0,
      }
    })
  }, [facturas])

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    estado: "todos",
    vencimiento: "todos",
  })

  // Filtrar facturas
  const filteredFacturas = useMemo(() => {
    return facturasPendientes.filter((factura) => {
      // Búsqueda por texto
      const matchesSearch =
        factura.numero_factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factura.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (factura.cliente_nit || "").toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por estado de pago
      const matchesEstado =
        filters.estado === "todos" ||
        (filters.estado === "vencido" && factura.estaVencida) ||
        (filters.estado === "pendiente" && !factura.estaVencida && factura.estado === "PENDIENTE") ||
        (filters.estado === "parcial" && factura.estado === "PARCIAL")

      // Filtro por vencimiento
      let matchesVencimiento = true
      if (filters.vencimiento === "vencidas") {
        matchesVencimiento = factura.estaVencida
      } else if (filters.vencimiento === "por_vencer") {
        matchesVencimiento = !factura.estaVencida && factura.fecha_vencimiento && new Date(factura.fecha_vencimiento) >= new Date()
      }

      return matchesSearch && matchesEstado && matchesVencimiento
    })
  }, [facturasPendientes, searchTerm, filters])

  // Ordenar por fecha de vencimiento (vencidas primero)
  const sortedFacturas = useMemo(() => {
    return [...filteredFacturas].sort((a, b) => {
      if (a.estaVencida && !b.estaVencida) return -1
      if (!a.estaVencida && b.estaVencida) return 1
      if (a.fecha_vencimiento && b.fecha_vencimiento) {
        return new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime()
      }
      return 0
    })
  }, [filteredFacturas])

  // Paginación
  const totalPages = Math.ceil(sortedFacturas.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedFacturas = sortedFacturas.slice(startIndex, endIndex)

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

  // Estadísticas - usar saldo_pendiente, no total
  // Asegurarse de que todos los valores sean números
  const totalDeuda = facturasPendientes.reduce((sum, f) => {
    const saldo = typeof f.saldo_pendiente === 'number' ? f.saldo_pendiente : Number(f.saldo_pendiente) || 0
    return sum + saldo
  }, 0)
  
  const deudaVencida = facturasPendientes
    .filter((f) => f.estaVencida)
    .reduce((sum, f) => {
      const saldo = typeof f.saldo_pendiente === 'number' ? f.saldo_pendiente : Number(f.saldo_pendiente) || 0
      return sum + saldo
    }, 0)
  
  const totalFacturas = facturasPendientes.length
  const facturasVencidas = facturasPendientes.filter((f) => f.estaVencida).length
  const promedioDeuda = totalFacturas > 0 && totalDeuda > 0 ? Number((totalDeuda / totalFacturas).toFixed(2)) : 0

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
            <p className="text-xs text-muted-foreground">{facturasVencidas} factura(s) vencida(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFacturas}</div>
            <p className="text-xs text-muted-foreground">Facturas pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Venta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Q{promedioDeuda.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Promedio de deuda pendiente</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Ventas Pendientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Facturas Pendientes de Pago</CardTitle>
            <Button variant="outline" size="sm" onClick={loadFacturas} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-8">{error}</div>
          ) : (
            <>
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por número de factura, cliente o NIT..."
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
                Mostrando {startIndex + 1}-{Math.min(endIndex, sortedFacturas.length)} de {sortedFacturas.length} facturas
              </div>
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número Factura</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Fecha Factura</TableHead>
                      <TableHead>Fecha Vencimiento</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Pagado</TableHead>
                      <TableHead>Saldo Pendiente</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFacturas.map((factura) => (
                      <TableRow key={factura.id} className={factura.estaVencida ? "bg-red-50 dark:bg-red-950/20" : ""}>
                        <TableCell className="font-medium">{factura.numero_factura}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{factura.cliente_nombre}</div>
                            {factura.cliente_nit && (
                              <div className="text-xs text-muted-foreground">NIT: {factura.cliente_nit}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{factura.empresa_display || factura.empresa}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(factura.fecha_factura)}</TableCell>
                        <TableCell>
                          <div className={factura.estaVencida ? "text-red-600 font-semibold" : ""}>
                            {factura.fecha_vencimiento ? formatDate(factura.fecha_vencimiento) : "N/A"}
                            {factura.estaVencida && factura.diasVencidos > 0 && (
                              <div className="text-xs text-red-600">
                                ({factura.diasVencidos} día(s) vencido(s))
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          Q{factura.total.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          Q{factura.total_pagado.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            Q{factura.saldo_pendiente.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                        <TableCell>
                          {factura.estaVencida ? (
                            <Badge variant="destructive">Vencido</Badge>
                          ) : factura.estado === "PARCIAL" ? (
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
                              onClick={() => handleRegistrarPago(factura)}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pagar
                            </Button>
                            <Link href={`/ferreteria/ventas/${factura.id}`}>
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
                {paginatedFacturas.length === 0 && (
                  <p className="text-center text-muted-foreground mt-4">
                    {sortedFacturas.length === 0
                      ? "No hay facturas pendientes de pago."
                      : "No se encontraron facturas con los filtros aplicados."}
                  </p>
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

      {facturaSeleccionada && (
        <RegistrarPagoConMoraDialog
          open={showPagoDialog}
          onOpenChange={(open) => {
            setShowPagoDialog(open)
            if (!open) {
              setFacturaSeleccionada(null)
            }
          }}
          factura={facturaSeleccionada}
          onPagoRegistrado={handlePagoRegistrado}
        />
      )}
    </div>
  )
}

