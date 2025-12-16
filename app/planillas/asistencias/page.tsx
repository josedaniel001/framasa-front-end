"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Download,
  Plus,
  Users,
  CalendarCheck,
  CalendarX,
  TrendingUp,
  Edit,
  LogOut,
  Loader2,
  Power,
  Coffee,
  Plane,
  Stethoscope,
  FileSpreadsheet,
} from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiFetch } from "@/lib/api-client"
import XLSX from "xlsx-js-style"

interface Asistencia {
  id: string
  empleadoId: string
  empleado: string
  codigo: string
  fecha: string
  horaEntrada: string
  horaSalida: string
  horasTrabajadas: number
  estado: string
  fechaRetorno: string
  observaciones: string
  activo: boolean
}

interface AsistenciaStats {
  total_registros: number
  presentes: number
  ausentes: number
  licencias: number
  vacaciones: number
  descansos: number
  permisos_con_goce: number
  permisos_sin_goce: number
  horas_totales: number
  porcentaje_asistencia: number
}

export default function AsistenciasPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroPeriodo, setFiltroPeriodo] = useState("hoy")
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [stats, setStats] = useState<AsistenciaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [asistenciaToDeactivate, setAsistenciaToDeactivate] = useState<Asistencia | null>(null)
  const [exporting, setExporting] = useState(false)

  const loadAsistencias = useCallback(async () => {
    try {
      setLoading(true)
      
      let url = API_ENDPOINTS.PLANILLAS.ASISTENCIAS
      const params = new URLSearchParams()
      
      if (filtroEstado !== "todos") {
        params.append("estado", filtroEstado)
      }
      if (filtroPeriodo !== "todos") {
        params.append("periodo", filtroPeriodo)
      }
      if (searchTerm) {
        params.append("search", searchTerm)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const data = await apiGet<Asistencia[]>(url)
      setAsistencias(data)
    } catch (error: any) {
      console.error("Error al cargar asistencias:", error)
      toast({
        title: "Error",
        description: error.message || "Error al cargar las asistencias",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filtroEstado, filtroPeriodo, searchTerm, toast])

  const loadStats = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filtroPeriodo !== "todos") {
        params.append("periodo", filtroPeriodo)
      }
      
      let url = API_ENDPOINTS.PLANILLAS.ASISTENCIAS_STATS
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const data = await apiGet<AsistenciaStats>(url)
      setStats(data)
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error)
    }
  }, [filtroPeriodo])

  useEffect(() => {
    loadAsistencias()
    loadStats()
  }, [loadAsistencias, loadStats])

  const handleMarcarSalida = async (asistencia: Asistencia) => {
    try {
      setActionLoading(asistencia.id)
      const now = new Date()
      const horaSalida = now.toTimeString().slice(0, 8)
      
      await apiFetch(API_ENDPOINTS.PLANILLAS.ASISTENCIA_MARCAR_SALIDA(asistencia.id), {
        method: 'PATCH',
        body: JSON.stringify({ hora_salida: horaSalida }),
      })

      toast({
        title: "Salida Marcada",
        description: `Se ha registrado la salida para ${asistencia.empleado} a las ${horaSalida.slice(0, 5)}`,
      })
      
      loadAsistencias()
      loadStats()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al marcar la salida",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDesactivar = async () => {
    if (!asistenciaToDeactivate) return
    
    try {
      setActionLoading(asistenciaToDeactivate.id)
      
      await apiFetch(API_ENDPOINTS.PLANILLAS.ASISTENCIA_TOGGLE_ACTIVO(asistenciaToDeactivate.id), {
        method: 'PATCH',
      })

      toast({
        title: "Asistencia Desactivada",
        description: `La asistencia de ${asistenciaToDeactivate.empleado} ha sido desactivada`,
      })
      
      loadAsistencias()
      loadStats()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al desactivar la asistencia",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
      setAsistenciaToDeactivate(null)
    }
  }

  // Función para obtener el nombre del estado legible
  const getEstadoTexto = (estado: string): string => {
    const estados: Record<string, string> = {
      presente: "Presente",
      ausente: "Ausente",
      licencia_medica: "Licencia Médica",
      vacaciones: "Vacaciones",
      descanso: "Descanso",
      permiso_con_goce: "Permiso con Goce",
      permiso_sin_goce: "Permiso sin Goce",
    }
    return estados[estado] || estado
  }

  // Función para obtener el nombre del período legible
  const getPeriodoTexto = (periodo: string): string => {
    const periodos: Record<string, string> = {
      hoy: "Hoy",
      semana: "Esta Semana",
      mes: "Este Mes",
      todos: "Todos los Registros",
    }
    return periodos[periodo] || periodo
  }

  // Colores para los estados
  const getEstadoColor = (estado: string): { fgColor: string; fontColor: string } => {
    const colores: Record<string, { fgColor: string; fontColor: string }> = {
      presente: { fgColor: "22C55E", fontColor: "FFFFFF" },      // Verde
      ausente: { fgColor: "EF4444", fontColor: "FFFFFF" },       // Rojo
      licencia_medica: { fgColor: "3B82F6", fontColor: "FFFFFF" }, // Azul
      vacaciones: { fgColor: "A855F7", fontColor: "FFFFFF" },    // Púrpura
      descanso: { fgColor: "6B7280", fontColor: "FFFFFF" },      // Gris
      permiso_con_goce: { fgColor: "14B8A6", fontColor: "FFFFFF" }, // Teal
      permiso_sin_goce: { fgColor: "EAB308", fontColor: "000000" }, // Amarillo
    }
    return colores[estado] || { fgColor: "E5E7EB", fontColor: "000000" }
  }

  // Estilo de borde para las celdas
  const borderStyle = {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
  }

  // Función para exportar a Excel
  const handleExportar = async () => {
    if (asistencias.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay registros para exportar con los filtros actuales.",
        variant: "destructive",
      })
      return
    }

    try {
      setExporting(true)

      // Preparar los datos para el Excel
      const datosExcel = asistencias.map((a) => ({
        "Código": a.codigo,
        "Empleado": a.empleado,
        "Fecha": new Date(a.fecha + 'T12:00:00').toLocaleDateString("es-GT"),
        "Hora Entrada": a.horaEntrada === "-" ? "" : a.horaEntrada,
        "Hora Salida": a.horaSalida === "-" ? "" : a.horaSalida,
        "Horas Trabajadas": a.horasTrabajadas,
        "Estado": getEstadoTexto(a.estado),
        "Fecha Retorno": a.fechaRetorno ? new Date(a.fechaRetorno + 'T12:00:00').toLocaleDateString("es-GT") : "",
        "Observaciones": a.observaciones || "",
      }))

      // Crear el libro de trabajo
      const workbook = XLSX.utils.book_new()

      // Crear la hoja de datos
      const worksheet = XLSX.utils.json_to_sheet(datosExcel)

      // Configurar anchos de columna
      const columnWidths = [
        { wch: 12 },  // Código
        { wch: 30 },  // Empleado
        { wch: 12 },  // Fecha
        { wch: 14 },  // Hora Entrada
        { wch: 14 },  // Hora Salida
        { wch: 18 },  // Horas Trabajadas
        { wch: 18 },  // Estado
        { wch: 14 },  // Fecha Retorno
        { wch: 40 },  // Observaciones
      ]
      worksheet["!cols"] = columnWidths

      // Obtener el rango de la hoja
      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
      
      // Aplicar estilos a todas las celdas
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          const cell = worksheet[cellAddress]
          
          if (cell) {
            // Estilo base con bordes
            cell.s = {
              border: borderStyle,
              alignment: { vertical: "center", horizontal: col === 0 ? "center" : "left" },
            }

            // Estilo para encabezados (primera fila)
            if (row === 0) {
              cell.s = {
                ...cell.s,
                fill: { fgColor: { rgb: "1F2937" } },
                font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
                alignment: { vertical: "center", horizontal: "center" },
              }
            }
            
            // Estilo para la columna de Estado (columna G = índice 6)
            if (col === 6 && row > 0) {
              const estadoOriginal = asistencias[row - 1]?.estado || ""
              const colores = getEstadoColor(estadoOriginal)
              cell.s = {
                ...cell.s,
                fill: { fgColor: { rgb: colores.fgColor } },
                font: { bold: true, color: { rgb: colores.fontColor }, sz: 10 },
                alignment: { vertical: "center", horizontal: "center" },
              }
            }

            // Centrar columnas de horas y fechas
            if ([2, 3, 4, 5, 7].includes(col) && row > 0) {
              cell.s = {
                ...cell.s,
                alignment: { vertical: "center", horizontal: "center" },
              }
            }
          }
        }
      }

      // Agregar información del encabezado
      const fechaActual = new Date().toLocaleDateString("es-GT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      
      // Crear hoja de resumen
      const resumenData = [
        ["REPORTE DE ASISTENCIAS - FRAMASA"],
        [""],
        ["Fecha de generación:", fechaActual],
        ["Período:", getPeriodoTexto(filtroPeriodo)],
        ["Estado filtrado:", filtroEstado === "todos" ? "Todos" : getEstadoTexto(filtroEstado)],
        ["Búsqueda:", searchTerm || "Sin filtro de búsqueda"],
        [""],
        ["RESUMEN DE ESTADÍSTICAS"],
        ["Total de registros:", stats?.total_registros || 0],
        ["Presentes:", stats?.presentes || 0],
        ["Ausentes:", stats?.ausentes || 0],
        ["Licencias médicas:", stats?.licencias || 0],
        ["Vacaciones:", stats?.vacaciones || 0],
        ["Descansos:", stats?.descansos || 0],
        ["Permisos con goce:", stats?.permisos_con_goce || 0],
        ["Permisos sin goce:", stats?.permisos_sin_goce || 0],
        ["Horas totales trabajadas:", stats?.horas_totales || 0],
        ["Porcentaje de asistencia:", `${stats?.porcentaje_asistencia || 0}%`],
      ]
      
      const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData)
      resumenSheet["!cols"] = [{ wch: 25 }, { wch: 40 }]

      // Aplicar estilos a la hoja de resumen
      // Título principal
      if (resumenSheet["A1"]) {
        resumenSheet["A1"].s = {
          font: { bold: true, sz: 16, color: { rgb: "1F2937" } },
          alignment: { horizontal: "left" },
        }
      }
      
      // Sección de estadísticas título
      if (resumenSheet["A8"]) {
        resumenSheet["A8"].s = {
          font: { bold: true, sz: 12, color: { rgb: "1F2937" } },
        }
      }

      // Etiquetas en negrita
      const labelRows = [3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
      labelRows.forEach((rowNum) => {
        const cellA = `A${rowNum}`
        if (resumenSheet[cellA]) {
          resumenSheet[cellA].s = {
            font: { bold: true },
          }
        }
      })

      // Colores para estadísticas específicas
      const statsColors: Record<string, string> = {
        "B10": "22C55E", // Presentes - Verde
        "B11": "EF4444", // Ausentes - Rojo
        "B12": "3B82F6", // Licencias - Azul
        "B13": "A855F7", // Vacaciones - Púrpura
        "B14": "6B7280", // Descansos - Gris
        "B15": "14B8A6", // Permisos con goce - Teal
        "B16": "EAB308", // Permisos sin goce - Amarillo
      }

      Object.entries(statsColors).forEach(([cell, color]) => {
        if (resumenSheet[cell]) {
          resumenSheet[cell].s = {
            font: { bold: true, color: { rgb: color } },
          }
        }
      })

      // Agregar las hojas al libro
      XLSX.utils.book_append_sheet(workbook, resumenSheet, "Resumen")
      XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencias")

      // Generar nombre del archivo
      const fechaArchivo = new Date().toISOString().split("T")[0]
      const nombreArchivo = `Asistencias_${getPeriodoTexto(filtroPeriodo).replace(/\s/g, "_")}_${fechaArchivo}.xlsx`

      // Descargar el archivo
      XLSX.writeFile(workbook, nombreArchivo)

      toast({
        title: "Exportación exitosa",
        description: `Se exportaron ${asistencias.length} registros a ${nombreArchivo}`,
      })
    } catch (error: any) {
      console.error("Error al exportar:", error)
      toast({
        title: "Error al exportar",
        description: error.message || "No se pudo generar el archivo Excel",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "presente":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-xs whitespace-nowrap">
            <CheckCircle className="mr-1 h-3 w-3 hidden sm:inline" />
            Presente
          </Badge>
        )
      case "ausente":
        return (
          <Badge variant="destructive" className="text-xs whitespace-nowrap">
            <XCircle className="mr-1 h-3 w-3 hidden sm:inline" />
            Ausente
          </Badge>
        )
      case "licencia_medica":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-xs whitespace-nowrap">
            <Stethoscope className="mr-1 h-3 w-3 hidden sm:inline" />
            Licencia
          </Badge>
        )
      case "vacaciones":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600 text-xs whitespace-nowrap">
            <Plane className="mr-1 h-3 w-3 hidden sm:inline" />
            Vacaciones
          </Badge>
        )
      case "descanso":
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 text-xs whitespace-nowrap">
            <Coffee className="mr-1 h-3 w-3 hidden sm:inline" />
            Descanso
          </Badge>
        )
      case "permiso_con_goce":
        return (
          <Badge className="bg-teal-500 hover:bg-teal-600 text-xs whitespace-nowrap">
            <AlertCircle className="mr-1 h-3 w-3 hidden sm:inline" />
            P. con Goce
          </Badge>
        )
      case "permiso_sin_goce":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs whitespace-nowrap">
            <AlertCircle className="mr-1 h-3 w-3 hidden sm:inline" />
            P. sin Goce
          </Badge>
        )
      default:
        return <Badge className="text-xs">{estado}</Badge>
    }
  }

  const totalEmpleados = stats?.total_registros || 0
  const presentes = stats?.presentes || 0
  const ausentes = stats?.ausentes || 0
  const horasTotales = stats?.horas_totales || 0
  const porcentajeAsistencia = stats?.porcentaje_asistencia || 0

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Asistencias</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Control de asistencia y puntualidad de empleados</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={handleExportar}
            disabled={exporting || loading || asistencias.length === 0}
          >
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar Excel
              </>
            )}
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/planillas/asistencias/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Asistencia
            </Link>
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Registros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{totalEmpleados}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Asistencias registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Presentes</CardTitle>
            <CalendarCheck className="h-4 w-4 text-green-600 hidden sm:block" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{presentes}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">{porcentajeAsistencia.toFixed(1)}% asistencia</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Ausentes</CardTitle>
            <CalendarX className="h-4 w-4 text-red-600 hidden sm:block" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{ausentes}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Sin justificación</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Horas Totales</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{horasTotales.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Horas trabajadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas secundarias - ocultas en móvil */}
      <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licencias</CardTitle>
            <Stethoscope className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.licencias || 0}</div>
            <p className="text-xs text-muted-foreground">Con licencia médica</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacaciones</CardTitle>
            <Plane className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.vacaciones || 0}</div>
            <p className="text-xs text-muted-foreground">De vacaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Horas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {presentes > 0 ? (horasTotales / presentes).toFixed(1) : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">Horas promedio por empleado</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="presente">Presente</SelectItem>
                  <SelectItem value="ausente">Ausente</SelectItem>
                  <SelectItem value="descanso">Descanso</SelectItem>
                  <SelectItem value="vacaciones">Vacaciones</SelectItem>
                  <SelectItem value="licencia_medica">Licencia</SelectItem>
                  <SelectItem value="permiso_con_goce">P. con Goce</SelectItem>
                  <SelectItem value="permiso_sin_goce">P. sin Goce</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoy">Hoy</SelectItem>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="mes">Este Mes</SelectItem>
                  <SelectItem value="todos">Todo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Asistencias - Vista Desktop */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle>Registro de Asistencias</CardTitle>
          <CardDescription>
            Lista de asistencias del día {new Date().toLocaleDateString("es-GT", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Cargando asistencias...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora Entrada</TableHead>
                    <TableHead>Hora Salida</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asistencias.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar className="h-12 w-12 text-muted-foreground" />
                          <p className="text-muted-foreground">No se encontraron registros de asistencia</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    asistencias.map((asistencia) => (
                      <TableRow key={asistencia.id}>
                        <TableCell className="font-medium">{asistencia.empleado}</TableCell>
                        <TableCell>{asistencia.codigo}</TableCell>
                        <TableCell>
                          {new Date(asistencia.fecha + 'T12:00:00').toLocaleDateString("es-GT")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {asistencia.horaEntrada}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {asistencia.horaSalida}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{asistencia.horasTrabajadas}h</Badge>
                        </TableCell>
                        <TableCell>{getEstadoBadge(asistencia.estado)}</TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-muted-foreground truncate">
                            {asistencia.observaciones || "-"}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {asistencia.horaSalida === "-" && asistencia.estado === "presente" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarcarSalida(asistencia)}
                                disabled={actionLoading === asistencia.id}
                              >
                                {actionLoading === asistencia.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <LogOut className="mr-1 h-3 w-3" />
                                    Marcar Salida
                                  </>
                                )}
                              </Button>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/planillas/asistencias/${asistencia.id}/editar`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAsistenciaToDeactivate(asistencia)}
                              disabled={actionLoading === asistencia.id}
                            >
                              <Power className="h-4 w-4 text-red-500" />
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
          {asistencias.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {asistencias.length} registros
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vista de Cards para Móvil y Tablet */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Registro de Asistencias</h2>
          <span className="text-sm text-muted-foreground">{asistencias.length} registros</span>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando...</span>
          </div>
        ) : asistencias.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8">
              <Calendar className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground text-center">No se encontraron registros</p>
            </CardContent>
          </Card>
        ) : (
          asistencias.map((asistencia) => (
            <Card key={asistencia.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{asistencia.empleado}</h3>
                    <p className="text-sm text-muted-foreground">{asistencia.codigo}</p>
                  </div>
                  {getEstadoBadge(asistencia.estado)}
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground text-xs">Fecha</p>
                    <p className="font-medium">{new Date(asistencia.fecha + 'T12:00:00').toLocaleDateString("es-GT")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Entrada</p>
                    <p className="font-medium">{asistencia.horaEntrada}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Salida</p>
                    <p className="font-medium">{asistencia.horaSalida}</p>
                  </div>
                </div>

                {asistencia.observaciones && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {asistencia.observaciones}
                  </p>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  {asistencia.horaSalida === "-" && asistencia.estado === "presente" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleMarcarSalida(asistencia)}
                      disabled={actionLoading === asistencia.id}
                    >
                      {actionLoading === asistencia.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <LogOut className="mr-1 h-4 w-4" />
                          Salida
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/planillas/asistencias/${asistencia.id}/editar`}>
                      <Edit className="mr-1 h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAsistenciaToDeactivate(asistencia)}
                    disabled={actionLoading === asistencia.id}
                  >
                    <Power className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de confirmación para desactivar */}
      <AlertDialog open={!!asistenciaToDeactivate} onOpenChange={() => setAsistenciaToDeactivate(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar asistencia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto desactivará el registro de asistencia de <strong>{asistenciaToDeactivate?.empleado}</strong> del día{" "}
              <strong>{asistenciaToDeactivate?.fecha && new Date(asistenciaToDeactivate.fecha + 'T12:00:00').toLocaleDateString("es-GT")}</strong>.
              El empleado podrá registrar una nueva asistencia para este día.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDesactivar} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
