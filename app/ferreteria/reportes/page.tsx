"use client"

import { CardDescription } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from "recharts"
import { Download, Users } from "lucide-react"

interface Cliente {
  id: string
  nombre: string
  nit: string
}

interface KPIs {
  ventasTotales: number
  totalFacturas: number
  productosVendidos: number
  clientesActivos: number
  porcentajeVentas: number
  diferenciaFacturas: number
}

interface VentaPorMes {
  mes: string
  ventas: number
  facturas: number
}

interface VentaPorFormaPago {
  name: string
  value: number
  color: string
}

interface TopProducto {
  producto: string
  ventas: number
  ingresos: number
}

interface TopCliente {
  id: string
  nombre: string
  numero_facturas: number
  total_compras: number
}

// Función helper para obtener el token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export default function ReportesPage() {
  const [tipoReporte, setTipoReporte] = useState("ventas")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [filtroCliente, setFiltroCliente] = useState("all")
  
  // Estados para datos
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [ventasPorMes, setVentasPorMes] = useState<VentaPorMes[]>([])
  const [ventasPorFormaPago, setVentasPorFormaPago] = useState<VentaPorFormaPago[]>([])
  const [topProductos, setTopProductos] = useState<TopProducto[]>([])
  const [topClientes, setTopClientes] = useState<TopCliente[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos()
  }, [fechaInicio, fechaFin])

  // Cargar clientes para el filtro
  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch("/api/ferreteria/clientes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setClientes(data)
      }
    } catch (err) {
      console.error("Error al cargar clientes:", err)
    }
  }

  const cargarDatos = async () => {
    setIsLoading(true)
    setError(null)
    const token = getAuthToken()

    if (!token) {
      setError("No hay token de autenticación")
      setIsLoading(false)
      return
    }

    try {
      // Construir query params
      const params = new URLSearchParams()
      if (fechaInicio) params.append('fechaInicio', fechaInicio)
      if (fechaFin) params.append('fechaFin', fechaFin)

      const headers = {
        Authorization: `Bearer ${token}`,
      }

      // Cargar todos los datos en paralelo
      const [kpisRes, ventasMesRes, formaPagoRes, productosRes, clientesRes] = await Promise.all([
        fetch(`/api/ferreteria/reportes/kpis?${params.toString()}`, { headers }),
        fetch("/api/ferreteria/reportes/ventas-mes", { headers }),
        fetch("/api/ferreteria/reportes/ventas-forma-pago", { headers }),
        fetch("/api/ferreteria/reportes/top-productos", { headers }),
        fetch("/api/ferreteria/reportes/top-clientes", { headers }),
      ])

      if (!kpisRes.ok || !ventasMesRes.ok || !formaPagoRes.ok || !productosRes.ok || !clientesRes.ok) {
        throw new Error("Error al cargar los datos")
      }

      const [kpisData, ventasMesData, formaPagoData, productosData, clientesData] = await Promise.all([
        kpisRes.json(),
        ventasMesRes.json(),
        formaPagoRes.json(),
        productosRes.json(),
        clientesRes.json(),
      ])

      setKpis(kpisData)
      setVentasPorMes(ventasMesData)
      setVentasPorFormaPago(formaPagoData)
      setTopProductos(productosData)
      setTopClientes(clientesData)
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError("Error al cargar los datos. Por favor, intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const generarReporte = () => {
    console.log("Generando reporte:", { tipoReporte, fechaInicio, fechaFin, filtroCliente })
    cargarDatos()
  }

  const exportarPDF = () => {
    alert("Exportando reporte a PDF...")
  }

  const exportarExcel = () => {
    alert("Exportando reporte a Excel...")
  }

  if (isLoading && !kpis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Cargando reportes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={cargarDatos} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes de Ferretería</h1>
          <p className="text-gray-600">Análisis y reportes del módulo de ferretería</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportarExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={exportarPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button onClick={generarReporte}>Generar Reporte</Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">Filtros de Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="tipo_reporte">Tipo de Reporte</Label>
              <Select value={tipoReporte} onValueChange={setTipoReporte}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ventas">Ventas</SelectItem>
                  <SelectItem value="productos">Productos</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="inventario">Inventario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fecha_fin">Fecha Fin</Label>
              <Input id="fecha_fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Select value={filtroCliente} onValueChange={setFiltroCliente}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id.toString()}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Q {kpis?.ventasTotales.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              {kpis && kpis.porcentajeVentas > 0 ? '+' : ''}{kpis?.porcentajeVentas.toFixed(1) || '0'}% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Emitidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.totalFacturas || 0}</div>
            <p className="text-xs text-muted-foreground">
              {kpis && kpis.diferenciaFacturas > 0 ? '+' : ''}{kpis?.diferenciaFacturas || 0} vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.productosVendidos.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">Total de unidades vendidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.clientesActivos || 0}</div>
            <p className="text-xs text-muted-foreground">Clientes con compras en el período</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Mes</CardTitle>
            <CardDescription>Evolución de ventas en los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={ventasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`Q ${value.toLocaleString()}`, "Ventas"]} />
                <Bar dataKey="ventas" fill="#3B82F6" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ventas por Forma de Pago</CardTitle>
            <CardDescription>Distribución de métodos de pago</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={ventasPorFormaPago as any}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${entry.percent ? (entry.percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ventasPorFormaPago.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tablas de Datos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Productos</CardTitle>
            <CardDescription>Productos más vendidos del período</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProductos.length > 0 ? (
                  topProductos.map((producto, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{producto.producto}</TableCell>
                      <TableCell className="text-center">{producto.ventas}</TableCell>
                      <TableCell className="text-right">Q {producto.ingresos.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No hay datos disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Clientes</CardTitle>
            <CardDescription>Clientes con mayor volumen de compras</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">Facturas</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClientes.length > 0 ? (
                  topClientes.slice(0, 10).map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell className="text-center">{cliente.numero_facturas}</TableCell>
                      <TableCell className="text-right">Q {cliente.total_compras.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No hay datos disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Tendencias */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Ventas</CardTitle>
          <CardDescription>Comparación de ventas y número de facturas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart data={ventasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ventas"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Ventas (Q)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="facturas"
                stroke="#10B981"
                strokeWidth={2}
                name="Facturas (#)"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
