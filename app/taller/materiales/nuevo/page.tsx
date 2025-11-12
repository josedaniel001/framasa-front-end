"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Package, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"

const categorias = [
  "Lubricantes",
  "Filtros",
  "Frenos",
  "Hidráulicos",
  "Correas",
  "Eléctricos",
  "Neumáticos",
  "Herramientas",
]

const unidades = ["Litros", "Unidad", "Juego", "Metros", "Kilogramos", "Galones", "Piezas"]

const proveedores = [
  "Distribuidora Técnica",
  "Repuestos Maquinaria",
  "Autopartes Premium",
  "Lubricantes Industriales",
  "Repuestos CAT",
  "Repuestos JCB",
  "Volvo Parts",
]

export default function NuevoMaterialPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    marca: "",
    unidad: "",
    stockMinimo: "",
    stockMaximo: "",
    stockInicial: "",
    ubicacion: "",
    precioUnitario: "",
    proveedor: "",
    descripcion: "",
    observaciones: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    router.push("/taller/materiales")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Generar código automático basado en categoría y nombre
  const generarCodigo = () => {
    if (formData.categoria && formData.nombre) {
      const catCode = formData.categoria.substring(0, 3).toUpperCase()
      const nameCode = formData.nombre.substring(0, 3).toUpperCase().replace(/\s/g, "")
      const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      const codigo = `${catCode}-${nameCode}-${randomNum}`
      handleInputChange("codigo", codigo)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/taller/materiales">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Material</h1>
          <p className="text-muted-foreground">Agregar un nuevo material o repuesto al inventario</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Información Principal
                </CardTitle>
                <CardDescription>Datos básicos del material o repuesto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="codigo"
                        placeholder="Ej: LUB-ACE-001"
                        value={formData.codigo}
                        onChange={(e) => handleInputChange("codigo", e.target.value)}
                      />
                      <Button type="button" variant="outline" onClick={generarCodigo}>
                        Auto
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Material *</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Aceite Motor 15W-40"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca</Label>
                    <Input
                      id="marca"
                      placeholder="Ej: Shell, Caterpillar"
                      value={formData.marca}
                      onChange={(e) => handleInputChange("marca", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unidad">Unidad de Medida *</Label>
                    <Select value={formData.unidad} onValueChange={(value) => handleInputChange("unidad", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {unidades.map((unidad) => (
                          <SelectItem key={unidad} value={unidad}>
                            {unidad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Descripción detallada del material..."
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    rows={2}
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
          </div>

          {/* Inventario y Costos */}
          <div className="space-y-6">
            {/* Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Control de Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stockInicial">Stock Inicial *</Label>
                  <Input
                    id="stockInicial"
                    type="number"
                    placeholder="0"
                    value={formData.stockInicial}
                    onChange={(e) => handleInputChange("stockInicial", e.target.value)}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockMinimo">Stock Mínimo *</Label>
                  <Input
                    id="stockMinimo"
                    type="number"
                    placeholder="0"
                    value={formData.stockMinimo}
                    onChange={(e) => handleInputChange("stockMinimo", e.target.value)}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockMaximo">Stock Máximo *</Label>
                  <Input
                    id="stockMaximo"
                    type="number"
                    placeholder="0"
                    value={formData.stockMaximo}
                    onChange={(e) => handleInputChange("stockMaximo", e.target.value)}
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ubicación y Proveedor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación y Proveedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación *</Label>
                  <Input
                    id="ubicacion"
                    placeholder="Ej: A-01-15"
                    value={formData.ubicacion}
                    onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proveedor">Proveedor Principal</Label>
                  <Select value={formData.proveedor} onValueChange={(value) => handleInputChange("proveedor", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores.map((proveedor) => (
                        <SelectItem key={proveedor} value={proveedor}>
                          {proveedor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Precio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Precio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="precioUnitario">Precio Unitario *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="precioUnitario"
                      type="number"
                      placeholder="0.00"
                      value={formData.precioUnitario}
                      onChange={(e) => handleInputChange("precioUnitario", e.target.value)}
                      className="pl-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Valor total calculado */}
                {formData.stockInicial && formData.precioUnitario && (
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor Total:</span>
                      <span className="font-medium">
                        $
                        {(
                          Number.parseFloat(formData.stockInicial) * Number.parseFloat(formData.precioUnitario)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Link href="/taller/materiales">
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
                Crear Material
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
