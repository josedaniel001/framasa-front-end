"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPut } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle, Truck, User, Calendar } from "lucide-react"

interface EditarCamionPiedrineraPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditarCamionPiedrineraPage({ params }: EditarCamionPiedrineraPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [placa, setPlaca] = useState<string>("")
  const [marca, setMarca] = useState<string>("")
  const [modelo, setModelo] = useState<string>("")
  const [capacidadMetrosCubicos, setCapacidadMetrosCubicos] = useState<number>(0)
  const [estado, setEstado] = useState<string>("Disponible")
  const [ultimoMantenimiento, setUltimoMantenimiento] = useState<string>("")
  const [proximoMantenimiento, setProximoMantenimiento] = useState<string>("")
  const [kilometraje, setKilometraje] = useState<number>(0)
  const [horasOperacion, setHorasOperacion] = useState<number>(0)
  const [consumoCombustible, setConsumoCombustible] = useState<number>(0)
  const [seguroVigente, setSeguroVigente] = useState<boolean>(true)
  const [revisionTecnicaVigente, setRevisionTecnicaVigente] = useState<boolean>(true)
  const [documentacionVigente, setDocumentacionVigente] = useState<boolean>(true)
  const [activo, setActivo] = useState<boolean>(true)
  const [observaciones, setObservaciones] = useState<string>("")

  // Cargar datos del camión
  useEffect(() => {
    const loadCamion = async () => {
      try {
        setLoading(true)
        const camion = await apiGet<any>(`${API_ENDPOINTS.PIEDRINERA.CAMIONES}/${id}`)

        setPlaca(camion.placa || "")
        setMarca(camion.marca || "")
        setModelo(camion.modelo || "")
        setCapacidadMetrosCubicos(camion.capacidadMetrosCubicos || camion.capacidad_m3 || 0)
        setEstado(camion.estado || camion.estado_actual || "Disponible")
        setUltimoMantenimiento(camion.ultimoMantenimiento || camion.fecha_ultimo_mantenimiento || "")
        setProximoMantenimiento(camion.proximoMantenimiento || camion.fecha_proximo_mantenimiento || "")
        setKilometraje(camion.kilometraje || 0)
        setHorasOperacion(camion.horasOperacion || camion.horas_operacion || 0)
        setConsumoCombustible(camion.consumoCombustible || camion.consumo_l_100km || 0)
        setSeguroVigente(camion.seguroVigente !== undefined ? camion.seguroVigente : camion.seguro_vigente !== undefined ? camion.seguro_vigente : true)
        setRevisionTecnicaVigente(camion.revisionTecnicaVigente !== undefined ? camion.revisionTecnicaVigente : camion.revision_tecnica_vigente !== undefined ? camion.revision_tecnica_vigente : true)
        setDocumentacionVigente(camion.documentacionVigente !== undefined ? camion.documentacionVigente : camion.documentacion_vigente !== undefined ? camion.documentacion_vigente : true)
        setActivo(camion.activo !== undefined ? camion.activo : true)
        setObservaciones(camion.observaciones || "")
      } catch (error: any) {
        console.error("Error al cargar camión:", error)
        toast({
          title: "Error",
          description: error.message || "No se pudo cargar el camión.",
          variant: "destructive",
        })
        router.push("/piedrinera/camiones")
      } finally {
        setLoading(false)
      }
    }

    loadCamion()
  }, [id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!placa || !marca || !modelo || capacidadMetrosCubicos <= 0 || !estado) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      // Preparar datos para enviar a la API
      const updatedCamion = {
        placa,
        marca,
        modelo,
        capacidad_m3: capacidadMetrosCubicos,
        estado_actual: estado,
        fecha_ultimo_mantenimiento: ultimoMantenimiento || null,
        fecha_proximo_mantenimiento: proximoMantenimiento || null,
        kilometraje,
        horas_operacion: horasOperacion,
        consumo_l_100km: consumoCombustible,
        seguro_vigente: seguroVigente,
        revision_tecnica_vigente: revisionTecnicaVigente,
        documentacion_vigente: documentacionVigente,
        observaciones: observaciones || null,
        activo,
      }

      await apiPut(`${API_ENDPOINTS.PIEDRINERA.CAMIONES}/${id}`, updatedCamion)

      toast({
        title: "Camión Actualizado",
        description: `El camión con placa ${placa} ha sido actualizado exitosamente.`,
      })
      router.push(`/piedrinera/camiones/${id}`)
    } catch (error: any) {
      console.error("Error al actualizar camión:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el camión. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Cargando...</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()} disabled={saving}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Camión: {placa}</h1>
      </div>
      <p className="text-muted-foreground">Modifica la información del camión.</p>

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
              <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                placeholder="Ej: C-123ABC"
                required
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej: Freightliner, Kenworth"
                required
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ej: Cascadia, T680"
                required
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacidadMetrosCubicos">Capacidad (m³) *</Label>
              <Input
                id="capacidadMetrosCubicos"
                type="number"
                value={capacidadMetrosCubicos}
                onChange={(e) => setCapacidadMetrosCubicos(Number(e.target.value))}
                step="0.01"
                min="0.01"
                required
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select value={estado} onValueChange={setEstado} disabled={saving}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="En Ruta">En Ruta</SelectItem>
                  <SelectItem value="Cargando">Cargando</SelectItem>
                  <SelectItem value="Descargando">Descargando</SelectItem>
                  <SelectItem value="En Mantenimiento">En Mantenimiento</SelectItem>
                  <SelectItem value="Fuera de Servicio">Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ultimoMantenimiento">Último Mantenimiento</Label>
              <Input
                id="ultimoMantenimiento"
                type="date"
                value={ultimoMantenimiento}
                onChange={(e) => setUltimoMantenimiento(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proximoMantenimiento">Próximo Mantenimiento</Label>
              <Input
                id="proximoMantenimiento"
                type="date"
                value={proximoMantenimiento}
                onChange={(e) => setProximoMantenimiento(e.target.value)}
                disabled={saving}
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
                  <div className="grid gap-2">
                    <Label htmlFor="kilometraje">Kilometraje</Label>
                    <Input
                      id="kilometraje"
                      type="number"
                      value={kilometraje}
                      onChange={(e) => setKilometraje(Number(e.target.value))}
                      placeholder="85420"
                      min="0"
                      disabled={saving}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="horasOperacion">Horas de Operación</Label>
                    <Input
                      id="horasOperacion"
                      type="number"
                      value={horasOperacion}
                      onChange={(e) => setHorasOperacion(Number(e.target.value))}
                      placeholder="2450"
                      min="0"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="consumoCombustible">Consumo (L/100km)</Label>
                    <Input
                      id="consumoCombustible"
                      type="number"
                      step="0.1"
                      value={consumoCombustible}
                      onChange={(e) => setConsumoCombustible(Number(e.target.value))}
                      placeholder="35.5"
                      min="0"
                      disabled={saving}
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
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="seguroVigente"
                checked={seguroVigente}
                onCheckedChange={setSeguroVigente}
                disabled={saving}
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
                <span className="ml-2">Seguro Vigente</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="revisionTecnicaVigente"
                checked={revisionTecnicaVigente}
                onCheckedChange={setRevisionTecnicaVigente}
                disabled={saving}
              />
              <Label htmlFor="revisionTecnicaVigente" className="flex items-center gap-2">
                {revisionTecnicaVigente ? (
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
                <span className="ml-2">Revisión Técnica Vigente</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="documentacionVigente"
                checked={documentacionVigente}
                onCheckedChange={setDocumentacionVigente}
                disabled={saving}
              />
              <Label htmlFor="documentacionVigente" className="flex items-center gap-2">
                {documentacionVigente ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600">Vigente</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-xs text-red-600">Vencida</span>
                  </>
                )}
                <span className="ml-2">Documentación Vigente</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                checked={activo}
                onCheckedChange={setActivo}
                disabled={saving}
              />
              <Label htmlFor="activo" className="flex items-center gap-2">
                {activo ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600">Activo</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-xs text-red-600">Inactivo</span>
                  </>
                )}
                <span className="ml-2">Camión Activo</span>
              </Label>
            </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Notas sobre el estado del vehículo, reparaciones recientes, etc..."
                    rows={3}
                    disabled={saving}
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
                      {marca} {modelo}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Capacidad:</span>
                    <span className="text-sm font-medium">{capacidadMetrosCubicos} m³</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <span className="text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          estado === "Disponible"
                            ? "bg-green-100 text-green-800"
                            : estado === "En Ruta"
                              ? "bg-blue-100 text-blue-800"
                              : estado === "En Mantenimiento"
                                ? "bg-red-100 text-red-800"
                                : estado === "Cargando"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : estado === "Descargando"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {estado}
                      </span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Activo:</span>
                    <span className="flex items-center gap-1">
                      {activo ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">Activo</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 text-red-600" />
                          <span className="text-xs text-red-600">Inactivo</span>
                        </>
                      )}
                    </span>
                  </div>

                  <hr />

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Kilometraje:</span>
                    <span className="text-sm font-medium">{kilometraje.toLocaleString() || "0"} km</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Horas Operación:</span>
                    <span className="text-sm font-medium">{horasOperacion.toLocaleString() || "0"} hrs</span>
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
                        {revisionTecnicaVigente ? (
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

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Documentación:</span>
                      <span className="flex items-center gap-1">
                        {documentacionVigente ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">Vigente</span>
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
                    <span className="text-sm font-medium">
                      {proximoMantenimiento
                        ? new Date(proximoMantenimiento).toLocaleDateString("es-GT")
                        : "No programado"}
                    </span>
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

                {(!seguroVigente || !revisionTecnicaVigente || !documentacionVigente) && (
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

                {estado === "Disponible" && seguroVigente && revisionTecnicaVigente && documentacionVigente && (
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
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
