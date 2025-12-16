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
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Empleado {
  id: string
  codigo: string
  nombres: string
  apellidos: string
  nombreCompleto: string
}

export default function NuevaAsistenciaPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loadingEmpleados, setLoadingEmpleados] = useState(true)
  const [empleadoId, setEmpleadoId] = useState<string>("")
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split("T")[0])
  const [horaEntrada, setHoraEntrada] = useState<string>("")
  const [horaSalida, setHoraSalida] = useState<string>("")
  const [estado, setEstado] = useState<string>("presente")
  const [fechaRetorno, setFechaRetorno] = useState<string>("")
  const [observaciones, setObservaciones] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  // Cargar empleados sin asistencia hoy
  useEffect(() => {
    const loadEmpleados = async () => {
      try {
        setLoadingEmpleados(true)
        const data = await apiGet<Empleado[]>(API_ENDPOINTS.PLANILLAS.EMPLEADOS_SIN_ASISTENCIA_HOY)
        setEmpleados(data)
      } catch (error: any) {
        console.error("Error al cargar empleados:", error)
        toast({
          title: "Error",
          description: error.message || "Error al cargar los empleados disponibles",
          variant: "destructive",
        })
      } finally {
        setLoadingEmpleados(false)
      }
    }

    loadEmpleados()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!empleadoId || !fecha || !estado) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa los campos obligatorios (Empleado, Fecha y Estado).",
        variant: "destructive",
      })
      return
    }

    // Validar fecha de retorno para licencia médica y vacaciones
    if ((estado === "licencia_medica" || estado === "vacaciones") && !fechaRetorno) {
      toast({
        title: "Error de validación",
        description: "La fecha de retorno es obligatoria para Licencia Médica y Vacaciones.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const asistenciaData = {
        empleadoId: parseInt(empleadoId),
        fecha,
        horaEntrada: horaEntrada || null,
        horaSalida: horaSalida || null,
        estado,
        fechaRetorno: fechaRetorno || null,
        observaciones: observaciones || null,
      }

      const response = await apiPost<any>(API_ENDPOINTS.PLANILLAS.ASISTENCIAS, asistenciaData)

      // Verificar si se crearon múltiples registros (vacaciones o licencia médica)
      if (response.registros_creados && response.registros_creados > 1) {
        toast({
          title: "Asistencias Registradas",
          description: response.mensaje || `Se crearon ${response.registros_creados} registros de asistencia.`,
        })
      } else {
        toast({
          title: "Asistencia Registrada",
          description: "La asistencia ha sido registrada exitosamente.",
        })
      }
      router.push("/planillas/asistencias")
    } catch (error: any) {
      console.error("Error al registrar asistencia:", error)
      toast({
        title: "Error",
        description: error.message || "Error al registrar la asistencia. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-2 sm:p-0">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/planillas/asistencias">
          <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">Nueva Asistencia</h1>
          <p className="text-xs sm:text-base text-muted-foreground hidden sm:block">
            Registra una nueva asistencia de empleado
          </p>
        </div>
      </div>

      {loadingEmpleados ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando empleados...</span>
        </div>
      ) : empleados.length === 0 ? (
        <Alert className="mx-0">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">Sin empleados disponibles</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
            Todos los empleados activos ya tienen asistencia registrada para hoy.
            Si deseas registrar una nueva asistencia, primero desactiva la asistencia actual del empleado.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4 sm:gap-6">
          {/* Información de Asistencia */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Información de Asistencia</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 grid gap-4">
              {/* Empleado y Fecha */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="empleado" className="text-sm">Empleado *</Label>
                  <Select value={empleadoId} onValueChange={setEmpleadoId} required>
                    <SelectTrigger id="empleado">
                      <SelectValue placeholder="Selecciona un empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      {empleados.map((empleado) => (
                        <SelectItem key={empleado.id} value={empleado.id}>
                          <span className="truncate">
                            {empleado.codigo} - {empleado.nombreCompleto || `${empleado.nombres} ${empleado.apellidos}`}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Solo empleados sin asistencia hoy
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fecha" className="text-sm">Fecha *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Hora Entrada y Salida */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="horaEntrada" className="text-sm">Hora Entrada</Label>
                  <Input
                    id="horaEntrada"
                    type="time"
                    value={horaEntrada}
                    onChange={(e) => setHoraEntrada(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="horaSalida" className="text-sm">Hora Salida</Label>
                  <Input
                    id="horaSalida"
                    type="time"
                    value={horaSalida}
                    onChange={(e) => setHoraSalida(e.target.value)}
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="grid gap-2">
                <Label htmlFor="estado" className="text-sm">Estado *</Label>
                <Select value={estado} onValueChange={setEstado} required>
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presente">Presente</SelectItem>
                    <SelectItem value="descanso">Descanso</SelectItem>
                    <SelectItem value="vacaciones">Vacaciones</SelectItem>
                    <SelectItem value="permiso_con_goce">Permiso con goce</SelectItem>
                    <SelectItem value="permiso_sin_goce">Permiso sin goce</SelectItem>
                    <SelectItem value="licencia_medica">Licencia Médica</SelectItem>
                    <SelectItem value="ausente">Ausente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha de Retorno - Condicional */}
              {(estado === "licencia_medica" || estado === "vacaciones") && (
                <div className="grid gap-2">
                  <Label htmlFor="fechaRetorno" className="text-sm">Fecha de Retorno *</Label>
                  <Input
                    id="fechaRetorno"
                    type="date"
                    value={fechaRetorno}
                    onChange={(e) => setFechaRetorno(e.target.value)}
                    min={fecha}
                    required
                  />
                </div>
              )}

              {/* Observaciones */}
              <div className="grid gap-2">
                <Label htmlFor="observaciones" className="text-sm">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas adicionales sobre la asistencia..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()} 
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar Asistencia"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
