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
import { Loader2, Sparkles, Brain, TrendingUp } from "lucide-react"
import { sugerirCodigoProducto } from "@/lib/codigo-generator"
import { calcularPrecioSugeridoSync } from "@/lib/precio-sugerido"

export default function NuevoAgregadoPiedrineraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [productosExistentes, setProductosExistentes] = useState<Array<{ codigo: string }>>([])

  const [codigo, setCodigo] = useState<string>("")
  const [nombre, setNombre] = useState<string>("")
  const [descripcion, setDescripcion] = useState<string>("")
  const [tipo, setTipo] = useState<string>("")
  const [granulometria, setGranulometria] = useState<string>("")
  const [precioVentaPorMetroCubico, setPrecioVentaPorMetroCubico] = useState<number>(0)
  const [costoProduccionPorMetroCubico, setCostoProduccionPorMetroCubico] = useState<number>(0)
  const [stockActualMetrosCubicos, setStockActualMetrosCubicos] = useState<number>(0)
  const [stockMinimoMetrosCubicos, setStockMinimoMetrosCubicos] = useState<number>(0)
  const [ubicacion, setUbicacion] = useState<string>("")
  const [humedadPorcentaje, setHumedadPorcentaje] = useState<number | undefined>(undefined)
  const [calidad, setCalidad] = useState<string>("")
  const [proveedor, setProveedor] = useState<string>("")
  const [fechaUltimaEntrada, setFechaUltimaEntrada] = useState<string>("")
  const [activo, setActivo] = useState<boolean>(true)
  const [precioSugerido, setPrecioSugerido] = useState<number | null>(null)
  const [mostrarSugerencia, setMostrarSugerencia] = useState(false)

  // Cargar productos existentes para generar códigos únicos
  useEffect(() => {
    const loadProductos = async () => {
      try {
        const productosData = await apiGet<any>(API_ENDPOINTS.PIEDRINERA.PRODUCTOS).catch(() => ({ results: [], data: [] }))
        const productosList = Array.isArray(productosData) 
          ? productosData 
          : ((productosData as any)?.results || (productosData as any)?.data || [])
        setProductosExistentes(productosList.map((p: any) => ({ codigo: p.codigo || '' })))
      } catch (error) {
        console.error('Error al cargar productos existentes:', error)
      }
    }
    loadProductos()
  }, [])

  // Función para generar código automático
  const generarCodigoAutomatico = () => {
    if (!nombre || !tipo) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, ingresa el nombre y selecciona el tipo para generar el código automático.",
        variant: "destructive",
      })
      return
    }

    const codigoSugerido = sugerirCodigoProducto(
      'PIEDRINERA',
      tipo,
      nombre,
      productosExistentes
    )

    setCodigo(codigoSugerido)
    toast({
      title: "Código generado",
      description: `Se ha generado el código: ${codigoSugerido}`,
    })
  }

  // Generar código automáticamente cuando cambien nombre o tipo (solo si el campo está vacío)
  useEffect(() => {
    if (nombre && tipo && !codigo) {
      const codigoSugerido = sugerirCodigoProducto(
        'PIEDRINERA',
        tipo,
        nombre,
        productosExistentes
      )
      setCodigo(codigoSugerido)
    }
  }, [nombre, tipo, productosExistentes])

  // Función para calcular precio sugerido
  const calcularPrecioSugerido = () => {
    if (!costoProduccionPorMetroCubico || costoProduccionPorMetroCubico <= 0) {
      toast({
        title: "Costo requerido",
        description: "Por favor, ingresa un costo de producción válido para calcular el precio sugerido.",
        variant: "destructive",
      })
      return
    }

    const resultado = calcularPrecioSugeridoSync({
      costoUnitario: costoProduccionPorMetroCubico,
      tipoModulo: 'PIEDRINERA',
      categoria: tipo,
      nombre,
    })

    setPrecioSugerido(resultado.precio)
    setMostrarSugerencia(true)
    
    toast({
      title: "Precio Sugerido",
      description: `Precio sugerido: Q${resultado.precio.toFixed(2)} por m³ (${resultado.porcentajeGanancia}% de ganancia)`,
    })
  }

  // Aplicar precio sugerido
  const aplicarPrecioSugerido = () => {
    if (precioSugerido) {
      setPrecioVentaPorMetroCubico(precioSugerido)
      toast({
        title: "Precio aplicado",
        description: `Se ha aplicado el precio sugerido de Q${precioSugerido.toFixed(2)} por m³`,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !codigo ||
      !nombre ||
      !tipo ||
      precioVentaPorMetroCubico <= 0 ||
      costoProduccionPorMetroCubico <= 0
    ) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios y asegúrate de que los precios sean válidos.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Preparar datos para enviar a la API
      const newAgregado = {
        codigo,
        nombre,
        descripcion: descripcion || null,
        tipo,
        granulometria: granulometria || null,
        precio_venta_m3: precioVentaPorMetroCubico,
        costo_produccion_m3: costoProduccionPorMetroCubico,
        stock_actual_m3: stockActualMetrosCubicos,
        stock_minimo_m3: stockMinimoMetrosCubicos,
        ubicacion: ubicacion || null,
        humedad_porcentaje: humedadPorcentaje || null,
        calidad: calidad || null,
        proveedor: proveedor || null,
        fecha_ultima_entrada: fechaUltimaEntrada || null,
        activo,
      }

      await apiPost(API_ENDPOINTS.PIEDRINERA.PRODUCTOS, newAgregado)

      toast({
        title: "Agregado Creado",
        description: `El agregado ${nombre} ha sido registrado exitosamente.`,
      })
      router.push("/piedrinera/productos")
    } catch (error: any) {
      console.error("Error al crear agregado:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el agregado. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nuevo Agregado</h1>
      <p className="text-muted-foreground">Registra un nuevo tipo de agregado (arena, grava, piedrín).</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Agregado</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="codigo">Código *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generarCodigoAutomatico}
                  disabled={!nombre || !tipo || loading}
                  className="h-7 text-xs"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  Generar automático
                </Button>
              </div>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Código único del agregado (se genera automáticamente)"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Arena de Río, Grava 3/4"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción detallada del agregado"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={tipo} onValueChange={setTipo} disabled={loading}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arena">Arena</SelectItem>
                  <SelectItem value="Grava">Grava</SelectItem>
                  <SelectItem value="Piedrín">Piedrín</SelectItem>
                  <SelectItem value="Mezcla">Mezcla</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="granulometria">Granulometría</Label>
              <Input
                id="granulometria"
                value={granulometria}
                onChange={(e) => setGranulometria(e.target.value)}
                placeholder="Ej: 0-5mm, 3/4, 1/2"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="precioVentaPorMetroCubico">Precio de Venta por m³ (Q) *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={calcularPrecioSugerido}
                  disabled={!costoProduccionPorMetroCubico || costoProduccionPorMetroCubico <= 0 || loading}
                  className="h-7 text-xs"
                >
                  <Brain className="mr-1 h-3 w-3" />
                  Sugerir con IA
                </Button>
              </div>
              <Input
                id="precioVentaPorMetroCubico"
                type="number"
                value={precioVentaPorMetroCubico}
                onChange={(e) => setPrecioVentaPorMetroCubico(Number(e.target.value))}
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
              {mostrarSugerencia && precioSugerido && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md border border-primary/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <div className="text-sm">
                      <span className="font-medium">Sugerido: Q{precioSugerido.toFixed(2)}/m³</span>
                      <span className="text-muted-foreground ml-2">
                        (Ganancia: Q{(precioSugerido - costoProduccionPorMetroCubico).toFixed(2)}/m³)
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={aplicarPrecioSugerido}
                    className="h-7 text-xs"
                    disabled={loading}
                  >
                    Aplicar
                  </Button>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="costoProduccionPorMetroCubico">Costo de Producción por m³ (Q) *</Label>
              <Input
                id="costoProduccionPorMetroCubico"
                type="number"
                value={costoProduccionPorMetroCubico}
                onChange={(e) => setCostoProduccionPorMetroCubico(Number(e.target.value))}
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockActualMetrosCubicos">Stock Actual (m³) *</Label>
              <Input
                id="stockActualMetrosCubicos"
                type="number"
                value={stockActualMetrosCubicos}
                onChange={(e) => setStockActualMetrosCubicos(Number(e.target.value))}
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockMinimoMetrosCubicos">Stock Mínimo (m³) *</Label>
              <Input
                id="stockMinimoMetrosCubicos"
                type="number"
                value={stockMinimoMetrosCubicos}
                onChange={(e) => setStockMinimoMetrosCubicos(Number(e.target.value))}
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej: Patio A-1"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="humedadPorcentaje">Humedad (%)</Label>
              <Input
                id="humedadPorcentaje"
                type="number"
                value={humedadPorcentaje || ""}
                onChange={(e) => setHumedadPorcentaje(e.target.value ? Number(e.target.value) : undefined)}
                step="0.01"
                min="0"
                max="100"
                placeholder="Ej: 3.2"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="calidad">Calidad</Label>
              <Select value={calidad} onValueChange={setCalidad} disabled={loading}>
                <SelectTrigger id="calidad">
                  <SelectValue placeholder="Selecciona calidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excelente">Excelente</SelectItem>
                  <SelectItem value="Buena">Buena</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                placeholder="Nombre del proveedor"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaUltimaEntrada">Fecha Última Entrada</Label>
              <Input
                id="fechaUltimaEntrada"
                type="date"
                value={fechaUltimaEntrada}
                onChange={(e) => setFechaUltimaEntrada(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch id="activo" checked={activo} onCheckedChange={setActivo} disabled={loading} />
              <Label htmlFor="activo">Agregado Activo</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Agregado
          </Button>
        </div>
      </form>
    </div>
  )
}
