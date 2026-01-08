"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Multiselect, type MultiselectOption } from "@/components/ui/multiselect"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPut } from "@/lib/api-client"
import { Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface EditarEmpleadoPageProps {
  params: Promise<{
    id: string
  }>
}

interface Empleado {
  id: string
  codigo: string
  nombres: string
  apellidos: string
  cedula: string
  telefono?: string
  email?: string
  cargo?: string
  cargos?: any[]
  salario: number
  fechaIngreso: string
  activo: boolean
  nit?: string
  areaTrabajo?: string
  turno?: string
  tipoContrato?: string
}

export default function EditarEmpleadoPage({ params }: EditarEmpleadoPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { logout } = useAuth()
  const { id } = use(params)

  const [codigo, setCodigo] = useState<string>("")
  const [nombres, setNombres] = useState<string>("")
  const [apellidos, setApellidos] = useState<string>("")
  const [cedula, setCedula] = useState<string>("")
  const [nit, setNit] = useState<string>("")
  const [telefono, setTelefono] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [cargosSeleccionados, setCargosSeleccionados] = useState<string[]>([])
  const [cargosOptions, setCargosOptions] = useState<MultiselectOption[]>([])
  const [loadingCargos, setLoadingCargos] = useState(false)
  const [areaTrabajo, setAreaTrabajo] = useState<string>("")
  const [turno, setTurno] = useState<string>("")
  const [tipoContrato, setTipoContrato] = useState<string>("")
  const [salario, setSalario] = useState<number>(0)
  const [fechaIngreso, setFechaIngreso] = useState<string>("")
  const [activo, setActivo] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar cargos desde la API
  useEffect(() => {
    const loadCargos = async () => {
      try {
        setLoadingCargos(true)
        const response = await apiGet(API_ENDPOINTS.PLANILLAS.CARGOS)
        const options: MultiselectOption[] = (response as any[]).map((cargo: any) => ({
          value: cargo.id.toString(),
          label: cargo.nombre,
          description: cargo.descripcion || undefined,
        }))
        setCargosOptions(options)
      } catch (error) {
        console.error('Error al cargar cargos:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los cargos disponibles.",
          variant: "destructive",
        })
      } finally {
        setLoadingCargos(false)
      }
    }

    loadCargos()
  }, [toast])

  // Cargar empleado desde la API (solo cuando los cargos estén cargados)
  useEffect(() => {
    if (cargosOptions.length === 0 && !loadingCargos) {
      // Esperar a que los cargos se carguen primero
      return
    }

    const loadEmpleado = async () => {
      try {
        setLoading(true)
        const empleadoData = await apiGet<Empleado>(API_ENDPOINTS.PLANILLAS.EMPLEADO(id))
        
        setCodigo(empleadoData.codigo || "")
        setNombres(empleadoData.nombres || "")
        setApellidos(empleadoData.apellidos || "")
        setCedula(empleadoData.cedula || "")
        setNit(empleadoData.nit || "")
        setTelefono(empleadoData.telefono || "")
        setEmail(empleadoData.email || "")
        
        // Manejar cargos: puede venir como array o como string
        if (empleadoData.cargos && Array.isArray(empleadoData.cargos)) {
          // Si viene como array de objetos con id
          const cargoIds = empleadoData.cargos.map((c: any) => {
            if (typeof c === 'object' && c.id) {
              return c.id.toString()
            }
            return c.toString()
          })
          setCargosSeleccionados(cargoIds)
        } else if (empleadoData.cargo) {
          // Si viene como string, buscar el ID del cargo en las opciones
          const cargoEncontrado = cargosOptions.find(c => c.label === empleadoData.cargo)
          if (cargoEncontrado) {
            setCargosSeleccionados([cargoEncontrado.value])
          }
        }
        
        setAreaTrabajo(empleadoData.areaTrabajo || "")
        setTurno(empleadoData.turno || "")
        setTipoContrato(empleadoData.tipoContrato || "")
        setSalario(empleadoData.salario || 0)
        setFechaIngreso(empleadoData.fechaIngreso ? empleadoData.fechaIngreso.split('T')[0] : "")
        setActivo(empleadoData.activo !== undefined ? empleadoData.activo : true)
      } catch (error: any) {
        console.error("Error al cargar empleado:", error)
        
        if (error.status === 401 || error.code === 'token_invalid') {
          toast({
            title: "Sesión Expirada",
            description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
            variant: "destructive",
          })
          logout()
          setTimeout(() => {
            router.push("/login")
          }, 2000)
          return
        }
        
        toast({
          title: "Error",
          description: error.message || "Error al cargar el empleado. Por favor, inténtelo de nuevo.",
          variant: "destructive",
        })
        router.push("/planillas/empleados")
      } finally {
        setLoading(false)
      }
    }

    loadEmpleado()
  }, [id, router, toast, logout, cargosOptions, loadingCargos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigo || !nombres || !apellidos || cargosSeleccionados.length === 0 || !fechaIngreso || salario < 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa los campos obligatorios (Código, Nombres, Apellidos, al menos un Cargo, Fecha de Ingreso y Salario).",
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
        // Enviar los IDs de los cargos seleccionados
        cargos: cargosSeleccionados.map(id => parseInt(id)),
        area_trabajo: areaTrabajo || null,
        turno: turno || null,
        tipo_contrato: tipoContrato || null,
        salario_base_q: salario,
        fecha_contratacion: fechaIngreso,
        activo,
      }

      await apiPut(API_ENDPOINTS.PLANILLAS.EMPLEADO(id), empleadoData)

      toast({
        title: "Empleado Actualizado",
        description: `El empleado ${nombres} ${apellidos} ha sido actualizado exitosamente.`,
      })
      router.push(`/planillas/empleados/${id}`)
    } catch (error: any) {
      console.error("Error al actualizar empleado:", error)

      let errorMessage = error.message || "Error al actualizar el empleado. Por favor, inténtelo de nuevo."

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
        errorMessage = "El empleado no fue encontrado. Por favor, verifica que el empleado exista."
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

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Cargando empleado...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href={`/planillas/empleados/${id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Editar Empleado</h1>
      </div>
      <p className="text-muted-foreground">Modifica la información del empleado en el sistema de planillas.</p>

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
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="cargos">Cargos / Puestos *</Label>
              <Multiselect
                options={cargosOptions}
                value={cargosSeleccionados}
                onValueChange={setCargosSeleccionados}
                placeholder="Selecciona uno o más cargos"
                searchPlaceholder="Buscar cargos..."
                emptyMessage="No se encontraron cargos."
                loading={loadingCargos}
                disabled={loadingCargos}
              />
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
                Actualizando...
              </>
            ) : (
              "Actualizar Empleado"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
