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
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle, Settings, Wrench, Calendar } from "lucide-react"

interface EditarMaquinariaPageProps {
  params: Promise<{
    id: string
  }>
}

interface TipoMaquinaria {
  value: string
  label: string
}

interface Empresa {
  value: string
  label: string
}

export default function EditarMaquinariaPage({ params }: EditarMaquinariaPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tipos, setTipos] = useState<TipoMaquinaria[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])

  const [codigo, setCodigo] = useState<string>("")
  const [nombre, setNombre] = useState<string>("")
  const [empresa, setEmpresa] = useState<string>("")
  const [tipoMaquinaria, setTipoMaquinaria] = useState<string>("")
  const [marca, setMarca] = useState<string>("")
  const [modelo, setModelo] = useState<string>("")
  const [numeroSerie, setNumeroSerie] = useState<string>("")
  const [añoFabricacion, setAñoFabricacion] = useState<number | undefined>(undefined)
  const [estadoActual, setEstadoActual] = useState<string>("operativa")
  const [fechaUltimoMantenimiento, setFechaUltimoMantenimiento] = useState<string>("")
  const [fechaProximoMantenimiento, setFechaProximoMantenimiento] = useState<string>("")
  const [horasOperacion, setHorasOperacion] = useState<number>(0)
  const [kilometraje, setKilometraje] = useState<number>(0)
  const [seguroVigente, setSeguroVigente] = useState<boolean>(true)
  const [documentacionVigente, setDocumentacionVigente] = useState<boolean>(true)
  const [ubicacionActual, setUbicacionActual] = useState<string>("")
  const [observaciones, setObservaciones] = useState<string>("")
  const [activo, setActivo] = useState<boolean>(true)

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [maquinariaData, tiposData, empresasData] = await Promise.all([
          apiGet<any>(API_ENDPOINTS.TALLER.MAQUINARIA_ITEM(id)),
          apiGet<TipoMaquinaria[]>(API_ENDPOINTS.TALLER.MAQUINARIA_TIPOS),
          apiGet<Empresa[]>(API_ENDPOINTS.TALLER.MAQUINARIA_EMPRESAS),
        ])

        setTipos(Array.isArray(tiposData) ? tiposData : [])
        setEmpresas(Array.isArray(empresasData) ? empresasData : [])

        // Normalizar y cargar datos de maquinaria
        const m = maquinariaData
        setCodigo(m.codigo || "")
        setNombre(m.nombre || "")
        setEmpresa(m.empresa || "")
        setTipoMaquinaria(m.tipoMaquinaria || m.tipo_maquinaria || "")
        setMarca(m.marca || "")
        setModelo(m.modelo || "")
        setNumeroSerie(m.numeroSerie || m.numero_serie || "")
        setAñoFabricacion(m.añoFabricacion || m.año_fabricacion || undefined)
        setEstadoActual(m.estadoActual || m.estado_actual || m.estado || "operativa")
        setFechaUltimoMantenimiento(m.fechaUltimoMantenimiento || m.fecha_ultimo_mantenimiento || "")
        setFechaProximoMantenimiento(m.fechaProximoMantenimiento || m.fecha_proximo_mantenimiento || m.proximoMantenimiento || "")
        setHorasOperacion(m.horasOperacion || m.horas_operacion || 0)
        setKilometraje(m.kilometraje || 0)
        setSeguroVigente(m.seguroVigente ?? m.seguro_vigente ?? true)
        setDocumentacionVigente(m.documentacionVigente ?? m.documentacion_vigente ?? true)
        setUbicacionActual(m.ubicacionActual || m.ubicacion_actual || "")
        setObservaciones(m.observaciones || "")
        setActivo(m.activo !== undefined ? m.activo : true)
      } catch (error: any) {
        console.error("Error al cargar maquinaria:", error)
        toast({
          title: "Error",
          description: error.message || "No se pudo cargar la maquinaria.",
          variant: "destructive",
        })
        router.push("/taller/maquinaria")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigo || !nombre || !empresa || !tipoMaquinaria || !marca || !modelo || !estadoActual) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    if (añoFabricacion && añoFabricacion < 1900) {
      toast({
        title: "Error de validación",
        description: "El año de fabricación debe ser mayor o igual a 1900.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      const updatedMaquinaria = {
        codigo,
        nombre,
        empresa,
        tipo_maquinaria: tipoMaquinaria,
        marca,
        modelo,
        numero_serie: numeroSerie || null,
        año_fabricacion: añoFabricacion || null,
        estado_actual: estadoActual,
        fecha_ultimo_mantenimiento: fechaUltimoMantenimiento || null,
        fecha_proximo_mantenimiento: fechaProximoMantenimiento || null,
        horas_operacion: horasOperacion || 0,
        kilometraje: kilometraje || 0,
        seguro_vigente: seguroVigente,
        documentacion_vigente: documentacionVigente,
        ubicacion_actual: ubicacionActual || null,
        observaciones: observaciones || null,
        activo: activo,
      }

      await apiPut(`${API_ENDPOINTS.TALLER.MAQUINARIA_ITEM(id)}`, updatedMaquinaria)

      toast({
        title: "Maquinaria Actualizada",
        description: `La maquinaria ${codigo} ha sido actualizada exitosamente.`,
      })
      router.push(`/taller/maquinaria/${id}`)
    } catch (error: any) {
      console.error("Error al actualizar maquinaria:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la maquinaria. Por favor, intenta de nuevo.",
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
    if (!fechaProximoMantenimiento) return null
    const hoy = new Date()
    const fechaMantenimiento = new Date(fechaProximoMantenimiento)
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
        <h1 className="text-3xl font-bold">Editar Maquinaria: {codigo}</h1>
      </div>
      <p className="text-muted-foreground">Modifica la información de la maquinaria.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={codigo}
                    placeholder="Código de la maquinaria"
                    required
                    disabled={true}
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    El código no se puede modificar una vez creada la maquinaria.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Excavadora CAT 320"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Select value={empresa} onValueChange={setEmpresa} disabled={saving} required>
                    <SelectTrigger id="empresa">
                      <SelectValue placeholder="Selecciona empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((emp) => (
                        <SelectItem key={emp.value} value={emp.value}>
                          {emp.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipoMaquinaria">Tipo de Maquinaria *</Label>
                  <Select value={tipoMaquinaria} onValueChange={setTipoMaquinaria} disabled={saving} required>
                    <SelectTrigger id="tipoMaquinaria">
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="marca">Marca *</Label>
                  <Input
                    id="marca"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    placeholder="Ej: Caterpillar"
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
                    placeholder="Ej: 320"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="numeroSerie">Número de Serie</Label>
                  <Input
                    id="numeroSerie"
                    value={numeroSerie}
                    onChange={(e) => setNumeroSerie(e.target.value)}
                    placeholder="Ej: CAT320-2020-001"
                    disabled={saving}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="añoFabricacion">Año de Fabricación</Label>
                  <Input
                    id="añoFabricacion"
                    type="number"
                    value={añoFabricacion || ""}
                    onChange={(e) => setAñoFabricacion(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ej: 2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    disabled={saving}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estadoActual">Estado Actual *</Label>
                  <Select value={estadoActual} onValueChange={setEstadoActual} disabled={saving} required>
                    <SelectTrigger id="estadoActual">
                      <SelectValue placeholder="Selecciona estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operativa">Operativa</SelectItem>
                      <SelectItem value="en_mantenimiento">En Mantenimiento</SelectItem>
                      <SelectItem value="fuera_de_servicio">Fuera de Servicio</SelectItem>
                      <SelectItem value="reservada">Reservada</SelectItem>
                      <SelectItem value="reparacion">En Reparación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ubicacionActual">Ubicación Actual</Label>
                  <Input
                    id="ubicacionActual"
                    value={ubicacionActual}
                    onChange={(e) => setUbicacionActual(e.target.value)}
                    placeholder="Ej: Obra Central"
                    disabled={saving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mantenimiento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Mantenimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="fechaUltimoMantenimiento">Último Mantenimiento</Label>
                  <Input
                    id="fechaUltimoMantenimiento"
                    type="date"
                    value={fechaUltimoMantenimiento}
                    onChange={(e) => setFechaUltimoMantenimiento(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fechaProximoMantenimiento">Próximo Mantenimiento</Label>
                  <Input
                    id="fechaProximoMantenimiento"
                    type="date"
                    value={fechaProximoMantenimiento}
                    onChange={(e) => setFechaProximoMantenimiento(e.target.value)}
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
                <div className="grid gap-2">
                  <Label htmlFor="horasOperacion">Horas de Operación</Label>
                  <Input
                    id="horasOperacion"
                    type="number"
                    value={horasOperacion}
                    onChange={(e) => setHorasOperacion(Number(e.target.value))}
                    min="0"
                    disabled={saving}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="kilometraje">Kilometraje</Label>
                  <Input
                    id="kilometraje"
                    type="number"
                    value={kilometraje}
                    onChange={(e) => setKilometraje(Number(e.target.value))}
                    min="0"
                    disabled={saving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Documentación y Estado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Documentación y Estado
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
                    <span className="ml-2">Maquinaria Activa</span>
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Notas sobre el estado de la maquinaria, reparaciones recientes, etc..."
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
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Código:</span>
                    <span className="text-sm font-bold">{codigo || "No definido"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Nombre:</span>
                    <span className="text-sm font-medium">{nombre || "No definido"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Empresa:</span>
                    <span className="text-sm font-medium">
                      {empresas.find((e) => e.value === empresa)?.label || empresa || "No definida"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tipo:</span>
                    <span className="text-sm font-medium">
                      {tipos.find((t) => t.value === tipoMaquinaria)?.label || tipoMaquinaria || "No definido"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Marca/Modelo:</span>
                    <span className="text-sm font-medium">
                      {marca} {modelo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <span className="text-sm">{estadoActual}</span>
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
                    <span className="text-sm text-muted-foreground">Horas Operación:</span>
                    <span className="text-sm font-medium">{horasOperacion.toLocaleString() || "0"} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Kilometraje:</span>
                    <span className="text-sm font-medium">{kilometraje.toLocaleString() || "0"} km</span>
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
                      {fechaProximoMantenimiento
                        ? new Date(fechaProximoMantenimiento).toLocaleDateString("es-GT")
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

                {(!seguroVigente || !documentacionVigente) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="text-sm text-red-600">Documentación vencida</p>
                    </div>
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

