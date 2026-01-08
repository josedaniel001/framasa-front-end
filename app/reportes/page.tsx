"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, Package, TrendingUp, TrendingDown, AlertTriangle, RefreshCw, BarChart3, FileSpreadsheet } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import ExcelJS from "exceljs"

interface InventarioUnificado {
  resumen_general: {
    total_productos: number
    productos_activos: number
    productos_inactivos: number
    productos_stock_bajo: number
    valor_inventario_total: number
  }
  por_empresa: Array<{
    empresa: string
    total_productos: number
    productos_activos: number
    productos_inactivos: number
    productos_stock_bajo: number
    valor_inventario_estimado: number
    unidades: string
  }>
  total_general: {
    total_productos: number
    productos_activos: number
    productos_inactivos: number
    productos_stock_bajo: number
    valor_inventario_total: number
  }
}

interface TopProducto {
  producto_id: number
  producto_codigo: string
  producto_nombre: string
  empresa: string
  cantidad_vendida: number
  unidades: string
  valor_total: number
}

interface EstadisticaPredictiva {
  producto_id: number
  producto_codigo: string
  producto_nombre: string
  empresa: string
  periodo: number
  ventas_q: number
  prom_diario_q: number
  tendencia_porcentaje: number
  proyeccion_30d_q: number
  stock_actual: number | null
  dias_stock: number | null
  riesgo_stock: "Alto" | "Medio" | "Bajo" | "Sin datos" | null
  recomendacion: string
}

export default function ReportesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("inventario")

  // Estados para Inventario Unificado
  const [inventarioUnificado, setInventarioUnificado] = useState<InventarioUnificado | null>(null)

  // Estados para Top Productos
  const [topProductos, setTopProductos] = useState<TopProducto[]>([])
  const [filtroEmpresaTop, setFiltroEmpresaTop] = useState("todas")
  const [limitTop, setLimitTop] = useState("10")
  const [fechaDesdeTop, setFechaDesdeTop] = useState("")
  const [fechaHastaTop, setFechaHastaTop] = useState("")
  const [loadingTop, setLoadingTop] = useState(false)

  // Estados para Estadísticas Predictivas
  const [estadisticas, setEstadisticas] = useState<EstadisticaPredictiva[]>([])
  const [diasAnalisis, setDiasAnalisis] = useState("30")
  const [filtroEmpresaStats, setFiltroEmpresaStats] = useState("todas")
  const [loadingStats, setLoadingStats] = useState(false)

  // Cargar inventario unificado al montar
  useEffect(() => {
    loadInventarioUnificado()
  }, [])

  const loadInventarioUnificado = async () => {
    try {
      setLoading(true)
      setError(null)
      const endpoint = API_ENDPOINTS.REPORTES.INVENTARIO_UNIFICADO
      console.log('🔍 [Reportes] Cargando inventario unificado desde:', endpoint)
      const data = await apiGet<InventarioUnificado>(endpoint)
      console.log('✅ [Reportes] Datos recibidos:', data)
      setInventarioUnificado(data)
      toast({
        title: "Éxito",
        description: "Inventario unificado cargado correctamente",
      })
    } catch (err: any) {
      console.error("Error al cargar inventario unificado:", err)
      const errorMessage = err.message || err.response?.data?.error || "Error al cargar el inventario unificado"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTopProductos = async () => {
    try {
      setLoadingTop(true)
      const params = new URLSearchParams()
      params.append("empresa", filtroEmpresaTop)
      params.append("limit", limitTop)
      if (fechaDesdeTop) params.append("fecha_desde", fechaDesdeTop)
      if (fechaHastaTop) params.append("fecha_hasta", fechaHastaTop)

      const url = `${API_ENDPOINTS.REPORTES.TOP_PRODUCTOS_VENDIDOS}?${params.toString()}`
      const data = await apiGet<TopProducto[]>(url)
      setTopProductos(Array.isArray(data) ? data : [])
      if (data.length > 0) {
        toast({
          title: "Éxito",
          description: `${data.length} productos cargados correctamente`,
        })
      }
    } catch (err: any) {
      console.error("Error al cargar top productos:", err)
      const errorMessage = err.message || err.response?.data?.error || "No se pudieron cargar los productos más vendidos"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setTopProductos([])
    } finally {
      setLoadingTop(false)
    }
  }

  const loadEstadisticasPredictivas = async () => {
    try {
      setLoadingStats(true)
      const params = new URLSearchParams()
      params.append("dias_analisis", diasAnalisis)
      if (filtroEmpresaStats !== "todas") {
        params.append("empresa", filtroEmpresaStats)
      }

      const url = `${API_ENDPOINTS.REPORTES.ESTADISTICAS_PREDICTIVAS}?${params.toString()}`
      const data = await apiGet<EstadisticaPredictiva[]>(url)
      setEstadisticas(Array.isArray(data) ? data : [])
      if (data.length > 0) {
        toast({
          title: "Éxito",
          description: `${data.length} productos analizados correctamente`,
        })
      }
    } catch (err: any) {
      console.error("Error al cargar estadísticas predictivas:", err)
      const errorMessage = err.message || err.response?.data?.error || "No se pudieron cargar las estadísticas predictivas"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setEstadisticas([])
    } finally {
      setLoadingStats(false)
    }
  }

  // Función para exportar inventario unificado a Excel
  const exportarInventarioExcel = async () => {
    if (!inventarioUnificado) return

    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Inventario Unificado")

      worksheet.addRows([
        ["REPORTE DE INVENTARIO UNIFICADO"],
        ["Fecha de Generación", new Date().toLocaleDateString("es-GT")],
        [""],
        ["RESUMEN GENERAL"],
        ["Total Productos", inventarioUnificado.resumen_general.total_productos],
        ["Productos Activos", inventarioUnificado.resumen_general.productos_activos],
        ["Productos Inactivos", inventarioUnificado.resumen_general.productos_inactivos],
        ["Productos Stock Bajo", inventarioUnificado.resumen_general.productos_stock_bajo],
        ["Valor Total Inventario", `Q ${inventarioUnificado.resumen_general.valor_inventario_total.toFixed(2)}`],
        [""],
        ["DESGLOSE POR EMPRESA"],
        ["Empresa", "Total Productos", "Activos", "Inactivos", "Stock Bajo", "Valor Inventario"],
      ])

      inventarioUnificado.por_empresa.forEach((emp) => {
        worksheet.addRow([
          emp.empresa,
          emp.total_productos,
          emp.productos_activos,
          emp.productos_inactivos,
          emp.productos_stock_bajo,
          `Q ${emp.valor_inventario_estimado.toFixed(2)}`,
        ])
      })

      worksheet.columns.forEach((column) => {
        column.width = 20
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Inventario_Unificado_${new Date().toISOString().split("T")[0]}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Excel Generado",
        description: "El reporte de inventario se ha descargado exitosamente.",
      })
    } catch (error) {
      console.error("Error al generar Excel:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el archivo Excel. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para exportar top productos a Excel
  const exportarTopProductosExcel = async () => {
    if (topProductos.length === 0) return

    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Top Productos")

      worksheet.addRows([
        ["REPORTE DE TOP PRODUCTOS VENDIDOS"],
        ["Fecha de Generación", new Date().toLocaleDateString("es-GT")],
        ["Empresa", filtroEmpresaTop === "todas" ? "Todas" : filtroEmpresaTop],
        ["Límite", limitTop],
        [""],
        ["#", "Producto", "Código", "Empresa", "Cantidad Vendida", "Valor Total"],
      ])

      topProductos.forEach((producto, index) => {
        worksheet.addRow([
          index + 1,
          producto.producto_nombre,
          producto.producto_codigo,
          producto.empresa,
          `${producto.cantidad_vendida} ${producto.unidades}`,
          `Q ${producto.valor_total.toFixed(2)}`,
        ])
      })

      worksheet.columns.forEach((column) => {
        column.width = 20
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Top_Productos_${new Date().toISOString().split("T")[0]}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Excel Generado",
        description: "El reporte de top productos se ha descargado exitosamente.",
      })
    } catch (error) {
      console.error("Error al generar Excel:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el archivo Excel. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Función para exportar estadísticas predictivas a Excel
  const exportarEstadisticasExcel = async () => {
    if (estadisticas.length === 0) return

    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Estadísticas Predictivas")

      worksheet.addRows([
        ["REPORTE DE ESTADÍSTICAS PREDICTIVAS"],
        ["Fecha de Generación", new Date().toLocaleDateString("es-GT")],
        ["Empresa", filtroEmpresaStats === "todas" ? "Todas" : filtroEmpresaStats.charAt(0).toUpperCase() + filtroEmpresaStats.slice(1)],
        ["Días de Análisis", diasAnalisis],
        [""],
        ["Producto", "Código", "Empresa", "Período", "Ventas (Q)", "Prom. diario (Q)", "Tendencia %", "Proyección 30d (Q)", "Stock actual", "Días stock", "Riesgo stock", "Recomendación"],
      ])

      estadisticas.forEach((stat) => {
        worksheet.addRow([
          stat.producto_nombre,
          stat.producto_codigo,
          stat.empresa.charAt(0).toUpperCase() + stat.empresa.slice(1),
          `${stat.periodo} días`,
          stat.ventas_q.toFixed(2),
          stat.prom_diario_q.toFixed(2),
          `${stat.tendencia_porcentaje > 0 ? "+" : ""}${stat.tendencia_porcentaje.toFixed(1)}%`,
          stat.proyeccion_30d_q.toFixed(2),
          stat.stock_actual !== null ? stat.stock_actual.toFixed(0) : "—",
          stat.dias_stock !== null ? `${stat.dias_stock} días` : "—",
          stat.riesgo_stock || "—",
          stat.recomendacion,
        ])
      })

      worksheet.columns.forEach((column) => {
        column.width = 20
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Estadisticas_Predictivas_${new Date().toISOString().split("T")[0]}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Excel Generado",
        description: "El reporte de estadísticas predictivas se ha descargado exitosamente.",
      })
    } catch (error) {
      console.error("Error al generar Excel:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el archivo Excel. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const getEmpresaBadge = (empresa: string) => {
    const colors: Record<string, string> = {
      ferreteria: "bg-blue-500",
      bloquera: "bg-green-500",
      piedrinera: "bg-orange-500",
    }
    return (
      <Badge className={colors[empresa] || "bg-gray-500"}>
        {empresa.charAt(0).toUpperCase() + empresa.slice(1)}
      </Badge>
    )
  }

  const getTendenciaBadge = (tendencia: string | null) => {
    if (!tendencia) return <Badge variant="outline">Sin datos</Badge>
    switch (tendencia) {
      case "creciente":
        return (
          <Badge className="bg-green-500">
            <TrendingUp className="h-3 w-3 mr-1" />
            Creciente
          </Badge>
        )
      case "decreciente":
        return (
          <Badge className="bg-red-500">
            <TrendingDown className="h-3 w-3 mr-1" />
            Decreciente
          </Badge>
        )
      case "estable":
        return <Badge variant="secondary">Estable</Badge>
      default:
        return <Badge variant="outline">{tendencia}</Badge>
    }
  }

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString("es-GT", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  if (loading && !inventarioUnificado) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Cargando reportes...</p>
        </div>
      </div>
    )
  }

  if (error && !inventarioUnificado) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-destructive">{error}</p>
              <Button onClick={loadInventarioUnificado}>Reintentar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes Unificados</h1>
          <p className="text-muted-foreground">Análisis consolidado de Ferretería, Bloquera y Piedrinera</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadInventarioUnificado}>
            <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventario">Inventario Unificado</TabsTrigger>
          <TabsTrigger value="top-productos">Top Productos</TabsTrigger>
          <TabsTrigger value="predictivas">Estadísticas Predictivas</TabsTrigger>
        </TabsList>

        {/* Tab: Inventario Unificado */}
        <TabsContent value="inventario" className="space-y-4">
          {inventarioUnificado && (
            <>
              <div className="flex justify-end">
                <Button onClick={exportarInventarioExcel} variant="outline">
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
                </Button>
              </div>
              {/* Resumen General */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inventarioUnificado.resumen_general.total_productos}</div>
                    <p className="text-xs text-muted-foreground">En todas las empresas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inventarioUnificado.resumen_general.productos_activos}</div>
                    <p className="text-xs text-muted-foreground">Disponibles para venta</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {inventarioUnificado.resumen_general.productos_stock_bajo}
                    </div>
                    <p className="text-xs text-muted-foreground">Necesitan reposición</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      Q {formatNumber(inventarioUnificado.resumen_general.valor_inventario_total)}
                    </div>
                    <p className="text-xs text-muted-foreground">Valor estimado del inventario</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Productos Inactivos</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inventarioUnificado.resumen_general.productos_inactivos}</div>
                    <p className="text-xs text-muted-foreground">No disponibles</p>
                  </CardContent>
                </Card>
              </div>

              {/* Desglose por Empresa */}
              <Card>
                <CardHeader>
                  <CardTitle>Desglose por Empresa</CardTitle>
                  <CardDescription>Detalle del inventario por cada empresa</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Total Productos</TableHead>
                        <TableHead>Activos</TableHead>
                        <TableHead>Inactivos</TableHead>
                        <TableHead>Stock Bajo</TableHead>
                        <TableHead className="text-right">Valor Inventario</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventarioUnificado.por_empresa.map((empresa) => (
                        <TableRow key={empresa.empresa}>
                          <TableCell className="font-medium">{getEmpresaBadge(empresa.empresa)}</TableCell>
                          <TableCell>{empresa.total_productos}</TableCell>
                          <TableCell>{empresa.productos_activos}</TableCell>
                          <TableCell>
                            <Badge variant={empresa.productos_inactivos > 0 ? "secondary" : "outline"}>
                              {empresa.productos_inactivos}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={empresa.productos_stock_bajo > 0 ? "destructive" : "secondary"}>
                              {empresa.productos_stock_bajo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            Q {formatNumber(empresa.valor_inventario_estimado)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tab: Top Productos Vendidos */}
        <TabsContent value="top-productos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Productos Más Vendidos</CardTitle>
                  <CardDescription>Ranking de productos con mayor volumen de ventas</CardDescription>
                </div>
                {topProductos.length > 0 && (
                  <Button onClick={exportarTopProductosExcel} variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label>Empresa</Label>
                  <Select value={filtroEmpresaTop} onValueChange={setFiltroEmpresaTop}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="ferreteria">Ferretería</SelectItem>
                      <SelectItem value="bloquera">Bloquera</SelectItem>
                      <SelectItem value="piedrinera">Piedrinera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cantidad</Label>
                  <Select value={limitTop} onValueChange={setLimitTop}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Top 5</SelectItem>
                      <SelectItem value="10">Top 10</SelectItem>
                      <SelectItem value="20">Top 20</SelectItem>
                      <SelectItem value="50">Top 50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fecha Desde</Label>
                  <Input
                    type="date"
                    value={fechaDesdeTop}
                    onChange={(e) => setFechaDesdeTop(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Fecha Hasta</Label>
                  <Input
                    type="date"
                    value={fechaHastaTop}
                    onChange={(e) => setFechaHastaTop(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={loadTopProductos} disabled={loadingTop} className="mb-4">
                {loadingTop ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Generar Reporte
                  </>
                )}
              </Button>

              {topProductos.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Cantidad Vendida</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProductos.map((producto, index) => (
                      <TableRow key={producto.producto_id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{producto.producto_nombre}</div>
                            <div className="text-sm text-muted-foreground">{producto.producto_codigo}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getEmpresaBadge(producto.empresa)}</TableCell>
                        <TableCell>
                          {formatNumber(producto.cantidad_vendida, producto.unidades === "m³" ? 2 : 0)} {producto.unidades}
                        </TableCell>
                        <TableCell className="text-right">Q {formatNumber(producto.valor_total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {topProductos.length === 0 && !loadingTop && (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos disponibles. Haz clic en "Generar Reporte" para cargar los datos.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Estadísticas Predictivas */}
        <TabsContent value="predictivas" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Estadísticas Predictivas</CardTitle>
                  <CardDescription>
                    Análisis predictivo basado en historial de ventas y tendencias de stock
                  </CardDescription>
                </div>
                {estadisticas.length > 0 && (
                  <Button onClick={exportarEstadisticasExcel} variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label>Empresa</Label>
                  <Select value={filtroEmpresaStats} onValueChange={setFiltroEmpresaStats}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las empresas</SelectItem>
                      <SelectItem value="ferreteria">Ferretería</SelectItem>
                      <SelectItem value="bloquera">Bloquera</SelectItem>
                      <SelectItem value="piedrinera">Piedrinera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Días de Análisis</Label>
                  <Select value={diasAnalisis} onValueChange={setDiasAnalisis}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Últimos 15 días</SelectItem>
                      <SelectItem value="30">Últimos 30 días</SelectItem>
                      <SelectItem value="60">Últimos 60 días</SelectItem>
                      <SelectItem value="90">Últimos 90 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={loadEstadisticasPredictivas} disabled={loadingStats} className="w-full">
                    {loadingStats ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Generar Análisis
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {estadisticas.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Ventas (Q)</TableHead>
                        <TableHead className="text-right">Prom. diario (Q)</TableHead>
                        <TableHead className="text-right">Tendencia %</TableHead>
                        <TableHead className="text-right">Proyección 30d (Q)</TableHead>
                        <TableHead className="text-right">Stock actual</TableHead>
                        <TableHead className="text-right">Días stock</TableHead>
                        <TableHead>Riesgo stock</TableHead>
                        <TableHead>Recomendación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estadisticas.map((stat) => (
                        <TableRow key={`${stat.empresa}-${stat.producto_id}`}>
                          <TableCell className="font-medium">{stat.producto_nombre}</TableCell>
                          <TableCell className="text-muted-foreground">{stat.producto_codigo}</TableCell>
                          <TableCell>
                            {getEmpresaBadge(stat.empresa)}
                          </TableCell>
                          <TableCell>{stat.periodo} días</TableCell>
                          <TableCell className="text-right">
                            Q {formatNumber(stat.ventas_q)}
                          </TableCell>
                          <TableCell className="text-right">
                            Q {formatNumber(stat.prom_diario_q)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={stat.tendencia_porcentaje > 0 ? "default" : stat.tendencia_porcentaje < 0 ? "destructive" : "secondary"}>
                              {stat.tendencia_porcentaje > 0 ? "+" : ""}{stat.tendencia_porcentaje}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            Q {formatNumber(stat.proyeccion_30d_q)}
                          </TableCell>
                          <TableCell className="text-right">
                            {stat.stock_actual !== null ? formatNumber(stat.stock_actual, 0) : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {stat.dias_stock !== null ? (
                              <Badge variant={stat.dias_stock < 10 ? "destructive" : stat.dias_stock <= 30 ? "default" : "secondary"}>
                                {stat.dias_stock} días
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {stat.riesgo_stock && (
                              <Badge 
                                variant={
                                  stat.riesgo_stock === "Alto" ? "destructive" : 
                                  stat.riesgo_stock === "Medio" ? "default" : 
                                  stat.riesgo_stock === "Bajo" ? "secondary" : 
                                  "outline"
                                }
                              >
                                {stat.riesgo_stock}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{stat.recomendacion}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {estadisticas.length === 0 && !loadingStats && (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos disponibles. Haz clic en "Generar Análisis" para cargar las estadísticas.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
