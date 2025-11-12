"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
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
import { sampleFacturasVenta, sampleClientes } from "@/lib/sample-data"

export default function ReportesPage() {
  const [tipoReporte, setTipoReporte] = useState("ventas")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [filtroCliente, setFiltroCliente] = useState("all")

  // Datos para gráficos
  const ventasPorMes = [
    { mes: "Ene", ventas: 45000, facturas: 25 },
    { mes: "Feb", ventas: 52000, facturas: 30 },
    { mes: "Mar", ventas: 48000, facturas: 28 },
    { mes: "Abr", ventas: 61000, facturas: 35 },
    { mes: "May", ventas: 55000, facturas: 32 },
    { mes: "Jun", ventas: 67000, facturas: 40 },
  ]

  const ventasPorFormaPago = [
    { name: "Efectivo", value: 45, color: "#10B981" },
    { name: "Crédito", value: 30, color: "#3B82F6" },
    { name: "Transferencia", value: 20, color: "#8B5CF6" },
    { name: "Cheque", value: 5, color: "#F59E0B" },
  ]

  const topProductos = [
    { producto: "Cemento UGC 50kg", ventas: 150, ingresos: 12750 },
    { producto: "Block 15x20x40", ventas: 2500, ingresos: 8750 },
    { producto: 'Piedrin 3/4"', ventas: 45, ingresos: 8100 },
    { producto: 'Electrodo 6013 1/8"', ventas: 250, ingresos: 3125 },
  ]

  const topClientes = sampleClientes
    .map((cliente) => {
      const ventasCliente = sampleFacturasVenta.filter((v) => v.cliente_id === cliente.id)
      const totalCompras = ventasCliente.reduce((acc, v) => acc + v.total, 0)
      return {
        ...cliente,
        total_compras: totalCompras,
        numero_facturas: ventasCliente.length,
      }
    })
    .sort((a, b) => b.total_compras - a.total_compras)

  const generarReporte = () => {
    console.log("Generando reporte:", { tipoReporte, fechaInicio, fechaFin, filtroCliente })
    alert(`Generando reporte de ${tipoReporte}`)
  }

  const exportarPDF = () => {
    alert("Exportando reporte a PDF...")
  }

  const exportarExcel = () => {
    alert("Exportando reporte a Excel...")
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
                  {sampleClientes.map((cliente) => (
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
            <div className="text-2xl font-bold">Q 328,000</div>
            <p className="text-xs text-muted-foreground">+18.2% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Emitidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">190</div>
            <p className="text-xs text-muted-foreground">+12 vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,945</div>
            <p className="text-xs text-muted-foreground">+8.1% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">+5 nuevos este mes</p>
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
                <Tooltip formatter={(value) => [`Q ${value.toLocaleString()}`, "Ventas"]} />
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
                  data={ventasPorFormaPago}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                {topProductos.map((producto, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{producto.producto}</TableCell>
                    <TableCell className="text-center">{producto.ventas}</TableCell>
                    <TableCell className="text-right">Q {producto.ingresos.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
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
                {topClientes.slice(0, 4).map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nombre}</TableCell>
                    <TableCell className="text-center">{cliente.numero_facturas}</TableCell>
                    <TableCell className="text-right">Q {cliente.total_compras.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
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

      {/* Additional Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
              <RechartsBarChart className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Análisis de ingresos por mes.</p>
            <Button variant="outline" className="mt-4 w-full bg-transparent">
              Ver Reporte Detallado
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
              <RechartsPieChart className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Identifica los productos con mayor demanda.</p>
            <Button variant="outline" className="mt-4 w-full bg-transparent">
              Ver Reporte Detallado
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movimientos de Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
              <RechartsLineChart className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Historial de entradas y salidas de stock.</p>
            <Button variant="outline" className="mt-4 w-full bg-transparent">
              Ver Reporte Detallado
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes Top</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
              <Users className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Clientes con mayor volumen de compra.</p>
            <Button variant="outline" className="mt-4 w-full bg-transparent">
              Ver Reporte Detallado
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cotizaciones por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
              <RechartsPieChart className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Distribución de cotizaciones por su estado (aceptadas, pendientes, rechazadas).
            </p>
            <Button variant="outline" className="mt-4 w-full bg-transparent">
              Ver Reporte Detallado
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
