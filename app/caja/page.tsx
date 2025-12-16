"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, MinusCircle, DollarSign, TrendingUp, TrendingDown, Calculator, Search, Filter, X, RefreshCw, Loader2, Eye, Edit, Trash2, Download } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const ITEMS_PER_PAGE = 10

interface MovimientoCaja {
  id: number
  tipo: 'ENTRADA' | 'SALIDA'
  monto: number
  descripcion: string
  empresa: string
  empresa_display: string
  fecha: string
  usuario: string
  referencia?: string
}

interface MovimientoListResponse {
  count: number
  next: string | null
  previous: string | null
  results: MovimientoCaja[]
  estadisticas: {
    total_entradas: number
    total_salidas: number
    saldo_actual: number
  }
}

export default function CajaPage() {
  const { toast } = useToast()
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [estadisticas, setEstadisticas] = useState({
    total_entradas: 0,
    total_salidas: 0,
    saldo_actual: 0
  })
  const [filters, setFilters] = useState({
    tipo: "todos",
    empresa: "todos",
    periodo: "todos",
    fecha: "",
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [movimientoToDelete, setMovimientoToDelete] = useState<MovimientoCaja | null>(null)

  // Simular carga de datos (en producción esto vendría de una API)
  useEffect(() => {
    loadMovimientos()
  }, [currentPage, filters, searchTerm])

  const loadMovimientos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulación de datos - en producción esto vendría de la API
      const mockData: MovimientoListResponse = {
        count: 25,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            tipo: 'ENTRADA',
            monto: 1500.00,
            descripcion: 'Venta de materiales ferretería',
            empresa: 'FERRETERIA',
            empresa_display: 'Ferretería',
            fecha: '2025-12-15T10:30:00Z',
            usuario: 'Juan Pérez',
            referencia: 'FAC-001'
          },
          {
            id: 2,
            tipo: 'SALIDA',
            monto: 300.00,
            descripcion: 'Pago de servicios eléctricos',
            empresa: 'BLOQUERA',
            empresa_display: 'Bloquera',
            fecha: '2025-12-15T11:15:00Z',
            usuario: 'María García',
            referencia: 'REC-001'
          },
          {
            id: 3,
            tipo: 'ENTRADA',
            monto: 2500.00,
            descripcion: 'Venta de bloques',
            empresa: 'BLOQUERA',
            empresa_display: 'Bloquera',
            fecha: '2025-12-15T14:20:00Z',
            usuario: 'Carlos López',
            referencia: 'FAC-002'
          },
          {
            id: 4,
            tipo: 'SALIDA',
            monto: 450.00,
            descripcion: 'Compra de insumos taller',
            empresa: 'TALLER',
            empresa_display: 'Taller',
            fecha: '2025-12-15T16:45:00Z',
            usuario: 'Ana Rodríguez',
            referencia: 'COMP-001'
          },
          {
            id: 5,
            tipo: 'ENTRADA',
            monto: 800.00,
            descripcion: 'Venta de piedra triturada',
            empresa: 'PIEDRINERA',
            empresa_display: 'Piedrinera',
            fecha: '2025-12-14T09:30:00Z',
            usuario: 'Luis Martínez',
            referencia: 'FAC-003'
          }
        ],
        estadisticas: {
          total_entradas: 48300.00,
          total_salidas: 12500.00,
          saldo_actual: 35800.00
        }
      }

      // Aplicar filtros
      let filteredResults = mockData.results

      if (filters.tipo !== "todos") {
        filteredResults = filteredResults.filter(m => m.tipo === filters.tipo)
      }

      if (filters.empresa !== "todos") {
        filteredResults = filteredResults.filter(m => m.empresa === filters.empresa)
      }

      if (searchTerm) {
        filteredResults = filteredResults.filter(m =>
          m.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.usuario.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      if (filters.fecha) {
        const filterDate = new Date(filters.fecha).toDateString()
        filteredResults = filteredResults.filter(m => {
          const movimientoDate = new Date(m.fecha).toDateString()
          return movimientoDate === filterDate
        })
      }

      // Paginación
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      const paginatedResults = filteredResults.slice(startIndex, endIndex)

      setMovimientos(paginatedResults)
      setTotalCount(filteredResults.length)
      setTotalPages(Math.ceil(filteredResults.length / ITEMS_PER_PAGE))
      setEstadisticas(mockData.estadisticas)

    } catch (err: any) {
      console.error("Error al cargar movimientos:", err)
      setError(err.message || "Error al cargar los movimientos de caja")
      toast({
        title: "Error",
        description: "No se pudieron cargar los movimientos de caja",
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
    setFilters({ tipo: "todos", empresa: "todos", periodo: "todos", fecha: "" })
    setSearchTerm("")
    setCurrentPage(1)
  }

  const hasActiveFilters = filters.tipo !== "todos" || filters.empresa !== "todos" || filters.periodo !== "todos" || filters.fecha !== ""

  const getTipoVariant = (tipo: string) => {
    switch (tipo) {
      case "ENTRADA":
        return "default"
      case "SALIDA":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getTipoDisplay = (tipo: string) => {
    switch (tipo) {
      case "ENTRADA":
        return "Entrada"
      case "SALIDA":
        return "Salida"
      default:
        return tipo
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatMonto = (monto: number) => {
    return `Q${monto.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const exportarExcel = () => {
    try {
      // Crear datos para exportar (usando todos los movimientos filtrados, no solo la página actual)
      const datosParaExportar = movimientos.map(movimiento => ({
        'Fecha': formatFecha(movimiento.fecha),
        'Tipo': getTipoDisplay(movimiento.tipo),
        'Descripción': movimiento.descripcion,
        'Empresa': movimiento.empresa_display,
        'Monto': movimiento.tipo === 'ENTRADA' ? formatMonto(movimiento.monto) : `-${formatMonto(movimiento.monto)}`,
        'Usuario': movimiento.usuario,
        'Referencia': movimiento.referencia || '',
      }))

      // Crear CSV
      const headers = Object.keys(datosParaExportar[0])
      const csvContent = [
        headers.join(','),
        ...datosParaExportar.map(row =>
          headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
        )
      ].join('\n')

      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      // Determinar nombre del archivo basado en filtros
      const fechaFiltro = filters.fecha || new Date().toISOString().split('T')[0]
      const nombreArchivo = `movimientos_caja_${fechaFiltro}.csv`

      link.setAttribute('href', url)
      link.setAttribute('download', nombreArchivo)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Exportación Exitosa",
        description: `Se exportaron ${datosParaExportar.length} movimientos a ${nombreArchivo}`,
      })
    } catch (error) {
      console.error("Error al exportar:", error)
      toast({
        title: "Error en Exportación",
        description: "No se pudo exportar los datos",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMovimiento = (movimiento: MovimientoCaja) => {
    setMovimientoToDelete(movimiento)
    setDeleteDialogOpen(true)
  }

  const confirmarEliminacion = async () => {
    if (!movimientoToDelete) return

    try {
      // Simulación de eliminación - en producción esto iría a la API
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log("Eliminando movimiento:", movimientoToDelete.id)

      toast({
        title: "Movimiento Eliminado",
        description: `El movimiento de ${getTipoDisplay(movimientoToDelete.tipo)} por ${formatMonto(movimientoToDelete.monto)} ha sido eliminado exitosamente`,
      })

      // Recargar los movimientos
      await loadMovimientos()

    } catch (error: any) {
      console.error("Error al eliminar movimiento:", error)
      toast({
        title: "Error al Eliminar",
        description: error.message || "No se pudo eliminar el movimiento",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setMovimientoToDelete(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Caja</h1>
        <div className="flex gap-2">
          <Link href="/caja/salidas/nueva">
            <Button variant="outline">
              <MinusCircle className="mr-2 h-4 w-4" /> Registrar Salida
            </Button>
          </Link>
          <Link href="/caja/entradas/nueva">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Registrar Entrada
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-muted-foreground">Gestión de entradas y salidas de caja para todas las empresas.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatMonto(estadisticas.total_entradas)}
            </div>
            <p className="text-xs text-muted-foreground">Ingresos totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salidas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatMonto(estadisticas.total_salidas)}
            </div>
            <p className="text-xs text-muted-foreground">Egresos totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Actual</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${estadisticas.saldo_actual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatMonto(estadisticas.saldo_actual)}
            </div>
            <p className="text-xs text-muted-foreground">Balance actual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Transacciones del día</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos de Caja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar movimientos por descripción, referencia o usuario..."
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
                        <Label htmlFor="tipo">Tipo de Movimiento</Label>
                        <Select
                          value={filters.tipo}
                          onValueChange={(value) => handleFilterChange("tipo", value)}
                        >
                          <SelectTrigger id="tipo">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="ENTRADA">Entradas</SelectItem>
                            <SelectItem value="SALIDA">Salidas</SelectItem>
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
                            <SelectItem value="TALLER">Taller</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fecha">Fecha</Label>
                        <Input
                          id="fecha"
                          type="date"
                          value={filters.fecha}
                          onChange={(e) => handleFilterChange("fecha", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Filtrar movimientos por fecha específica
                        </p>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {filters.tipo !== "todos" && (
                  <Badge variant="secondary" className="gap-1">
                    Tipo: {filters.tipo === "ENTRADA" ? "Entradas" : "Salidas"}
                    <button
                      type="button"
                      onClick={() => handleFilterChange("tipo", "todos")}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      aria-label={`Quitar filtro de tipo: ${filters.tipo}`}
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
                {filters.fecha && (
                  <Badge variant="secondary" className="gap-1">
                    Fecha: {new Date(filters.fecha).toLocaleDateString("es-GT")}
                    <button
                      type="button"
                      onClick={() => handleFilterChange("fecha", "")}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      aria-label={`Quitar filtro de fecha: ${filters.fecha}`}
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
              Mostrando {movimientos.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount} movimientos
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportarExcel}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadMovimientos()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
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
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientos.map((movimiento) => (
                    <TableRow key={movimiento.id}>
                      <TableCell>{formatFecha(movimiento.fecha)}</TableCell>
                      <TableCell>
                        <Badge variant={getTipoVariant(movimiento.tipo)}>
                          {getTipoDisplay(movimiento.tipo)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={movimiento.descripcion}>
                        {movimiento.descripcion}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{movimiento.empresa_display}</Badge>
                      </TableCell>
                      <TableCell className={`font-medium ${movimiento.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                        {movimiento.tipo === 'ENTRADA' ? '+' : '-'}{formatMonto(movimiento.monto)}
                      </TableCell>
                      <TableCell>{movimiento.usuario}</TableCell>
                      <TableCell>
                        {movimiento.referencia && (
                          <Badge variant="secondary">{movimiento.referencia}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={movimiento.tipo === 'ENTRADA' ? `/caja/entradas/${movimiento.id}` : `/caja/salidas/${movimiento.id}`}>
                            <Button variant="outline" size="sm" aria-label="Ver detalle del movimiento">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver</span>
                            </Button>
                          </Link>
                          <Link href={movimiento.tipo === 'ENTRADA' ? `/caja/entradas/${movimiento.id}/editar` : `/caja/salidas/${movimiento.id}/editar`}>
                            <Button variant="outline" size="sm" aria-label="Editar movimiento">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMovimiento(movimiento)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            aria-label="Eliminar movimiento"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {movimientos.length === 0 && (
                <p className="text-center text-muted-foreground mt-4">No se encontraron movimientos de caja.</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar este movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el movimiento de{' '}
              <strong>{getTipoDisplay(movimientoToDelete?.tipo || '')}</strong> por{' '}
              <strong>{formatMonto(movimientoToDelete?.monto || 0)}</strong> de la empresa{' '}
              <strong>{movimientoToDelete?.empresa_display}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminacion}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar Movimiento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
