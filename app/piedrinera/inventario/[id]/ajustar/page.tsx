"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Package, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

interface AjustarInventarioPiedrineraPageProps {
  params: Promise<{
    id: string
  }>
}

interface ProductoPiedrinera {
  id: string | number
  codigo: string
  nombre: string
  descripcion?: string
  tipo?: string
  stockActual: number
  stockMinimo: number
  activo: boolean
}

export default function AjustarInventarioPiedrineraPage({ params }: AjustarInventarioPiedrineraPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { usuario } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [producto, setProducto] = useState<ProductoPiedrinera | null>(null)

  const [tipoMovimiento, setTipoMovimiento] = useState<"ENTRADA" | "SALIDA" | "AJUSTE" | "TRANSFERENCIA" | "DEVOLUCION">("ENTRADA")
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(0)
  const [motivo, setMotivo] = useState<string>("")
  const [observaciones, setObservaciones] = useState<string>("")

  // Cargar producto desde la API
  useEffect(() => {
    const loadProducto = async () => {
      try {
        setLoading(true)
        
        // Construir URL del endpoint para un producto específico
        const productoUrl = API_ENDPOINTS.PIEDRINERA.PRODUCTOS.endsWith('/')
          ? `${API_ENDPOINTS.PIEDRINERA.PRODUCTOS}${id}/`
          : `${API_ENDPOINTS.PIEDRINERA.PRODUCTOS}/${id}/`
        
        const productoResponse = await apiGet<any>(productoUrl)
        
        // Debug: Log para ver qué devuelve la API
        console.log('🔍 [Ajustar Inventario] Respuesta de la API:', productoResponse)
        
        // Mapear datos del backend al formato del frontend
        // El backend devuelve: stock_actual_m3, stock_minimo_m3 (snake_case)
        // También devuelve: stockActualMetrosCubicos, stockMinimoMetrosCubicos (camelCase)
        // Convertir a número para asegurar que sean valores numéricos
        const stockActualValue = productoResponse.stock_actual_m3 ?? 
                                 productoResponse.stockActualMetrosCubicos ?? 
                                 productoResponse.stock_actual ?? 
                                 productoResponse.stock ?? 
                                 0
        const stockMinimoValue = productoResponse.stock_minimo_m3 ?? 
                                 productoResponse.stockMinimoMetrosCubicos ?? 
                                 productoResponse.stock_minimo ?? 
                                 productoResponse.stockMinimo ?? 
                                 0
        
        const productoData: ProductoPiedrinera = {
          id: String(productoResponse.id || productoResponse.pk || ''),
          codigo: productoResponse.codigo || '',
          nombre: productoResponse.nombre || '',
          descripcion: productoResponse.descripcion || null,
          tipo: productoResponse.tipo || null,
          stockActual: Number(stockActualValue) || 0,
          stockMinimo: Number(stockMinimoValue) || 0,
          activo: productoResponse.activo !== undefined ? productoResponse.activo : true,
        }
        
        // Debug: Log del producto mapeado
        console.log('🔍 [Ajustar Inventario] Producto mapeado:', productoData)

        setProducto(productoData)
      } catch (error) {
        console.error('Error al cargar producto:', error)
        toast({
          title: "Error",
          description: "No se pudo cargar el producto. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
        router.replace("/piedrinera/inventario")
      } finally {
        setLoading(false)
      }
    }

    loadProducto()
  }, [id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!producto) {
      toast({
        title: "Error",
        description: "Producto no encontrado.",
        variant: "destructive",
      })
      return
    }

    if (cantidadAjuste === 0 || !motivo.trim()) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    if (!usuario || !usuario.id) {
      toast({
        title: "Error de autenticación",
        description: "No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.",
        variant: "destructive",
      })
      return
    }

    // Validaciones según tipo de movimiento
    if (tipoMovimiento === "SALIDA" || tipoMovimiento === "TRANSFERENCIA") {
      if (producto.stockActual < cantidadAjuste) {
        toast({
          title: "Error de ajuste",
          description: `Stock insuficiente. Stock actual: ${producto.stockActual.toFixed(2)} m³`,
          variant: "destructive",
        })
        return
      }
      if (cantidadAjuste <= 0) {
        toast({
          title: "Error de ajuste",
          description: "La cantidad debe ser mayor a 0 para este tipo de movimiento.",
          variant: "destructive",
        })
        return
      }
    }

    if (tipoMovimiento === "ENTRADA" || tipoMovimiento === "DEVOLUCION") {
      if (cantidadAjuste <= 0) {
        toast({
          title: "Error de ajuste",
          description: "La cantidad debe ser mayor a 0 para este tipo de movimiento.",
          variant: "destructive",
        })
        return
      }
    }

    // Para AJUSTE, la cantidad puede ser positiva o negativa, pero no puede ser 0
    if (tipoMovimiento === "AJUSTE" && cantidadAjuste === 0) {
      toast({
        title: "Error de ajuste",
        description: "La cantidad de ajuste no puede ser 0.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Preparar datos para enviar a la API según documentación
      const movimientoData: any = {
        producto: Number(producto.id), // El backend espera 'producto' no 'producto_id'
        usuario: usuario.id,
        tipo: tipoMovimiento,
        cantidad: cantidadAjuste, // Para AJUSTE, puede ser positiva o negativa (decimales permitidos)
        motivo: motivo.trim(),
      }

      // Agregar observaciones solo si tiene contenido
      if (observaciones.trim()) {
        movimientoData.observaciones = observaciones.trim()
      }

      await apiPost(API_ENDPOINTS.PIEDRINERA.MOVIMIENTOS_INVENTARIO, movimientoData)

      toast({
        title: "Movimiento Registrado",
        description: `El movimiento de ${tipoMovimiento} para ${producto.nombre} ha sido registrado exitosamente.`,
      })

      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push("/piedrinera/inventario")
      }, 1500)
    } catch (error: any) {
      console.error('Error al ajustar inventario:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo realizar el ajuste de inventario. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getTextoAjuste = () => {
    if (!producto || cantidadAjuste === 0) return ""
    
    let stockNuevo = producto.stockActual
    
    if (tipoMovimiento === "ENTRADA" || tipoMovimiento === "DEVOLUCION") {
      stockNuevo = producto.stockActual + cantidadAjuste
      return `Stock actual: ${producto.stockActual.toFixed(2)} m³ → Stock nuevo: ${stockNuevo.toFixed(2)} m³ (+${cantidadAjuste.toFixed(2)} m³)`
    } else if (tipoMovimiento === "SALIDA" || tipoMovimiento === "TRANSFERENCIA") {
      stockNuevo = Math.max(0, producto.stockActual - cantidadAjuste)
      return `Stock actual: ${producto.stockActual.toFixed(2)} m³ → Stock nuevo: ${stockNuevo.toFixed(2)} m³ (-${cantidadAjuste.toFixed(2)} m³)`
    } else if (tipoMovimiento === "AJUSTE") {
      // Para ajuste, la cantidad puede ser positiva o negativa
      // cantidadAjuste es la diferencia (puede ser +5.5 o -2.3, por ejemplo)
      stockNuevo = Math.max(0, producto.stockActual + cantidadAjuste)
      return `Stock actual: ${producto.stockActual.toFixed(2)} m³ → Stock nuevo: ${stockNuevo.toFixed(2)} m³ (${cantidadAjuste >= 0 ? '+' : ''}${cantidadAjuste.toFixed(2)} m³)`
    }
    
    return ""
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-destructive">Producto no encontrado</p>
              <Link href="/piedrinera/inventario">
                <Button>Volver al Inventario</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link href="/piedrinera/inventario">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Ajustar Inventario: {producto.nombre}</h1>
          <p className="text-muted-foreground">
            Realiza ajustes manuales de entrada, salida o corrección en el inventario de agregados (metros cúbicos).
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Agregado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-semibold">{producto.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    Código: {producto.codigo} {producto.tipo && `| Tipo: ${producto.tipo}`}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Stock Actual (m³)</p>
                  <p className="text-lg font-bold">{producto.stockActual.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock Mínimo (m³)</p>
                  <p className="text-lg font-bold">{producto.stockMinimo.toFixed(2)}</p>
                </div>
              </div>
              {producto.stockActual <= producto.stockMinimo && (
                <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>El stock actual está por debajo del mínimo requerido</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles del Ajuste</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="tipoMovimiento">Tipo de Movimiento</Label>
              <Select value={tipoMovimiento} onValueChange={(value: "ENTRADA" | "SALIDA" | "AJUSTE" | "TRANSFERENCIA" | "DEVOLUCION") => {
                setTipoMovimiento(value)
                setCantidadAjuste(0)
              }}>
                <SelectTrigger id="tipoMovimiento">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada (Aumento de stock)</SelectItem>
                  <SelectItem value="SALIDA">Salida (Disminución de stock)</SelectItem>
                  <SelectItem value="AJUSTE">Ajuste (Ajuste de inventario)</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferencia (Transferencia a otra ubicación)</SelectItem>
                  <SelectItem value="DEVOLUCION">Devolución (Devolución de producto)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {tipoMovimiento === "AJUSTE" && "La cantidad puede ser positiva o negativa para ajustar el stock (decimales permitidos)"}
                {tipoMovimiento === "ENTRADA" && "Incrementa el stock del agregado (metros cúbicos)"}
                {tipoMovimiento === "SALIDA" && "Disminuye el stock del agregado (requiere stock suficiente)"}
                {tipoMovimiento === "TRANSFERENCIA" && "Transfiere stock a otra ubicación (requiere stock suficiente)"}
                {tipoMovimiento === "DEVOLUCION" && "Aumenta el stock por devolución de cliente"}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cantidadAjuste">
                {tipoMovimiento === "AJUSTE" ? "Cantidad de Ajuste (m³, puede ser negativa)" : "Cantidad (m³)"}
              </Label>
              <Input
                id="cantidadAjuste"
                type="number"
                value={cantidadAjuste || ""}
                onChange={(e) => setCantidadAjuste(Number(e.target.value))}
                step="0.01"
                min={tipoMovimiento === "AJUSTE" ? undefined : "0.01"}
                required
                placeholder={tipoMovimiento === "AJUSTE" ? "Ej: 5.5 o -2.3" : "Ingresa la cantidad en m³"}
              />
            </div>
            {producto && cantidadAjuste !== 0 && (
              <div className="md:col-span-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {getTextoAjuste()}
                </p>
              </div>
            )}
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="motivo">Motivo del Movimiento *</Label>
              <Textarea
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Describe el motivo del movimiento de inventario..."
                rows={3}
                required
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Ejemplo: "Extracción", "Venta", "Conteo físico", "Pérdida por evaporación", "Devolución de cliente", etc.
              </p>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones adicionales, número de factura, orden de compra, cantera, etc."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link href="/piedrinera/inventario">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={cantidadAjuste === 0 || !motivo.trim() || submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Aplicar Ajuste"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
