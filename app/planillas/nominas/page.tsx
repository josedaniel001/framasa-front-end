"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DollarSign,
  Users,
  Calendar,
  Download,
  FileText,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Receipt,
  CreditCard,
} from "lucide-react"

// Datos estáticos de ejemplo
const nominasEstaticas = [
  {
    id: 1,
    empleado: "Juan Pérez",
    codigo: "EMP001",
    periodo: "Enero 2024",
    fechaPago: "2024-02-05",
    salarioBase: 3500.00,
    horasExtras: 150.00,
    bonificaciones: 200.00,
    descuentos: 50.00,
    isr: 350.00,
    igss: 280.00,
    totalDevengado: 3850.00,
    totalDescuentos: 680.00,
    salarioNeto: 3170.00,
    estado: "pagado",
    metodoPago: "Transferencia",
  },
  {
    id: 2,
    empleado: "María González",
    codigo: "EMP002",
    periodo: "Enero 2024",
    fechaPago: "2024-02-05",
    salarioBase: 4000.00,
    horasExtras: 200.00,
    bonificaciones: 300.00,
    descuentos: 0.00,
    isr: 450.00,
    igss: 320.00,
    totalDevengado: 4500.00,
    totalDescuentos: 770.00,
    salarioNeto: 3730.00,
    estado: "pagado",
    metodoPago: "Efectivo",
  },
  {
    id: 3,
    empleado: "Carlos Rodríguez",
    codigo: "EMP003",
    periodo: "Enero 2024",
    fechaPago: "2024-02-05",
    salarioBase: 3200.00,
    horasExtras: 100.00,
    bonificaciones: 150.00,
    descuentos: 75.00,
    isr: 300.00,
    igss: 256.00,
    totalDevengado: 3450.00,
    totalDescuentos: 631.00,
    salarioNeto: 2819.00,
    estado: "pagado",
    metodoPago: "Cheque",
  },
  {
    id: 4,
    empleado: "Ana Martínez",
    codigo: "EMP004",
    periodo: "Enero 2024",
    fechaPago: "2024-02-05",
    salarioBase: 3800.00,
    horasExtras: 180.00,
    bonificaciones: 250.00,
    descuentos: 0.00,
    isr: 400.00,
    igss: 304.00,
    totalDevengado: 4230.00,
    totalDescuentos: 704.00,
    salarioNeto: 3526.00,
    estado: "pagado",
    metodoPago: "Transferencia",
  },
  {
    id: 5,
    empleado: "Luis Hernández",
    codigo: "EMP005",
    periodo: "Enero 2024",
    fechaPago: "2024-02-05",
    salarioBase: 3600.00,
    horasExtras: 120.00,
    bonificaciones: 180.00,
    descuentos: 30.00,
    isr: 370.00,
    igss: 288.00,
    totalDevengado: 3900.00,
    totalDescuentos: 688.00,
    salarioNeto: 3212.00,
    estado: "pagado",
    metodoPago: "Efectivo",
  },
  {
    id: 6,
    empleado: "Sofía Ramírez",
    codigo: "EMP006",
    periodo: "Enero 2024",
    fechaPago: "2024-02-05",
    salarioBase: 4200.00,
    horasExtras: 250.00,
    bonificaciones: 350.00,
    descuentos: 0.00,
    isr: 500.00,
    igss: 336.00,
    totalDevengado: 4800.00,
    totalDescuentos: 836.00,
    salarioNeto: 3964.00,
    estado: "pagado",
    metodoPago: "Transferencia",
  },
  {
    id: 7,
    empleado: "Pedro López",
    codigo: "EMP007",
    periodo: "Enero 2024",
    fechaPago: "2024-02-05",
    salarioBase: 3400.00,
    horasExtras: 80.00,
    bonificaciones: 120.00,
    descuentos: 100.00,
    isr: 330.00,
    igss: 272.00,
    totalDevengado: 3600.00,
    totalDescuentos: 702.00,
    salarioNeto: 2898.00,
    estado: "pagado",
    metodoPago: "Cheque",
  },
  {
    id: 8,
    empleado: "Carmen Torres",
    codigo: "EMP008",
    periodo: "Enero 2024",
    fechaPago: "2024-02-05",
    salarioBase: 3900.00,
    horasExtras: 160.00,
    bonificaciones: 220.00,
    descuentos: 0.00,
    isr: 420.00,
    igss: 312.00,
    totalDevengado: 4280.00,
    totalDescuentos: 732.00,
    salarioNeto: 3548.00,
    estado: "pendiente",
    metodoPago: "Transferencia",
  },
]

export default function NominasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroPeriodo, setFiltroPeriodo] = useState("enero-2024")

  // Filtrar nóminas
  const nominasFiltradas = nominasEstaticas.filter((nomina) => {
    const coincideBusqueda =
      nomina.empleado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nomina.codigo.toLowerCase().includes(searchTerm.toLowerCase())

    const coincideEstado =
      filtroEstado === "todos" || nomina.estado === filtroEstado

    const coincidePeriodo =
      filtroPeriodo === "todos" || nomina.periodo.toLowerCase().includes(filtroPeriodo.toLowerCase())

    return coincideBusqueda && coincideEstado && coincidePeriodo
  })

  // Calcular estadísticas
  const totalEmpleados = nominasEstaticas.length
  const pagados = nominasEstaticas.filter((n) => n.estado === "pagado").length
  const pendientes = nominasEstaticas.filter((n) => n.estado === "pendiente").length
  const totalDevengado = nominasEstaticas.reduce((sum, n) => sum + n.totalDevengado, 0)
  const totalDescuentos = nominasEstaticas.reduce((sum, n) => sum + n.totalDescuentos, 0)
  const totalNeto = nominasEstaticas.reduce((sum, n) => sum + n.salarioNeto, 0)
  const promedioSalario = totalEmpleados > 0 ? totalNeto / totalEmpleados : 0

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pagado":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Pagado
          </Badge>
        )
      case "pendiente":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente
          </Badge>
        )
      case "cancelado":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Cancelado
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nóminas</h1>
          <p className="text-muted-foreground">Gestión de nóminas y pagos de empleados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Generar Nómina
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmpleados}</div>
            <p className="text-xs text-muted-foreground">Empleados en nómina</p>
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
            <CardTitle className="text-sm font-medium">Pagados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{pagados}</div>
            <p className="text-xs text-muted-foreground">
              {totalEmpleados > 0 ? ((pagados / totalEmpleados) * 100).toFixed(1) : 0}% del total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendientes}</div>
            <p className="text-xs text-muted-foreground">Pendientes de pago</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Salario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(promedioSalario)}</div>
            <p className="text-xs text-muted-foreground">Salario neto promedio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Pago</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(nominasEstaticas[0]?.fechaPago || "").toLocaleDateString("es-GT", {
                day: "2-digit",
                month: "short",
              })}
            </div>
            <p className="text-xs text-muted-foreground">Fecha de último pago</p>
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
                placeholder="Buscar por nombre o código de empleado..."
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
                <SelectItem value="pagado">Pagado</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los períodos</SelectItem>
                <SelectItem value="enero-2024">Enero 2024</SelectItem>
                <SelectItem value="diciembre-2023">Diciembre 2023</SelectItem>
                <SelectItem value="noviembre-2023">Noviembre 2023</SelectItem>
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
            Detalle de nóminas y pagos a empleados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Fecha Pago</TableHead>
                  <TableHead>Salario Base</TableHead>
                  <TableHead>Devengado</TableHead>
                  <TableHead>Descuentos</TableHead>
                  <TableHead>Salario Neto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Método Pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nominasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No se encontraron registros de nómina</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  nominasFiltradas.map((nomina) => (
                    <TableRow key={nomina.id}>
                      <TableCell className="font-medium">{nomina.empleado}</TableCell>
                      <TableCell>{nomina.codigo}</TableCell>
                      <TableCell>{nomina.periodo}</TableCell>
                      <TableCell>
                        {new Date(nomina.fechaPago).toLocaleDateString("es-GT")}
                      </TableCell>
                      <TableCell>{formatCurrency(nomina.salarioBase)}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {formatCurrency(nomina.totalDevengado)}
                      </TableCell>
                      <TableCell className="text-red-600">
                        {formatCurrency(nomina.totalDescuentos)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(nomina.salarioNeto)}
                      </TableCell>
                      <TableCell>{getEstadoBadge(nomina.estado)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {nomina.metodoPago === "Transferencia" && (
                            <CreditCard className="h-3 w-3 text-muted-foreground" />
                          )}
                          {nomina.metodoPago === "Efectivo" && (
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                          )}
                          {nomina.metodoPago === "Cheque" && (
                            <Receipt className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="text-sm">{nomina.metodoPago}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {nominasFiltradas.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {nominasFiltradas.length} de {nominasEstaticas.length} registros
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen Financiero */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Desglose de Devengados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Salarios Base:</span>
              <span className="font-medium">
                {formatCurrency(nominasEstaticas.reduce((sum, n) => sum + n.salarioBase, 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Horas Extras:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(nominasEstaticas.reduce((sum, n) => sum + n.horasExtras, 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bonificaciones:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(nominasEstaticas.reduce((sum, n) => sum + n.bonificaciones, 0))}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between font-semibold">
                <span>Total Devengado:</span>
                <span className="text-green-600">{formatCurrency(totalDevengado)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Desglose de Descuentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ISR:</span>
              <span className="font-medium text-red-600">
                {formatCurrency(nominasEstaticas.reduce((sum, n) => sum + n.isr, 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IGSS:</span>
              <span className="font-medium text-red-600">
                {formatCurrency(nominasEstaticas.reduce((sum, n) => sum + n.igss, 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Otros Descuentos:</span>
              <span className="font-medium text-red-600">
                {formatCurrency(nominasEstaticas.reduce((sum, n) => sum + n.descuentos, 0))}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between font-semibold">
                <span>Total Descuentos:</span>
                <span className="text-red-600">{formatCurrency(totalDescuentos)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Resumen General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Empleados:</span>
              <span className="font-medium">{totalEmpleados}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pagados:</span>
              <span className="font-medium text-green-600">{pagados}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pendientes:</span>
              <span className="font-medium text-yellow-600">{pendientes}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total a Pagar:</span>
                <span className="text-blue-600">{formatCurrency(totalNeto)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

