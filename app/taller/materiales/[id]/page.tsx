"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  Package,
  MapPin,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Calendar,
  User,
  Truck,
  Clock,
} from "lucide-react"
import Link from "next/link"

// Datos simulados del material
const materialData = {
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
  descripcion: "Aceite multigrado para motores diesel de maquinaria pesada",
  observaciones: "Verificar compatibilidad con equipos antes de usar",
  estado: "Disponible",
  movimientos: [
    {
      fecha: "2024-01-15",
      tipo: "Salida",
      cantidad: 20,
      motivo: "Mantenimiento Excavadora CAT 320D",
      usuario: "Carlos Méndez",
    },
    { fecha: "2024-01-12", tipo: "Entrada", cantidad: 40, motivo: "Compra a proveedor", usuario: "Almacén" },
    {
      fecha: "2024-01-10",
      tipo: "Salida",
      cantidad: 15,
      motivo: "Mantenimiento Camión Volvo",
      usuario: "Miguel Torres",
    },
    { fecha: "2024-01-08", tipo: "Ajuste", cantidad: 5, motivo: "Corrección de inventario", usuario: "Supervisor" },
  ],
  estadisticas: {
    consumoMensual: 35,
    rotacion: 2.5,
    diasStock: 38,
    valorTotal: 562.5,
  },
}

const getEstadoBadge = (estado: string, stockActual: number, stockMinimo: number) => {
  if (stockActual === 0) {
    return <Badge className="bg-red-100 text-red-800 border-red-200">Agotado</Badge>
  } else if (stockActual <= stockMinimo) {
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Stock Bajo</Badge>
  } else {
    return <Badge className="bg-green-100 text-green-800 border-green-200">Disponible</Badge>
  }
}

const getTipoMovimientoIcon = (tipo: string) => {
  const icons = {
    Entrada: <TrendingUp className="h-4 w-4 text-green-600" />,
    Salida: <Package className="h-4 w-4 text-red-600" />,
    Ajuste: <AlertTriangle className="h-4 w-4 text-blue-600" />,
  }
  return icons[tipo as keyof typeof icons] || <Package className="h-4 w-4" />
}

export default function DetalleMaterialPage({ params }: { params: { id: string } }) {
  const [material] = useState(materialData)
  const stockPercentage =
    ((material.stockActual - material.stockMinimo) / (material.stockMaximo - material.stockMinimo)) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/taller/materiales">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{material.nombre}</h1>
            <p className="text-muted-foreground">
              {material.codigo} - {material.marca}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/taller/materiales/${params.id}/editar`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estado y Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Estado y Stock Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {getEstadoBadge(material.estado, material.stockActual, material.stockMinimo)}
                <span className="text-sm text-muted-foreground">Categoría: {material.categoria}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Stock Actual: {material.stockActual} {material.unidad}
                  </span>
                  <span>
                    Min: {material.stockMinimo} | Max: {material.stockMaximo}
                  </span>
                </div>
                <Progress value={Math.max(0, Math.min(100, stockPercentage))} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Valor en Stock: ${material.estadisticas.valorTotal.toFixed(2)}</span>
                  <span>Precio Unitario: ${material.precioUnitario}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Detallada */}
          <Card>
            <CardHeader>
              <CardTitle>Información Detallada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Descripción</h4>
                  <p className="text-sm text-muted-foreground">{material.descripcion}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Observaciones</h4>
                  <p className="text-sm text-muted-foreground">{material.observaciones}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Ubicación</p>
                  <p className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {material.ubicacion}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Proveedor</p>
                  <p className="font-medium flex items-center">
                    <Truck className="h-4 w-4 mr-1" />
                    {material.proveedor}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última Compra</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(material.ultimaCompra).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Movimientos Recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Movimientos Recientes</CardTitle>
              <CardDescription>Últimas entradas y salidas del material</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {material.movimientos.map((movimiento, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {getTipoMovimientoIcon(movimiento.tipo)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{movimiento.tipo}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(movimiento.fecha).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{movimiento.motivo}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {movimiento.usuario}
                        </span>
                        <span
                          className={`font-medium ${
                            movimiento.tipo === "Entrada"
                              ? "text-green-600"
                              : movimiento.tipo === "Salida"
                                ? "text-red-600"
                                : "text-blue-600"
                          }`}
                        >
                          {movimiento.tipo === "Entrada" ? "+" : movimiento.tipo === "Salida" ? "-" : "±"}
                          {movimiento.cantidad} {material.unidad}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consumo Mensual:</span>
                  <span className="font-medium">
                    {material.estadisticas.consumoMensual} {material.unidad}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rotación:</span>
                  <span className="font-medium">{material.estadisticas.rotacion}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Días de Stock:</span>
                  <span className="font-medium">{material.estadisticas.diasStock} días</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Valor Total:</span>
                  <span>${material.estadisticas.valorTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {material.stockActual <= material.stockMinimo && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Stock Bajo</p>
                      <p className="text-xs text-yellow-700">Considerar realizar pedido</p>
                    </div>
                  </div>
                )}

                {material.estadisticas.diasStock < 30 && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">Stock Crítico</p>
                      <p className="text-xs text-orange-700">Menos de 30 días de inventario</p>
                    </div>
                  </div>
                )}

                {material.stockActual > material.stockMaximo && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Sobrestock</p>
                      <p className="text-xs text-blue-700">Stock por encima del máximo</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/taller/materiales/${params.id}/ajustar`}>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Package className="h-4 w-4 mr-2" />
                  Ajustar Stock
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <TrendingUp className="h-4 w-4 mr-2" />
                Ver Historial Completo
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <DollarSign className="h-4 w-4 mr-2" />
                Actualizar Precio
              </Button>
              <Button className="w-full justify-start">
                <Truck className="h-4 w-4 mr-2" />
                Solicitar Compra
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
