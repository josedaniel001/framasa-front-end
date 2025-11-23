"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, Search, Plus, MoreHorizontal, Edit, Eye, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface Empleado {
  id: string
  codigo: string
  nombres: string
  apellidos: string
  nombreCompleto: string
  cedula: string
  telefono?: string
  email?: string
  cargo: string
  salario: number
  fechaIngreso: string
  activo: boolean
}

interface EmpleadosStats {
  total_empleados: number
  empleados_activos: number
  empleados_inactivos: number
}

export default function EmpleadosPage() {
  const { toast } = useToast()
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [allEmpleados, setAllEmpleados] = useState<Empleado[]>([])
  const [stats, setStats] = useState<EmpleadosStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Cargar datos iniciales desde Django
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Cargar empleados y estadísticas en paralelo
        const [empleadosResult, statsResult] = await Promise.allSettled([
          apiGet<Empleado[]>(API_ENDPOINTS.PLANILLAS.EMPLEADOS),
          apiGet<EmpleadosStats>(API_ENDPOINTS.PLANILLAS.EMPLEADOS_STATS),
        ])

        if (empleadosResult.status === 'fulfilled') {
          setEmpleados(empleadosResult.value)
          setAllEmpleados(empleadosResult.value)
        } else {
          console.error('Error cargando empleados:', empleadosResult.reason)
          setError('Error al cargar los empleados')
        }

        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value)
        } else {
          console.error('Error cargando estadísticas:', statsResult.reason)
        }
      } catch (err: any) {
        console.error('Error en loadInitialData:', err)
        setError(err.message || 'Error al cargar los datos')
        toast({
          title: "Error",
          description: "No se pudieron cargar los empleados. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [toast])

  // Filtrado local con debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (!searchTerm.trim()) {
      setEmpleados(allEmpleados)
      setSearching(false)
      return
    }

    setSearching(true)

    debounceTimer.current = setTimeout(() => {
      const term = searchTerm.toLowerCase().trim()
      const filtered = allEmpleados.filter((empleado) => {
        return (
          empleado.nombres.toLowerCase().includes(term) ||
          empleado.apellidos.toLowerCase().includes(term) ||
          empleado.nombreCompleto.toLowerCase().includes(term) ||
          empleado.codigo.toLowerCase().includes(term) ||
          empleado.cedula.toLowerCase().includes(term) ||
          empleado.cargo.toLowerCase().includes(term)
        )
      })
      setEmpleados(filtered)
      setSearching(false)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchTerm, allEmpleados])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Empleados</h1>
            <p className="text-muted-foreground">Gestión de empleados y personal</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Empleados</h1>
            <p className="text-muted-foreground">Gestión de empleados y personal</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar datos</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empleados</h1>
          <p className="text-muted-foreground">Gestión de empleados y personal</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/planillas/empleados/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Empleado
            </Link>
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Empleados</CardDescription>
              <CardTitle className="text-2xl">{stats.total_empleados}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Activos</CardDescription>
              <CardTitle className="text-2xl">{stats.empleados_activos}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Inactivos</CardDescription>
              <CardTitle className="text-2xl">{stats.empleados_inactivos}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, código, cédula o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus={false}
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Empleados */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Código</th>
                  <th className="text-left p-2 font-medium">Nombre Completo</th>
                  <th className="text-left p-2 font-medium">Cédula</th>
                  <th className="text-left p-2 font-medium">Cargo</th>
                  <th className="text-left p-2 font-medium">Salario</th>
                  <th className="text-left p-2 font-medium">Fecha Ingreso</th>
                  <th className="text-left p-2 font-medium">Estado</th>
                  <th className="text-right p-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((empleado) => (
                  <tr key={empleado.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{empleado.codigo}</td>
                    <td className="p-2">{empleado.nombreCompleto || `${empleado.nombres} ${empleado.apellidos}`}</td>
                    <td className="p-2">{empleado.cedula}</td>
                    <td className="p-2">{empleado.cargo}</td>
                    <td className="p-2">Q{empleado.salario.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="p-2">
                      {empleado.fechaIngreso
                        ? new Date(empleado.fechaIngreso).toLocaleDateString("es-GT")
                        : "N/A"}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        {empleado.activo ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Activo</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-600">Inactivo</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/planillas/empleados/${empleado.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/planillas/empleados/${empleado.id}/editar`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {empleados.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron empleados</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No hay empleados que coincidan con tu búsqueda."
                  : "Aún no hay empleados registrados."}
              </p>
              <Button asChild>
                <Link href="/planillas/empleados/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Primer Empleado
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

