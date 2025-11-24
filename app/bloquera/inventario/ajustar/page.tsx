"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Package, AlertCircle, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

interface ProductoBloquera {
  id: string | number
  codigo: string
  nombre: string
  descripcion?: string
  tipoBloque?: string
  dimensiones?: string
  stockActual: number
  stockMinimo: number
  activo: boolean
}

export default function AjustarInventarioBloqueraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { usuario } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [productos, setProductos] = useState<ProductoBloquera[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const [itemSeleccionado, setItemSeleccionado] = useState<string>("")
  const [tipoMovimiento, setTipoMovimiento] = useState<"ENTRADA" | "SALIDA" | "AJUSTE" | "TRANSFERENCIA" | "DEVOLUCION">("ENTRADA")
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(0)
  const [motivo, setMotivo] = useState<string>("")
  const [observaciones, setObservaciones] = useState<string>("")

  // Cargar productos desde la API
  useEffect(() => {
    const loadProductos = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        params.append('activo', 'true')
        if (searchTerm) {
          params.append('search', searchTerm)
        }
        
        const productosResponse = await apiGet<any>(`${API_ENDPOINTS.BLOQUERA.PRODUCTOS}?${params.toString()}`)
        
        let productosData: ProductoBloquera[] = []
        if (Array.isArray(productosResponse)) {
          productosData = productosResponse
        } else if (productosResponse && Array.isArray(productosResponse.results)) {
          productosData = productosResponse.results
        } else if (productosResponse && productosResponse.data && Array.isArray(productosResponse.data)) {
          productosData = productosResponse.data
        }

        // Mapear datos del backend al formato del frontend
        productosData = productosData.map((p: any) => ({
          id: p.id || p.pk || '',
          codigo: p.codigo || '',
          nombre: p.nombre || '',
          descripcion: p.descripcion || '',
          tipoBloque: p.tipo_bloque || p.tipoBloque || '',
          dimensiones: p.dimensiones || '',
          stockActual: p.stock_actual || p.stockActual || 0,
          stockMinimo: p.stock_minimo || p.stockMinimo || 0,
          activo: p.activo !== undefined ? p.activo : true,
        }))

        setProductos(productosData)
      } catch (error) {
        console.error('Error al cargar productos:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProductos()
  }, [searchTerm, toast])

  const itemSeleccionadoData = productos.find((item) => String(item.id) === itemSeleccionado)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemSeleccionado || cantidadAjuste === 0 || !motivo.trim()) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    if (!itemSeleccionadoData) {
      toast({
        title: "Error",
        description: "Producto de inventario no encontrado.",
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
      if (itemSeleccionadoData.stockActual < cantidadAjuste) {
        toast({
          title: "Error de ajuste",
          description: `Stock insuficiente. Stock actual: ${itemSeleccionadoData.stockActual}`,
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
        producto: Number(itemSeleccionadoData.id), // El backend espera 'producto' no 'producto_id'
        usuario: usuario.id,
        tipo: tipoMovimiento,
        cantidad: cantidadAjuste, // Para AJUSTE, puede ser positiva o negativa
        motivo: motivo.trim(),
      }

      // Agregar observaciones solo si tiene contenido
      if (observaciones.trim()) {
        movimientoData.observaciones = observaciones.trim()
      }

      await apiPost(API_ENDPOINTS.BLOQUERA.MOVIMIENTOS_INVENTARIO, movimientoData)

      toast({
        title: "Movimiento Registrado",
        description: `El movimiento de ${tipoMovimiento} para ${itemSeleccionadoData.nombre} ha sido registrado exitosamente.`,
      })

      // Resetear formulario
      setItemSeleccionado("")
      setTipoMovimiento("ENTRADA")
      setCantidadAjuste(0)
      setMotivo("")
      setObservaciones("")

      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push("/bloquera/inventario")
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
    if (!itemSeleccionadoData || cantidadAjuste === 0) return ""
    
    let stockNuevo = itemSeleccionadoData.stockActual
    
    if (tipoMovimiento === "ENTRADA" || tipoMovimiento === "DEVOLUCION") {
      stockNuevo = itemSeleccionadoData.stockActual + cantidadAjuste
      return `Stock actual: ${itemSeleccionadoData.stockActual} → Stock nuevo: ${stockNuevo} (+${cantidadAjuste})`
    } else if (tipoMovimiento === "SALIDA" || tipoMovimiento === "TRANSFERENCIA") {
      stockNuevo = Math.max(0, itemSeleccionadoData.stockActual - cantidadAjuste)
      return `Stock actual: ${itemSeleccionadoData.stockActual} → Stock nuevo: ${stockNuevo} (-${cantidadAjuste})`
    } else if (tipoMovimiento === "AJUSTE") {
      // Para ajuste, la cantidad puede ser positiva o negativa
      // cantidadAjuste es la diferencia (puede ser +5 o -3, por ejemplo)
      stockNuevo = Math.max(0, itemSeleccionadoData.stockActual + cantidadAjuste)
      return `Stock actual: ${itemSeleccionadoData.stockActual} → Stock nuevo: ${stockNuevo} (${cantidadAjuste >= 0 ? '+' : ''}${cantidadAjuste})`
    }
    
    return ""
  }

  // Filtrar productos según búsqueda
  const productosFiltrados = productos.filter((p) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      p.codigo.toLowerCase().includes(search) ||
      p.nombre.toLowerCase().includes(search) ||
      (p.tipoBloque && p.tipoBloque.toLowerCase().includes(search)) ||
      (p.dimensiones && p.dimensiones.toLowerCase().includes(search))
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link href="/bloquera/inventario">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Ajustar Inventario de Bloquera</h1>
          <p className="text-muted-foreground">Realiza ajustes manuales de entrada, salida o corrección en el inventario de bloques.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="buscar">Buscar Producto</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="buscar"
                  type="search"
                  placeholder="Buscar por código, nombre, tipo o dimensiones..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="producto">Producto</Label>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Select value={itemSeleccionado} onValueChange={setItemSeleccionado}>
                  <SelectTrigger id="producto">
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productosFiltrados.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No se encontraron productos
                      </div>
                    ) : (
                      productosFiltrados.map((item) => (
                        <SelectItem key={String(item.id)} value={String(item.id)}>
                          <div className="flex items-center justify-between w-full">
                            <span>{item.codigo} - {item.nombre}</span>
                            <Badge variant={item.stockActual <= item.stockMinimo ? "destructive" : "secondary"} className="ml-2">
                              Stock: {item.stockActual}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {itemSeleccionadoData && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-semibold">{itemSeleccionadoData.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      Código: {itemSeleccionadoData.codigo} {itemSeleccionadoData.tipoBloque && `| Tipo: ${itemSeleccionadoData.tipoBloque}`}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Actual</p>
                    <p className="text-lg font-bold">{itemSeleccionadoData.stockActual}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Mínimo</p>
                    <p className="text-lg font-bold">{itemSeleccionadoData.stockMinimo}</p>
                  </div>
                </div>
                {itemSeleccionadoData.stockActual <= itemSeleccionadoData.stockMinimo && (
                  <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>El stock actual está por debajo del mínimo requerido</span>
                  </div>
                )}
              </div>
            )}
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
                step="1"
                min={tipoMovimiento === "AJUSTE" ? undefined : "1"}
                required
                placeholder={tipoMovimiento === "AJUSTE" ? "Ej: 5 o -3" : "Ingresa la cantidad"}
              />
            </div>
            {itemSeleccionadoData && cantidadAjuste !== 0 && (
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
          <Link href="/bloquera/inventario">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={!itemSeleccionado || cantidadAjuste === 0 || !motivo.trim() || submitting}>
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
