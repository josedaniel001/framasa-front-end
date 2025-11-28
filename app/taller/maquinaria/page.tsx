"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Settings,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Clock,
  DollarSign,
  RefreshCw,
  Shield,
  FileText,
} from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Maquinaria {
  id: string
  codigo: string
  nombre: string
  empresa: string
  empresaDisplay: string
  tipoMaquinaria: string
  tipoMaquinariaDisplay: string
  marca: string
  modelo: string
  estado: string
  proximoMantenimiento: string | null
  seguroVigente: boolean
  documentacionVigente: boolean
  activo: boolean
  // Campos adicionales del detalle (pueden no estar en el listado)
  numeroSerie?: string | null
  añoFabricacion?: number | null
  estadoActual?: string
  fechaUltimoMantenimiento?: string | null
  fechaProximoMantenimiento?: string | null
  horasOperacion?: number
  kilometraje?: number
  ubicacionActual?: string | null
  observaciones?: string | null
  // Campos snake_case para compatibilidad
  empresa_display?: string
  tipo_maquinaria?: string
  tipo_maquinaria_display?: string
  estado_actual?: string
  fecha_ultimo_mantenimiento?: string | null
  fecha_proximo_mantenimiento?: string | null
  horas_operacion?: number
  seguro_vigente?: boolean
  documentacion_vigente?: boolean
  ubicacion_actual?: string | null
}

interface TipoMaquinaria {
  value: string
  label: string
}

interface Empresa {
  value: string
  label: string
}

export default function MaquinariaTallerPage() {
  const { toast } = useToast()
  const [maquinaria, setMaquinaria] = useState<Maquinaria[]>([])
  const [allMaquinaria, setAllMaquinaria] = useState<Maquinaria[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [tipos, setTipos] = useState<TipoMaquinaria[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [filters, setFilters] = useState({
    empresa: "todos",
    tipo_maquinaria: "todos",
    estado: "todos",
    activo: "todos",
  })

  // Cargar datos iniciales
  useEffect(() => {
    loadTipos()
    loadEmpresas()
    loadMaquinaria()
  }, [])

  // Recargar cuando cambian los filtros
  useEffect(() => {
    if (tipos.length > 0 && empresas.length > 0) {
      loadMaquinaria()
    }
  }, [filters.empresa, filters.tipo_maquinaria, filters.estado, filters.activo])

  // Filtrado local con debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchTerm.trim()) {
        setMaquinaria(allMaquinaria)
        setSearching(false)
        return
      }

      setSearching(true)
      const term = searchTerm.toLowerCase().trim()
      const filtered = allMaquinaria.filter((item) => {
        return (
          item.codigo?.toLowerCase().includes(term) ||
          item.nombre?.toLowerCase().includes(term) ||
          item.marca?.toLowerCase().includes(term) ||
          item.modelo?.toLowerCase().includes(term) ||
          item.numeroSerie?.toLowerCase().includes(term) ||
          item.ubicacionActual?.toLowerCase().includes(term) ||
          item.ubicacion_actual?.toLowerCase().includes(term)
        )
      })
      setMaquinaria(filtered)
      setSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, allMaquinaria])

  const loadTipos = async () => {
    try {
      const data = await apiGet<TipoMaquinaria[]>(API_ENDPOINTS.TALLER.MAQUINARIA_TIPOS)
      setTipos(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("Error al cargar tipos:", err)
    }
  }

  const loadEmpresas = async () => {
    try {
      const data = await apiGet<Empresa[]>(API_ENDPOINTS.TALLER.MAQUINARIA_EMPRESAS)
      setEmpresas(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("Error al cargar empresas:", err)
    }
  }

  const loadMaquinaria = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      // Agregar filtros a los query params
      if (filters.empresa !== "todos") {
        params.append("empresa", filters.empresa)
      }
      if (filters.tipo_maquinaria !== "todos") {
        params.append("tipo_maquinaria", filters.tipo_maquinaria)
      }
      if (filters.estado !== "todos") {
        params.append("estado", filters.estado)
      }
      if (filters.activo !== "todos") {
        params.append("activo", filters.activo)
      }
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim())
      }

      const url = `${API_ENDPOINTS.TALLER.MAQUINARIA}${params.toString() ? `?${params.toString()}` : ""}`
      const data = await apiGet<Maquinaria[]>(url)

      const results = Array.isArray(data) ? data : []
      
      // Normalizar datos: usar camelCase si está disponible, sino snake_case
      const normalized = results.map((item) => ({
        ...item,
        empresaDisplay: item.empresaDisplay || item.empresa_display || item.empresa,
        tipoMaquinaria: item.tipoMaquinaria || item.tipo_maquinaria || "",
        tipoMaquinariaDisplay: item.tipoMaquinariaDisplay || item.tipo_maquinaria_display || item.tipoMaquinaria || "",
        estado: item.estado || item.estadoActual || item.estado_actual || "",
        proximoMantenimiento: item.proximoMantenimiento || item.fechaProximoMantenimiento || item.fecha_proximo_mantenimiento || null,
        seguroVigente: item.seguroVigente ?? item.seguro_vigente ?? true,
        documentacionVigente: item.documentacionVigente ?? item.documentacion_vigente ?? true,
        ubicacionActual: item.ubicacionActual || item.ubicacion_actual || null,
      }))

      setMaquinaria(normalized)
      setAllMaquinaria(normalized)
    } catch (err: any) {
      console.error("Error al cargar maquinaria:", err)
      setError(err.message || "Error al cargar la maquinaria")
      toast({
        title: "Error",
        description: "No se pudo cargar la maquinaria. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = allMaquinaria.length
    const operativos = allMaquinaria.filter((m) => 
      (m.estado?.toLowerCase() === "operativa" || m.estado?.toLowerCase() === "operativo")
    ).length
    const enMantenimiento = allMaquinaria.filter((m) => 
      m.estado?.toLowerCase().includes("mantenimiento")
    ).length
    const fueraServicio = allMaquinaria.filter((m) => 
      m.estado?.toLowerCase().includes("fuera") || m.estado?.toLowerCase().includes("servicio")
    ).length
    const criticos = allMaquinaria.filter((m) => 
      !m.seguroVigente || !m.documentacionVigente || 
      (m.proximoMantenimiento && new Date(m.proximoMantenimiento) < new Date())
    ).length
    const activos = allMaquinaria.filter((m) => m.activo).length

    return {
      total,
      operativos,
      enMantenimiento,
      fueraServicio,
      criticos,
      activos,
    }
  }, [allMaquinaria])

  const getStatusVariant = (status: string) => {
    const statusLower = status?.toLowerCase() || ""
    if (statusLower.includes("operativa") || statusLower.includes("operativo")) {
      return "default"
    }
    if (statusLower.includes("mantenimiento")) {
      return "secondary"
    }
    if (statusLower.includes("fuera") || statusLower.includes("servicio") || statusLower.includes("reparacion")) {
      return "destructive"
    }
    if (statusLower.includes("reservada")) {
      return "outline"
    }
    return "outline"
  }

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || ""
    if (statusLower.includes("operativa") || statusLower.includes("operativo")) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    if (statusLower.includes("mantenimiento")) {
      return <Wrench className="h-4 w-4 text-blue-600" />
    }
    if (statusLower.includes("fuera") || statusLower.includes("servicio") || statusLower.includes("reparacion")) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
    return <Clock className="h-4 w-4 text-gray-600" />
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A"
    try {
      return new Date(date).toLocaleDateString("es-GT", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "N/A"
    }
  }

  const isMantenimientoVencido = (fecha: string | null | undefined) => {
    if (!fecha) return false
    try {
      return new Date(fecha) < new Date()
    } catch {
      return false
    }
  }

  if (loading && !allMaquinaria.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maquinaria</h1>
            <p className="text-muted-foreground">Gestión del inventario de maquinaria del taller</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maquinaria</h1>
          <p className="text-muted-foreground">Gestión del inventario de maquinaria del taller</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { loadMaquinaria(); loadTipos(); loadEmpresas(); }} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button asChild>
            <Link href="/taller/maquinaria/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Maquinaria
            </Link>
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.operativos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.enMantenimiento}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuera de Servicio</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.fueraServicio}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.criticos}</div>
            <p className="text-xs text-muted-foreground mt-1">Mant. vencido o docs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por código, nombre, marca, modelo, serie o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <Select 
              value={filters.empresa} 
              onValueChange={(value) => setFilters({ ...filters, empresa: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las Empresas</SelectItem>
                {empresas.map((emp) => (
                  <SelectItem key={emp.value} value={emp.value}>
                    {emp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={filters.tipo_maquinaria} 
              onValueChange={(value) => setFilters({ ...filters, tipo_maquinaria: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los Tipos</SelectItem>
                {tipos.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={filters.activo} 
              onValueChange={(value) => setFilters({ ...filters, activo: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Activo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Maquinaria */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Maquinaria</CardTitle>
          <CardDescription>
            {maquinaria.length} {maquinaria.length === 1 ? "equipo encontrado" : "equipos encontrados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && !allMaquinaria.length ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error al cargar datos</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => { loadMaquinaria(); loadTipos(); loadEmpresas(); }}>
                Reintentar
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Marca/Modelo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Próx. Mant.</TableHead>
                    <TableHead>Documentación</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maquinaria.map((item) => {
                    const mantenimientoVencido = isMantenimientoVencido(item.proximoMantenimiento)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.codigo || "N/A"}</TableCell>
                        <TableCell>
                          <div className="font-medium">{item.nombre}</div>
                          {item.numeroSerie && (
                            <div className="text-sm text-muted-foreground">Serie: {item.numeroSerie}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.empresaDisplay || item.empresa}</Badge>
                        </TableCell>
                        <TableCell>{item.tipoMaquinariaDisplay || item.tipoMaquinaria || "N/A"}</TableCell>
                        <TableCell>
                          <div>{item.marca}</div>
                          <div className="text-sm text-muted-foreground">{item.modelo}</div>
                          {item.añoFabricacion && (
                            <div className="text-xs text-muted-foreground">({item.añoFabricacion})</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(item.estado)} className="flex items-center gap-1 w-fit">
                            {getStatusIcon(item.estado)}
                            {item.estado || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.ubicacionActual || "N/A"}</TableCell>
                        <TableCell>
                          {item.proximoMantenimiento ? (
                            <div className={mantenimientoVencido ? "text-red-600 font-medium" : ""}>
                              {formatDate(item.proximoMantenimiento)}
                              {mantenimientoVencido && (
                                <AlertTriangle className="h-3 w-3 inline ml-1" />
                              )}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.seguroVigente && item.documentacionVigente ? (
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
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.activo ? (
                            <Badge variant="default" className="flex items-center gap-1 w-fit">
                              <CheckCircle className="h-3 w-3" />
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <AlertTriangle className="h-3 w-3" />
                              Inactivo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/taller/maquinaria/${item.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalles
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/taller/maquinaria/${item.id}/editar`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/taller/ordenes/nueva?maquinaria=${item.id}`}>
                                  <Wrench className="mr-2 h-4 w-4" />
                                  Nueva Orden
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {maquinaria.length === 0 && (
                <div className="text-center py-8">
                  <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontró maquinaria</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filters.empresa !== "todos" || filters.tipo_maquinaria !== "todos" || filters.activo !== "todos"
                      ? "No hay maquinaria que coincida con los filtros aplicados."
                      : "Aún no hay maquinaria registrada."}
                  </p>
                  {(!searchTerm && filters.empresa === "todos" && filters.tipo_maquinaria === "todos" && filters.activo === "todos") && (
                    <Button asChild>
                      <Link href="/taller/maquinaria/nuevo">
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Primera Maquinaria
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
