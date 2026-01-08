"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPut } from "@/lib/api-client"

interface Categoria {
  id: number
  nombre: string
  descripcion: string
  activo: boolean
}

interface UnidadMedida {
  id: number
  nombre: string
  abreviatura: string
  activo: boolean
}

interface Producto {
  id: number
  codigo: string
  nombre: string
  descripcion: string | null
  categoria_id: number
  unidad_medida_id: number
  precio_venta: number
  precio_descuento?: number | null
  costo_unitario: number
  stock_actual: number
  stock_minimo: number
  proveedor?: string | null
  activo: boolean
}

interface EditarProductoPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditarProductoPage({ params }: EditarProductoPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = use(params)

  const [codigo, setCodigo] = useState<string>("")
  const [nombre, setNombre] = useState<string>("")
  const [descripcion, setDescripcion] = useState<string>("")
  const [categoriaId, setCategoriaId] = useState<string>("")
  const [precioVenta, setPrecioVenta] = useState<number>(0)
  const [precioDescuento, setPrecioDescuento] = useState<number | null>(null)
  const [costoUnitario, setCostoUnitario] = useState<number>(0)
  const [unidadMedidaId, setUnidadMedidaId] = useState<string>("")
  const [stockActual, setStockActual] = useState<number>(0)
  const [stockMinimo, setStockMinimo] = useState<number>(0)
  const [proveedor, setProveedor] = useState<string>("")
  const [activo, setActivo] = useState<boolean>(true)

  // Estados para cargar datos desde la API
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Lista de proveedores comunes
  const proveedoresComunes = [
    "Distribuidora Técnica",
    "Repuestos Maquinaria",
    "Autopartes Premium",
    "Lubricantes Industriales",
    "Repuestos CAT",
    "Repuestos JCB",
    "Volvo Parts",
    "Ferretería Central",
    "Distribuidora Nacional",
    "Importadora de Herramientas",
  ]

  // Cargar producto, categorías y unidades de medida desde Django
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // Construir URL correctamente removiendo el slash final si existe
        const productoUrl = API_ENDPOINTS.FERRETERIA.PRODUCTOS.endsWith('/') 
          ? `${API_ENDPOINTS.FERRETERIA.PRODUCTOS}${id}/`
          : `${API_ENDPOINTS.FERRETERIA.PRODUCTOS}/${id}/`
        
        const [productoData, categoriasData, unidadesData] = await Promise.all([
          apiGet<Producto>(productoUrl),
          apiGet<Categoria[]>(API_ENDPOINTS.FERRETERIA.CATEGORIAS),
          apiGet<UnidadMedida[]>(API_ENDPOINTS.FERRETERIA.UNIDADES_MEDIDA),
        ])

        // Manejar respuesta paginada o directa para categorías y unidades
        const categoriasList = Array.isArray(categoriasData) 
          ? categoriasData 
          : ((categoriasData as any)?.results || (categoriasData as any)?.data || [])
        
        const unidadesList = Array.isArray(unidadesData) 
          ? unidadesData 
          : ((unidadesData as any)?.results || (unidadesData as any)?.data || [])

        setCategorias(categoriasList)
        setUnidadesMedida(unidadesList)

        // Debug: ver qué datos está recibiendo
        console.log('🔍 [Editar Producto] Datos recibidos del producto:', productoData)

        // Cargar datos del producto
        setCodigo(productoData.codigo || '')
        setNombre(productoData.nombre || '')
        setDescripcion(productoData.descripcion || "")
        setCategoriaId(String(productoData.categoria_id || ''))
        setPrecioVenta(productoData.precio_venta || 0)
        setPrecioDescuento(productoData.precio_descuento ?? null)
        setCostoUnitario(productoData.costo_unitario || 0)
        setUnidadMedidaId(String(productoData.unidad_medida_id || ''))
        setStockActual(productoData.stock_actual || 0)
        setStockMinimo(productoData.stock_minimo || 0)
        setProveedor(productoData.proveedor || "")
        setActivo(productoData.activo ?? true)
      } catch (err: any) {
        console.error('Error al cargar datos:', err)
        toast({
          title: "Error",
          description: err.message || "No se pudieron cargar los datos del producto.",
          variant: "destructive",
        })
        router.replace("/ferreteria/productos")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, router, toast])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Cargando producto...</span>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigo || !nombre || !categoriaId || precioVenta < 0 || costoUnitario < 0 || !unidadMedidaId) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios y asegúrate de que los precios sean válidos.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const productoData = {
        codigo,
        nombre,
        descripcion: descripcion || null,
        categoria_id: Number(categoriaId),
        unidad_medida_id: Number(unidadMedidaId),
        precio_venta: precioVenta,
        precio_descuento: precioDescuento,
        costo_unitario: costoUnitario,
        stock_actual: stockActual,
        stock_minimo: stockMinimo,
        proveedor: proveedor || null,
        activo,
      }

      // Construir URL correctamente removiendo el slash final si existe
      const productoUrl = API_ENDPOINTS.FERRETERIA.PRODUCTOS.endsWith('/') 
        ? `${API_ENDPOINTS.FERRETERIA.PRODUCTOS}${id}/`
        : `${API_ENDPOINTS.FERRETERIA.PRODUCTOS}/${id}/`
      
      await apiPut(productoUrl, productoData)

      toast({
        title: "Producto Actualizado",
        description: `El producto ${nombre} ha sido actualizado exitosamente.`,
      })
      router.push(`/ferreteria/productos/${id}`)
    } catch (error: any) {
      console.error("Error al actualizar producto:", error)
      
      // Manejar errores de validación de Django
      // El error ya viene parseado desde apiPut con el mensaje correcto
      let errorMessage = error.message || "No se pudo actualizar el producto. Por favor, intenta nuevamente."
      
      toast({
        title: "Error",
        description: errorMessage,
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
        <h1 className="text-3xl font-bold">Editar Producto: {nombre || "Cargando..."}</h1>
      </div>
      <p className="text-muted-foreground">Modifica la información del producto.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Producto</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Código único del producto"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del producto"
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción detallada del producto"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoría</Label>
              {loading ? (
                <div className="flex items-center gap-2 h-10">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Cargando categorías...</span>
                </div>
              ) : (
                <Select value={categoriaId} onValueChange={setCategoriaId} required>
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias
                      .filter((cat) => cat.activo)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unidadMedida">Unidad de Medida</Label>
              {loading ? (
                <div className="flex items-center gap-2 h-10">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Cargando unidades...</span>
                </div>
              ) : (
                <Select value={unidadMedidaId} onValueChange={setUnidadMedidaId} required>
                  <SelectTrigger id="unidadMedida">
                    <SelectValue placeholder="Selecciona unidad de medida" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesMedida
                      .filter((unidad) => unidad.activo)
                      .map((unidad) => (
                        <SelectItem key={unidad.id} value={String(unidad.id)}>
                          {unidad.nombre} ({unidad.abreviatura})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="precioVenta">Precio de Venta (Q)</Label>
              <Input
                id="precioVenta"
                type="number"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(Number(e.target.value))}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="precioDescuento">Precio con Descuento (Q)</Label>
              <Input
                id="precioDescuento"
                type="number"
                value={precioDescuento ?? ""}
                onChange={(e) => setPrecioDescuento(e.target.value ? Number(e.target.value) : null)}
                step="0.01"
                min="0"
                placeholder="Opcional - Precio con descuento aplicado"
              />
              <p className="text-xs text-muted-foreground">
                Deja vacío si no hay descuento. Este precio se mostrará como oferta.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="costoUnitario">Costo Unitario (Q)</Label>
              <Input
                id="costoUnitario"
                type="number"
                value={costoUnitario}
                onChange={(e) => setCostoUnitario(Number(e.target.value))}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockActual">Stock Actual</Label>
              <Input
                id="stockActual"
                type="number"
                value={stockActual}
                onChange={(e) => setStockActual(Number(e.target.value))}
                min="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockMinimo">Stock Mínimo</Label>
              <Input
                id="stockMinimo"
                type="number"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(Number(e.target.value))}
                min="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                list="proveedores-list"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                placeholder="Selecciona o escribe un proveedor"
              />
              <datalist id="proveedores-list">
                {proveedoresComunes.map((prov) => (
                  <option key={prov} value={prov} />
                ))}
              </datalist>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="activo" checked={activo} onCheckedChange={setActivo} />
              <Label htmlFor="activo">Producto Activo</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
