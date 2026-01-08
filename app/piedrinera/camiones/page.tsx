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
import { Truck, Search, Plus, MoreHorizontal, Edit, Eye, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface Camion {
  id: string
  placa: string
  marca: string
  modelo: string
  capacidadMetrosCubicos: number
  estado: string
  proximoMantenimiento: string
  seguroVigente: boolean
  revisionTecnicaVigente: boolean
  documentacionVigente: boolean
  activo: boolean
}

export default function CamionesPiedrineraPage() {
  const { toast } = useToast()
  const [camiones, setCamiones] = useState<Camion[]>([])
  const [allCamiones, setAllCamiones] = useState<Camion[]>([])
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

        const camionesResponse = await apiGet<any>(API_ENDPOINTS.PIEDRINERA.CAMIONES)
        
        // Manejar diferentes formatos de respuesta
        let camionesData: any[] = []
        if (Array.isArray(camionesResponse)) {
          camionesData = camionesResponse
        } else if (camionesResponse && Array.isArray(camionesResponse.results)) {
          camionesData = camionesResponse.results
        } else if (camionesResponse && camionesResponse.data && Array.isArray(camionesResponse.data)) {
          camionesData = camionesResponse.data
        }
        
        // Mapear datos del backend al formato del frontend
        const mappedCamiones: Camion[] = camionesData.map((camion: any) => ({
          id: String(camion.id || camion.pk || ''),
          placa: camion.placa || '',
          marca: camion.marca || '',
          modelo: camion.modelo || '',
          capacidadMetrosCubicos: Number(camion.capacidadMetrosCubicos ?? camion.capacidad_m3 ?? 0) || 0,
          estado: camion.estado ?? camion.estado_actual ?? 'Desconocido',
          proximoMantenimiento: camion.proximoMantenimiento ?? camion.fecha_proximo_mantenimiento ?? '',
          seguroVigente: camion.seguroVigente ?? camion.seguro_vigente ?? true,
          revisionTecnicaVigente: camion.revisionTecnicaVigente ?? camion.revision_tecnica_vigente ?? true,
          documentacionVigente: camion.documentacionVigente ?? camion.documentacion_vigente ?? true,
          activo: camion.activo !== undefined ? camion.activo : true,
        }))

        setCamiones(mappedCamiones)
        setAllCamiones(mappedCamiones)
      } catch (err: any) {
        console.error('Error en loadInitialData:', err)
        setError(err.message || 'Error al cargar los datos')
        toast({
          title: "Error",
          description: "No se pudieron cargar los camiones. Por favor, intenta de nuevo.",
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
      setCamiones(allCamiones)
      setSearching(false)
      return
    }

    setSearching(true)

    debounceTimer.current = setTimeout(() => {
      const term = searchTerm.toLowerCase().trim()
      const filtered = allCamiones.filter((camion) => {
        return (
          camion.placa.toLowerCase().includes(term) ||
          camion.marca.toLowerCase().includes(term) ||
          camion.modelo.toLowerCase().includes(term) ||
          camion.estado.toLowerCase().includes(term)
        )
      })
      setCamiones(filtered)
      setSearching(false)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchTerm, allCamiones])

  const totalCamiones = allCamiones.length
  const camionesDisponibles = allCamiones.filter((c) => c.estado === "Disponible").length
  const camionesEnRuta = allCamiones.filter((c) => c.estado === "En Ruta").length
  const camionesEnMantenimiento = allCamiones.filter((c) => c.estado === "En Mantenimiento").length

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Disponible":
        return "default"
      case "En Ruta":
        return "secondary"
      case "En Mantenimiento":
        return "destructive"
      case "Cargando":
        return "outline"
      case "Descargando":
        return "outline"
      case "Fuera de Servicio":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Camiones</h1>
            <p className="text-muted-foreground">Gestión de la flota de camiones</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Camiones</h1>
            <p className="text-muted-foreground">Gestión de la flota de camiones</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
          <h1 className="text-3xl font-bold tracking-tight">Camiones</h1>
          <p className="text-muted-foreground">Gestión de la flota de camiones</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/piedrinera/camiones/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Camión
            </Link>
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Camiones</CardDescription>
            <CardTitle className="text-2xl">{totalCamiones}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Disponibles</CardDescription>
            <CardTitle className="text-2xl">{camionesDisponibles}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>En Ruta</CardDescription>
            <CardTitle className="text-2xl">{camionesEnRuta}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>En Mantenimiento</CardDescription>
            <CardTitle className="text-2xl">{camionesEnMantenimiento}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por placa, marca, modelo o estado..."
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

      {/* Tabla de Camiones */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Camiones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Placa</th>
                  <th className="text-left p-2 font-medium">Marca</th>
                  <th className="text-left p-2 font-medium">Modelo</th>
                  <th className="text-left p-2 font-medium">Capacidad (m³)</th>
                  <th className="text-left p-2 font-medium">Estado</th>
                  <th className="text-left p-2 font-medium">Activo</th>
                  <th className="text-left p-2 font-medium">Documentación</th>
                  <th className="text-left p-2 font-medium">Próx. Mantenimiento</th>
                  <th className="text-right p-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {camiones.map((camion) => (
                  <tr key={camion.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{camion.placa}</td>
                    <td className="p-2">{camion.marca}</td>
                    <td className="p-2">{camion.modelo}</td>
                    <td className="p-2">{camion.capacidadMetrosCubicos}</td>
                    <td className="p-2">
                      <Badge variant={getStatusVariant(camion.estado)}>{camion.estado}</Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        {camion.activo ? (
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
                      <div className="flex items-center gap-2">
                        {camion.seguroVigente && camion.revisionTecnicaVigente && camion.documentacionVigente ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {camion.seguroVigente && camion.revisionTecnicaVigente && camion.documentacionVigente
                            ? "Al día"
                            : "Vencida"}
                        </span>
                      </div>
                    </td>
                    <td className="p-2">{camion.proximoMantenimiento || "N/A"}</td>
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
                              <Link href={`/piedrinera/camiones/${camion.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/piedrinera/camiones/${camion.id}/editar`}>
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
          {camiones.length === 0 && (
            <div className="text-center py-8">
              <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron camiones</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No hay camiones que coincidan con tu búsqueda."
                  : "Aún no hay camiones registrados."}
              </p>
              <Button asChild>
                <Link href="/piedrinera/camiones/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Primer Camión
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
