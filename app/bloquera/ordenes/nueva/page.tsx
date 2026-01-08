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
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

interface ProductoBloquera {
  id: string
  codigo: string
  nombre: string
  dimensiones?: string
}

export default function NuevaOrdenBloqueraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [productosBloquera, setProductosBloquera] = useState<ProductoBloquera[]>([])

  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("")
  const [cantidadSolicitada, setCantidadSolicitada] = useState<number>(0)
  const [fechaInicio, setFechaInicio] = useState<string>(new Date().toISOString().split("T")[0])
  const [fechaFinEstimada, setFechaFinEstimada] = useState<string>("")
  const [responsable, setResponsable] = useState<string>("")
  const [notas, setNotas] = useState<string>("")

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = async () => {
    try {
      setLoadingProductos(true)
      const data = await apiGet<ProductoBloquera[]>(API_ENDPOINTS.BLOQUERA.PRODUCTOS)
      // Filtrar solo productos activos
      const productosActivos = data.filter((p: any) => p.activo !== false)
      setProductosBloquera(productosActivos)
    } catch (error: any) {
      console.error("Error al cargar productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoadingProductos(false)
    }
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
      setLoading(true)

      const ordenData = {
        producto: productoSeleccionado,
        cantidad_solicitada: cantidadSolicitada,
        fecha_inicio: fechaInicio,
        fecha_fin_estimada: fechaFinEstimada || null,
        supervisor: responsable,
        notas: notas || null,
        estado: "PENDIENTE",
      }

      const nuevaOrden = await apiPost(API_ENDPOINTS.BLOQUERA.ORDENES_PRODUCCION, ordenData)

      toast({
        title: "Orden de Producción Creada",
        description: `La orden ${nuevaOrden.codigo} ha sido registrada exitosamente.`,
      })
      router.push("/bloquera/ordenes")
    } catch (error: any) {
      console.error("Error al crear orden:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la orden de producción",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingProductos) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nueva Orden de Producción</h1>
      <p className="text-muted-foreground">Crea una nueva orden para la fabricación de bloques.</p>

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
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="responsable">Responsable *</Label>
              <Input
                id="responsable"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Nombre del encargado de la producción"
                required
              />
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
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Orden
          </Button>
        </div>
      </form>
    </div>
  )
}
