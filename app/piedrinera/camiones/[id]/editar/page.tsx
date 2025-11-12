"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getSampleCamionesPiedrinera } from "@/lib/sample-data"
import type { CamionPiedrinera } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Truck, User, Calendar, AlertTriangle, CheckCircle } from "lucide-react"

// Datos simulados
const conductores = [
  { id: 1, nombre: "Mario Castillo", licencia: "A-123456", telefono: "5551-2345" },
  { id: 2, nombre: "José Morales", licencia: "B-789012", telefono: "5552-3456" },
  { id: 3, nombre: "Pedro Hernández", licencia: "C-345678", telefono: "5553-4567" },
  { id: 4, nombre: "Luis Gómez", licencia: "D-901234", telefono: "5554-5678" },
]

const estadosCamion = [
  { value: "Disponible", label: "Disponible", color: "bg-green-100 text-green-800" },
  { value: "En Ruta", label: "En Ruta", color: "bg-blue-100 text-blue-800" },
  { value: "Cargando", label: "Cargando", color: "bg-yellow-100 text-yellow-800" },
  { value: "Descargando", label: "Descargando", color: "bg-orange-100 text-orange-800" },
  { value: "En Mantenimiento", label: "Mantenimiento", color: "bg-red-100 text-red-800" },
  { value: "Fuera de Servicio", label: "Fuera de Servicio", color: "bg-gray-100 text-gray-800" },
]

const tiposCamion = [
  { value: "Volquete", label: "Volquete" },
  { value: "Mixer", label: "Mixer" },
  { value: "Plataforma", label: "Plataforma" },
  { value: "Cisterna", label: "Cisterna" },
]

interface EditarCamionPiedrineraPageProps {
  params: {
    id: string
  }
}

export default function EditarCamionPiedrineraPage({ params }: EditarCamionPiedrineraPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const camiones = getSampleCamionesPiedrinera()
  const camionOriginal = camiones.find((c) => c.id === params.id)

  const [placa, setPlaca] = useState<string>(camionOriginal?.placa || "")
  const [marca, setMarca] = useState<string>(camionOriginal?.marca || "")
  const [modelo, setModelo] = useState<string>(camionOriginal?.modelo || "")
  const [capacidadMetrosCubicos, setCapacidadMetrosCubicos] = useState<number>(
    camionOriginal?.capacidadMetrosCubicos || 0,
  )
  const [estado, setEstado] = useState<CamionPiedrinera["estado"]>(camionOriginal?.estado || "Disponible")
  const [ultimoMantenimiento, setUltimoMantenimiento] = useState<string>(camionOriginal?.ultimoMantenimiento || "")
  const [proximoMantenimiento, setProximoMantenimiento] = useState<string>(camionOriginal?.proximoMantenimiento || "")
  const [kilometraje, setKilometraje] = useState<number>(camionOriginal?.kilometraje || 0)
  const [horasOperacion, setHorasOperacion] = useState<number>(camionOriginal?.horasOperacion || 0)
  const [consumoCombustible, setConsumoCombustible] = useState<number>(camionOriginal?.consumoCombustible || 0)
  const [seguroVigente, setSeguroVigente] = useState<boolean>(camionOriginal?.seguroVigente || false)
  const [revisionTecnica, setRevisionTecnica] = useState<boolean>(camionOriginal?.revisionTecnica || false)
  const [observaciones, setObservaciones] = useState<string>(camionOriginal?.observaciones || "")
  const [ubicacionActual, setUbicacionActual] = useState<string>(camionOriginal?.ubicacionActual || "")

  useEffect(() => {
    if (!camionOriginal) {
      toast({
        title: "Camión no encontrado",
        description: `El camión con ID ${params.id} no existe.`,
        variant: "destructive",
      })
      router.replace("/piedrinera/camiones")
    }
  }, [camionOriginal, params.id, router, toast])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!placa || !marca || !modelo || capacidadMetrosCubicos <= 0 || !estado) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    const updatedCamion: CamionPiedrinera = {
      ...camionOriginal,
      placa,
      marca,
      modelo,
      capacidadMetrosCubicos,
      estado,
      ultimoMantenimiento,
      proximoMantenimiento,
      kilometraje,
      horasOperacion,
      consumoCombustible,
      seguroVigente,
      revisionTecnica,
      observaciones,
      ubicacionActual,
    }

    console.log("Camión Actualizado:", updatedCamion)
    // Aquí integrarías con tu backend para guardar el camión
    toast({
      title: "Camión Actualizado",
      description: `El camión con placa ${updatedCamion.placa} ha sido actualizado exitosamente.`,
    })
    router.push(`/piedrinera/camiones/${updatedCamion.id}`)
  }

  if (!camionOriginal) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-3xl font-bold">Camión no encontrado</h1>
        <p className="text-muted-foreground">El camión con ID {params.id} no existe.</p>
        <Button onClick={() => router.back()}>Volver a Camiones</Button>
      </div>
    )
  }

  const calcularDiasMantenimiento = () => {
    if (!proximoMantenimiento) return null

    const hoy = new Date()
    const fechaMantenimiento = new Date(proximoMantenimiento)
    const diferencia = Math.ceil((fechaMantenimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24))

    return diferencia
  }

  const diasMantenimiento = calcularDiasMantenimiento()
  const mantenimientoProximo = diasMantenimiento !== null && diasMantenimiento <= 30
  const mantenimientoVencido = diasMantenimiento !== null && diasMantenimiento < 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Camión {placa}</h1>
          <p className="text-muted-foreground">Modificar información del vehículo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Información Básica del Vehículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="placa">Placa *</Label>
                    <Input
                      id="placa"
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value)}
                      placeholder="P-123ABC"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca *</Label>
                    <Input
                      id="marca"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      placeholder="Volvo, Mercedes, etc."
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo *</Label>
                    <Input
                      id="modelo"
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      placeholder="FH16, Actros, etc."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacidadMetrosCubicos">Capacidad (m³)</Label>
                    <Input
                      id="capacidadMetrosCubicos"
                      type="number"
                      step="0.1"
                      value={capacidadMetrosCubicos}
                      onChange={(e) => setCapacidadMetrosCubicos(Number(e.target.value))}
                      placeholder="15.0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado Actual *</Label>
                    <Select value={estado} onValueChange={(value: CamionPiedrinera["estado"]) => setEstado(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estadosCamion.map((estado) => (
                          <SelectItem key={estado.value} value={estado.value}>
                            {estado.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ultimoMantenimiento">Último Mantenimiento</Label>
                    <Input
                      id="ultimoMantenimiento"
                      type="date"
                      value={ultimoMantenimiento}
                      onChange={(e) => setUltimoMantenimiento(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proximoMantenimiento">Próximo Mantenimiento</Label>
                    <Input
                      id="proximoMantenimiento"
                      type="date"
                      value={proximoMantenimiento}
                      onChange={(e) => setProximoMantenimiento(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Operativa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Operativa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kilometraje">Kilometraje</Label>
                    <Input
                      id="kilometraje"
                      type="number"
                      value={kilometraje}
                      onChange={(e) => setKilometraje(Number(e.target.value))}
                      placeholder="85420"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horasOperacion">Horas de Operación</Label>
                    <Input
                      id="horasOperacion"
                      type="number"
                      value={horasOperacion}
                      onChange={(e) => setHorasOperacion(Number(e.target.value))}
                      placeholder="2450"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consumoCombustible">Consumo (L/100km)</Label>
                    <Input
                      id="consumoCombustible"
                      type="number"
                      step="0.1"
                      value={consumoCombustible}
                      onChange={(e) => setConsumoCombustible(Number(e.target.value))}
                      placeholder="35.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mantenimiento y Documentación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Mantenimiento y Documentación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ultimoMantenimiento">Último Mantenimiento</Label>
                    <Input
                      id="ultimoMantenimiento"
                      type="date"
                      value={ultimoMantenimiento}
                      onChange={(e) => setUltimoMantenimiento(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proximoMantenimiento">Próximo Mantenimiento</Label>
                    <Input
                      id="proximoMantenimiento"
                      type="date"
                      value={proximoMantenimiento}
                      onChange={(e) => setProximoMantenimiento(e.target.value)}
                    />
                    {diasMantenimiento !== null && (
                      <p
                        className={`text-sm ${mantenimientoVencido ? "text-red-600" : mantenimientoProximo ? "text-yellow-600" : "text-green-600"}`}
                      >
                        {mantenimientoVencido
                          ? `Vencido hace ${Math.abs(diasMantenimiento)} días`
                          : mantenimientoProximo
                            ? `En ${diasMantenimiento} días`
                            : `En ${diasMantenimiento} días`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="seguroVigente"
                      checked={seguroVigente}
                      onCheckedChange={(checked) => setSeguroVigente(checked)}
                    />
                    <Label htmlFor="seguroVigente" className="flex items-center gap-2">
                      {seguroVigente ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">Vigente</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-xs text-red-600">Vencido</span>
                        </>
                      )}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="revisionTecnica"
                      checked={revisionTecnica}
                      onCheckedChange={(checked) => setRevisionTecnica(checked)}
                    />
                    <Label htmlFor="revisionTecnica" className="flex items-center gap-2">
                      {revisionTecnica ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">Al día</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-xs text-red-600">Vencida</span>
                        </>
                      )}
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Notas sobre el estado del vehículo, reparaciones recientes, etc..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral - Resumen */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Resumen del Vehículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Placa:</span>
                    <span className="text-sm font-bold">{placa || "No definida"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Vehículo:</span>
                    <span className="text-sm font-medium">
                      {marca} {modelo} ({camionOriginal.año})
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tipo:</span>
                    <span className="text-sm font-medium">{camionOriginal.tipo}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Capacidad:</span>
                    <span className="text-sm font-medium">{capacidadMetrosCubicos} m³</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <span className="text-sm">
                      {estadosCamion.find((e) => e.value === estado) && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${estadosCamion.find((e) => e.value === estado)?.color}`}
                        >
                          {estadosCamion.find((e) => e.value === estado)?.label}
                        </span>
                      )}
                    </span>
                  </div>

                  <hr />

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Conductor:</span>
                    <span className="text-sm font-medium">
                      {camionOriginal.conductor
                        ? conductores.find((c) => c.id.toString() === camionOriginal.conductor)?.nombre
                        : "Sin asignar"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ubicación:</span>
                    <span className="text-sm font-medium">{ubicacionActual || "No definida"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Kilometraje:</span>
                    <span className="text-sm font-medium">{kilometraje || "0"} km</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Horas Operación:</span>
                    <span className="text-sm font-medium">{horasOperacion || "0"} hrs</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Consumo:</span>
                    <span className="text-sm font-medium">{consumoCombustible || "0"} L/100km</span>
                  </div>

                  <hr />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Seguro:</span>
                      <span className="flex items-center gap-1">
                        {seguroVigente ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">Vigente</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            <span className="text-xs text-red-600">Vencido</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Revisión Técnica:</span>
                      <span className="flex items-center gap-1">
                        {revisionTecnica ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">Al día</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            <span className="text-xs text-red-600">Vencida</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Próximo Mantenimiento:</span>
                    <span className="text-sm font-medium">{proximoMantenimiento || "No programado"}</span>
                  </div>
                </div>

                {/* Alertas */}
                {mantenimientoVencido && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="text-sm text-red-600">Mantenimiento vencido</p>
                    </div>
                  </div>
                )}

                {mantenimientoProximo && !mantenimientoVencido && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm text-yellow-600">Mantenimiento próximo</p>
                    </div>
                  </div>
                )}

                {(!seguroVigente || !revisionTecnica) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="text-sm text-red-600">Documentación vencida</p>
                    </div>
                  </div>
                )}

                {estado === "Fuera de Servicio" && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm text-gray-600">⚠️ Vehículo fuera de servicio</p>
                  </div>
                )}

                {estado === "Disponible" && seguroVigente && revisionTecnica && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-600">✓ Vehículo operativo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Actualizar Camión
          </Button>
        </div>
      </form>
    </div>
  )
}
