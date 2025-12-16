"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  DollarSign,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  FileSpreadsheet,
  XCircle,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { toast } from "sonner"
import * as XLSX from "xlsx-js-style"

// Tipos
interface NominaDetalle {
  id: string
  nominaId: string
  empleadoId: string
  empleadoNombre: string
  empleadoCodigo: string
  diasTrabajados: number
  diasDescanso: number
  diasVacaciones: number
  diasPermisoConGoce: number
  diasPermisoSinGoce: number
  diasLicenciaMedica: number
  diasAusente: number
  salarioBaseMensual: number
  salarioBasePeriodo: number
  salarioBaseDevengado: number
  horasExtra: number
  montoHorasExtra: number
  bonificaciones: number
  igss: number
  isr: number
  otrosDescuentos: number
  totalDevengado: number
  totalDescuentos: number
  salarioNeto: number
  estado: string
  pagado: boolean
  metodoPago: string
  fechaPagado: string
  observaciones: string
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
  totalPendientes: number
  totalAnulados: number
  detalles: NominaDetalle[]
  createdAt: string
  updatedAt: string
}

export default function NominaDetallePage() {
  const params = useParams()
  const router = useRouter()
  const nominaId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [nomina, setNomina] = useState<Nomina | null>(null)
  const [procesandoPago, setProcesandoPago] = useState<string | null>(null)
  
  // Modal de pago
  const [modalPagoOpen, setModalPagoOpen] = useState(false)
  const [detalleSeleccionado, setDetalleSeleccionado] = useState<NominaDetalle | null>(null)
  const [formaPago, setFormaPago] = useState<string>("EFECTIVO")

  // Cargar nómina
  const cargarNomina = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiGet<Nomina>(API_ENDPOINTS.PLANILLAS.NOMINA(nominaId))
      setNomina(data)
    } catch (error: any) {
      if (!error.isSessionExpired) {
        console.error("Error al cargar nómina:", error)
        toast.error("Error al cargar nómina", {
          description: error.message,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [nominaId])

  useEffect(() => {
    if (nominaId) {
      cargarNomina()
    }
  }, [nominaId, cargarNomina])

  // Abrir modal de pago
  const abrirModalPago = (detalle: NominaDetalle) => {
    setDetalleSeleccionado(detalle)
    setFormaPago("EFECTIVO")
    setModalPagoOpen(true)
  }

  // Registrar pago
  const registrarPago = async () => {
    if (!detalleSeleccionado) return

    setProcesandoPago(detalleSeleccionado.id)
    try {
      await apiPost(API_ENDPOINTS.PLANILLAS.NOMINA_DETALLE_PAGAR(detalleSeleccionado.id), {
        forma_pago: formaPago,
      })

      toast.success("Pago registrado", {
        description: `Se registró el pago de ${detalleSeleccionado.empleadoNombre}`,
      })

      // Cerrar modal y recargar datos
      setModalPagoOpen(false)
      setDetalleSeleccionado(null)
      await cargarNomina()
    } catch (error: any) {
      if (!error.isSessionExpired) {
        console.error("Error al registrar pago:", error)
        toast.error("Error al registrar pago", {
          description: error.message,
        })
      }
    } finally {
      setProcesandoPago(null)
    }
  }

  // Anular detalle
  const anularDetalle = async (detalle: NominaDetalle) => {
    if (!confirm(`¿Está seguro de anular a ${detalle.empleadoNombre}?`)) {
      return
    }

    setProcesandoPago(detalle.id)
    try {
      await apiPost(API_ENDPOINTS.PLANILLAS.NOMINA_DETALLE_ANULAR(detalle.id), {
        motivo: "Anulación manual",
      })

      toast.success("Registro anulado", {
        description: `Se anuló el registro de ${detalle.empleadoNombre}`,
      })

      await cargarNomina()
    } catch (error: any) {
      if (!error.isSessionExpired) {
        console.error("Error al anular:", error)
        toast.error("Error al anular", {
          description: error.message,
        })
      }
    } finally {
      setProcesandoPago(null)
    }
  }

  // Quitar anulación
  const quitarAnulacion = async (detalle: NominaDetalle) => {
    if (!confirm(`¿Está seguro de quitar la anulación de ${detalle.empleadoNombre}?`)) {
      return
    }

    setProcesandoPago(detalle.id)
    try {
      await apiPost(API_ENDPOINTS.PLANILLAS.NOMINA_DETALLE_QUITAR_ANULACION(detalle.id), {})

      toast.success("Anulación removida", {
        description: `${detalle.empleadoNombre} vuelve a estar pendiente`,
      })

      await cargarNomina()
    } catch (error: any) {
      if (!error.isSessionExpired) {
        console.error("Error al quitar anulación:", error)
        toast.error("Error al quitar anulación", {
          description: error.message,
        })
      }
    } finally {
      setProcesandoPago(null)
    }
  }

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Formatear fecha
  const formatFecha = (fecha: string) => {
    if (!fecha) return "-"
    return new Date(fecha + "T12:00:00").toLocaleDateString("es-GT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // Obtener texto del tipo de período
  const getTipoPeriodoTexto = (tipo: string) => {
    switch (tipo?.toUpperCase()) {
      case "MENSUAL":
        return "Mensual"
      case "QUINCENAL":
        return "Quincenal"
      case "SEMANAL":
        return "Semanal"
      default:
        return tipo
    }
  }

  // Obtener badge de estado
  const getEstadoBadge = (estado: string) => {
    switch (estado?.toUpperCase()) {
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

  // Calcular empleados pagados, pendientes y anulados (excluyendo anulados de pendientes)
  const empleadosPagados = nomina?.totalPagado || 0
  const empleadosPendientes = nomina?.totalPendientes || 0
  const empleadosAnulados = nomina?.totalAnulados || 0

  // Exportar a Excel
  const exportarExcel = () => {
    if (!nomina) return

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new()

    // === HOJA 1: Resumen de la Nómina ===
    const resumenData = [
      [""],
      ["NÓMINA - RESUMEN"],
      [""],
      ["Tipo de Período:", getTipoPeriodoTexto(nomina.tipoPeriodo)],
      ["Fecha Inicio:", formatFecha(nomina.fechaInicio)],
      ["Fecha Fin:", formatFecha(nomina.fechaFin)],
      ["Fecha de Pago:", formatFecha(nomina.fechaPago)],
      ["Estado:", nomina.estado],
      [""],
      ["TOTALES"],
      ["Total Empleados:", nomina.totalEmpleados],
      ["Total Devengado:", formatCurrencyExcel(nomina.totalDevengado)],
      ["Total Descuentos:", formatCurrencyExcel(nomina.totalDescuentos)],
      ["Total Neto a Pagar:", formatCurrencyExcel(nomina.totalNeto)],
      ["Empleados Pagados:", empleadosPagados],
      ["Empleados Pendientes:", empleadosPendientes],
      ["Empleados Anulados:", empleadosAnulados],
      [""],
      ["Generado el:", format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })],
    ]

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData)

    // Estilos para la hoja de resumen
    const headerStyle = {
      font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "2563EB" } },
      alignment: { horizontal: "center" },
    }
    const labelStyle = {
      font: { bold: true, sz: 11 },
      fill: { fgColor: { rgb: "E5E7EB" } },
    }
    const valueStyle = {
      font: { sz: 11 },
      alignment: { horizontal: "left" },
    }

    // Aplicar estilos a la hoja de resumen
    wsResumen["A2"] = { v: "NÓMINA - RESUMEN", s: headerStyle }
    wsResumen["A10"] = { v: "TOTALES", s: headerStyle }

    // Ancho de columnas para resumen
    wsResumen["!cols"] = [{ wch: 25 }, { wch: 30 }]

    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen")

    // === HOJA 2: Detalle de Empleados ===
    // Encabezados de la tabla
    const encabezados = [
      "N°",
      "Código",
      "Nombre del Empleado",
      "Días Trab.",
      "Sal. Base Devengado",
      "Bonificación",
      "Hrs. Extra",
      "Monto Hrs. Extra",
      "Total Devengado",
      "IGSS",
      "ISR",
      "Otros Desc.",
      "Total Descuentos",
      "Salario Neto",
      "Estado",
      "Forma de Pago",
      "Firma del Empleado",
    ]

    // Datos de empleados
    const datosEmpleados = nomina.detalles?.map((detalle, index) => [
      index + 1,
      detalle.empleadoCodigo,
      detalle.empleadoNombre,
      detalle.diasTrabajados,
      detalle.salarioBaseDevengado,
      detalle.bonificaciones,
      detalle.horasExtra || 0,
      detalle.montoHorasExtra,
      detalle.totalDevengado,
      detalle.igss,
      detalle.isr,
      detalle.otrosDescuentos,
      detalle.totalDescuentos,
      detalle.salarioNeto,
      detalle.pagado ? "Pagado" : "Pendiente",
      detalle.pagado ? (detalle.metodoPago || "---") : "---",
      "", // Columna de firma vacía
    ]) || []

    // Fila de totales (sin sumar días trabajados ni horas extra)
    const totales = [
      "",
      "",
      "TOTALES",
      "", // Días trabajados - no se suman
      nomina.detalles?.reduce((sum, d) => sum + d.salarioBaseDevengado, 0) || 0,
      nomina.detalles?.reduce((sum, d) => sum + d.bonificaciones, 0) || 0,
      "", // Horas extra - no se suman
      nomina.detalles?.reduce((sum, d) => sum + d.montoHorasExtra, 0) || 0,
      nomina.totalDevengado,
      nomina.detalles?.reduce((sum, d) => sum + d.igss, 0) || 0,
      nomina.detalles?.reduce((sum, d) => sum + d.isr, 0) || 0,
      nomina.detalles?.reduce((sum, d) => sum + d.otrosDescuentos, 0) || 0,
      nomina.totalDescuentos,
      nomina.totalNeto,
      "",
      "",
      "",
    ]

    // Título de la hoja
    const tituloNomina = [
      `NÓMINA ${getTipoPeriodoTexto(nomina.tipoPeriodo).toUpperCase()} - ${formatFecha(nomina.fechaInicio)} al ${formatFecha(nomina.fechaFin)}`,
    ]

    // Construir la hoja con título, espacio, encabezados, datos y totales
    const wsDetalle = XLSX.utils.aoa_to_sheet([
      tituloNomina,
      [], // Fila vacía
      encabezados,
      ...datosEmpleados,
      totales,
    ])

    // Estilos
    const estiloEncabezado = {
      font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1E40AF" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    }

    const estiloTitulo = {
      font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1F2937" } },
      alignment: { horizontal: "center", vertical: "center" },
    }

    const estiloCeldaNormal = {
      font: { sz: 10 },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "D1D5DB" } },
        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } },
      },
    }

    const estiloCeldaNumero = {
      font: { sz: 10 },
      alignment: { horizontal: "right", vertical: "center" },
      numFmt: '"Q"#,##0.00',
      border: {
        top: { style: "thin", color: { rgb: "D1D5DB" } },
        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } },
      },
    }

    const estiloTotales = {
      font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "059669" } },
      alignment: { horizontal: "right", vertical: "center" },
      numFmt: '"Q"#,##0.00',
      border: {
        top: { style: "medium", color: { rgb: "000000" } },
        bottom: { style: "medium", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    }

    const estiloPagado = {
      font: { sz: 10, color: { rgb: "166534" } },
      fill: { fgColor: { rgb: "DCFCE7" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "D1D5DB" } },
        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } },
      },
    }

    const estiloPendiente = {
      font: { sz: 10, color: { rgb: "B45309" } },
      fill: { fgColor: { rgb: "FEF3C7" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "D1D5DB" } },
        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } },
      },
    }

    const estiloFirma = {
      font: { sz: 10 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "D1D5DB" } },
        bottom: { style: "medium", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } },
      },
    }

    // Aplicar estilos al título (fila 1)
    const colLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"]
    
    // Merge título
    wsDetalle["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 16 } }]
    wsDetalle["A1"] = { v: tituloNomina[0], s: estiloTitulo }

    // Aplicar estilos a encabezados (fila 3)
    colLetters.forEach((col, index) => {
      const cellRef = `${col}3`
      if (wsDetalle[cellRef]) {
        wsDetalle[cellRef].s = estiloEncabezado
      }
    })

    // Aplicar estilos a datos de empleados
    const numFilas = datosEmpleados.length
    for (let i = 0; i < numFilas; i++) {
      const rowNum = i + 4 // Los datos empiezan en la fila 4
      colLetters.forEach((col, colIndex) => {
        const cellRef = `${col}${rowNum}`
        if (wsDetalle[cellRef]) {
          // Columnas de moneda (índices 4,5,7,8,9,10,11,12,13)
          // 4=Sal.Base, 5=Bonificación, 7=MontoHrsExtra, 8=TotalDevengado, 9=IGSS, 10=ISR, 11=OtrosDesc, 12=TotalDescuentos, 13=SalarioNeto
          if ([4, 5, 7, 8, 9, 10, 11, 12, 13].includes(colIndex)) {
            wsDetalle[cellRef].s = estiloCeldaNumero
          }
          // Columna de Horas Extra (índice 6) - número sin formato moneda
          else if (colIndex === 6) {
            wsDetalle[cellRef].s = {
              ...estiloCeldaNormal,
              alignment: { horizontal: "center", vertical: "center" },
            }
          }
          // Columna de Estado (índice 14)
          else if (colIndex === 14) {
            const detalle = nomina.detalles?.[i]
            wsDetalle[cellRef].s = detalle?.pagado ? estiloPagado : estiloPendiente
          }
          // Columna de Firma (índice 16)
          else if (colIndex === 16) {
            wsDetalle[cellRef].s = estiloFirma
          }
          // Otras columnas
          else {
            wsDetalle[cellRef].s = estiloCeldaNormal
          }
        }
      })
    }

    // Aplicar estilos a la fila de totales
    const filaTotal = numFilas + 4
    colLetters.forEach((col, colIndex) => {
      const cellRef = `${col}${filaTotal}`
      if (wsDetalle[cellRef]) {
        wsDetalle[cellRef].s = estiloTotales
      }
    })

    // Ancho de columnas
    wsDetalle["!cols"] = [
      { wch: 5 },   // N°
      { wch: 12 },  // Código
      { wch: 30 },  // Nombre
      { wch: 10 },  // Días
      { wch: 18 },  // Sal. Base
      { wch: 14 },  // Bonificación
      { wch: 10 },  // Hrs. Extra (cantidad)
      { wch: 16 },  // Monto Hrs. Extra
      { wch: 16 },  // Total Devengado
      { wch: 12 },  // IGSS
      { wch: 10 },  // ISR
      { wch: 12 },  // Otros Desc.
      { wch: 16 },  // Total Descuentos
      { wch: 15 },  // Salario Neto
      { wch: 12 },  // Estado
      { wch: 15 },  // Forma Pago
      { wch: 25 },  // Firma
    ]

    // Alto de filas
    wsDetalle["!rows"] = [
      { hpt: 30 }, // Título
      { hpt: 15 }, // Espacio
      { hpt: 25 }, // Encabezados
      ...Array(numFilas).fill({ hpt: 20 }), // Datos
      { hpt: 25 }, // Totales
    ]

    XLSX.utils.book_append_sheet(wb, wsDetalle, "Detalle Nómina")

    // Generar nombre del archivo
    const fechaInicio = nomina.fechaInicio.replace(/-/g, "")
    const fechaFin = nomina.fechaFin.replace(/-/g, "")
    const nombreArchivo = `Nomina_${nomina.tipoPeriodo}_${fechaInicio}_${fechaFin}.xlsx`

    // Descargar archivo
    XLSX.writeFile(wb, nombreArchivo)

    toast.success("Excel generado", {
      description: `Se ha descargado ${nombreArchivo}`,
    })
  }

  // Formatear moneda para Excel (sin símbolo)
  const formatCurrencyExcel = (amount: number) => {
    return `Q${amount.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!nomina) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">No se encontró la nómina</p>
        <Button variant="outline" onClick={() => router.push("/planillas/nominas")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Nóminas
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/planillas/nominas")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Nómina {getTipoPeriodoTexto(nomina.tipoPeriodo)}
            </h1>
            <p className="text-muted-foreground">
              Período: {formatFecha(nomina.fechaInicio)} - {formatFecha(nomina.fechaFin)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 ml-12 sm:ml-0">
          {getEstadoBadge(nomina.estado)}
          <Button variant="outline" size="sm" onClick={exportarExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={cargarNomina}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nomina.totalEmpleados}</div>
            <p className="text-xs text-muted-foreground">En esta nómina</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devengado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {formatCurrency(nomina.totalDevengado)}
            </div>
            <p className="text-xs text-muted-foreground">Salarios + bonificaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Descuentos</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {formatCurrency(nomina.totalDescuentos)}
            </div>
            <p className="text-xs text-muted-foreground">IGSS + ISR + otros</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Neto</CardTitle>
            <Banknote className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {formatCurrency(nomina.totalNeto)}
            </div>
            <p className="text-xs text-muted-foreground">A pagar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de Pagos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className="text-green-600">{empleadosPagados}</span>
              <span className="text-muted-foreground text-lg"> / {nomina.totalEmpleados}</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              {empleadosPendientes > 0 && (
                <p><span className="text-yellow-600 font-medium">{empleadosPendientes}</span> pendientes</p>
              )}
              {empleadosAnulados > 0 && (
                <p><span className="text-red-600 font-medium">{empleadosAnulados}</span> anulados</p>
              )}
              {empleadosPendientes === 0 && empleadosAnulados === 0 && (
                <p>Todos pagados</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información de la Nómina</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Fecha de Pago</p>
              <p className="font-medium">{formatFecha(nomina.fechaPago)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tipo de Período</p>
              <p className="font-medium">{getTipoPeriodoTexto(nomina.tipoPeriodo)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Creado por</p>
              <p className="font-medium">{nomina.usuarioNombre || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fecha de Creación</p>
              <p className="font-medium">
                {nomina.createdAt
                  ? format(new Date(nomina.createdAt), "dd/MM/yyyy HH:mm", { locale: es })
                  : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de detalles */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Empleados</CardTitle>
          <CardDescription>
            Cálculos individuales para cada empleado en el período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Código</TableHead>
                  <TableHead className="min-w-[180px]">Empleado</TableHead>
                  <TableHead className="text-center min-w-[60px]">Días</TableHead>
                  <TableHead className="text-right min-w-[100px]">Sal. Base</TableHead>
                  <TableHead className="text-right min-w-[100px]">Bonificación</TableHead>
                  <TableHead className="text-center min-w-[80px]">Hrs. Extra</TableHead>
                  <TableHead className="text-right min-w-[100px]">Devengado</TableHead>
                  <TableHead className="text-right min-w-[80px]">IGSS</TableHead>
                  <TableHead className="text-right min-w-[100px]">Descuentos</TableHead>
                  <TableHead className="text-right min-w-[100px]">Neto</TableHead>
                  <TableHead className="text-center min-w-[120px]">Estado</TableHead>
                  <TableHead className="text-center min-w-[100px]">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nomina.detalles?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
                      <p className="text-muted-foreground">No hay detalles para esta nómina</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  nomina.detalles?.map((detalle) => (
                    <TableRow key={detalle.id} className={detalle.pagado ? "bg-green-50/50" : ""}>
                      <TableCell className="font-mono text-sm">{detalle.empleadoCodigo}</TableCell>
                      <TableCell className="font-medium">{detalle.empleadoNombre}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-medium">{detalle.diasTrabajados}</span>
                          <span className="text-xs text-muted-foreground">trabajados</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(detalle.salarioBaseDevengado)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(detalle.bonificaciones)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-medium">{detalle.horasExtra || 0}</span>
                          <span className="text-xs text-muted-foreground">
                            {detalle.montoHorasExtra > 0 ? formatCurrency(detalle.montoHorasExtra) : "---"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {formatCurrency(detalle.totalDevengado)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(detalle.igss)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(detalle.totalDescuentos)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-blue-600">
                        {formatCurrency(detalle.salarioNeto)}
                      </TableCell>
                      <TableCell className="text-center">
                        {detalle.estado === 'ANULADO' ? (
                          <Badge className="bg-red-500">
                            <XCircle className="mr-1 h-3 w-3" />
                            Anulado
                          </Badge>
                        ) : detalle.pagado ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Pagado
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500">
                            <Clock className="mr-1 h-3 w-3" />
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          {detalle.estado === 'ANULADO' ? (
                            // Si está anulado, mostrar botón para quitar anulación
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 h-7 px-2"
                              onClick={() => quitarAnulacion(detalle)}
                              disabled={procesandoPago === detalle.id}
                            >
                              {procesandoPago === detalle.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <RefreshCw className="mr-1 h-3 w-3" />
                                  Quitar Anulación
                                </>
                              )}
                            </Button>
                          ) : detalle.pagado ? (
                            // Si está pagado, mostrar método de pago y botón anular
                            <>
                              <span className="text-xs text-muted-foreground">
                                {detalle.metodoPago || "-"}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                                onClick={() => anularDetalle(detalle)}
                                disabled={procesandoPago === detalle.id}
                              >
                                {procesandoPago === detalle.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Anular
                                  </>
                                )}
                              </Button>
                            </>
                          ) : (
                            // Si está pendiente, mostrar botón pagar y anular
                            <>
                              <Button
                                size="sm"
                                onClick={() => abrirModalPago(detalle)}
                                disabled={procesandoPago === detalle.id}
                              >
                                {procesandoPago === detalle.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CreditCard className="mr-1 h-3 w-3" />
                                    Pagar
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                                onClick={() => anularDetalle(detalle)}
                                disabled={procesandoPago === detalle.id}
                              >
                                {procesandoPago === detalle.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Anular
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Totales de la tabla */}
          {nomina.detalles && nomina.detalles.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Total Devengado</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(nomina.totalDevengado)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Total Descuentos</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(nomina.totalDescuentos)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Total Neto</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(nomina.totalNeto)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Progreso de Pago</p>
                  <p className="text-lg font-bold">
                    {Math.round((empleadosPagados / nomina.totalEmpleados) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Pago */}
      <Dialog open={modalPagoOpen} onOpenChange={setModalPagoOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Registrar Pago
            </DialogTitle>
            <DialogDescription>
              {detalleSeleccionado && (
                <>
                  Registrar pago para <strong>{detalleSeleccionado.empleadoNombre}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {detalleSeleccionado && (
            <div className="space-y-4 py-4">
              {/* Resumen del pago */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empleado:</span>
                  <span className="font-medium">{detalleSeleccionado.empleadoNombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Código:</span>
                  <span className="font-mono">{detalleSeleccionado.empleadoCodigo}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-muted-foreground">Monto a pagar:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(detalleSeleccionado.salarioNeto)}
                  </span>
                </div>
              </div>

              {/* Forma de pago */}
              <div className="space-y-2">
                <Label htmlFor="formaPago">Forma de Pago</Label>
                <Select value={formaPago} onValueChange={setFormaPago}>
                  <SelectTrigger id="formaPago">
                    <SelectValue placeholder="Selecciona forma de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EFECTIVO">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Efectivo
                      </div>
                    </SelectItem>
                    <SelectItem value="TRANSFERENCIA">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Transferencia Bancaria
                      </div>
                    </SelectItem>
                    <SelectItem value="CHEQUE">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Cheque
                      </div>
                    </SelectItem>
                    <SelectItem value="DEPOSITO">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Depósito Bancario
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalPagoOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={registrarPago}
              disabled={procesandoPago !== null}
            >
              {procesandoPago ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Pago
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

