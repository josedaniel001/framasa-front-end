"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  DollarSign,
  TrendingUp,
  Users,
  Package,
  Calendar,
  MapPin,
  Truck,
} from "lucide-react"
import Link from "next/link"

// Datos de ejemplo para ventas de piedrinera
const ventasData = [
  {
    id: "V-001",
    fecha: "2024-01-15",
    cliente: "Constructora ABC",
    agregado: "Arena Fina",
    cantidad: 25.5,
    unidad: "m³",
    precioUnitario: 45000,
    total: 1147500,
    estado: "Completada",
    destino: "Obra Los Pinos",
    camion: "CAM-001",
    conductor: "Juan Pérez",
  },
  {
    id: "V-002",
    fecha: "2024-01-15",
    cliente: "Obras Civiles SRL",
    agregado: 'Grava 3/4"',
    cantidad: 40.0,
    unidad: "m³",
    precioUnitario: 52000,
    total: 2080000,
    estado: "En Proceso",
    destino: "Proyecto Residencial",
    camion: "CAM-003",
    conductor: "María García",
  },
  {
    id: "V-003",
    fecha: "2024-01-14",
    cliente: "Infraestructura Total",
    agregado: 'Piedrín 1/2"',
    cantidad: 60.0,
    unidad: "m³",
    precioUnitario: 48000,
    total: 2880000,
    estado: "Pendiente",
    destino: "Carretera Nacional",
    camion: "Pendiente",
    conductor: "Pendiente",
  },
  {
    id: "V-004",
    fecha: "2024-01-14",
    cliente: "Constructora XYZ",
    agregado: "Arena Gruesa",
    cantidad: 30.0,
    unidad: "m³",
    precioUnitario: 42000,
    total: 1260000,
    estado: "Completada",
    destino: "Edificio Central",
    camion: "CAM-002",
    conductor: "Carlos López",
  },
]

const estadoColors = {
  Completada: "bg-green-100 text-green-800",
  "En Proceso": "bg-blue-100 text-blue-800",
  Pendiente: "bg-yellow-100 text-yellow-800",
  Cancelada: "bg-red-100 text-red-800",
}

export default function PiedrinerapVentasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [selectedVenta, setSelectedVenta] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleOpenDetailModal = useCallback((venta: any) => {
    setSelectedVenta(venta)
    setIsDetailModalOpen(true)
  }, [])

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false)
    setSelectedVenta(null)
  }, [])

  const filteredVentas = ventasData.filter((venta) => {
    const matchesSearch =
      venta.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.agregado.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterEstado === "todos" || venta.estado === filterEstado
    return matchesSearch && matchesFilter
  })

  // Cálculos para KPIs
  const totalVentas = ventasData.reduce((sum, venta) => sum + venta.total, 0)
  const ventasCompletadas = ventasData.filter((v) => v.estado === "Completada").length
  const volumenTotal = ventasData.reduce((sum, venta) => sum + venta.cantidad, 0)
  const clientesUnicos = new Set(ventasData.map((v) => v.cliente)).size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ventas - Piedrinera</h1>
          <p className="text-gray-600">Gestión de ventas de agregados y materiales</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" asChild>
          <Link href="/piedrinera/ventas/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Venta
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventas del Mes</p>
                <p className="text-2xl font-bold">₡{totalVentas.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-500 ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventas Completadas</p>
                <p className="text-2xl font-bold">{ventasCompletadas}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">de {ventasData.length} totales</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Volumen Vendido</p>
                <p className="text-2xl font-bold">{volumenTotal.toFixed(1)} m³</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+8.3%</span>
              <span className="text-gray-500 ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                <p className="text-2xl font-bold">{clientesUnicos}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">clientes únicos</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por cliente, ID o agregado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de ventas */}
      <div className="grid gap-4">
        {filteredVentas.map((venta) => (
          <Card key={venta.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <p className="font-semibold text-blue-600">{venta.id}</p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {venta.fecha}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">{venta.cliente}</p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {venta.destino}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">{venta.agregado}</p>
                    <p className="text-sm text-gray-500">
                      {venta.cantidad} {venta.unidad}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">₡{venta.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      ₡{venta.precioUnitario.toLocaleString()}/{venta.unidad}
                    </p>
                  </div>
                  <div>
                    <Badge className={estadoColors[venta.estado as keyof typeof estadoColors]}>{venta.estado}</Badge>
                    <p className="text-sm text-gray-500 mt-1">
                      {venta.camion !== "Pendiente" ? venta.camion : "Sin asignar"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDetailModal(venta)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/piedrinera/ventas/${venta.id}/editar`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de detalles */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de Venta - {selectedVenta?.id}</DialogTitle>
          </DialogHeader>
          {selectedVenta && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Información General</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Fecha:</span> {selectedVenta.fecha}
                    </p>
                    <p>
                      <span className="font-medium">Cliente:</span> {selectedVenta.cliente}
                    </p>
                    <p>
                      <span className="font-medium">Destino:</span> {selectedVenta.destino}
                    </p>
                    <p>
                      <span className="font-medium">Estado:</span>
                      <Badge className={`ml-2 ${estadoColors[selectedVenta.estado as keyof typeof estadoColors]}`}>
                        {selectedVenta.estado}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Detalles del Producto</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Agregado:</span> {selectedVenta.agregado}
                    </p>
                    <p>
                      <span className="font-medium">Cantidad:</span> {selectedVenta.cantidad} {selectedVenta.unidad}
                    </p>
                    <p>
                      <span className="font-medium">Precio Unitario:</span> ₡
                      {selectedVenta.precioUnitario.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Total:</span> ₡{selectedVenta.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Información de Despacho</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p>
                    <span className="font-medium">Camión:</span> {selectedVenta.camion}
                  </p>
                  <p>
                    <span className="font-medium">Conductor:</span> {selectedVenta.conductor}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseDetailModal}>
                  Cerrar
                </Button>
                <Button>Editar Venta</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
