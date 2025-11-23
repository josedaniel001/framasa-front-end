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
import { Package, Search, Plus, MoreHorizontal, Edit, Eye, Filter, Loader2 } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface AgregadoPiedrinera {
  id: string
  codigo: string
  nombre: string
  tipo: string
  granulometria: string
  precioVenta: number
  stock: number
  stockMinimo: number
  activo: boolean
  ubicacion?: string
  calidad?: string
  proveedor?: string
}

interface AgregadosStats {
  total_agregados: number
  agregados_activos: number
  agregados_inactivos: number
  agregados_stock_bajo: number
}

export default function PiedrinerapProductosPage() {
  const { toast } = useToast()
  const [agregados, setAgregados] = useState<AgregadoPiedrinera[]>([])
  const [allAgregados, setAllAgregados] = useState<AgregadoPiedrinera[]>([]) // Todos los agregados para filtrado local
  const [stats, setStats] = useState<AgregadosStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false) // Estado separado para búsqueda
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Cargar datos iniciales desde Django (solo una vez)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Cargar productos y estadísticas en paralelo
        const [productosResult, statsResult] = await Promise.allSettled([
          apiGet<any[]>(API_ENDPOINTS.PIEDRINERA.PRODUCTOS),
          apiGet<AgregadosStats>(API_ENDPOINTS.PIEDRINERA.PRODUCTOS_STATS),
        ])

        if (productosResult.status === 'fulfilled') {
          setAgregados(productosResult.value)
          setAllAgregados(productosResult.value) // Guardar todos para filtrado local
        } else {
          console.error('Error cargando productos:', productosResult.reason)
          setError('Error al cargar los agregados')
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
          description: "No se pudieron cargar los agregados. Por favor, intenta de nuevo.",
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
    // Limpiar timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Si no hay término de búsqueda, mostrar todos
    if (!searchTerm.trim()) {
      setAgregados(allAgregados)
      setSearching(false)
      return
    }

    // Mostrar estado de búsqueda
    setSearching(true)

    // Debounce: esperar 300ms antes de filtrar
    debounceTimer.current = setTimeout(() => {
      const term = searchTerm.toLowerCase().trim()
      const filtered = allAgregados.filter((agregado) => {
        return (
          agregado.nombre.toLowerCase().includes(term) ||
          agregado.codigo.toLowerCase().includes(term) ||
          agregado.tipo.toLowerCase().includes(term) ||
          (agregado.granulometria && agregado.granulometria.toLowerCase().includes(term)) ||
          (agregado.proveedor && agregado.proveedor.toLowerCase().includes(term))
        )
      })
      setAgregados(filtered)
      setSearching(false)
    }, 300)

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchTerm, allAgregados])

  const getStockStatus = (stock: number, stockMinimo: number) => {
    if (stock <= stockMinimo * 0.5) {
      return { status: "Crítico", color: "bg-red-500", textColor: "text-red-700" }
    } else if (stock <= stockMinimo) {
      return { status: "Bajo", color: "bg-yellow-500", textColor: "text-yellow-700" }
    } else {
      return { status: "Normal", color: "bg-green-500", textColor: "text-green-700" }
    }
  }

  const getCalidadBadge = (calidad?: string) => {
    if (!calidad) return null
    
    const variants = {
      Excelente: "default",
      Buena: "secondary",
      Regular: "outline",
    } as const

    return <Badge variant={variants[calidad as keyof typeof variants] || "outline"}>{calidad}</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agregados</h1>
            <p className="text-muted-foreground">Gestión de arena, grava, piedrín y otros agregados</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Agregados</h1>
            <p className="text-muted-foreground">Gestión de arena, grava, piedrín y otros agregados</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
          <h1 className="text-3xl font-bold tracking-tight">Agregados</h1>
          <p className="text-muted-foreground">Gestión de arena, grava, piedrín y otros agregados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button asChild>
            <Link href="/piedrinera/productos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Agregado
            </Link>
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Agregados</CardDescription>
              <CardTitle className="text-2xl">{stats.total_agregados}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Activos</CardDescription>
              <CardTitle className="text-2xl">{stats.agregados_activos}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Inactivos</CardDescription>
              <CardTitle className="text-2xl">{stats.agregados_inactivos}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Stock Bajo</CardDescription>
              <CardTitle className="text-2xl">{stats.agregados_stock_bajo}</CardTitle>
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
              placeholder="Buscar por nombre, tipo, código o proveedor..."
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

      {/* Grid de Agregados */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agregados.map((agregado) => {
          const stockStatus = getStockStatus(agregado.stock, agregado.stockMinimo)

          return (
            <Card key={agregado.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{agregado.nombre}</CardTitle>
                    <CardDescription>
                      {agregado.tipo} • {agregado.granulometria || 'N/A'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/piedrinera/productos/${agregado.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/piedrinera/productos/${agregado.id}/editar`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Package className="mr-2 h-4 w-4" />
                        Ajustar Stock
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stock */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Stock Actual</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stockStatus.color}`} />
                      <span className={`text-sm font-medium ${stockStatus.textColor}`}>{stockStatus.status}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {agregado.stock.toLocaleString()} m³
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Mínimo: {agregado.stockMinimo} m³
                  </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Precio:</span>
                    <div className="font-medium">Q{agregado.precioVenta.toFixed(2)}</div>
                  </div>
                  {agregado.ubicacion && (
                    <div>
                      <span className="text-muted-foreground">Ubicación:</span>
                      <div className="font-medium">{agregado.ubicacion}</div>
                    </div>
                  )}
                  {agregado.calidad && (
                    <div>
                      <span className="text-muted-foreground">Calidad:</span>
                      <div>{getCalidadBadge(agregado.calidad)}</div>
                    </div>
                  )}
                </div>

                {/* Proveedor */}
                {agregado.proveedor && (
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">Proveedor</div>
                    <div className="font-medium">{agregado.proveedor}</div>
                  </div>
                )}

                {/* Acciones rápidas */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href={`/piedrinera/productos/${agregado.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href={`/piedrinera/productos/${agregado.id}/editar`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Mensaje si no hay resultados */}
      {agregados.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron agregados</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "No hay agregados que coincidan con tu búsqueda."
                : "Aún no hay agregados registrados."}
            </p>
            <Button asChild>
              <Link href="/piedrinera/productos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Primer Agregado
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
