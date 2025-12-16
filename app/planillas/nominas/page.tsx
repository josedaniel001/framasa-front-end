"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  DollarSign,
  Users,
  Calendar,
  Download,
  FileText,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Receipt,
  CreditCard,
  CalendarIcon,
  Loader2,
  Eye,
  RefreshCw,
  Trash2,
  RotateCcw,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost, apiPatch } from "@/lib/api-client"
import { toast } from "sonner"

// Tipos
interface NominaDetalle {
  id: string
  nominaId: string
  empleadoId: string
  empleadoNombre: string
  empleadoCodigo: string
  diasTrabajados: number
  salarioBasePeriodo: number
  totalDevengado: number
  totalDescuentos: number
  salarioNeto: number
  estado: string
  pagado: boolean
  metodoPago: string
  activo: boolean
}

interface Nomina {
  id: string
  tipoPeriodo: string
  fechaInicio: string
  fechaFin: string
  fechaPago: string
  estado: string
  usuarioId: string | null
  usuarioNombre: string
  observaciones: string
  activo: boolean
  totalEmpleados: number
  totalDevengado: number
  totalDescuentos: number
  totalNeto: number
  totalPagado: number
  detalles: NominaDetalle[]
  createdAt: string
  updatedAt: string
}

interface NominaStats {
  total_nominas: number
  nominas_abiertas: number
  nominas_calculadas: number
  nominas_cerradas: number
  nominas_pagadas: number
  total_empleados_nomina: number
  total_devengado_global: number
  total_descuentos_global: number
  total_neto_global: number
}

export default function NominasPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [nominas, setNominas] = useState<Nomina[]>([])
  const [stats, setStats] = useState<NominaStats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroTipoPeriodo, setFiltroTipoPeriodo] = useState("todos")
  
  // Estados para el modal de generar nómina
  const [modalOpen, setModalOpen] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [tipoPeriodo, setTipoPeriodo] = useState<string>("QUINCENAL")
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(undefined)
  const [fechaFin, setFechaFin] = useState<Date | undefined>(undefined)
  const [fechaPago, setFechaPago] = useState<Date | undefined>(undefined)
  const [empleadosIncluidos, setEmpleadosIncluidos] = useState<string>("todos")

  // Cargar nóminas
  const cargarNominas = useCallback(async () => {
    try {
      setLoading(true)
      
      // Construir query params
      const params = new URLSearchParams()
      if (filtroEstado !== "todos") {
        params.append("estado", filtroEstado)
      }
      if (filtroTipoPeriodo !== "todos") {
        params.append("tipo_periodo", filtroTipoPeriodo)
      }
      
      const url = `${API_ENDPOINTS.PLANILLAS.NOMINAS}${params.toString() ? `?${params.toString()}` : ""}`
      const data = await apiGet<Nomina[]>(url)
      setNominas(data)
    } catch (error: any) {
      if (!error.isSessionExpired) {
        console.error("Error al cargar nóminas:", error)
        toast.error("Error al cargar nóminas", {
          description: error.message,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [filtroEstado, filtroTipoPeriodo])

  // Cargar estadísticas
  const cargarStats = useCallback(async () => {
    try {
      const data = await apiGet<NominaStats>(API_ENDPOINTS.PLANILLAS.NOMINAS_STATS)
      setStats(data)
    } catch (error: any) {
      if (!error.isSessionExpired) {
        console.error("Error al cargar estadísticas:", error)
      }
    }
  }, [])

  // Cargar datos al montar
  useEffect(() => {
    cargarNominas()
    cargarStats()
  }, [cargarNominas, cargarStats])

  // Actualizar fecha de pago cuando cambia fecha fin
  useEffect(() => {
    if (fechaFin && !fechaPago) {
      setFechaPago(fechaFin)
    }
  }, [fechaFin, fechaPago])

  // Función para generar nómina
  const handleGenerarNomina = async () => {
    if (!fechaInicio || !fechaFin || !fechaPago) {
      toast.error("Faltan campos requeridos", {
        description: "Por favor completa todas las fechas",
      })
      return
    }

    setGenerando(true)
    try {
      const payload = {
        tipoPeriodo: tipoPeriodo,
        fechaInicio: format(fechaInicio, "yyyy-MM-dd"),
        fechaFin: format(fechaFin, "yyyy-MM-dd"),
        fechaPago: format(fechaPago, "yyyy-MM-dd"),
        empleadosIncluidos: empleadosIncluidos,
      }

      const response = await apiPost<Nomina>(API_ENDPOINTS.PLANILLAS.NOMINAS, payload)
      
      toast.success("Nómina generada exitosamente", {
        description: `Se calcularon ${response.totalEmpleados} empleados. Total neto: Q${response.totalNeto.toFixed(2)}`,
      })
      
      // Recargar datos
      await cargarNominas()
      await cargarStats()
      
      // Cerrar modal
      setModalOpen(false)
      resetModal()
    } catch (error: any) {
      if (!error.isSessionExpired) {
        console.error("Error al generar nómina:", error)
        toast.error("Error al generar nómina", {
          description: error.message,
        })
      }
    } finally {
      setGenerando(false)
    }
  }

  // Resetear modal
  const resetModal = () => {
    setTipoPeriodo("QUINCENAL")
    setFechaInicio(undefined)
    setFechaFin(undefined)
    setFechaPago(undefined)
    setEmpleadosIncluidos("todos")
  }

  // Ver detalle de nómina (redirige a la página de detalle)
  const verDetalleNomina = (nomina: Nomina) => {
    router.push(`/planillas/nominas/${nomina.id}`)
  }

  // Desactivar/Activar nómina
  const toggleActivoNomina = async (nomina: Nomina) => {
    try {
      await apiPatch(API_ENDPOINTS.PLANILLAS.NOMINA_TOGGLE_ACTIVO(nomina.id), {})
      
      toast.success(nomina.activo ? "Nómina desactivada" : "Nómina reactivada", {
        description: nomina.activo 
          ? "La nómina ya no aparecerá en la lista" 
          : "La nómina ha sido reactivada",
      })
      
      // Recargar datos
      await cargarNominas()
      await cargarStats()
    } catch (error: any) {
      if (!error.isSessionExpired) {
        toast.error("Error al cambiar estado", {
          description: error.message,
        })
      }
    }
  }

  // Formatear fecha para resumen
  const formatFechaResumen = (fecha: Date | undefined) => {
    if (!fecha) return "—"
    return format(fecha, "dd/MM/yyyy", { locale: es })
  }

  // Obtener texto del tipo de período
  const getTipoPeriodoTexto = (tipo: string) => {
    switch (tipo.toUpperCase()) {
      case "MENSUAL": return "Mensual"
      case "QUINCENAL": return "Quincenal"
      case "SEMANAL": return "Semanal"
      default: return tipo
    }
  }

  // Filtrar nóminas por búsqueda
  const nominasFiltradas = nominas.filter((nomina) => {
    if (!searchTerm) return true
    const busqueda = searchTerm.toLowerCase()
    return (
      nomina.observaciones?.toLowerCase().includes(busqueda) ||
      nomina.tipoPeriodo.toLowerCase().includes(busqueda) ||
      nomina.estado.toLowerCase().includes(busqueda)
    )
  })

  // Calcular estadísticas de la vista actual
  const totalEmpleados = stats?.total_empleados_nomina || 0
  const totalDevengado = stats?.total_devengado_global || 0
  const totalDescuentos = stats?.total_descuentos_global || 0
  const totalNeto = stats?.total_neto_global || 0
  const nominasPagadas = stats?.nominas_pagadas || 0
  const nominasPendientes = (stats?.nominas_abiertas || 0) + (stats?.nominas_calculadas || 0) + (stats?.nominas_cerradas || 0)

  const getEstadoBadge = (estado: string) => {
    switch (estado.toUpperCase()) {
      case "PAGADA":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Pagada
          </Badge>
        )
      case "CERRADA":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Cerrada
          </Badge>
        )
      case "CALCULADA":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="mr-1 h-3 w-3" />
            Calculada
          </Badge>
        )
      case "ABIERTA":
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">
            <Clock className="mr-1 h-3 w-3" />
            Abierta
          </Badge>
        )
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatFecha = (fecha: string) => {
    if (!fecha) return "-"
    return new Date(fecha + 'T12:00:00').toLocaleDateString("es-GT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nóminas</h1>
          <p className="text-muted-foreground">Gestión de nóminas y pagos de empleados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { cargarNominas(); cargarStats(); }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Generar Nómina
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nóminas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_nominas || 0}</div>
            <p className="text-xs text-muted-foreground">Nóminas registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devengado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalDevengado)}
            </div>
            <p className="text-xs text-muted-foreground">Salarios y bonificaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Descuentos</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalDescuentos)}
            </div>
            <p className="text-xs text-muted-foreground">ISR, IGSS y otros</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salario Neto Total</CardTitle>
            <Receipt className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalNeto)}
            </div>
            <p className="text-xs text-muted-foreground">A pagar a empleados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{nominasPagadas}</div>
            <p className="text-xs text-muted-foreground">Nóminas completadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{nominasPendientes}</div>
            <p className="text-xs text-muted-foreground">Por procesar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados en Nómina</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmpleados}</div>
            <p className="text-xs text-muted-foreground">Registros de empleados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Nómina</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nominas.length > 0 ? formatFecha(nominas[0].fechaPago) : "-"}
            </div>
            <p className="text-xs text-muted-foreground">Fecha de pago</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar nóminas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="ABIERTA">Abierta</SelectItem>
                <SelectItem value="CALCULADA">Calculada</SelectItem>
                <SelectItem value="CERRADA">Cerrada</SelectItem>
                <SelectItem value="PAGADA">Pagada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroTipoPeriodo} onValueChange={setFiltroTipoPeriodo}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los períodos</SelectItem>
                <SelectItem value="MENSUAL">Mensual</SelectItem>
                <SelectItem value="QUINCENAL">Quincenal</SelectItem>
                <SelectItem value="SEMANAL">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Nóminas */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Nóminas</CardTitle>
          <CardDescription>
            Lista de nóminas generadas con sus totales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Fecha Pago</TableHead>
                    <TableHead>Empleados</TableHead>
                    <TableHead>Devengado</TableHead>
                    <TableHead>Descuentos</TableHead>
                    <TableHead>Neto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nominasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {nominas.length === 0 
                              ? "No hay nóminas registradas. Genera tu primera nómina."
                              : "No se encontraron nóminas con los filtros actuales"
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    nominasFiltradas.map((nomina) => (
                      <TableRow key={nomina.id}>
                        <TableCell className="font-medium">
                          {getTipoPeriodoTexto(nomina.tipoPeriodo)}
                        </TableCell>
                        <TableCell>
                          {formatFecha(nomina.fechaInicio)} - {formatFecha(nomina.fechaFin)}
                        </TableCell>
                        <TableCell>{formatFecha(nomina.fechaPago)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {nomina.totalEmpleados}
                          </div>
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency(nomina.totalDevengado)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {formatCurrency(nomina.totalDescuentos)}
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(nomina.totalNeto)}
                        </TableCell>
                        <TableCell>{getEstadoBadge(nomina.estado)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => verDetalleNomina(nomina)}
                              title="Ver detalle"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActivoNomina(nomina)}
                              title="Desactivar nómina"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {nominasFiltradas.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {nominasFiltradas.length} de {nominas.length} nóminas
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Generar Nómina */}
      <Dialog open={modalOpen} onOpenChange={(open) => {
        setModalOpen(open)
        if (!open) resetModal()
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generar Nómina
            </DialogTitle>
            <DialogDescription>
              Define el periodo de pago. Se calcularán los montos para los empleados activos usando sus asistencias.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* Tipo de Período */}
            <div className="space-y-2">
              <Label htmlFor="tipoPeriodo" className="text-sm font-medium">
                Tipo de período <span className="text-red-500">*</span>
              </Label>
              <Select value={tipoPeriodo} onValueChange={setTipoPeriodo}>
                <SelectTrigger id="tipoPeriodo" className="w-full">
                  <SelectValue placeholder="Selecciona el tipo de período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MENSUAL">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Mensual
                    </div>
                  </SelectItem>
                  <SelectItem value="QUINCENAL">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Quincenal
                    </div>
                  </SelectItem>
                  <SelectItem value="SEMANAL">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Semanal
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Período (Fechas) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Período <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {/* Fecha Inicio */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Desde</Label>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        type="button"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fechaInicio && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaInicio ? format(fechaInicio, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={fechaInicio}
                        onSelect={(date) => {
                          setFechaInicio(date)
                          if (date && fechaFin && date > fechaFin) {
                            setFechaFin(undefined)
                            setFechaPago(undefined)
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Fecha Fin */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Hasta</Label>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        type="button"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fechaFin && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaFin ? format(fechaFin, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={fechaFin}
                        onSelect={(date) => {
                          setFechaFin(date)
                          setFechaPago(date)
                        }}
                        disabled={(date) => fechaInicio ? date < fechaInicio : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Fecha de Pago */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Fecha de pago <span className="text-red-500">*</span>
              </Label>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaPago && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaPago ? format(fechaPago, "PPP", { locale: es }) : "Seleccionar fecha de pago"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[100]" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={fechaPago}
                    onSelect={setFechaPago}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Empleados Incluidos */}
            <div className="space-y-2">
              <Label htmlFor="empleados" className="text-sm font-medium">
                Empleados incluidos
              </Label>
              <Select value={empleadosIncluidos} onValueChange={setEmpleadosIncluidos}>
                <SelectTrigger id="empleados" className="w-full">
                  <SelectValue placeholder="Selecciona empleados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Todos los empleados activos
                    </div>
                  </SelectItem>
                  <SelectItem value="ferreteria">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Ferretería
                    </div>
                  </SelectItem>
                  <SelectItem value="bloquera">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Bloquera
                    </div>
                  </SelectItem>
                  <SelectItem value="piedrinera">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Piedrinera
                    </div>
                  </SelectItem>
                  <SelectItem value="taller">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Taller
                    </div>
                  </SelectItem>
                  <SelectItem value="administracion">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Administración
                    </div>
                  </SelectItem>
                  <SelectItem value="ventas">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Ventas
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resumen y Botones */}
          <DialogFooter className="flex flex-col sm:flex-row gap-4 sm:gap-0">
            {/* Mini resumen a la izquierda */}
            {fechaInicio && fechaFin && (
              <div className="flex-1 bg-muted/50 rounded-lg p-3 mr-0 sm:mr-4">
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">RESUMEN</p>
                <div className="space-y-0.5 text-xs">
                  <p>
                    <span className="text-muted-foreground">Período:</span>{" "}
                    <span className="font-medium">{formatFechaResumen(fechaInicio)} – {formatFechaResumen(fechaFin)}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Tipo:</span>{" "}
                    <span className="font-medium">{getTipoPeriodoTexto(tipoPeriodo)}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Fecha de pago:</span>{" "}
                    <span className="font-medium">{formatFechaResumen(fechaPago)}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-2 sm:flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  setModalOpen(false)
                  resetModal()
                }}
                disabled={generando}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGenerarNomina}
                disabled={!fechaInicio || !fechaFin || !fechaPago || generando}
              >
                {generando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generar nómina
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
