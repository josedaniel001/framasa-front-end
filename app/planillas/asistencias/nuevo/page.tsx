"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"

// Datos estáticos de empleados para el select
const empleadosEstaticos = [
  { id: "1", codigo: "EMP001", nombre: "Juan Pérez" },
  { id: "2", codigo: "EMP002", nombre: "María González" },
  { id: "3", codigo: "EMP003", nombre: "Carlos Rodríguez" },
  { id: "4", codigo: "EMP004", nombre: "Ana Martínez" },
  { id: "5", codigo: "EMP005", nombre: "Luis Hernández" },
  { id: "6", codigo: "EMP006", nombre: "Sofía Ramírez" },
  { id: "7", codigo: "EMP007", nombre: "Pedro López" },
  { id: "8", codigo: "EMP008", nombre: "Carmen Torres" },
]

export default function NuevaAsistenciaPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [empleadoId, setEmpleadoId] = useState<string>("")
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split("T")[0])
  const [horaEntrada, setHoraEntrada] = useState<string>("")
  const [horaSalida, setHoraSalida] = useState<string>("")
  const [estado, setEstado] = useState<string>("presente")
  const [fechaRetorno, setFechaRetorno] = useState<string>("")
  const [observaciones, setObservaciones] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

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
        description: "La fecha de retorno es obligatoria para Licencia Medica y Vacaciones.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Aquí iría la llamada a la API cuando esté conectada
      // await apiPost(API_ENDPOINTS.PLANILLAS.ASISTENCIAS, asistenciaData)

      // Simulación de éxito
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Asistencia Registrada",
        description: "La asistencia ha sido registrada exitosamente.",
      })
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

  const empleadoSeleccionado = empleadosEstaticos.find((e) => e.id === empleadoId)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nueva Asistencia</h1>
      <p className="text-muted-foreground">Registra una nueva asistencia de empleado.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Información de Asistencia */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Asistencia</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="empleado">Empleado *</Label>
              <Select value={empleadoId} onValueChange={setEmpleadoId} required>
                <SelectTrigger id="empleado">
                  <SelectValue placeholder="Selecciona un empleado" />
                </SelectTrigger>
                <SelectContent>
                  {empleadosEstaticos.map((empleado) => (
                    <SelectItem key={empleado.id} value={empleado.id}>
                      {empleado.codigo} - {empleado.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="horaEntrada">Hora de Entrada</Label>
              <Input
                id="horaEntrada"
                type="time"
                value={horaEntrada}
                onChange={(e) => setHoraEntrada(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="horaSalida">Hora de Salida</Label>
              <Input
                id="horaSalida"
                type="time"
                value={horaSalida}
                onChange={(e) => setHoraSalida(e.target.value)}
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="estado">Estado *</Label>
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
                  <SelectItem value="licencia_medica">Licencia Medica</SelectItem>
                  <SelectItem value="ausente">Ausente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(estado === "licencia_medica" || estado === "vacaciones") && (
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="fechaRetorno">Fecha de Retorno *</Label>
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
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales sobre la asistencia..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
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
    </div>
  )
}

