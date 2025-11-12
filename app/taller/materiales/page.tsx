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
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Droplets,
  Settings,
  Zap,
  Wrench,
} from "lucide-react"
import Link from "next/link"

const materiales = [
  {
    id: "MAT-001",
    codigo: "ACE-15W40-20L",
    nombre: "Aceite Motor 15W-40",
    categoria: "Lubricantes",
    marca: "Shell",
    unidad: "Litros",
    stockActual: 45,
    stockMinimo: 20,
    stockMaximo: 100,
    ubicacion: "A-01-15",
    precioUnitario: 12.5,
    proveedor: "Distribuidora Técnica",
    ultimaCompra: "2024-01-10",
    estado: "Disponible",
  },
  {
    id: "MAT-002",
    codigo: "FIL-AIR-CAT320",
    nombre: "Filtro de Aire CAT 320D",
    categoria: "Filtros",
    marca: "Caterpillar",
    unidad: "Unidad",
    stockActual: 8,
    stockMinimo: 10,
    stockMaximo: 25,
    ubicacion: "B-02-08",
    precioUnitario: 85.0,
    proveedor: "Repuestos Maquinaria",
    ultimaCompra: "2024-01-08",
    estado: "Stock Bajo",
  },
  {
    id: "MAT-003",
    codigo: "PAD-BRK-VOLVO",
    nombre: "Pastillas de Freno Volvo FH",
    categoria: "Frenos",
    marca: "Brembo",
    unidad: "Juego",
    stockActual: 0,
    stockMinimo: 5,
    stockMaximo: 15,
    ubicacion: "C-01-12",
    precioUnitario: 150.0,
    proveedor: "Autopartes Premium",
    ultimaCompra: "2023-12-20",
    estado: "Agotado",
  },
  {
    id: "MAT-004",
    codigo: "HYD-OIL-ISO46",
    nombre: "Aceite Hidráulico ISO 46",
    categoria: "Hidráulicos",
    marca: "Mobil",
    unidad: "Litros",
    stockActual: 120,
    stockMinimo: 50,
    stockMaximo: 200,
    ubicacion: "A-02-20",
    precioUnitario: 8.75,
    proveedor: "Lubricantes Industriales",
    ultimaCompra: "2024-01-12",
    estado: "Disponible",
  },
  {
    id: "MAT-005",
    codigo: "BLT-TIMING-JCB",
    nombre: "Correa de Distribución JCB 3CX",
    categoria: "Correas",
    marca: "Gates",
    unidad: "Unidad",
    stockActual: 3,
    stockMinimo: 5,
    stockMaximo: 12,
    ubicacion: "D-01-05",
    precioUnitario: 95.0,
    proveedor: "Repuestos JCB",
    ultimaCompra: "2024-01-05",
    estado: "Stock Bajo",
  },
  {
    id: "MAT-006",
    codigo: "GRS-MULTI-500G",
    nombre: "Grasa Multiuso 500g",
    categoria: "Lubricantes",
    marca: "Texaco",
    unidad: "Unidad",
    stockActual: 25,
    stockMinimo: 15,
    stockMaximo: 40,
    ubicacion: "A-01-08",
    precioUnitario: 6.5,
    proveedor: "Distribuidora Técnica",
    ultimaCompra: "2024-01-14",
    estado: "Disponible",
  },
]

const getEstadoBadge = (estado: string) => {
  const variants = {
    Disponible: "bg-green-100 text-green-800 border-green-200",
    "Stock Bajo": "bg-yellow-100 text-yellow-800 border-yellow-200",
    Agotado: "bg-red-100 text-red-800 border-red-200",
  }
  return variants[estado as keyof typeof variants] || variants["Disponible"]
}

const getEstadoIcon = (estado: string) => {
  const icons = {
    Disponible: <CheckCircle className="h-4 w-4" />,
    "Stock Bajo": <AlertTriangle className="h-4 w-4" />,
    Agotado: <XCircle className="h-4 w-4" />,
  }
  return icons[estado as keyof typeof icons] || icons["Disponible"]
}

const getCategoriaIcon = (categoria: string) => {
  const icons = {
    Lubricantes: <Droplets className="h-4 w-4" />,
    Filtros: <Settings className="h-4 w-4" />,
    Frenos: <XCircle className="h-4 w-4" />,
    Hidráulicos: <TrendingUp className="h-4 w-4" />,
    Correas: <Zap className="h-4 w-4" />,
  }
  return icons[categoria as keyof typeof icons] || <Wrench className="h-4 w-4" />
}

const getStockPercentage = (actual: number, minimo: number, maximo: number) => {
  return ((actual - minimo) / (maximo - minimo)) * 100
}

export default function MaterialesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("Todas")
  const [filtroEstado, setFiltroEstado] = useState("Todos")

  const materialesFiltrados = materiales.filter((material) => {
    const matchesSearch =
      material.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.marca.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria = filtroCategoria === "Todas" || material.categoria === filtroCategoria
    const matchesEstado = filtroEstado === "Todos" || material.estado === filtroEstado
    return matchesSearch && matchesCategoria && matchesEstado
  })

  const stats = {
    total: materiales.length,
    disponibles: materiales.filter((m) => m.estado === "Disponible").length,
    stockBajo: materiales.filter((m) => m.estado === "Stock Bajo").length,
    agotados: materiales.filter((m) => m.estado === "Agotado").length,
    valorTotal: materiales.reduce((sum, m) => sum + m.stockActual * m.precioUnitario, 0),
  }

  const categorias = [...new Set(materiales.map((m) => m.categoria))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Materiales y Repuestos</h1>
          <p className="text-muted-foreground">Gestión de inventario del taller</p>
        </div>
        <Link href="/taller/materiales/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Material
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Materiales</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{stats.disponibles}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock Bajo</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.stockBajo}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agotados</p>
                <p className="text-2xl font-bold text-red-600">{stats.agotados}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">${stats.valorTotal.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
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
                  placeholder="Buscar por nombre, código o marca..."
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
                <option value="Disponible">Disponible</option>
                <option value="Stock Bajo">Stock Bajo</option>
                <option value="Agotado">Agotado</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Materiales */}
      <div className="grid gap-4">
        {materialesFiltrados.map((material) => (
          <Card key={material.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getCategoriaIcon(material.categoria)}
                    <h3 className="font-semibold text-lg">{material.nombre}</h3>
                    <Badge className={`${getEstadoBadge(material.estado)} border`}>
                      {getEstadoIcon(material.estado)}
                      <span className="ml-1">{material.estado}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Código</p>
                      <p className="font-medium">{material.codigo}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Marca</p>
                      <p className="font-medium">{material.marca}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ubicación</p>
                      <p className="font-medium">{material.ubicacion}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Precio Unitario</p>
                      <p className="font-medium">${material.precioUnitario}</p>
                    </div>
                  </div>

                  {/* Barra de Stock */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        Stock: {material.stockActual} {material.unidad}
                      </span>
                      <span>
                        Min: {material.stockMinimo} | Max: {material.stockMaximo}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          material.estado === "Agotado"
                            ? "bg-red-500"
                            : material.estado === "Stock Bajo"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(0, getStockPercentage(material.stockActual, material.stockMinimo, material.stockMaximo)))}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Valor en Stock: ${(material.stockActual * material.precioUnitario).toLocaleString()}</span>
                      <span>Última compra: {new Date(material.ultimaCompra).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href={`/taller/materiales/${material.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </Link>
                  <Link href={`/taller/materiales/${material.id}/editar`}>
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

      {materialesFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron materiales</h3>
            <p className="text-gray-500 mb-4">No hay materiales que coincidan con los filtros seleccionados.</p>
            <Link href="/taller/materiales/nuevo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Material
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
