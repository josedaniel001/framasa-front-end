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
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  ArrowLeft,
  Save,
  Calendar,
  Wrench,
  Plus,
  X,
  ShoppingCart,
  Info,
  Loader2,
  Sparkles,
  Package,
  ChevronsUpDown,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { toast } from "sonner"
import { sugerirCodigoOrdenTrabajo, TipoMantenimiento } from "@/lib/codigo-generator"

interface Maquinaria {
  id: string
  codigo: string
  nombre: string
  empresa: string
  empresaDisplay: string
}

interface Empleado {
  id: string
  codigo: string
  nombres: string
  apellidos: string
  nombreCompleto: string
  puesto: string
}

interface RepuestoExterno {
  id: string
  nombre: string
  cantidad: number
}

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

export default function NuevaOrdenPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Datos para selects
  const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [ordenesExistentes, setOrdenesExistentes] = useState<Array<{ codigo_orden?: string; codigoOrden?: string }>>([])
  
  // Código de orden
  const [codigoOrden, setCodigoOrden] = useState("")
  
  // Form data
  const [formData, setFormData] = useState({
    maquinaria: "",
    tecnico: "",
    tipo_mantenimiento: "",
    descripcion_trabajo: "",
    prioridad: "",
    observaciones: "",
    fecha_creacion_orden: new Date().toISOString().split("T")[0],
    fecha_inicio: "",
    fecha_estimada_terminacion: "",
    costo_estimado: "0",
  })

  // Repuestos externos
  const [repuestosExternos, setRepuestosExternos] = useState<RepuestoExterno[]>([])
  const [nuevoRepuestoNombre, setNuevoRepuestoNombre] = useState("")
  const [nuevoRepuestoCantidad, setNuevoRepuestoCantidad] = useState<number>(1)

  // Productos de ferretería (materiales)
  const [productos, setProductos] = useState<ProductoFerreteria[]>([])
  const [productosLoading, setProductosLoading] = useState(false)
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState<MaterialSeleccionado[]>([])
  const [productoOpen, setProductoOpen] = useState(false)
  const [productoSearch, setProductoSearch] = useState("")

  // Cargar maquinarias, empleados y órdenes existentes
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)
        
        // Cargar maquinarias
        const maquinariasData = await apiGet<Maquinaria[]>(`${API_ENDPOINTS.TALLER.MAQUINARIA}?activo=activo`)
        setMaquinarias(Array.isArray(maquinariasData) ? maquinariasData : [])
        
        // Cargar empleados (técnicos)
        const empleadosData = await apiGet<any[]>(`${API_ENDPOINTS.PLANILLAS.EMPLEADOS}?activo=activo`)
        const empleadosMapeados = (Array.isArray(empleadosData) ? empleadosData : []).map((e: any) => ({
          id: String(e.id),
          codigo: e.codigo_empleado || e.codigo || "",
          nombres: e.nombres || "",
          apellidos: e.apellidos || "",
          nombreCompleto: e.nombre_completo || e.nombreCompleto || `${e.nombres || ""} ${e.apellidos || ""}`.trim(),
          puesto: e.puesto || e.cargo || "",
        }))
        setEmpleados(empleadosMapeados)
        
        // Cargar órdenes existentes para generar códigos únicos
        try {
          const ordenesData = await apiGet<any[]>(`${API_ENDPOINTS.TALLER.ORDENES}`)
          const ordenesList = Array.isArray(ordenesData) ? ordenesData : []
          setOrdenesExistentes(ordenesList.map((o: any) => ({
            codigo_orden: o.codigo_orden || o.codigoOrden || "",
            codigoOrden: o.codigoOrden || o.codigo_orden || "",
          })))
        } catch {
          // Si falla, continuar sin órdenes existentes
          setOrdenesExistentes([])
        }

        // Cargar productos de ferretería
        try {
          setProductosLoading(true)
          const params = new URLSearchParams()
          params.append("estado", "activo")
          params.append("page_size", "500")
          
          const productosData = await apiGet<any>(`${API_ENDPOINTS.FERRETERIA.PRODUCTOS}?${params.toString()}`)
          
          const productosList = Array.isArray(productosData)
            ? productosData
            : productosData?.results || productosData?.data || []
          
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
        } catch (err) {
          console.error("Error al cargar productos:", err)
        } finally {
          setProductosLoading(false)
        }
      } catch (error: any) {
        console.error("Error al cargar datos:", error)
        toast.error("Error al cargar datos iniciales")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [])

  // Función para generar código automático
  const generarCodigoAutomatico = () => {
    if (!formData.tipo_mantenimiento || !formData.maquinaria) {
      toast.error("Selecciona el tipo de mantenimiento y la maquinaria para generar el código")
      return
    }

    const maquinariaSeleccionada = maquinarias.find((m) => m.id === formData.maquinaria)
    if (!maquinariaSeleccionada) {
      toast.error("Maquinaria no encontrada")
      return
    }

    const codigo = sugerirCodigoOrdenTrabajo(
      formData.tipo_mantenimiento as TipoMantenimiento,
      maquinariaSeleccionada.nombre,
      ordenesExistentes
    )

    setCodigoOrden(codigo)
    toast.success(`Código generado: ${codigo}`)
  }

  // Autogenerar código cuando cambien tipo y maquinaria (solo si está vacío)
  useEffect(() => {
    if (formData.tipo_mantenimiento && formData.maquinaria && !codigoOrden) {
      const maquinariaSeleccionada = maquinarias.find((m) => m.id === formData.maquinaria)
      if (maquinariaSeleccionada) {
        const codigo = sugerirCodigoOrdenTrabajo(
          formData.tipo_mantenimiento as TipoMantenimiento,
          maquinariaSeleccionada.nombre,
          ordenesExistentes
        )
        setCodigoOrden(codigo)
      }
    }
  }, [formData.tipo_mantenimiento, formData.maquinaria, maquinarias, ordenesExistentes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    if (!codigoOrden) {
      toast.error("Ingrese o genere un código de orden")
      return
    }
    if (!formData.maquinaria) {
      toast.error("Seleccione una maquinaria")
      return
    }
    if (!formData.tecnico) {
      toast.error("Seleccione un técnico")
      return
    }
    if (!formData.tipo_mantenimiento) {
      toast.error("Seleccione el tipo de mantenimiento")
      return
    }
    if (!formData.descripcion_trabajo) {
      toast.error("Ingrese la descripción del trabajo")
      return
    }
    if (!formData.prioridad) {
      toast.error("Seleccione la prioridad")
      return
    }
    if (!formData.fecha_inicio) {
      toast.error("Seleccione la fecha de inicio")
      return
    }
    if (!formData.fecha_estimada_terminacion) {
      toast.error("Seleccione la fecha estimada de terminación")
      return
    }

    try {
      setIsLoading(true)

      const datosOrden = {
        codigo_orden: codigoOrden,
        maquinaria: parseInt(formData.maquinaria),
        tecnico: parseInt(formData.tecnico),
        tipo_mantenimiento: formData.tipo_mantenimiento,
        descripcion_trabajo: formData.descripcion_trabajo,
        prioridad: formData.prioridad,
        observaciones: formData.observaciones || null,
        fecha_creacion_orden: formData.fecha_creacion_orden,
        fecha_inicio: formData.fecha_inicio,
        fecha_estimada_terminacion: formData.fecha_estimada_terminacion,
        costo_estimado: parseFloat(formData.costo_estimado) || 0,
        repuestos_externos: repuestosExternos.map((r) => ({ nombre: r.nombre, cantidad: r.cantidad })),
        // Materiales de ferretería seleccionados
        materiales: materialesSeleccionados.map((m) => ({
          producto_id: parseInt(m.productoId),
          cantidad: m.cantidad,
        })),
        estado: "PENDIENTE",
        progreso: 0,
        activo: true,
      }

      await apiPost(API_ENDPOINTS.TALLER.ORDENES, datosOrden)
      toast.success("Orden de trabajo creada exitosamente")
      router.push("/taller/ordenes")
    } catch (error: any) {
      console.error("Error al crear orden:", error)
      toast.error(error.message || "Error al crear la orden de trabajo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Agregar repuesto externo
  const handleAgregarRepuestoExterno = () => {
    if (!nuevoRepuestoNombre.trim()) return

    const nuevo: RepuestoExterno = {
      id: Date.now().toString(),
      nombre: nuevoRepuestoNombre.trim(),
      cantidad: nuevoRepuestoCantidad || 1,
    }

    setRepuestosExternos([...repuestosExternos, nuevo])
    setNuevoRepuestoNombre("")
    setNuevoRepuestoCantidad(1)
  }

  // Actualizar cantidad de repuesto externo
  const handleActualizarCantidadRepuesto = (id: string, cantidad: number) => {
    setRepuestosExternos((prev) =>
      prev.map((r) => (r.id === id ? { ...r, cantidad: Math.max(0, cantidad) } : r))
    )
  }

  // Eliminar repuesto externo
  const handleEliminarRepuestoExterno = (id: string) => {
    setRepuestosExternos((prev) => prev.filter((r) => r.id !== id))
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

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando datos...</span>
      </div>
    )
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
                {/* Código de Orden */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="codigo_orden">Código de Orden *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generarCodigoAutomatico}
                      disabled={!formData.tipo_mantenimiento || !formData.maquinaria || isLoadingData}
                      className="h-7 text-xs"
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      Generar automático
                    </Button>
                  </div>
                  <Input
                    id="codigo_orden"
                    value={codigoOrden}
                    onChange={(e) => setCodigoOrden(e.target.value.toUpperCase())}
                    placeholder="Ej: OT-PRE-EXC-001 (se genera automáticamente)"
                    className="font-mono"
                  />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Formato: <span className="font-mono">OT-[TIPO]-[MAQ]-[NÚM]</span></p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline" className="text-xs font-normal">OT = Orden Trabajo</Badge>
                      <Badge variant="outline" className="text-xs font-normal">PRE/COR/EME/LEG = Tipo</Badge>
                      <Badge variant="outline" className="text-xs font-normal">3 letras = Maquinaria</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maquinaria">Maquinaria / Equipo *</Label>
                    <Select
                      value={formData.maquinaria}
                      onValueChange={(value) => handleInputChange("maquinaria", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar maquinaria" />
                      </SelectTrigger>
                      <SelectContent>
                        {maquinarias.map((maq) => (
                          <SelectItem key={maq.id} value={maq.id}>
                            {maq.codigo} - {maq.nombre} ({maq.empresaDisplay || maq.empresa})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_mantenimiento">Tipo de Mantenimiento *</Label>
                    <Select
                      value={formData.tipo_mantenimiento}
                      onValueChange={(value) => handleInputChange("tipo_mantenimiento", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PREVENTIVO">Preventivo</SelectItem>
                        <SelectItem value="CORRECTIVO">Correctivo</SelectItem>
                        <SelectItem value="EMERGENCIA">Emergencia</SelectItem>
                        <SelectItem value="LEGAL_INSPECCION">Legal / Inspección</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion_trabajo">Descripción del Trabajo *</Label>
                  <Textarea
                    id="descripcion_trabajo"
                    placeholder="Describe detalladamente el trabajo a realizar..."
                    value={formData.descripcion_trabajo}
                    onChange={(e) => handleInputChange("descripcion_trabajo", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prioridad">Prioridad *</Label>
                    <Select
                      value={formData.prioridad}
                      onValueChange={(value) => handleInputChange("prioridad", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BAJA">Baja</SelectItem>
                        <SelectItem value="MEDIA">Media</SelectItem>
                        <SelectItem value="ALTA">Alta</SelectItem>
                        <SelectItem value="URGENTE">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tecnico">Técnico Asignado *</Label>
                    <Select
                      value={formData.tecnico}
                      onValueChange={(value) => handleInputChange("tecnico", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {empleados.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.nombreCompleto} - {emp.puesto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costo_estimado">Costo Estimado (Q)</Label>
                  <Input
                    id="costo_estimado"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.costo_estimado}
                    onChange={(e) => handleInputChange("costo_estimado", e.target.value)}
                  />
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

            {/* Materiales y Productos de Ferretería */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Materiales y Productos de Ferretería
                </CardTitle>
                <CardDescription>
                  Selecciona los materiales del inventario de ferretería que se utilizarán en el trabajo
                </CardDescription>
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
                            {productosFiltrados.slice(0, 20).map((producto) => (
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
                              type="button"
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

                {materialesSeleccionados.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay materiales seleccionados. Usa el buscador para agregar productos del inventario.
                  </p>
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
                  Lista de materiales y repuestos externos que se necesitarán conseguir (no están en inventario)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: Bujía NGK BKR6E-11, Filtro de aceite..."
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
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Cant."
                    value={nuevoRepuestoCantidad}
                    onChange={(e) => setNuevoRepuestoCantidad(parseFloat(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Button
                    type="button"
                    onClick={handleAgregarRepuestoExterno}
                    disabled={!nuevoRepuestoNombre.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {repuestosExternos.length > 0 && (
                  <div className="space-y-2">
                    <Label>Repuestos y Materiales Agregados</Label>
                    <div className="space-y-2">
                      {repuestosExternos.map((repuesto) => (
                        <div
                          key={repuesto.id}
                          className="flex items-center gap-2 p-3 border rounded-lg bg-background"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{repuesto.nombre}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs whitespace-nowrap">Cantidad:</Label>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={repuesto.cantidad}
                              onChange={(e) =>
                                handleActualizarCantidadRepuesto(repuesto.id, parseFloat(e.target.value) || 0)
                              }
                              className="w-20"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminarRepuestoExterno(repuesto.id)}
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
                  <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
                  <Input
                    id="fecha_inicio"
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => handleInputChange("fecha_inicio", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_estimada_terminacion">Fecha Estimada de Terminación *</Label>
                  <Input
                    id="fecha_estimada_terminacion"
                    type="date"
                    value={formData.fecha_estimada_terminacion}
                    onChange={(e) => handleInputChange("fecha_estimada_terminacion", e.target.value)}
                    min={formData.fecha_inicio}
                  />
                </div>

                {/* Resumen */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Resumen</h4>
                  <div className="space-y-2 text-sm">
                    {codigoOrden && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Código:</span>
                        <span className="font-mono font-medium text-primary">{codigoOrden}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <Badge variant="secondary">Pendiente</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha creación:</span>
                      <span className="font-medium">{new Date().toLocaleDateString("es-GT")}</span>
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
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-2 border rounded bg-blue-50 dark:bg-blue-950/20">
                  <span className="font-semibold text-xs text-blue-900 dark:text-blue-100">Preventivo:</span>
                  <p className="text-xs text-muted-foreground">Cambio de aceite, filtros, revisión general.</p>
                </div>
                <div className="p-2 border rounded bg-orange-50 dark:bg-orange-950/20">
                  <span className="font-semibold text-xs text-orange-900 dark:text-orange-100">Correctivo:</span>
                  <p className="text-xs text-muted-foreground">Reparaciones mecánicas, soldaduras, cambio de piezas.</p>
                </div>
                <div className="p-2 border rounded bg-red-50 dark:bg-red-950/20">
                  <span className="font-semibold text-xs text-red-900 dark:text-red-100">Emergencia:</span>
                  <p className="text-xs text-muted-foreground">Fallas urgentes que detienen operaciones.</p>
                </div>
                <div className="p-2 border rounded bg-purple-50 dark:bg-purple-950/20">
                  <span className="font-semibold text-xs text-purple-900 dark:text-purple-100">Legal:</span>
                  <p className="text-xs text-muted-foreground">Inspecciones obligatorias por ley.</p>
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
