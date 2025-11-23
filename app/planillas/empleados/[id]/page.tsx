"use client"

import { useEffect, use, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, User, CheckCircle, XCircle, Loader2, Mail, Phone, Calendar, DollarSign, Briefcase } from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface VerEmpleadoPageProps {
  params: Promise<{
    id: string
  }>
}

interface Empleado {
  id: string
  codigo: string
  nombres: string
  apellidos: string
  nombreCompleto?: string
  cedula: string
  telefono?: string
  email?: string
  cargo: string
  salario: number
  fechaIngreso: string
  activo: boolean
  nit?: string
  areaTrabajo?: string
  turno?: string
  tipoContrato?: string
  fechaBaja?: string
  created_at?: string
  updated_at?: string
}

export default function VerEmpleadoPage({ params }: VerEmpleadoPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { logout } = useAuth()
  const { id } = use(params)
  
  const [empleado, setEmpleado] = useState<Empleado | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEmpleado = async () => {
      try {
        setLoading(true)
        const empleadoData = await apiGet<Empleado>(`${API_ENDPOINTS.PLANILLAS.EMPLEADOS}/${id}`)
        setEmpleado(empleadoData)
      } catch (error: any) {
        console.error('Error al cargar empleado:', error)
        
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
          description: error.message || "No se pudo cargar el empleado.",
          variant: "destructive",
        })
        router.replace("/planillas/empleados")
      } finally {
        setLoading(false)
      }
    }

    loadEmpleado()
  }, [id, router, toast, logout])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Cargando empleado...</p>
        </div>
      </div>
    )
  }

  if (!empleado) {
    return null
  }

  const nombreCompleto = empleado.nombreCompleto || `${empleado.nombres} ${empleado.apellidos}`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/planillas/empleados">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{nombreCompleto}</h1>
            <p className="text-muted-foreground">Código: {empleado.codigo}</p>
          </div>
        </div>
        <Link href={`/planillas/empleados/${empleado.id}/editar`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar Empleado
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            {empleado.activo ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <Badge variant={empleado.activo ? "default" : "destructive"} className="text-base px-3 py-1">
              {empleado.activo ? "Activo" : "Inactivo"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salario Base</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Q{empleado.salario.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Mensual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cargo</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{empleado.cargo}</div>
            {empleado.areaTrabajo && (
              <p className="text-xs text-muted-foreground">{empleado.areaTrabajo}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fecha de Ingreso</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {empleado.fechaIngreso
                ? new Date(empleado.fechaIngreso).toLocaleDateString("es-GT")
                : "N/A"}
            </div>
            {empleado.fechaBaja && (
              <p className="text-xs text-red-500">Baja: {new Date(empleado.fechaBaja).toLocaleDateString("es-GT")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Código</p>
                <p className="text-base font-semibold">{empleado.codigo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <Badge variant={empleado.activo ? "default" : "destructive"}>
                  {empleado.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombres</p>
                <p className="text-base font-semibold">{empleado.nombres}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Apellidos</p>
                <p className="text-base font-semibold">{empleado.apellidos}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">DPI / Cédula</p>
                <p className="text-base font-semibold">{empleado.cedula || "N/A"}</p>
              </div>
              {empleado.nit && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">NIT</p>
                  <p className="text-base font-semibold">{empleado.nit}</p>
                </div>
              )}
            </div>
            <Separator />
            <div className="space-y-2">
              {empleado.telefono && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base">{empleado.telefono}</p>
                </div>
              )}
              {empleado.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base">{empleado.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Laboral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cargo / Puesto</p>
                <p className="text-base font-semibold">{empleado.cargo}</p>
              </div>
              {empleado.areaTrabajo && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Área de Trabajo</p>
                  <p className="text-base font-semibold">{empleado.areaTrabajo}</p>
                </div>
              )}
              {empleado.turno && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Turno</p>
                  <p className="text-base font-semibold">{empleado.turno}</p>
                </div>
              )}
              {empleado.tipoContrato && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Contrato</p>
                  <p className="text-base font-semibold">{empleado.tipoContrato}</p>
                </div>
              )}
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Salario Base</p>
              <p className="text-2xl font-bold">Q{empleado.salario.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground">Mensual</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Fecha de Contratación</p>
              <p className="text-base">
                {empleado.fechaIngreso
                  ? new Date(empleado.fechaIngreso).toLocaleDateString("es-GT", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
              {empleado.fechaBaja && (
                <>
                  <p className="text-sm font-medium text-muted-foreground mt-2 mb-2">Fecha de Baja</p>
                  <p className="text-base text-red-500">
                    {new Date(empleado.fechaBaja).toLocaleDateString("es-GT", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {empleado.created_at && (
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {empleado.created_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
                    <p className="text-base">
                      {new Date(empleado.created_at).toLocaleDateString("es-GT", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
                {empleado.updated_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                    <p className="text-base">
                      {new Date(empleado.updated_at).toLocaleDateString("es-GT", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

