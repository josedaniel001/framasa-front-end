"use client"

import { useState } from "react"
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
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Download,
  Plus,
  Filter,
  Users,
  CalendarCheck,
  CalendarX,
  TrendingUp,
  Edit,
  LogOut,
} from "lucide-react"
import Link from "next/link"

// Datos estáticos de ejemplo
const asistenciasEstaticas = [
  {
    id: 1,
    empleado: "Juan Pérez",
    codigo: "EMP001",
    fecha: "2024-01-15",
    horaEntrada: "08:00",
    horaSalida: "17:00",
    horasTrabajadas: 8,
    estado: "presente",
    observaciones: "",
  },
  {
    id: 2,
    empleado: "María González",
    codigo: "EMP002",
    fecha: "2024-01-15",
    horaEntrada: "08:15",
    horaSalida: "-",
    horasTrabajadas: 8.25,
    estado: "presente",
    observaciones: "Llegó 15 minutos tarde",
  },
  {
    id: 3,
    empleado: "Carlos Rodríguez",
    codigo: "EMP003",
    fecha: "2024-01-15",
    horaEntrada: "-",
    horaSalida: "-",
    horasTrabajadas: 0,
    estado: "ausente",
    observaciones: "Sin justificación",
  },
  {
    id: 4,
    empleado: "Ana Martínez",
    codigo: "EMP004",
    fecha: "2024-01-15",
    horaEntrada: "08:00",
    horaSalida: "13:00",
    horasTrabajadas: 5,
    estado: "medio_dia",
    observaciones: "Salida temprano por cita médica",
  },
  {
    id: 5,
    empleado: "Luis Hernández",
    codigo: "EMP005",
    fecha: "2024-01-15",
    horaEntrada: "08:00",
    horaSalida: "17:00",
    horasTrabajadas: 8,
    estado: "presente",
    observaciones: "",
  },
  {
    id: 6,
    empleado: "Sofía Ramírez",
    codigo: "EMP006",
    fecha: "2024-01-15",
    horaEntrada: "08:30",
    horaSalida: "17:30",
    horasTrabajadas: 8,
    estado: "presente",
    observaciones: "Llegó tarde, compensó saliendo más tarde",
  },
  {
    id: 7,
    empleado: "Pedro López",
    codigo: "EMP007",
    fecha: "2024-01-15",
    horaEntrada: "-",
    horaSalida: "-",
    horasTrabajadas: 0,
    estado: "licencia",
    observaciones: "Licencia médica",
  },
  {
    id: 8,
    empleado: "Carmen Torres",
    codigo: "EMP008",
    fecha: "2024-01-15",
    horaEntrada: "08:00",
    horaSalida: "17:00",
    horasTrabajadas: 8,
    estado: "presente",
    observaciones: "",
  },
]

export default function AsistenciasPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroFecha, setFiltroFecha] = useState("hoy")

  // Filtrar asistencias
  const asistenciasFiltradas = asistenciasEstaticas.filter((asistencia) => {
    const coincideBusqueda =
      asistencia.empleado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asistencia.codigo.toLowerCase().includes(searchTerm.toLowerCase())

    const coincideEstado =
      filtroEstado === "todos" || asistencia.estado === filtroEstado

    return coincideBusqueda && coincideEstado
  })

  // Calcular estadísticas
  const totalEmpleados = asistenciasEstaticas.length
  const presentes = asistenciasEstaticas.filter((a) => a.estado === "presente").length
  const ausentes = asistenciasEstaticas.filter((a) => a.estado === "ausente").length
  const licencias = asistenciasEstaticas.filter((a) => a.estado === "licencia").length
  const medioDia = asistenciasEstaticas.filter((a) => a.estado === "medio_dia").length
  const porcentajeAsistencia = totalEmpleados > 0 ? ((presentes / totalEmpleados) * 100).toFixed(1) : 0
  const horasTotales = asistenciasEstaticas.reduce((sum, a) => sum + a.horasTrabajadas, 0)

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "presente":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Presente
          </Badge>
        )
      case "ausente":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Ausente
          </Badge>
        )
      case "licencia":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <AlertCircle className="mr-1 h-3 w-3" />
            Licencia
          </Badge>
        )
      case "medio_dia":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="mr-1 h-3 w-3" />
            Medio Día
          </Badge>
        )
      default:
        return <Badge>{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asistencias</h1>
          <p className="text-muted-foreground">Control de asistencia y puntualidad de empleados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button asChild>
            <Link href="/planillas/asistencias/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Asistencia
            </Link>
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
            <p className="text-xs text-muted-foreground">Empleados registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presentes</CardTitle>
            <CalendarCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentes}</div>
            <p className="text-xs text-muted-foreground">{porcentajeAsistencia}% de asistencia</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausentes</CardTitle>
            <CalendarX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{ausentes}</div>
            <p className="text-xs text-muted-foreground">Sin justificación</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Totales</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{horasTotales.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Horas trabajadas hoy</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licencias</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{licencias}</div>
            <p className="text-xs text-muted-foreground">Con licencia médica</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medio Día</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{medioDia}</div>
            <p className="text-xs text-muted-foreground">Salida temprano</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Horas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
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
                <SelectItem value="presente">Presente</SelectItem>
                <SelectItem value="ausente">Ausente</SelectItem>
                <SelectItem value="licencia">Licencia</SelectItem>
                <SelectItem value="medio_dia">Medio Día</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroFecha} onValueChange={setFiltroFecha}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="semana">Esta Semana</SelectItem>
                <SelectItem value="mes">Este Mes</SelectItem>
                <SelectItem value="todos">Todas las Fechas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Asistencias */}
      <Card>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora Entrada</TableHead>
                  <TableHead>Hora Salida</TableHead>
                  <TableHead>Horas Trabajadas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asistenciasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No se encontraron registros de asistencia</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  asistenciasFiltradas.map((asistencia) => (
                    <TableRow key={asistencia.id}>
                      <TableCell className="font-medium">{asistencia.empleado}</TableCell>
                      <TableCell>{asistencia.codigo}</TableCell>
                      <TableCell>
                        {new Date(asistencia.fecha).toLocaleDateString("es-GT")}
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
                              onClick={() => {
                                // Aquí iría la lógica para marcar salida
                                toast({
                                  title: "Salida Marcada",
                                  description: `Se ha registrado la salida para ${asistencia.empleado}`,
                                })
                              }}
                            >
                              <LogOut className="mr-1 h-3 w-3" />
                              Marcar Salida
                            </Button>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/planillas/asistencias/${asistencia.id}/editar`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {asistenciasFiltradas.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {asistenciasFiltradas.length} de {asistenciasEstaticas.length} registros
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

