"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"

interface Agregado {
  id: string
  codigo: string
  nombre: string
}

interface Empleado {
  id: string
  nombre_completo: string
  nombres: string
  apellidos: string
}

export default function NuevoLoteProduccionPiedrineraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [agregados, setAgregados] = useState<Agregado[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])

  const [codigoLote, setCodigoLote] = useState("")
  const [agregadoSeleccionado, setAgregadoSeleccionado] = useState<string>("")
  const [fechaProduccion, setFechaProduccion] = useState<string>(new Date().toISOString().split("T")[0])
  const [horaInicio, setHoraInicio] = useState<string>("")
  const [horaFin, setHoraFin] = useState<string>("")
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState<string>("")
  const [operadorSeleccionado, setOperadorSeleccionado] = useState<string>("")
  const [volumenPlanificado, setVolumenPlanificado] = useState<number>(0)
  const [volumenProducido, setVolumenProducido] = useState<number>(0)
  const [costoTotal, setCostoTotal] = useState<number>(0)
  const [estado, setEstado] = useState<string>("EN_PROCESO")
  const [calidad, setCalidad] = useState<string>("")
  const [equiposUsados, setEquiposUsados] = useState<string>("")
  const [observaciones, setObservaciones] = useState<string>("")

  // Cargar agregados y empleados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true)

        // Cargar agregados y empleados en paralelo
        const [agregadosResponse, empleadosResponse] = await Promise.all([
          apiGet<any>(API_ENDPOINTS.PIEDRINERA.PRODUCTOS),
          apiGet<any>(API_ENDPOINTS.PLANILLAS.EMPLEADOS),
        ])

        // Mapear agregados
        let agregadosData: any[] = []
        if (Array.isArray(agregadosResponse)) {
          agregadosData = agregadosResponse
        } else if (agregadosResponse?.results) {
          agregadosData = agregadosResponse.results
        } else if (agregadosResponse?.data) {
          agregadosData = agregadosResponse.data
        }
        const mappedAgregados: Agregado[] = agregadosData
          .filter((a: any) => a.activo !== false)
          .map((a: any) => ({
            id: String(a.id || ''),
            codigo: a.codigo || '',
            nombre: a.nombre || '',
          }))
        setAgregados(mappedAgregados)

        // Mapear empleados
        let empleadosData: any[] = []
        if (Array.isArray(empleadosResponse)) {
          empleadosData = empleadosResponse
        } else if (empleadosResponse?.results) {
          empleadosData = empleadosResponse.results
        } else if (empleadosResponse?.data) {
          empleadosData = empleadosResponse.data
        }
        const mappedEmpleados: Empleado[] = empleadosData
          .filter((e: any) => e.activo !== false)
          .map((e: any) => ({
            id: String(e.id || ''),
            nombre_completo: e.nombre_completo || `${e.nombres || ''} ${e.apellidos || ''}`.trim(),
            nombres: e.nombres || '',
            apellidos: e.apellidos || '',
          }))
        setEmpleados(mappedEmpleados)
      } catch (err: any) {
        console.error('Error al cargar datos:', err)
        toast({
          title: "Error",
          description: err.message || "No se pudieron cargar los datos. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !codigoLote ||
      !agregadoSeleccionado ||
      !fechaProduccion ||
      !horaInicio ||
      !supervisorSeleccionado ||
      !operadorSeleccionado ||
      volumenPlanificado <= 0 ||
      costoTotal <= 0
    ) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios y asegúrate de que los valores sean válidos.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Preparar equipos usados
      const equiposArray = equiposUsados
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0)

      // Preparar datos para enviar a la API
      const newLote = {
        codigo_lote: codigoLote,
        agregado: parseInt(agregadoSeleccionado),
        fecha_produccion: fechaProduccion,
        hora_inicio_produccion: horaInicio,
        hora_fin_produccion: horaFin || null,
        supervisor: parseInt(supervisorSeleccionado),
        operador: parseInt(operadorSeleccionado),
        volumen_planificado_m3: volumenPlanificado,
        volumen_producido_m3: volumenProducido,
        costo_total_q: costoTotal,
        estado,
        calidad: calidad || null,
        equipos_usados: equiposArray,
        observaciones: observaciones || null,
        activo: true,
      }

      await apiPost(API_ENDPOINTS.PIEDRINERA.PRODUCCION, newLote)

      toast({
        title: "Lote de Producción Registrado",
        description: `El lote de producción ${codigoLote} ha sido registrado exitosamente.`,
      })
      router.push("/piedrinera/produccion")
    } catch (error: any) {
      console.error("Error al crear lote:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el lote. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Registrar Nuevo Lote de Producción</h1>
      <p className="text-muted-foreground">Registra un nuevo lote de agregados producido.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Lote de Producción</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="codigoLote">Código del Lote *</Label>
              <Input
                id="codigoLote"
                value={codigoLote}
                onChange={(e) => setCodigoLote(e.target.value)}
                placeholder="Ej: LOTE-001"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="agregado">Agregado Producido *</Label>
              <Select value={agregadoSeleccionado} onValueChange={setAgregadoSeleccionado}>
                <SelectTrigger id="agregado">
                  <SelectValue placeholder="Selecciona un agregado" />
                </SelectTrigger>
                <SelectContent>
                  {agregados.map((agregado) => (
                    <SelectItem key={agregado.id} value={agregado.id}>
                      {agregado.nombre} ({agregado.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaProduccion">Fecha de Producción *</Label>
              <Input
                id="fechaProduccion"
                type="date"
                value={fechaProduccion}
                onChange={(e) => setFechaProduccion(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="horaInicio">Hora de Inicio *</Label>
              <Input
                id="horaInicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="horaFin">Hora de Fin (opcional)</Label>
              <Input
                id="horaFin"
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supervisor">Supervisor *</Label>
              <Select value={supervisorSeleccionado} onValueChange={setSupervisorSeleccionado}>
                <SelectTrigger id="supervisor">
                  <SelectValue placeholder="Selecciona un supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {empleados.map((empleado) => (
                    <SelectItem key={empleado.id} value={empleado.id}>
                      {empleado.nombre_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="operador">Operador *</Label>
              <Select value={operadorSeleccionado} onValueChange={setOperadorSeleccionado}>
                <SelectTrigger id="operador">
                  <SelectValue placeholder="Selecciona un operador" />
                </SelectTrigger>
                <SelectContent>
                  {empleados.map((empleado) => (
                    <SelectItem key={empleado.id} value={empleado.id}>
                      {empleado.nombre_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="volumenPlanificado">Volumen Planificado (m³) *</Label>
              <Input
                id="volumenPlanificado"
                type="number"
                step="0.01"
                min="0.01"
                value={volumenPlanificado}
                onChange={(e) => setVolumenPlanificado(Number(e.target.value))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="volumenProducido">Volumen Producido (m³) *</Label>
              <Input
                id="volumenProducido"
                type="number"
                step="0.01"
                min="0"
                value={volumenProducido}
                onChange={(e) => setVolumenProducido(Number(e.target.value))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="costoTotal">Costo Total (Q) *</Label>
              <Input
                id="costoTotal"
                type="number"
                step="0.01"
                min="0"
                value={costoTotal}
                onChange={(e) => setCostoTotal(Number(e.target.value))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                  <SelectItem value="COMPLETADO">Completado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="calidad">Calidad (opcional)</Label>
              <Input
                id="calidad"
                value={calidad}
                onChange={(e) => setCalidad(e.target.value)}
                placeholder="Ej: Buena, Excelente, Regular"
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="equiposUsados">Equipos Usados (opcional, separados por comas)</Label>
              <Input
                id="equiposUsados"
                value={equiposUsados}
                onChange={(e) => setEquiposUsados(e.target.value)}
                placeholder="Ej: Excavadora CAT-320, Criba Vibratoria"
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                placeholder="Cualquier nota relevante sobre el lote de producción..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              'Registrar Lote'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
