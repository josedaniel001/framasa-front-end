"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

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

export default function NuevoProductoPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [codigo, setCodigo] = useState<string>("")
  const [nombre, setNombre] = useState<string>("")
  const [descripcion, setDescripcion] = useState<string>("")
  const [categoriaId, setCategoriaId] = useState<string>("")
  const [precioVenta, setPrecioVenta] = useState<number>(0)
  const [costoUnitario, setCostoUnitario] = useState<number>(0)
  const [unidadMedidaId, setUnidadMedidaId] = useState<string>("")
  const [stockActual, setStockActual] = useState<number>(0)
  const [stockMinimo, setStockMinimo] = useState<number>(0)
  const [activo, setActivo] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Estados para cargar datos desde la API
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar categorías y unidades de medida desde Django
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [categoriasData, unidadesData] = await Promise.all([
          apiGet<Categoria[]>(API_ENDPOINTS.FERRETERIA.CATEGORIAS),
          apiGet<UnidadMedida[]>(API_ENDPOINTS.FERRETERIA.UNIDADES_MEDIDA),
        ])

        // Manejar respuesta paginada o directa
        const categoriasList = Array.isArray(categoriasData) 
          ? categoriasData 
          : ((categoriasData as any)?.results || (categoriasData as any)?.data || [])
        
        const unidadesList = Array.isArray(unidadesData) 
          ? unidadesData 
          : ((unidadesData as any)?.results || (unidadesData as any)?.data || [])

        setCategorias(categoriasList)
        setUnidadesMedida(unidadesList)
      } catch (err) {
        console.error('Error al cargar categorías y unidades:', err)
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías y unidades de medida.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

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

    const productoData = {
      codigo,
      nombre,
      descripcion: descripcion || null,
      categoria_id: Number(categoriaId),
      unidad_medida_id: Number(unidadMedidaId),
      precio_venta: precioVenta,
      costo_unitario: costoUnitario,
      stock_actual: stockActual,
      stock_minimo: stockMinimo,
      activo,
    }

    try {
      setSubmitting(true)

      await apiPost(API_ENDPOINTS.FERRETERIA.PRODUCTOS, productoData)

      toast({
        title: "Producto Creado",
        description: `El producto ${nombre} ha sido registrado exitosamente.`,
      })
      router.push("/ferreteria/productos")
    } catch (error: any) {
      console.error("Error al crear producto:", error)
      console.error("URL:", API_ENDPOINTS.FERRETERIA.PRODUCTOS)
      console.error("Datos enviados:", productoData)
      
      let errorMessage = "No se pudo crear el producto. Por favor, intenta nuevamente."
      
      if (error.status === 405) {
        errorMessage = "El método POST no está permitido en este endpoint de Django. Verifica que el ViewSet o View tenga configurado el método 'create' o 'post' en Django REST Framework."
      } else if (error.message) {
        errorMessage = error.message
      }
      
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
      <h1 className="text-3xl font-bold">Nuevo Producto</h1>
      <p className="text-muted-foreground">Registra un nuevo producto en el catálogo de ferretería.</p>

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
                Creando...
              </>
            ) : (
              "Crear Producto"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
