"use client"

import { useState, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  Wrench,
  CheckCircle,
  DollarSign,
  FileText,
  ShoppingCart,
  Package,
} from "lucide-react"
import Link from "next/link"

// Datos simulados de la orden
const ordenDataInicial = {
  id: "ORD-001",
  numero: "OT-2024-001",
  equipo: "Excavadora CAT 320D",
  tipo: "Preventivo",
  descripcion: "Cambio de aceite y filtros del motor principal",
  prioridad: "Media",
  estado: "En Progreso",
  tecnico: "Carlos Méndez",
  fechaCreacion: "2024-01-15",
  fechaInicio: "2024-01-15",
  fechaEstimadaTerminacion: "2024-01-20",
  fechaTerminacionReal: null as string | null,
  costo: 850.0,
  observaciones: "Revisar también el estado de las mangueras hidráulicas",
  materiales: [
    { nombre: "Aceite Motor 15W-40", cantidad: 20, unidad: "Litros", costo: 250.0 },
    { nombre: "Filtro de Aceite", cantidad: 1, unidad: "Unidad", costo: 85.0 },
    { nombre: "Filtro de Aire", cantidad: 1, unidad: "Unidad", costo: 65.0 },
  ],
  repuestosExternos: [
    { nombre: "Bujía NGK BKR6E-11", cantidad: 4 },
    { nombre: "Mangueras hidráulicas", cantidad: 2 },
  ],
}

const getEstadoBadge = (estado: string) => {
  const variants = {
    Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Programada: "bg-blue-100 text-blue-800 border-blue-200",
    "En Progreso": "bg-orange-100 text-orange-800 border-orange-200",
    Completada: "bg-green-100 text-green-800 border-green-200",
    Cancelada: "bg-red-100 text-red-800 border-red-200",
  }
  return variants[estado as keyof typeof variants] || variants["Pendiente"]
}

const getPrioridadBadge = (prioridad: string) => {
  const variants = {
    Baja: "bg-gray-100 text-gray-800 border-gray-200",
    Media: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Alta: "bg-orange-100 text-orange-800 border-orange-200",
    Crítica: "bg-red-100 text-red-800 border-red-200",
  }
  return variants[prioridad as keyof typeof variants] || variants["Media"]
}

export default function DetalleOrdenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [orden, setOrden] = useState(ordenDataInicial)

  // Calcular progreso basado en fechas
  const calcularProgreso = () => {
    if (!orden.fechaInicio || !orden.fechaEstimadaTerminacion) return 0

    const inicio = new Date(orden.fechaInicio).getTime()
    const fin = new Date(orden.fechaEstimadaTerminacion).getTime()
    const ahora = orden.estado === "Completada" && orden.fechaTerminacionReal
      ? new Date(orden.fechaTerminacionReal).getTime()
      : new Date().getTime()

    if (ahora < inicio) return 0
    if (ahora >= fin || orden.estado === "Completada") return 100

    const total = fin - inicio
    const transcurrido = ahora - inicio
    return Math.min(100, Math.max(0, Math.round((transcurrido / total) * 100)))
  }

  const progreso = calcularProgreso()

  const handleCompletarOrden = () => {
    setOrden({
      ...orden,
      estado: "Completada",
      fechaTerminacionReal: new Date().toISOString(),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/taller/ordenes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{orden.numero}</h1>
            <p className="text-muted-foreground">{orden.equipo}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/taller/ordenes/${id}/editar`}>
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
          {/* Estado y Progreso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Estado y Progreso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge className={`${getEstadoBadge(orden.estado)} border`}>{orden.estado}</Badge>
                <Badge className={`${getPrioridadBadge(orden.prioridad)} border`}>{orden.prioridad}</Badge>
                <span className="text-sm text-muted-foreground">Tipo: {orden.tipo}</span>
              </div>

              {orden.fechaInicio && orden.fechaEstimadaTerminacion && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso del trabajo</span>
                    <span>{progreso}%</span>
                  </div>
                  <Progress
                    value={progreso}
                    className={`h-2 ${
                      orden.estado === "Completada"
                        ? "[&>div]:bg-green-600"
                        : progreso >= 100
                          ? "[&>div]:bg-red-600"
                          : "[&>div]:bg-blue-600"
                    }`}
                  />
                  {orden.estado === "Completada" && (
                    <div className="text-xs text-green-600 font-medium">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      Trabajo completado exitosamente
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Inicio: {new Date(orden.fechaInicio).toLocaleDateString("es-GT")} | Fin:{" "}
                      {new Date(orden.fechaEstimadaTerminacion).toLocaleDateString("es-GT")}
                    </span>
                    <span>Costo actual: Q{orden.costo.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Descripción del Trabajo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Descripción del Trabajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{orden.descripcion}</p>
              {orden.observaciones && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">Observaciones</h4>
                  <p className="text-blue-800 text-sm">{orden.observaciones}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Materiales Utilizados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Materiales Utilizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orden.materiales.map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{material.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {material.cantidad} {material.unidad}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Q{material.costo.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Materiales:</span>
                  <span>Q{orden.materiales.reduce((sum, m) => sum + m.costo, 0).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listado de Repuestos y Materiales Externos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Listado de Repuestos y Materiales Externos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orden.repuestosExternos && orden.repuestosExternos.length > 0 ? (
                <div className="space-y-3">
                  {orden.repuestosExternos.map((repuesto, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{repuesto.nombre}</p>
                        {repuesto.cantidad && (
                          <p className="text-sm text-muted-foreground">
                            Cantidad: {repuesto.cantidad}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No hay repuestos y materiales externos registrados
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Información del Técnico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Técnico Asignado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-medium">{orden.tecnico}</h3>
                <p className="text-sm text-muted-foreground">Técnico Senior</p>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Especialidad:</span>
                    <span>Maquinaria Pesada</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Experiencia:</span>
                    <span>8 años</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fechas Importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creación:</span>
                <span>{new Date(orden.fechaCreacion).toLocaleDateString()}</span>
              </div>
              {orden.fechaInicio && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inicio:</span>
                  <span>{new Date(orden.fechaInicio).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimada de terminación:</span>
                <span>{new Date(orden.fechaEstimadaTerminacion).toLocaleDateString()}</span>
              </div>
              {orden.estado === "Completada" && orden.fechaTerminacionReal && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground font-medium">Terminación real:</span>
                  <span className="font-medium text-green-600">
                    {new Date(orden.fechaTerminacionReal).toLocaleDateString("es-GT", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen de Costos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumen de Costos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Materiales:</span>
                <span>Q{orden.materiales.reduce((sum, m) => sum + m.costo, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Materiales y Repuestos Externos:</span>
                <span>
                  Q{(orden.costo - orden.materiales.reduce((sum, m) => sum + m.costo, 0)).toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>Q{orden.costo.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Registrar repuestos y Materiales Externos
              </Button>
              {orden.estado !== "Completada" && (
                <Button
                  className="w-full justify-start"
                  onClick={handleCompletarOrden}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
