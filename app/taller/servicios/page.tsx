"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Settings,
  Clock,
  Users,
  DollarSign,
  Wrench,
  Zap,
  Cog,
  PenToolIcon as Tool,
  Activity,
} from "lucide-react"
import Link from "next/link"

const servicios = [
  {
    id: "SRV-001",
    codigo: "MANT-PREV-001",
    nombre: "Mantenimiento Preventivo Básico",
    categoria: "Mantenimiento",
    descripcion: "Cambio de aceite, filtros y revisión general",
    duracionHoras: 4,
    tecnicosRequeridos: 1,
    materialesIncluidos: ["Aceite motor", "Filtro aceite", "Filtro aire"],
    precioBase: 250.0,
    tipoEquipo: "Excavadoras",
    popularidad: 85,
    estado: "Activo",
    ultimaActualizacion: "2024-01-10",
  },
  {
    id: "SRV-002",
    codigo: "REP-HID-001",
    nombre: "Reparación Sistema Hidráulico",
    categoria: "Reparación",
    descripcion: "Diagnóstico y reparación de fallas hidráulicas",
    duracionHoras: 8,
    tecnicosRequeridos: 2,
    materialesIncluidos: ["Aceite hidráulico", "Sellos", "Mangueras"],
    precioBase: 850.0,
    tipoEquipo: "Grúas",
    popularidad: 65,
    estado: "Activo",
    ultimaActualizacion: "2024-01-08",
  },
  {
    id: "SRV-003",
    codigo: "OVER-MOT-001",
    nombre: "Overhaul Motor Completo",
    categoria: "Overhaul",
    descripcion: "Reconstrucción completa del motor",
    duracionHoras: 40,
    tecnicosRequeridos: 3,
    materialesIncluidos: ["Kit de motor", "Pistones", "Anillos", "Cojinetes"],
    precioBase: 4500.0,
    tipoEquipo: "Camiones",
    popularidad: 25,
    estado: "Activo",
    ultimaActualizacion: "2024-01-05",
  },
  {
    id: "SRV-004",
    codigo: "ELEC-DIAG-001",
    nombre: "Diagnóstico Electrónico",
    categoria: "Electrónica",
    descripcion: "Diagnóstico con scanner y reparación de fallas eléctricas",
    duracionHoras: 3,
    tecnicosRequeridos: 1,
    materialesIncluidos: ["Fusibles", "Relés", "Conectores"],
    precioBase: 180.0,
    tipoEquipo: "Todos",
    popularidad: 70,
    estado: "Activo",
    ultimaActualizacion: "2024-01-12",
  },
  {
    id: "SRV-005",
    codigo: "SOLD-EST-001",
    nombre: "Soldadura Estructural",
    categoria: "Soldadura",
    descripcion: "Reparación de estructuras metálicas y chasis",
    duracionHoras: 6,
    tecnicosRequeridos: 1,
    materialesIncluidos: ["Electrodos", "Gas argón", "Alambre MIG"],
    precioBase: 320.0,
    tipoEquipo: "Estructuras",
    popularidad: 45,
    estado: "Activo",
    ultimaActualizacion: "2024-01-07",
  },
  {
    id: "SRV-006",
    codigo: "MANT-PREV-002",
    nombre: "Mantenimiento 1000 Horas",
    categoria: "Mantenimiento",
    descripcion: "Mantenimiento mayor cada 1000 horas de operación",
    duracionHoras: 12,
    tecnicosRequeridos: 2,
    materialesIncluidos: ["Aceites", "Filtros completos", "Correas", "Refrigerante"],
    precioBase: 680.0,
    tipoEquipo: "Maquinaria Pesada",
    popularidad: 55,
    estado: "Inactivo",
    ultimaActualizacion: "2023-12-20",
  },
]

const getEstadoBadge = (estado: string) => {
  const variants = {
    Activo: "bg-green-100 text-green-800 border-green-200",
    Inactivo: "bg-gray-100 text-gray-800 border-gray-200",
  }
  return variants[estado as keyof typeof variants] || variants["Activo"]
}

const getCategoriaIcon = (categoria: string) => {
  const icons = {
    Mantenimiento: <Settings className="h-4 w-4" />,
    Reparación: <Wrench className="h-4 w-4" />,
    Overhaul: <Cog className="h-4 w-4" />,
    Electrónica: <Zap className="h-4 w-4" />,
    Soldadura: <Tool className="h-4 w-4" />,
  }
  return icons[categoria as keyof typeof icons] || <Settings className="h-4 w-4" />
}

const getPopularidadColor = (popularidad: number) => {
  if (popularidad >= 70) return "bg-green-500"
  if (popularidad >= 50) return "bg-yellow-500"
  return "bg-red-500"
}

export default function ServiciosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("Todas")
  const [filtroEstado, setFiltroEstado] = useState("Todos")

  const serviciosFiltrados = servicios.filter((servicio) => {
    const matchesSearch =
      servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria = filtroCategoria === "Todas" || servicio.categoria === filtroCategoria
    const matchesEstado = filtroEstado === "Todos" || servicio.estado === filtroEstado
    return matchesSearch && matchesCategoria && matchesEstado
  })

  const stats = {
    total: servicios.length,
    activos: servicios.filter((s) => s.estado === "Activo").length,
    inactivos: servicios.filter((s) => s.estado === "Inactivo").length,
    promedioHoras: servicios.reduce((sum, s) => sum + s.duracionHoras, 0) / servicios.length,
    ingresosPotenciales: servicios.filter((s) => s.estado === "Activo").reduce((sum, s) => sum + s.precioBase, 0),
  }

  const categorias = [...new Set(servicios.map((s) => s.categoria))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Servicios del Taller</h1>
          <p className="text-muted-foreground">Catálogo de servicios disponibles</p>
        </div>
        <Link href="/taller/servicios/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Servicio
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Servicios</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactivos</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactivos}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promedio Horas</p>
                <p className="text-2xl font-bold">{stats.promedioHoras.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Potenciales</p>
                <p className="text-2xl font-bold">${stats.ingresosPotenciales.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, código o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Todas">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Servicios */}
      <div className="grid gap-4">
        {serviciosFiltrados.map((servicio) => (
          <Card key={servicio.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getCategoriaIcon(servicio.categoria)}
                    <h3 className="font-semibold text-lg">{servicio.nombre}</h3>
                    <Badge className={`${getEstadoBadge(servicio.estado)} border`}>{servicio.estado}</Badge>
                  </div>

                  <p className="text-muted-foreground mb-4">{servicio.descripcion}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Duración</p>
                      <p className="font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {servicio.duracionHoras}h
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Técnicos</p>
                      <p className="font-medium flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {servicio.tecnicosRequeridos}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Precio Base</p>
                      <p className="font-medium flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />${servicio.precioBase}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tipo Equipo</p>
                      <p className="font-medium">{servicio.tipoEquipo}</p>
                    </div>
                  </div>

                  {/* Popularidad */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Popularidad</span>
                      <span>{servicio.popularidad}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPopularidadColor(servicio.popularidad)}`}
                        style={{ width: `${servicio.popularidad}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Materiales: {servicio.materialesIncluidos.length} incluidos</span>
                      <span>Actualizado: {new Date(servicio.ultimaActualizacion).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href={`/taller/servicios/${servicio.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </Link>
                  <Link href={`/taller/servicios/${servicio.id}/editar`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {serviciosFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron servicios</h3>
            <p className="text-gray-500 mb-4">No hay servicios que coincidan con los filtros seleccionados.</p>
            <Link href="/taller/servicios/nuevo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Servicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
