"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Save,
  Calendar,
  Wrench,
  Package,
  Plus,
  X,
  ShoppingCart,
  Info,
  ChevronsUpDown,
  Check,
} from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { cn } from "@/lib/utils"

const equipos = [
  "Excavadora CAT 320D",
  "Camión Volvo FH16",
  "Retroexcavadora JCB 3CX",
  "Grúa Liebherr LTM 1050",
  "Compactadora Dynapac CA250",
  "Bulldozer CAT D6T",
  "Motoniveladora CAT 140M",
  "Cargador Frontal CAT 950M",
]

const tecnicos = [
  "Carlos Méndez",
  "Miguel Torres",
  "Ana Rodríguez",
  "Luis Vargas",
  "Pedro Jiménez",
  "Roberto Silva",
  "Antonio López",
  "María González",
]

interface ProductoFerreteria {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  categoria: string
  precioVenta: number
  costoUnitario: number
  unidadMedida: string
  stockActual: number
  stockMinimo: number
  activo: boolean
}

interface MaterialSeleccionado {
  productoId: string
  nombre: string
  codigo: string
  cantidad: number
  unidadMedida: string
  stockActual: number
}

interface RepuestoExterno {
  id: string
  nombre: string
}

export default function NuevaOrdenPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    equipo: "",
    tipo: "",
    descripcion: "",
    prioridad: "",
    tecnico: "",
    fechaInicio: "",
    fechaEstimadaTerminacion: "",
    observaciones: "",
  })

  // Estados para productos y materiales
  const [productos, setProductos] = useState<ProductoFerreteria[]>([])
  const [productosLoading, setProductosLoading] = useState(false)
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState<MaterialSeleccionado[]>([])
  const [repuestosExternos, setRepuestosExternos] = useState<RepuestoExterno[]>([])
  
  // Estados para el combobox de productos
  const [productoOpen, setProductoOpen] = useState(false)
  const [productoSearch, setProductoSearch] = useState("")
  
  // Estado para el formulario de repuestos externos
  const [nuevoRepuestoNombre, setNuevoRepuestoNombre] = useState("")

  // Cargar productos desde la API
  useEffect(() => {
    const loadProductos = async () => {
      try {
        setProductosLoading(true)
        const params = new URLSearchParams()
        params.append("estado", "activo")
        params.append("page_size", "100") // Cargar más productos para búsqueda
        
        const productosData = await apiGet<any>(`${API_ENDPOINTS.FERRETERIA.PRODUCTOS}?${params.toString()}`)
        
        // Manejar respuesta paginada o directa
        const productosList = Array.isArray(productosData)
          ? productosData
          : productosData?.results || productosData?.data || []
        
        // Mapear datos del backend al formato del frontend
        const productosMapeados: ProductoFerreteria[] = productosList.map((p: any) => ({
          id: String(p.id || p.pk || ""),
          codigo: p.codigo || "",
          nombre: p.nombre || "",
          descripcion: p.descripcion || "",
          categoria: p.categoria || p.categoria_nombre || "",
          precioVenta: p.precio_venta || p.precioVenta || 0,
          costoUnitario: p.costo_unitario || p.costoUnitario || 0,
          unidadMedida: p.unidad_medida || p.unidad_medida_nombre || "",
          stockActual: p.stock_actual || p.stockActual || 0,
          stockMinimo: p.stock_minimo || p.stockMinimo || 0,
          activo: p.activo !== undefined ? p.activo : true,
        }))
        
        setProductos(productosMapeados.filter((p) => p.activo))
      } catch (error) {
        console.error("Error al cargar productos:", error)
      } finally {
        setProductosLoading(false)
      }
    }

    loadProductos()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Preparar datos para enviar
    const datosOrden = {
      ...formData,
      materiales: materialesSeleccionados.map((m) => ({
        productoId: m.productoId,
        cantidad: m.cantidad,
      })),
      repuestosExternos: repuestosExternos,
    }

    console.log("Datos de la orden:", datosOrden)

    // TODO: Aquí se debe hacer la llamada a la API para crear la orden
    // await apiPost(API_ENDPOINTS.TALLER.ORDENES, datosOrden)

    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    router.push("/taller/ordenes")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Filtrar productos para el combobox
  const productosFiltrados = productos.filter((producto) => {
    const searchLower = productoSearch.toLowerCase()
    return (
      producto.nombre.toLowerCase().includes(searchLower) ||
      producto.codigo.toLowerCase().includes(searchLower) ||
      producto.categoria.toLowerCase().includes(searchLower)
    )
  })

  // Agregar material/producto seleccionado
  const handleAgregarMaterial = (producto: ProductoFerreteria) => {
    // Verificar si ya está agregado
    if (materialesSeleccionados.some((m) => m.productoId === producto.id)) {
      return
    }

    const nuevoMaterial: MaterialSeleccionado = {
      productoId: producto.id,
      nombre: producto.nombre,
      codigo: producto.codigo,
      cantidad: 1,
      unidadMedida: producto.unidadMedida,
      stockActual: producto.stockActual,
    }

    setMaterialesSeleccionados([...materialesSeleccionados, nuevoMaterial])
    setProductoOpen(false)
    setProductoSearch("")
  }

  // Actualizar cantidad de material
  const handleActualizarCantidadMaterial = (productoId: string, cantidad: number) => {
    setMaterialesSeleccionados((prev) =>
      prev.map((m) => (m.productoId === productoId ? { ...m, cantidad: Math.max(0, cantidad) } : m))
    )
  }

  // Eliminar material
  const handleEliminarMaterial = (productoId: string) => {
    setMaterialesSeleccionados((prev) => prev.filter((m) => m.productoId !== productoId))
  }

  // Agregar repuesto externo
  const handleAgregarRepuestoExterno = () => {
    if (!nuevoRepuestoNombre.trim()) {
      return
    }

    const nuevo: RepuestoExterno = {
      id: Date.now().toString(),
      nombre: nuevoRepuestoNombre.trim(),
    }

    setRepuestosExternos([...repuestosExternos, nuevo])
    setNuevoRepuestoNombre("")
  }

  // Eliminar repuesto externo
  const handleEliminarRepuestoExterno = (id: string) => {
    setRepuestosExternos((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/taller/ordenes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nueva Orden de Trabajo</h1>
          <p className="text-muted-foreground">Crear una nueva orden de mantenimiento o reparación</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Información Principal
                </CardTitle>
                <CardDescription>Datos básicos de la orden de trabajo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipo">Equipo *</Label>
                    <Select value={formData.equipo} onValueChange={(value) => handleInputChange("equipo", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipos.map((equipo) => (
                          <SelectItem key={equipo} value={equipo}>
                            {equipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Mantenimiento *</Label>
                    <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preventivo">Preventivo</SelectItem>
                        <SelectItem value="Correctivo">Correctivo</SelectItem>
                        <SelectItem value="Emergencia">Emergencia</SelectItem>
                        <SelectItem value="Legal">Legal / Inspección</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción del Trabajo *</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe detalladamente el trabajo a realizar..."
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prioridad">Prioridad *</Label>
                    <Select value={formData.prioridad} onValueChange={(value) => handleInputChange("prioridad", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baja">Baja</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Crítica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tecnico">Técnico Asignado *</Label>
                    <Select value={formData.tecnico} onValueChange={(value) => handleInputChange("tecnico", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {tecnicos.map((tecnico) => (
                          <SelectItem key={tecnico} value={tecnico}>
                            {tecnico}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Observaciones adicionales..."
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange("observaciones", e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Materiales y Productos */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Materiales y Productos
                </CardTitle>
                <CardDescription>Selecciona los materiales que se utilizarán en el trabajo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selector de productos con buscador */}
                <div className="space-y-2">
                  <Label>Buscar Producto</Label>
                  <Popover open={productoOpen} onOpenChange={setProductoOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={productoOpen}
                        className="w-full justify-between"
                      >
                        {productoSearch || "Buscar producto por nombre, código o categoría..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Buscar producto..."
                          value={productoSearch}
                          onValueChange={setProductoSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {productosLoading ? "Cargando productos..." : "No se encontraron productos."}
                          </CommandEmpty>
                          <CommandGroup>
                            {productosFiltrados.map((producto) => (
                              <CommandItem
                                key={producto.id}
                                value={`${producto.nombre} ${producto.codigo} ${producto.categoria}`}
                                onSelect={() => handleAgregarMaterial(producto)}
                                disabled={materialesSeleccionados.some((m) => m.productoId === producto.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    materialesSeleccionados.some((m) => m.productoId === producto.id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{producto.nombre}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Código: {producto.codigo} | Stock: {producto.stockActual} {producto.unidadMedida}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Lista de materiales seleccionados */}
                {materialesSeleccionados.length > 0 && (
                  <div className="space-y-2">
                    <Label>Materiales Seleccionados</Label>
                    <div className="space-y-2">
                      {materialesSeleccionados.map((material) => (
                        <div
                          key={material.productoId}
                          className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{material.nombre}</div>
                            <div className="text-xs text-muted-foreground">
                              Código: {material.codigo} | Stock disponible: {material.stockActual}{" "}
                              {material.unidadMedida}
                              {material.cantidad > material.stockActual && (
                                <Badge variant="destructive" className="ml-2">
                                  Stock insuficiente
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap">Cantidad:</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={material.cantidad}
                              onChange={(e) =>
                                handleActualizarCantidadMaterial(material.productoId, parseFloat(e.target.value) || 0)
                              }
                              className="w-20"
                            />
                            <span className="text-xs text-muted-foreground">{material.unidadMedida}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminarMaterial(material.productoId)}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Repuestos Externos */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Repuestos Externos
                </CardTitle>
                <CardDescription>
                  Lista de materiales y repuestos externos que se necesitarán conseguir
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: Bujía NGK BKR6E-11, Filtro de aceite, Mangueras hidráulicas..."
                    value={nuevoRepuestoNombre}
                    onChange={(e) => setNuevoRepuestoNombre(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAgregarRepuestoExterno()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAgregarRepuestoExterno}
                    disabled={!nuevoRepuestoNombre.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Lista de repuestos externos agregados */}
                {repuestosExternos.length > 0 && (
                  <div className="space-y-2">
                    <Label>Repuestos y Materiales Agregados</Label>
                    <div className="space-y-2">
                      {repuestosExternos.map((repuesto) => (
                        <div
                          key={repuesto.id}
                          className="flex items-center justify-between gap-2 p-3 border rounded-lg bg-background"
                        >
                          <div className="font-medium">{repuesto.nombre}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminarRepuestoExterno(repuesto.id)}
                            className="text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Programación e Información */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Programación
                </CardTitle>
                <CardDescription>Fechas de inicio y terminación estimada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => handleInputChange("fechaInicio", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaEstimadaTerminacion">Fecha Estimada de Terminación *</Label>
                  <Input
                    id="fechaEstimadaTerminacion"
                    type="date"
                    value={formData.fechaEstimadaTerminacion}
                    onChange={(e) => handleInputChange("fechaEstimadaTerminacion", e.target.value)}
                    min={formData.fechaInicio}
                  />
                </div>

                {/* Resumen */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Resumen</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <span className="font-medium">Pendiente</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creado por:</span>
                      <span className="font-medium">Usuario Actual</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha creación:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información sobre Tipos de Mantenimiento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Tipos de Mantenimiento
                </CardTitle>
                <CardDescription>Información sobre los tipos de mantenimiento disponibles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {/* Mantenimiento Preventivo */}
                  <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                      1. Mantenimiento Preventivo
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Programado por kilómetros, horas de uso o fechas.
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="font-medium">Incluye:</div>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li>Cambio de aceite</li>
                        <li>Filtros</li>
                        <li>Revisión de frenos</li>
                        <li>Engrase</li>
                        <li>Revisión general</li>
                      </ul>
                    </div>
                    <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                      ➡️ Mantiene operativos camiones, maquinaria y herramientas.
                    </div>
                  </div>

                  {/* Mantenimiento Correctivo */}
                  <div className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <div className="font-semibold text-sm mb-2 text-orange-900 dark:text-orange-100">
                      2. Mantenimiento Correctivo
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Por fallas o daños inesperados.
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="font-medium">Incluye:</div>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li>Reparaciones mecánicas</li>
                        <li>Soldaduras</li>
                        <li>Cambios de piezas</li>
                        <li>Reparaciones eléctricas</li>
                        <li>Problemas con llantas o sistemas hidráulicos</li>
                      </ul>
                    </div>
                    <div className="mt-2 text-xs text-orange-700 dark:text-orange-300">
                      ➡️ Es lo que más pasa en maquinaria pesada y camiones de piedrín.
                    </div>
                  </div>

                  {/* Mantenimiento de Emergencia */}
                  <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="font-semibold text-sm mb-2 text-red-900 dark:text-red-100">
                      3. Mantenimiento de Emergencia / Urgente
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Cuando la unidad se queda tirada en obra o carretera.
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="font-medium">Incluye:</div>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li>Estallido de llanta</li>
                        <li>Sobrecalentamiento</li>
                        <li>Fugas graves</li>
                        <li>Motor no enciende</li>
                        <li>Fallas hidráulicas en maquinaria en uso</li>
                      </ul>
                    </div>
                    <div className="mt-2 text-xs text-red-700 dark:text-red-300">
                      ➡️ Aquí sí se prioriza porque detiene operaciones.
                    </div>
                  </div>

                  {/* Mantenimiento Legal */}
                  <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div className="font-semibold text-sm mb-2 text-purple-900 dark:text-purple-100">
                      4. Mantenimiento Legal / Inspección
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Obligatorio por ley o seguridad industrial.
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="font-medium">Incluye:</div>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li>Revisión de frenos</li>
                        <li>Emisiones</li>
                        <li>Certificado de maquinaria pesada</li>
                        <li>Revisiones municipales</li>
                        <li>Inspecciones de seguridad en planta</li>
                        <li>Verificación de montacargas</li>
                      </ul>
                    </div>
                    <div className="mt-2 text-xs text-purple-700 dark:text-purple-300">
                      ➡️ Necesario para evitar multas y permisos.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Link href="/taller/ordenes">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Crear Orden
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
