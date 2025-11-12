"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  User,
  Wrench,
  CheckCircle,
  DollarSign,
  FileText,
  Settings,
} from "lucide-react"
import Link from "next/link"

// Datos simulados de la orden
const ordenData = {
  id: "ORD-001",
  numero: "OT-2024-001",
  equipo: "Excavadora CAT 320D",
  tipo: "Preventivo",
  descripcion: "Cambio de aceite y filtros del motor principal",
  prioridad: "Media",
  estado: "En Progreso",
  tecnico: "Carlos Méndez",
  fechaCreacion: "2024-01-15",
  fechaEstimada: "2024-01-16",
  fechaInicio: "2024-01-15T08:00",
  horasEstimadas: 4,
  horasReales: 2.5,
  costo: 850.0,
  progreso: 60,
  observaciones: "Revisar también el estado de las mangueras hidráulicas",
  materiales: [
    { nombre: "Aceite Motor 15W-40", cantidad: 20, unidad: "Litros", costo: 250.0 },
    { nombre: "Filtro de Aceite", cantidad: 1, unidad: "Unidad", costo: 85.0 },
    { nombre: "Filtro de Aire", cantidad: 1, unidad: "Unidad", costo: 65.0 },
  ],
  historial: [
    {
      fecha: "2024-01-15T08:00",
      accion: "Orden creada",
      usuario: "Sistema",
      detalle: "Orden generada automáticamente",
    },
    {
      fecha: "2024-01-15T08:30",
      accion: "Asignada a técnico",
      usuario: "Supervisor",
      detalle: "Asignada a Carlos Méndez",
    },
    {
      fecha: "2024-01-15T09:00",
      accion: "Trabajo iniciado",
      usuario: "Carlos Méndez",
      detalle: "Inicio de trabajos de mantenimiento",
    },
    {
      fecha: "2024-01-15T11:30",
      accion: "Progreso actualizado",
      usuario: "Carlos Méndez",
      detalle: "60% completado - Aceite cambiado",
    },
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

export default function DetalleOrdenPage({ params }: { params: { id: string } }) {
  const [orden] = useState(ordenData)

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
          <Link href={`/taller/ordenes/${params.id}/editar`}>
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

              {orden.estado === "En Progreso" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso del trabajo</span>
                    <span>{orden.progreso}%</span>
                  </div>
                  <Progress value={orden.progreso} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {orden.horasReales}h trabajadas de {orden.horasEstimadas}h estimadas
                    </span>
                    <span>Costo actual: ${orden.costo.toLocaleString()}</span>
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
                <Settings className="h-5 w-5" />
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
                      <p className="font-medium">${material.costo.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Materiales:</span>
                  <span>${orden.materiales.reduce((sum, m) => sum + m.costo, 0).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Actividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orden.historial.map((evento, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{evento.accion}</span>
                        <span className="text-xs text-muted-foreground">{new Date(evento.fecha).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{evento.detalle}</p>
                      <p className="text-xs text-muted-foreground">Por: {evento.usuario}</p>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimada:</span>
                <span>{new Date(orden.fechaEstimada).toLocaleDateString()}</span>
              </div>
              {orden.fechaInicio && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inicio:</span>
                  <span>{new Date(orden.fechaInicio).toLocaleDateString()}</span>
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
                <span>${orden.materiales.reduce((sum, m) => sum + m.costo, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mano de obra:</span>
                <span>${(orden.horasReales * 25).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>${orden.costo.toFixed(2)}</span>
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
                <Clock className="h-4 w-4 mr-2" />
                Actualizar Progreso
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Agregar Materiales
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
              {orden.estado === "En Progreso" && (
                <Button className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Completada
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
