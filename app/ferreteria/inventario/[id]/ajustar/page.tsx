"use client"

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
import { ArrowLeft, Package, AlertCircle, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

interface AjustarInventarioItemPageProps {
  params: Promise<{
    id: string
  }>
}

interface ProductoFerreteria {
  id: string | number
  codigo: string
  nombre: string
  descripcion?: string
  categoria?: string
  precioVenta: number
  costoUnitario: number
  unidadMedida: string
  stockActual: number
  stockMinimo: number
  activo: boolean
}

export default function AjustarInventarioItemPage({ params }: AjustarInventarioItemPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { usuario } = useAuth()
  const { id } = use(params)
  
  const [producto, setProducto] = useState<ProductoFerreteria | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [tipoMovimiento, setTipoMovimiento] = useState<"ENTRADA" | "SALIDA" | "AJUSTE" | "TRANSFERENCIA" | "DEVOLUCION">("ENTRADA")
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(0)
  const [motivo, setMotivo] = useState<string>("")
  const [observaciones, setObservaciones] = useState<string>("")

  // Cargar producto desde Django
  useEffect(() => {
    const loadProducto = async () => {
      try {
        setLoading(true)
        // Construir URL correctamente
        const productoUrl = API_ENDPOINTS.FERRETERIA.PRODUCTOS.endsWith('/') 
          ? `${API_ENDPOINTS.FERRETERIA.PRODUCTOS}${id}/`
          : `${API_ENDPOINTS.FERRETERIA.PRODUCTOS}/${id}/`
        
        const productoRaw = await apiGet<any>(productoUrl)
        
        // Mapear datos del backend al formato del frontend
        const productoData: ProductoFerreteria = {
          id: String(productoRaw.id || productoRaw.pk || ''),
          codigo: productoRaw.codigo || '',
          nombre: productoRaw.nombre || '',
          descripcion: productoRaw.descripcion || '',
          categoria: productoRaw.categoria || productoRaw.categoria_nombre || productoRaw.categoria?.nombre || '',
          precioVenta: productoRaw.precio_venta || productoRaw.precioVenta || 0,
          costoUnitario: productoRaw.costo_unitario || productoRaw.costoUnitario || 0,
          unidadMedida: productoRaw.unidad_medida || productoRaw.unidad_medida_nombre || productoRaw.unidad_medida?.nombre || productoRaw.unidadMedida || '',
          stockActual: productoRaw.stock_actual || productoRaw.stockActual || 0,
          stockMinimo: productoRaw.stock_minimo || productoRaw.stockMinimo || 0,
          activo: productoRaw.activo !== undefined ? productoRaw.activo : true,
        }
        
        setProducto(productoData)
      } catch (error: any) {
        console.error('Error al cargar producto:', error)
        toast({
          title: "Error",
          description: error.message || "No se pudo cargar el producto. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
        router.replace("/ferreteria/inventario")
      } finally {
        setLoading(false)
      }
    }

    loadProducto()
  }, [id, router, toast])

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
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!motivo.trim() || cantidadAjuste === 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    // Validaciones según tipo de movimiento
    if (tipoMovimiento === "SALIDA" || tipoMovimiento === "TRANSFERENCIA") {
      if (producto.stockActual < cantidadAjuste) {
        toast({
          title: "Error de ajuste",
          description: `Stock insuficiente. Stock actual: ${producto.stockActual}`,
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

    if (!usuario || !usuario.id) {
      toast({
        title: "Error de autenticación",
        description: "No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Preparar datos para enviar a la API
      const movimientoData: any = {
        producto: Number(producto.id),
        usuario: usuario.id,
        tipo: tipoMovimiento,
        cantidad: cantidadAjuste,
        motivo: motivo.trim(),
      }

      // Agregar observaciones solo si tiene contenido
      if (observaciones.trim()) {
        movimientoData.observaciones = observaciones.trim()
      }

      await apiPost(API_ENDPOINTS.FERRETERIA.MOVIMIENTOS_INVENTARIO, movimientoData)

      toast({
        title: "Movimiento Registrado",
        description: `El movimiento de ${tipoMovimiento} para ${producto.nombre} ha sido registrado exitosamente.`,
      })

      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push("/ferreteria/inventario")
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
      return `Stock actual: ${producto.stockActual} → Stock nuevo: ${stockNuevo} (+${cantidadAjuste})`
    } else if (tipoMovimiento === "SALIDA" || tipoMovimiento === "TRANSFERENCIA") {
      stockNuevo = Math.max(0, producto.stockActual - cantidadAjuste)
      return `Stock actual: ${producto.stockActual} → Stock nuevo: ${stockNuevo} (-${cantidadAjuste})`
    } else if (tipoMovimiento === "AJUSTE") {
      stockNuevo = Math.max(0, producto.stockActual + cantidadAjuste)
      return `Stock actual: ${producto.stockActual} → Stock nuevo: ${stockNuevo} (${cantidadAjuste >= 0 ? '+' : ''}${cantidadAjuste})`
    }
    
    return ""
  }

  const diferenciaStock = producto.stockActual - producto.stockMinimo

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link href="/ferreteria/inventario">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Ajustar Inventario: {producto.nombre}</h1>
          <p className="text-muted-foreground">Realiza un ajuste manual de inventario para este producto.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Información del Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-semibold">{producto.nombre}</p>
                <p className="text-sm text-muted-foreground">Código: {producto.codigo}</p>
              </div>
            </div>
            <div className="pt-2 border-t space-y-2">
              {producto.categoria && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Categoría:</span>
                  <span className="text-sm font-medium">{producto.categoria}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Unidad:</span>
                <span className="text-sm font-medium capitalize">{producto.unidadMedida}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Precio Unitario:</span>
                <span className="text-sm font-medium">Q{producto.precioVenta.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Stock Actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-3xl font-bold">{producto.stockActual}</p>
              <p className="text-xs text-muted-foreground">Unidades en inventario</p>
            </div>
            <div className="pt-2 border-t space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stock Mínimo:</span>
                <span className="text-sm font-medium">{producto.stockMinimo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Diferencia:</span>
                <Badge variant={diferenciaStock >= 0 ? "secondary" : "destructive"}>
                  {diferenciaStock >= 0 ? "+" : ""}{diferenciaStock}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Valor Total:</span>
                <span className="text-sm font-medium">
                  Q{(producto.stockActual * producto.costoUnitario).toFixed(2)}
                </span>
              </div>
            </div>
            {producto.stockActual <= producto.stockMinimo && (
              <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded text-destructive text-sm mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>Stock bajo mínimo</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumen del Ajuste</CardTitle>
          </CardHeader>
          <CardContent>
            {cantidadAjuste !== 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {tipoMovimiento === "ENTRADA" || tipoMovimiento === "DEVOLUCION" ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : tipoMovimiento === "SALIDA" || tipoMovimiento === "TRANSFERENCIA" ? (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  ) : (
                    <Package className="h-5 w-5 text-blue-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {tipoMovimiento === "ENTRADA"
                        ? "Entrada"
                        : tipoMovimiento === "SALIDA"
                          ? "Salida"
                          : tipoMovimiento === "AJUSTE"
                            ? "Ajuste"
                            : tipoMovimiento === "TRANSFERENCIA"
                              ? "Transferencia"
                              : "Devolución"}
                    </p>
                    <p className="text-xs text-muted-foreground">Tipo de movimiento</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold text-muted-foreground">Previsualización:</p>
                  <p className="text-base font-medium mt-1">{getTextoAjuste()}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Completa el formulario para ver el resumen del ajuste.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit}>
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
                {tipoMovimiento === "AJUSTE" && "La cantidad puede ser positiva o negativa para ajustar el stock"}
                {tipoMovimiento === "ENTRADA" && "Incrementa el stock del producto"}
                {tipoMovimiento === "SALIDA" && "Disminuye el stock del producto (requiere stock suficiente)"}
                {tipoMovimiento === "TRANSFERENCIA" && "Transfiere stock a otra ubicación (requiere stock suficiente)"}
                {tipoMovimiento === "DEVOLUCION" && "Aumenta el stock por devolución de cliente"}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cantidadAjuste">
                {tipoMovimiento === "AJUSTE" ? "Cantidad de Ajuste (puede ser negativa)" : "Cantidad"}
              </Label>
              <Input
                id="cantidadAjuste"
                type="number"
                value={cantidadAjuste || ""}
                onChange={(e) => setCantidadAjuste(Number(e.target.value))}
                step="0.01"
                min={tipoMovimiento === "AJUSTE" ? undefined : "0.01"}
                required
                placeholder={tipoMovimiento === "AJUSTE" ? "Ej: 5 o -3" : "Ingresa la cantidad"}
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
                Ejemplo: "Compra a proveedor", "Venta", "Conteo físico", "Mercancía dañada", "Devolución de cliente", etc.
              </p>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones adicionales, número de factura, orden de compra, etc."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link href="/ferreteria/inventario">
            <Button type="button" variant="outline" disabled={submitting}>Cancelar</Button>
          </Link>
          <Button type="submit" disabled={!motivo.trim() || cantidadAjuste === 0 || submitting}>
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

