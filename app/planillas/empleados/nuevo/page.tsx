"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiPost } from "@/lib/api-client"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function NuevoEmpleadoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { logout } = useAuth()

  const [codigo, setCodigo] = useState<string>("")
  const [nombres, setNombres] = useState<string>("")
  const [apellidos, setApellidos] = useState<string>("")
  const [cedula, setCedula] = useState<string>("")
  const [nit, setNit] = useState<string>("")
  const [telefono, setTelefono] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [cargo, setCargo] = useState<string>("")
  const [areaTrabajo, setAreaTrabajo] = useState<string>("")
  const [turno, setTurno] = useState<string>("")
  const [tipoContrato, setTipoContrato] = useState<string>("")
  const [salario, setSalario] = useState<number>(0)
  const [fechaIngreso, setFechaIngreso] = useState<string>("")
  const [activo, setActivo] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigo || !nombres || !apellidos || !cargo || !fechaIngreso || salario < 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa los campos obligatorios (Código, Nombres, Apellidos, Cargo, Fecha de Ingreso y Salario).",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Preparar los datos según lo que espera el backend Django
      // El serializer mapea estos campos a los nombres reales de la base de datos
      const empleadoData = {
        codigo_empleado: codigo,
        nombres,
        apellidos,
        dpi: cedula || null,
        nit: nit || null,
        telefono: telefono || null,
        email: email || null,
        puesto: cargo,
        area_trabajo: areaTrabajo || null,
        turno: turno || null,
        tipo_contrato: tipoContrato || null,
        salario_base_q: salario,
        fecha_contratacion: fechaIngreso,
        fecha_baja: null,
        usuario_id: null,
        activo,
      }

      await apiPost(API_ENDPOINTS.PLANILLAS.EMPLEADOS, empleadoData)

      toast({
        title: "Empleado Creado",
        description: `El empleado ${nombres} ${apellidos} ha sido registrado exitosamente.`,
      })
      router.push("/planillas/empleados")
    } catch (error: any) {
      console.error("Error al crear empleado:", error)
      
      let errorMessage = error.message || "Error al crear el empleado. Por favor, inténtelo de nuevo."
      
      if (error.status === 401 || error.code === 'token_invalid') {
        errorMessage = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        toast({
          title: "Sesión Expirada",
          description: errorMessage,
          variant: "destructive",
        })
        // Limpiar sesión y redirigir al login
        logout()
        setTimeout(() => {
          router.push("/login")
        }, 2000)
        return
      } else if (error.status === 400) {
        errorMessage = "Los datos proporcionados no son válidos. Verifica que todos los campos estén correctamente completados."
      } else if (error.status === 404) {
        errorMessage = "El endpoint de empleados no está disponible en el backend. Por favor, contacta al administrador del sistema."
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nuevo Empleado</h1>
      <p className="text-muted-foreground">Registra un nuevo empleado en el sistema de planillas.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="codigo">Código de Empleado *</Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej: EMP001"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cedula">DPI / Cédula</Label>
              <Input
                id="cedula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Número de DPI o cédula"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nombres">Nombres *</Label>
              <Input
                id="nombres"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="Nombres del empleado"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apellidos">Apellidos *</Label>
              <Input
                id="apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Apellidos del empleado"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nit">NIT</Label>
              <Input
                id="nit"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                placeholder="Número de Identificación Tributaria"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Número de teléfono"
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
              />
            </div>
          </CardContent>
        </Card>

        {/* Información Laboral */}
        <Card>
          <CardHeader>
            <CardTitle>Información Laboral</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cargo">Cargo / Puesto *</Label>
              <Select value={cargo} onValueChange={setCargo} required>
                <SelectTrigger id="cargo">
                  <SelectValue placeholder="Selecciona un puesto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gerente General">Gerente General</SelectItem>
                  <SelectItem value="Gerente de Operaciones">Gerente de Operaciones</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Jefe de Producción">Jefe de Producción</SelectItem>
                  <SelectItem value="Jefe de Bodega">Jefe de Bodega</SelectItem>
                  <SelectItem value="Operador de Maquinaria">Operador de Maquinaria</SelectItem>
                  <SelectItem value="Operador de Producción">Operador de Producción</SelectItem>
                  <SelectItem value="Conductor">Conductor</SelectItem>
                  <SelectItem value="Ayudante de Producción">Ayudante de Producción</SelectItem>
                  <SelectItem value="Mecánico">Mecánico</SelectItem>
                  <SelectItem value="Vendedor">Vendedor</SelectItem>
                  <SelectItem value="Cajero">Cajero</SelectItem>
                  <SelectItem value="Contador">Contador</SelectItem>
                  <SelectItem value="Asistente Administrativo">Asistente Administrativo</SelectItem>
                  <SelectItem value="Secretaria">Secretaria</SelectItem>
                  <SelectItem value="Vigilante">Vigilante</SelectItem>
                  <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="areaTrabajo">Área de Trabajo</Label>
              <Select value={areaTrabajo} onValueChange={setAreaTrabajo}>
                <SelectTrigger id="areaTrabajo">
                  <SelectValue placeholder="Selecciona un área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ferretería">Ferretería</SelectItem>
                  <SelectItem value="Bloquera">Bloquera</SelectItem>
                  <SelectItem value="Piedrinera">Piedrinera</SelectItem>
                  <SelectItem value="Taller">Taller</SelectItem>
                  <SelectItem value="Administración">Administración</SelectItem>
                  <SelectItem value="Ventas">Ventas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="turno">Turno</Label>
              <Select value={turno} onValueChange={setTurno}>
                <SelectTrigger id="turno">
                  <SelectValue placeholder="Selecciona un turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diurno">Diurno</SelectItem>
                  <SelectItem value="Nocturno">Nocturno</SelectItem>
                  <SelectItem value="Mixto">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipoContrato">Tipo de Contrato</Label>
              <Select value={tipoContrato} onValueChange={setTipoContrato}>
                <SelectTrigger id="tipoContrato">
                  <SelectValue placeholder="Selecciona tipo de contrato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Indefinido">Indefinido</SelectItem>
                  <SelectItem value="Temporal">Temporal</SelectItem>
                  <SelectItem value="Por Obra">Por Obra</SelectItem>
                  <SelectItem value="Tiempo Parcial">Tiempo Parcial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salario">Salario Base (Q) *</Label>
              <Input
                id="salario"
                type="number"
                value={salario}
                onChange={(e) => setSalario(Number(e.target.value))}
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaIngreso">Fecha de Contratación *</Label>
              <Input
                id="fechaIngreso"
                type="date"
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch id="activo" checked={activo} onCheckedChange={setActivo} />
              <Label htmlFor="activo">Empleado Activo</Label>
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
                Creando...
              </>
            ) : (
              "Crear Empleado"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

