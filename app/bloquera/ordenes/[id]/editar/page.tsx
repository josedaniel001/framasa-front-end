"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPut } from "@/lib/api-client"
import { ArrowLeft, Loader2 } from "lucide-react"

interface EditarOrdenBloqueraPageProps {
  params: Promise<{ id: string }>
}

interface ProductoBloquera {
  id: string
  codigo: string
  nombre: string
  dimensiones?: string
}

interface OrdenProduccion {
  id: string
  codigo: string
  productoId: string
  producto_id: string
  nombreProducto: string
  cantidadSolicitada: number
  cantidad_solicitada: number
  cantidadProducida: number
  cantidad_producida_total: number
  fechaInicio: string
  fecha_inicio: string
  fechaFinEstimada?: string
  fecha_fin_estimada?: string
  responsable?: string
  supervisor?: string
  notas?: string
  estado: string
  estadoDisplay: string
}

export default function EditarOrdenBloqueraPage({ params }: EditarOrdenBloqueraPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orden, setOrden] = useState<OrdenProduccion | null>(null)
  const [productosBloquera, setProductosBloquera] = useState<ProductoBloquera[]>([])

  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("")
  const [cantidadSolicitada, setCantidadSolicitada] = useState<number>(0)
  const [fechaInicio, setFechaInicio] = useState<string>("")
  const [fechaFinEstimada, setFechaFinEstimada] = useState<string>("")
  const [responsable, setResponsable] = useState<string>("")
  const [notas, setNotas] = useState<string>("")
  const [estadoOrden, setEstadoOrden] = useState<string>("PENDIENTE")

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      setLoadingProductos(true)

      const [ordenData, productosData] = await Promise.all([
        apiGet<OrdenProduccion>(API_ENDPOINTS.BLOQUERA.ORDENES_PRODUCCION + `${id}/`),
        apiGet<ProductoBloquera[]>(API_ENDPOINTS.BLOQUERA.PRODUCTOS)
      ])

      setOrden(ordenData)
      const productosActivos = productosData.filter((p: any) => p.activo !== false)
      setProductosBloquera(productosActivos)

      // Inicializar formulario con datos de la orden
      setProductoSeleccionado(ordenData.productoId || ordenData.producto_id || "")
      setCantidadSolicitada(ordenData.cantidadSolicitada || ordenData.cantidad_solicitada || 0)
      setFechaInicio(ordenData.fechaInicio || ordenData.fecha_inicio || "")
      setFechaFinEstimada(ordenData.fechaFinEstimada || ordenData.fecha_fin_estimada || "")
      setResponsable(ordenData.responsable || ordenData.supervisor || "")
      setNotas(ordenData.notas || "")
      setEstadoOrden(ordenData.estado || "PENDIENTE")

    } catch (error: any) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de la orden",
        variant: "destructive",
      })
      router.replace("/bloquera/ordenes")
    } finally {
      setLoading(false)
      setLoadingProductos(false)
    }
  }

  if (loading || loadingProductos) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!orden) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!productoSeleccionado || cantidadSolicitada <= 0 || !fechaInicio || !responsable) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    const producto = productosBloquera.find((p) => p.id === productoSeleccionado)
    if (!producto) {
      toast({
        title: "Error",
        description: "Producto seleccionado no válido.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const ordenData = {
        producto: productoSeleccionado,
        cantidad_solicitada: cantidadSolicitada,
        fecha_inicio: fechaInicio,
        fecha_fin_estimada: fechaFinEstimada || null,
        supervisor: responsable,
        notas: notas || null,
        estado: estadoOrden,
      }

      await apiPut(API_ENDPOINTS.BLOQUERA.ORDENES_PRODUCCION + `${id}/`, ordenData)

      toast({
        title: "Orden de Producción Actualizada",
        description: `La orden ${orden.codigo} ha sido actualizada exitosamente.`,
      })
      router.push(`/bloquera/ordenes/${id}`)
    } catch (error: any) {
      console.error("Error al actualizar orden:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la orden de producción",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Orden: {orden.codigo}</h1>
      </div>
      <p className="text-muted-foreground">Modifica los detalles de la orden de producción existente.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Orden</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="producto">Producto a Producir *</Label>
              <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
                <SelectTrigger id="producto">
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {productosBloquera.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id}>
                      {producto.nombre} {producto.dimensiones ? `(${producto.dimensiones})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cantidadSolicitada">Cantidad Solicitada *</Label>
              <Input
                id="cantidadSolicitada"
                type="number"
                value={cantidadSolicitada}
                onChange={(e) => setCantidadSolicitada(Number(e.target.value))}
                min="1"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaFinEstimada">Fecha Fin Estimada</Label>
              <Input
                id="fechaFinEstimada"
                type="date"
                value={fechaFinEstimada}
                onChange={(e) => setFechaFinEstimada(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="responsable">Responsable *</Label>
              <Input
                id="responsable"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Nombre del encargado de la producción"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado de la Orden</Label>
              <Select
                value={estadoOrden}
                onValueChange={setEstadoOrden}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                  <SelectItem value="COMPLETADA">Completada</SelectItem>
                  <SelectItem value="CANCELADA">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea
                id="notas"
                placeholder="Cualquier nota relevante sobre la orden de producción..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
