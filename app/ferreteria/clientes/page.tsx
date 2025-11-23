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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
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
  Users,
  DollarSign,
  ShoppingCart,
  Phone,
  MapPin,
  PlusCircle,
  CheckCircle,
  UserPlus,
  FileText,
  RefreshCw,
  Download,
  Filter,
  X,
  Mail,
  Calendar,
  TrendingUp,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiFetch, apiDelete } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import type { ClienteFerreteria } from "@/types/database"
import { Loader2, AlertCircle } from "lucide-react"

const ITEMS_PER_PAGE = 5

interface ClientesStats {
  total_clientes?: number
  clientes_con_compras?: number
  clientes_con_compras_recientes?: number
  nuevos_clientes_mes?: number
  valor_total_compras?: number
  promedio_compras_por_cliente?: number
  total_cotizaciones?: number
  total_facturas?: number
}

export default function ClientesFerreteriaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [clientes, setClientes] = useState<ClienteFerreteria[]>([])
  const [stats, setStats] = useState<ClientesStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    periodoRegistro: "todos",
    tieneCompras: "todos",
  })
  const [selectedCliente, setSelectedCliente] = useState<ClienteFerreteria | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)

  // Cargar datos desde la API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Construir query params para filtros
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)

        const queryString = params.toString()
        const clientesUrl = queryString 
          ? `${API_ENDPOINTS.FERRETERIA.CLIENTES}?${queryString}`
          : API_ENDPOINTS.FERRETERIA.CLIENTES

        // Cargar clientes y estadísticas en paralelo
        // Las estadísticas pueden no estar disponibles aún, así que las manejamos silenciosamente
        const [clientesResult, statsResult] = await Promise.allSettled([
          apiGet<any>(clientesUrl),
          (async () => {
            try {
              // Usar apiFetch directamente para manejar 404 silenciosamente
              const response = await apiFetch(API_ENDPOINTS.FERRETERIA.CLIENTES_STATS)
              if (response.ok) {
                return await response.json()
              } else if (response.status === 404) {
                // Endpoint no existe aún, continuar sin estadísticas (sin loguear error)
                return null
              } else {
                // Otro error, también continuar sin estadísticas (sin loguear error)
                return null
              }
            } catch (error) {
              // Cualquier error, continuar sin estadísticas (sin loguear error)
              return null
            }
          })(),
        ])

        // Procesar clientes
        let clientesData: ClienteFerreteria[] = []
        if (clientesResult.status === 'fulfilled') {
          const clientesResponse = clientesResult.value
          if (Array.isArray(clientesResponse)) {
            clientesData = clientesResponse
          } else if (clientesResponse && Array.isArray(clientesResponse.results)) {
            clientesData = clientesResponse.results
          } else if (clientesResponse && clientesResponse.data && Array.isArray(clientesResponse.data)) {
            clientesData = clientesResponse.data
          }
          
          // Normalizar campos para compatibilidad
          clientesData = clientesData.map(cliente => ({
            ...cliente,
            fechaRegistro: cliente.fecha_registro || cliente.fechaRegistro,
          }))
        } else {
          console.error('Error al cargar clientes:', clientesResult.reason)
          throw clientesResult.reason
        }

        // Procesar estadísticas
        let statsData: ClientesStats | null = null
        if (statsResult.status === 'fulfilled' && statsResult.value) {
          statsData = statsResult.value
        } else {
          console.warn('Error al cargar estadísticas (continuando sin ellas):', statsResult.status === 'rejected' ? statsResult.reason : 'No disponible')
        }

        setClientes(clientesData)
        setStats(statsData)
      } catch (err) {
        console.error('Error al cargar clientes:', err)
        setError('Error al cargar los clientes. Por favor, intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [searchTerm])

  // Agregar estadísticas opcionales a los clientes (si vienen del backend)
  // Si no vienen, usamos valores por defecto (0 o null)
  const clientesConEstadisticas = useMemo(() => {
    return clientes.map((cliente) => ({
      ...cliente,
      numero_facturas: cliente.numero_facturas ?? 0,
      total_compras: cliente.total_compras ?? 0,
      numero_cotizaciones: cliente.numero_cotizaciones ?? 0,
      ultimaCompra: cliente.ultimaCompra ?? null,
      deudaPendiente: cliente.deudaPendiente ?? 0,
      numeroVentasPendientes: cliente.numeroVentasPendientes ?? 0,
      ventasPendientes: cliente.ventasPendientes ?? [],
    }))
  }, [clientes])

  // Filtrar clientes
  const filteredClientes = useMemo(() => {
    return clientesConEstadisticas.filter((cliente) => {
      // Búsqueda por texto
      const matchesSearch =
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.nit && cliente.nit.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cliente.telefono && cliente.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filtro por período de registro
      const fechaRegistroStr = cliente.fechaRegistro || cliente.fecha_registro
      if (!fechaRegistroStr) return false
      
      const fechaRegistro = new Date(fechaRegistroStr)
      const hoy = new Date()
      let matchesPeriodo = true

      if (filters.periodoRegistro === "mes") {
        matchesPeriodo =
          fechaRegistro.getMonth() === hoy.getMonth() && fechaRegistro.getFullYear() === hoy.getFullYear()
      } else if (filters.periodoRegistro === "semana") {
        const semanaAtras = new Date(hoy)
        semanaAtras.setDate(hoy.getDate() - 7)
        matchesPeriodo = fechaRegistro >= semanaAtras
      } else if (filters.periodoRegistro === "año") {
        matchesPeriodo = fechaRegistro.getFullYear() === hoy.getFullYear()
      }

      // Filtro por compras (solo si tenemos estadísticas)
      let matchesCompras = true
      if (filters.tieneCompras === "si") {
        matchesCompras = (cliente.numero_facturas ?? 0) > 0
      } else if (filters.tieneCompras === "no") {
        matchesCompras = (cliente.numero_facturas ?? 0) === 0
      }

      return matchesSearch && matchesPeriodo && matchesCompras
    })
  }, [clientesConEstadisticas, searchTerm, filters])

  // Paginación
  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedClientes = filteredClientes.slice(startIndex, endIndex)

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
    setFilters({ periodoRegistro: "todos", tieneCompras: "todos" })
    setSearchTerm("")
    setCurrentPage(1)
  }

  const hasActiveFilters = filters.periodoRegistro !== "todos" || filters.tieneCompras !== "todos"

  // Estadísticas generales (usar stats del backend si están disponibles, sino calcular desde clientes)
  const totalClientes = stats?.total_clientes ?? clientes.length
  const clientesConCompras = stats?.clientes_con_compras ?? clientesConEstadisticas.filter((c) => (c.numero_facturas ?? 0) > 0).length
  const clientesConComprasRecientes = stats?.clientes_con_compras_recientes ?? 0
  const nuevosClientesMes = stats?.nuevos_clientes_mes ?? clientesConEstadisticas.filter(
    (c) => {
      const fechaRegistroStr = c.fechaRegistro || c.fecha_registro
      if (!fechaRegistroStr) return false
      const fechaRegistro = new Date(fechaRegistroStr)
      return fechaRegistro.getMonth() === new Date().getMonth() &&
        fechaRegistro.getFullYear() === new Date().getFullYear()
    }
  ).length
  const valorTotalCompras = stats?.valor_total_compras ?? clientesConEstadisticas.reduce((sum, c) => sum + (c.total_compras ?? 0), 0)
  const promedioComprasPorCliente = stats?.promedio_compras_por_cliente ?? (clientesConCompras > 0 ? valorTotalCompras / clientesConCompras : 0)
  const totalCotizaciones = stats?.total_cotizaciones ?? clientesConEstadisticas.reduce((sum, c) => sum + (c.numero_cotizaciones ?? 0), 0)
  const totalFacturas = stats?.total_facturas ?? clientesConEstadisticas.reduce((sum, c) => sum + (c.numero_facturas ?? 0), 0)

  const formatDate = (date: string | undefined | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleViewCliente = useCallback((cliente: any) => {
    setSelectedCliente(cliente)
    setShowDetailDialog(true)
  }, [])

  const closeDetailDialog = useCallback(() => {
    setShowDetailDialog(false)
    setSelectedCliente(null)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false)
    setSelectedCliente(null)
  }, [])

  const handleEditCliente = useCallback(
    (cliente: any) => {
      router.push(`/ferreteria/clientes/${cliente.id}/editar`)
    },
    [router],
  )

  const handleNuevaVenta = useCallback(
    (cliente: any) => {
      router.push(`/ferreteria/ventas/nueva?cliente=${cliente.id}`)
    },
    [router],
  )

  const handleNuevaCotizacion = useCallback(
    (cliente: any) => {
      router.push(`/ferreteria/cotizaciones/nueva?cliente=${cliente.id}`)
    },
    [router],
  )

  const handleDeleteCliente = useCallback((cliente: any) => {
    // Cerrar el dropdown primero para evitar problemas de accesibilidad
    setOpenDropdownId(null)
    // Usar setTimeout para asegurar que el dropdown se cierre antes de abrir el dialog
    setTimeout(() => {
      setSelectedCliente(cliente)
      setShowDeleteDialog(true)
    }, 100)
  }, [])

  const confirmDelete = async () => {
    if (!selectedCliente) return

    setIsDeleting(true)
    try {
      await apiDelete(`${API_ENDPOINTS.FERRETERIA.CLIENTES}/${selectedCliente.id}`)

      toast({
        title: "Cliente Eliminado",
        description: `El cliente "${selectedCliente.nombre}" ha sido eliminado exitosamente.`,
      })
      closeDeleteDialog()
      
      // Remover el cliente de la lista local
      setClientes((prev) => prev.filter((c) => c.id !== selectedCliente.id))
    } catch (error: any) {
      console.error("Error al eliminar cliente:", error)
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el cliente. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const numeroFacturas = selectedCliente ? (selectedCliente.numero_facturas ?? 0) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Cargando clientes...</p>
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
        <h1 className="text-3xl font-bold">Clientes</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Función para exportar a CSV
              const headers = ["Nombre", "NIT", "Teléfono", "Email", "Dirección", "Fecha Registro", "Facturas", "Total Compras", "Cotizaciones"]
              const rows = filteredClientes.map((cliente) => [
                cliente.nombre,
                cliente.nit || "",
                cliente.telefono || "",
                cliente.email || "",
                cliente.direccion || "",
                cliente.fechaRegistro || cliente.fecha_registro || "",
                (cliente.numero_facturas ?? 0).toString(),
                (cliente.total_compras ?? 0).toFixed(2),
                (cliente.numero_cotizaciones ?? 0).toString(),
              ])
              const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
              const blob = new Blob([csv], { type: "text/csv" })
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `clientes-ferreteria-${new Date().toISOString().split("T")[0]}.csv`
              a.click()
            }}
          >
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
          <Link href="/ferreteria/clientes/nuevo">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Cliente
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
            <p className="text-xs text-muted-foreground">Clientes registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Compras</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesConCompras}</div>
            <p className="text-xs text-muted-foreground">
              {totalClientes > 0 ? ((clientesConCompras / totalClientes) * 100).toFixed(1) : 0}% del total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Compras</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Q{valorTotalCompras.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">De todos los clientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos (Mes)</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nuevosClientesMes}</div>
            <p className="text-xs text-muted-foreground">Clientes registrados este mes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras Recientes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesConComprasRecientes}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Cliente</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Q{promedioComprasPorCliente.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Promedio de compras</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cotizaciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientesConEstadisticas.reduce((sum, c) => sum + c.numero_cotizaciones, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Cotizaciones emitidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFacturas}</div>
            <p className="text-xs text-muted-foreground">Facturas emitidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar clientes por nombre, NIT, teléfono o email..."
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
                        <Label htmlFor="periodoRegistro">Período de Registro</Label>
                        <Select
                          value={filters.periodoRegistro}
                          onValueChange={(value) => handleFilterChange("periodoRegistro", value)}
                        >
                          <SelectTrigger id="periodoRegistro">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="semana">Última Semana</SelectItem>
                            <SelectItem value="mes">Este Mes</SelectItem>
                            <SelectItem value="año">Este Año</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tieneCompras">Tiene Compras</Label>
                        <Select
                          value={filters.tieneCompras}
                          onValueChange={(value) => handleFilterChange("tieneCompras", value)}
                        >
                          <SelectTrigger id="tieneCompras">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="si">Con Compras</SelectItem>
                            <SelectItem value="no">Sin Compras</SelectItem>
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
                {filters.periodoRegistro !== "todos" && (
                  <Badge variant="secondary" className="gap-1">
                    Período:{" "}
                    {filters.periodoRegistro === "semana"
                      ? "Última Semana"
                      : filters.periodoRegistro === "mes"
                        ? "Este Mes"
                        : "Este Año"}
                    <button
                      onClick={() => handleFilterChange("periodoRegistro", "todos")}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.tieneCompras !== "todos" && (
                  <Badge variant="secondary" className="gap-1">
                    Compras: {filters.tieneCompras === "si" ? "Con Compras" : "Sin Compras"}
                    <button
                      onClick={() => handleFilterChange("tieneCompras", "todos")}
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
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredClientes.length)} de {filteredClientes.length} clientes
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>NIT</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead>Estadísticas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nombre}</TableCell>
                  <TableCell>{cliente.nit || "-"}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {cliente.telefono && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {cliente.telefono}
                        </div>
                      )}
                      {cliente.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {cliente.email}
                        </div>
                      )}
                      {!cliente.telefono && !cliente.email && <span className="text-sm text-muted-foreground">-</span>}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(cliente.fechaRegistro || cliente.fecha_registro)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {cliente.numero_facturas ?? 0} facturas
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {cliente.numero_cotizaciones ?? 0} cotiz.
                        </Badge>
                        {(cliente.deudaPendiente ?? 0) > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {cliente.numeroVentasPendientes ?? 0} pend.
                          </Badge>
                        )}
                      </div>
                      {(cliente.total_compras ?? 0) > 0 && (
                        <span className="text-xs font-medium text-green-600">
                          Q{(cliente.total_compras ?? 0).toFixed(2)}
                        </span>
                      )}
                      {(cliente.deudaPendiente ?? 0) > 0 && (
                        <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Deuda: Q{(cliente.deudaPendiente ?? 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewCliente(cliente)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Button>
                      <Link href={`/ferreteria/clientes/${cliente.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                      <DropdownMenu 
                        open={openDropdownId === cliente.id} 
                        onOpenChange={(open) => setOpenDropdownId(open ? cliente.id : null)}
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
                            handleViewCliente(cliente)
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setOpenDropdownId(null)
                            handleEditCliente(cliente)
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar cliente
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setOpenDropdownId(null)
                            handleNuevaVenta(cliente)
                          }}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Nueva venta
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setOpenDropdownId(null)
                            handleNuevaCotizacion(cliente)
                          }}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Nueva cotización
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteCliente(cliente)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {paginatedClientes.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">No se encontraron clientes.</p>
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

      {/* Dialog de Detalles del Cliente */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Perfil del Cliente</DialogTitle>
            <DialogDescription>Información detallada del cliente seleccionado</DialogDescription>
          </DialogHeader>
          {selectedCliente && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                  <div className="font-semibold text-lg">{selectedCliente.nombre}</div>
                  <div className="text-sm text-muted-foreground mt-1">NIT: {selectedCliente.nit || "-"}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Contacto</Label>
                  {selectedCliente.telefono && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {selectedCliente.telefono}
                    </div>
                  )}
                  {selectedCliente.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Mail className="h-4 w-4" />
                      {selectedCliente.email}
                    </div>
                  )}
                  {!selectedCliente.telefono && !selectedCliente.email && (
                    <div className="text-sm text-muted-foreground">-</div>
                  )}
                </div>
              </div>

              {selectedCliente.direccion && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Dirección</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCliente.direccion}</span>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Fecha de Registro</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(selectedCliente.fechaRegistro || selectedCliente.fecha_registro)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedCliente.numero_facturas ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Facturas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    Q{(selectedCliente.total_compras ?? 0).toLocaleString("es-GT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Compras</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedCliente.numero_cotizaciones ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Cotizaciones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    Q{(selectedCliente.deudaPendiente ?? 0).toLocaleString("es-GT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">Deuda Pendiente</p>
                </div>
              </div>

              {(selectedCliente.deudaPendiente ?? 0) > 0 && selectedCliente.ventasPendientes && selectedCliente.ventasPendientes.length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Ventas Pendientes de Pago ({selectedCliente.ventasPendientes.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {selectedCliente.ventasPendientes.map((venta) => (
                      <div key={venta.id} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">{venta.codigo}</span>
                          <span className="text-muted-foreground ml-2">
                            {new Date(venta.fecha).toLocaleDateString("es-GT")}
                          </span>
                          {venta.fechaVencimiento && (
                            <span className={`ml-2 ${new Date(venta.fechaVencimiento) < new Date() ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                              Vence: {new Date(venta.fechaVencimiento).toLocaleDateString("es-GT")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Q{venta.saldoPendiente?.toFixed(2) || "0.00"}</span>
                          {venta.estadoPago === "vencido" && (
                            <Badge variant="destructive" className="text-xs">Vencido</Badge>
                          )}
                          {venta.estadoPago === "parcial" && (
                            <Badge variant="secondary" className="text-xs">Parcial</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCliente.ultimaCompra && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Última Compra</Label>
                  <div className="mt-1">
                    <span>{formatDate(selectedCliente.ultimaCompra)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDetailDialog}>
              Cerrar
            </Button>
            <Button onClick={() => {
              closeDetailDialog()
              if (selectedCliente) handleEditCliente(selectedCliente)
            }}>
              Editar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Cliente</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar este cliente?
            </DialogDescription>
          </DialogHeader>
          {selectedCliente && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="font-semibold text-destructive">{selectedCliente.nombre}</p>
                <p className="text-sm text-muted-foreground mt-1">NIT: {selectedCliente.nit || "-"}</p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span>
                    <strong>{numeroFacturas}</strong> factura{numeroFacturas !== 1 ? "s" : ""}
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Q{(selectedCliente.total_compras ?? 0).toLocaleString("es-GT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}</strong> en compras
                  </span>
                </div>
              </div>

              {numeroFacturas > 0 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Este cliente tiene facturas asociadas. Considere desactivarlo en lugar de eliminarlo.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
