"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Package, Search, Plus, MoreHorizontal, Edit, Eye, Filter } from "lucide-react"

// Datos de ejemplo para agregados
const agregados = [
  {
    id: 1,
    nombre: "Arena de Río",
    categoria: "Arena",
    granulometria: "0-5mm",
    stock: 450,
    stockMinimo: 200,
    unidad: "m³",
    precioVenta: 85.0,
    ubicacion: "Patio A-1",
    calidad: "Excelente",
    humedad: "3.2%",
    ultimaEntrada: "2024-01-15",
    proveedor: "Cantera San José",
  },
  {
    id: 2,
    nombre: 'Grava 3/4"',
    categoria: "Grava",
    granulometria: "19mm",
    stock: 320,
    stockMinimo: 150,
    unidad: "m³",
    precioVenta: 95.0,
    ubicacion: "Patio B-2",
    calidad: "Buena",
    humedad: "1.8%",
    ultimaEntrada: "2024-01-14",
    proveedor: "Agregados del Norte",
  },
  {
    id: 3,
    nombre: 'Piedrín 1/2"',
    categoria: "Piedrín",
    granulometria: "12.5mm",
    stock: 180,
    stockMinimo: 250,
    unidad: "m³",
    precioVenta: 105.0,
    ubicacion: "Patio C-1",
    calidad: "Excelente",
    humedad: "0.5%",
    ultimaEntrada: "2024-01-13",
    proveedor: "Cantera El Progreso",
  },
  {
    id: 4,
    nombre: "Arena Lavada",
    categoria: "Arena",
    granulometria: "0-3mm",
    stock: 275,
    stockMinimo: 100,
    unidad: "m³",
    precioVenta: 120.0,
    ubicacion: "Patio A-3",
    calidad: "Excelente",
    humedad: "2.1%",
    ultimaEntrada: "2024-01-16",
    proveedor: "Lavadero Central",
  },
  {
    id: 5,
    nombre: 'Grava 1"',
    categoria: "Grava",
    granulometria: "25mm",
    stock: 95,
    stockMinimo: 120,
    unidad: "m³",
    precioVenta: 110.0,
    ubicacion: "Patio B-1",
    calidad: "Buena",
    humedad: "1.2%",
    ultimaEntrada: "2024-01-12",
    proveedor: "Agregados del Norte",
  },
  {
    id: 6,
    nombre: "Arena Amarilla",
    categoria: "Arena",
    granulometria: "0-4mm",
    stock: 380,
    stockMinimo: 200,
    unidad: "m³",
    precioVenta: 75.0,
    ubicacion: "Patio A-2",
    calidad: "Regular",
    humedad: "4.1%",
    ultimaEntrada: "2024-01-11",
    proveedor: "Cantera San José",
  },
]

export default function PiedrinerapProductosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgregado, setSelectedAgregado] = useState<(typeof agregados)[0] | null>(null)

  const filteredAgregados = agregados.filter(
    (agregado) =>
      agregado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agregado.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agregado.proveedor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStockStatus = (stock: number, stockMinimo: number) => {
    if (stock <= stockMinimo * 0.5) {
      return { status: "Crítico", color: "bg-red-500", textColor: "text-red-700" }
    } else if (stock <= stockMinimo) {
      return { status: "Bajo", color: "bg-yellow-500", textColor: "text-yellow-700" }
    } else {
      return { status: "Normal", color: "bg-green-500", textColor: "text-green-700" }
    }
  }

  const getCalidadBadge = (calidad: string) => {
    const variants = {
      Excelente: "default",
      Buena: "secondary",
      Regular: "outline",
    } as const

    return <Badge variant={variants[calidad as keyof typeof variants] || "outline"}>{calidad}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agregados</h1>
          <p className="text-muted-foreground">Gestión de arena, grava, piedrín y otros agregados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button asChild>
            <Link href="/piedrinera/productos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Agregado
            </Link>
          </Button>
        </div>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, categoría o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid de Agregados */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgregados.map((agregado) => {
          const stockStatus = getStockStatus(agregado.stock, agregado.stockMinimo)

          return (
            <Card key={agregado.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{agregado.nombre}</CardTitle>
                    <CardDescription>
                      {agregado.categoria} • {agregado.granulometria}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/piedrinera/productos/${agregado.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/piedrinera/productos/${agregado.id}/editar`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Package className="mr-2 h-4 w-4" />
                        Ajustar Stock
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stock */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Stock Actual</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stockStatus.color}`} />
                      <span className={`text-sm font-medium ${stockStatus.textColor}`}>{stockStatus.status}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {agregado.stock.toLocaleString()} {agregado.unidad}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Mínimo: {agregado.stockMinimo} {agregado.unidad}
                  </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Precio:</span>
                    <div className="font-medium">Q{agregado.precioVenta.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ubicación:</span>
                    <div className="font-medium">{agregado.ubicacion}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Humedad:</span>
                    <div className="font-medium">{agregado.humedad}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Calidad:</span>
                    <div>{getCalidadBadge(agregado.calidad)}</div>
                  </div>
                </div>

                {/* Proveedor */}
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground">Proveedor</div>
                  <div className="font-medium">{agregado.proveedor}</div>
                  <div className="text-xs text-muted-foreground">Última entrada: {agregado.ultimaEntrada}</div>
                </div>

                {/* Acciones rápidas */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href={`/piedrinera/productos/${agregado.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href={`/piedrinera/productos/${agregado.id}/editar`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Mensaje si no hay resultados */}
      {filteredAgregados.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron agregados</h3>
            <p className="text-muted-foreground mb-4">No hay agregados que coincidan con tu búsqueda.</p>
            <Button asChild>
              <Link href="/piedrinera/productos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Primer Agregado
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
