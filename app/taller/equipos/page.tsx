"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Settings,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  Hammer,
} from "lucide-react"
import Link from "next/link"

export default function EquiposPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const equipos = [
    {
      id: "EQ-001",
      nombre: "Excavadora CAT 320",
      tipo: "Excavadora",
      marca: "Caterpillar",
      modelo: "320 GC",
      serie: "CAT0320ABCD1234",
      año: 2020,
      horasOperacion: 2450,
      estado: "Operativo",
      ubicacion: "Obra Central",
      ultimoMantenimiento: "2024-01-10",
      proximoMantenimiento: "2024-02-10",
      responsable: "Carlos Méndez",
    },
    {
      id: "EQ-002",
      nombre: "Camión Volvo FH16",
      tipo: "Camión",
      marca: "Volvo",
      modelo: "FH16 750",
      serie: "VOLVO2024XYZ789",
      año: 2022,
      horasOperacion: 1890,
      estado: "Mantenimiento",
      ubicacion: "Taller Principal",
      ultimoMantenimiento: "2024-01-14",
      proximoMantenimiento: "2024-01-20",
      responsable: "Ana Rodríguez",
    },
    {
      id: "EQ-003",
      nombre: "Retroexcavadora JCB 3CX",
      tipo: "Retroexcavadora",
      marca: "JCB",
      modelo: "3CX Super",
      serie: "JCB3CX2023ABC456",
      año: 2023,
      horasOperacion: 1200,
      estado: "Crítico",
      ubicacion: "Obra Norte",
      ultimoMantenimiento: "2023-12-15",
      proximoMantenimiento: "2024-01-20",
      responsable: "Luis Vargas",
    },
    {
      id: "EQ-004",
      nombre: "Grúa Liebherr LTM 1050",
      tipo: "Grúa",
      marca: "Liebherr",
      modelo: "LTM 1050-3.1",
      serie: "LBR1050DEF2024",
      año: 2021,
      horasOperacion: 3200,
      estado: "Operativo",
      ubicacion: "Obra Sur",
      ultimoMantenimiento: "2024-01-08",
      proximoMantenimiento: "2024-02-08",
      responsable: "María González",
    },
    {
      id: "EQ-005",
      nombre: "Compresor Atlas Copco",
      tipo: "Compresor",
      marca: "Atlas Copco",
      modelo: "XAHS 186",
      serie: "AC186GHI2022",
      año: 2022,
      horasOperacion: 1650,
      estado: "Operativo",
      ubicacion: "Almacén Central",
      ultimoMantenimiento: "2024-01-12",
      proximoMantenimiento: "2024-02-12",
      responsable: "Pedro Jiménez",
    },
  ]

  const filteredEquipos = equipos.filter(
    (equipo) =>
      equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getEstadoBadge = (estado: string) => {
    const variants = {
      Operativo: "secondary",
      Mantenimiento: "default",
      Crítico: "destructive",
      "Fuera de Servicio": "destructive",
    }
    return variants[estado as keyof typeof variants] || "default"
  }

  const getEstadoIcon = (estado: string) => {
    const icons = {
      Operativo: CheckCircle,
      Mantenimiento: Wrench,
      Crítico: AlertTriangle,
      "Fuera de Servicio": AlertTriangle,
    }
    const Icon = icons[estado as keyof typeof icons] || Clock
    return <Icon className="h-4 w-4" />
  }

  const getTipoIcon = (tipo: string) => {
    const icons = {
      Excavadora: Hammer,
      Camión: Truck,
      Retroexcavadora: Hammer,
      Grúa: Settings,
      Compresor: Settings,
    }
    const Icon = icons[tipo as keyof typeof icons] || Settings
    return <Icon className="h-4 w-4" />
  }

  const estadisticas = {
    total: equipos.length,
    operativos: equipos.filter((e) => e.estado === "Operativo").length,
    mantenimiento: equipos.filter((e) => e.estado === "Mantenimiento").length,
    criticos: equipos.filter((e) => e.estado === "Crítico").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Equipos y Maquinaria</h1>
          <p className="text-muted-foreground">Gestión del inventario de equipos del taller</p>
        </div>
        <Button asChild>
          <Link href="/taller/equipos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Equipo
          </Link>
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipos</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estadisticas.operativos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estadisticas.mantenimiento}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estadisticas.criticos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar equipos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Equipos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Equipos</CardTitle>
          <CardDescription>{filteredEquipos.length} equipos encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Próximo Mant.</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipos.map((equipo) => (
                <TableRow key={equipo.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTipoIcon(equipo.tipo)}
                      <div>
                        <div className="font-medium">{equipo.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          {equipo.marca} {equipo.modelo} ({equipo.año})
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{equipo.tipo}</TableCell>
                  <TableCell>
                    <Badge variant={getEstadoBadge(equipo.estado)} className="flex items-center gap-1 w-fit">
                      {getEstadoIcon(equipo.estado)}
                      {equipo.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>{equipo.ubicacion}</TableCell>
                  <TableCell>{equipo.horasOperacion.toLocaleString()}h</TableCell>
                  <TableCell>{equipo.proximoMantenimiento}</TableCell>
                  <TableCell>{equipo.responsable}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/taller/equipos/${equipo.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/taller/equipos/${equipo.id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/taller/ordenes/nueva?equipo=${equipo.id}`}>
                            <Wrench className="mr-2 h-4 w-4" />
                            Nueva Orden
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
