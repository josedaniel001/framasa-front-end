"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, PlusCircle, ArrowLeft, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { createMovimientoCaja, type MovimientoCajaCreate } from "@/lib/api/caja"
import { apiGet } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"
import { Textarea } from "@/components/ui/textarea"
import { useEffect } from "react"

interface UnidadMedida {
  id: number
  nombre: string
  abreviatura: string
  activo: boolean
}

interface Movimiento {
  id: string
  empresa: string
  nombreProducto: string
  cantidad: number
  unidadMedidaId?: number | null
  costoTotal: number
}

export default function NuevoMovimientoCajaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [tipoMovimiento, setTipoMovimiento] = useState<'ENTRADA' | 'SALIDA'>(
    (searchParams.get('tipo') as 'ENTRADA' | 'SALIDA') || 'ENTRADA'
  )
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([])
  const [loadingUnidades, setLoadingUnidades] = useState(true)

  const [formData, setFormData] = useState({
    empresa: "",
    descripcion: "",
    nombreProducto: "",
    cantidad: "",
    unidadMedida: "",
    costoTotal: "",
  })

  // Cargar unidades de medida
  useEffect(() => {
    const loadUnidadesMedida = async () => {
      try {
        setLoadingUnidades(true)
        const data = await apiGet<UnidadMedida[]>(API_ENDPOINTS.FERRETERIA.UNIDADES_MEDIDA)
        setUnidadesMedida(data)
      } catch (error) {
        console.error("Error al cargar unidades de medida:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las unidades de medida",
          variant: "destructive",
        })
      } finally {
        setLoadingUnidades(false)
      }
    }
    loadUnidadesMedida()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const agregarMovimiento = () => {
    // Validaciones
    if (!formData.empresa) {
      toast({
        title: "Error",
        description: "Selecciona una empresa",
        variant: "destructive",
      })
      return
    }

    if (!formData.nombreProducto.trim()) {
      toast({
        title: "Error",
        description: "Ingresa el nombre del producto",
        variant: "destructive",
      })
      return
    }

    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      toast({
        title: "Error",
        description: "Ingresa una cantidad válida mayor a 0",
        variant: "destructive",
      })
      return
    }

    if (!formData.costoTotal || parseFloat(formData.costoTotal) <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un costo total válido mayor a 0",
        variant: "destructive",
      })
      return
    }

    const nuevoMovimiento: Movimiento = {
      id: Date.now().toString(),
      empresa: formData.empresa,
      nombreProducto: formData.nombreProducto.trim(),
      cantidad: parseFloat(formData.cantidad),
      unidadMedidaId: formData.unidadMedida ? parseInt(formData.unidadMedida) : null,
      costoTotal: parseFloat(formData.costoTotal),
    }

    setMovimientos(prev => [...prev, nuevoMovimiento])

    // Resetear formulario (mantener empresa y descripción si ya hay movimientos)
    setFormData(prev => ({
      ...prev,
      nombreProducto: "",
      cantidad: "",
      unidadMedida: "",
      costoTotal: "",
    }))

    toast({
      title: "Movimiento Agregado",
      description: "El movimiento ha sido agregado a la lista",
    })
  }

  const eliminarMovimiento = (id: string) => {
    setMovimientos(prev => prev.filter(m => m.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (movimientos.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un movimiento",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Convertir valores de empresa al formato del backend
      const empresaMap: Record<string, string> = {
        'FERRETERIA': 'Ferretería',
        'BLOQUERA': 'Bloquera',
        'PIEDRINERA': 'Piedrinera',
        'TALLER': 'Taller',
      }

      // Calcular el total de todos los detalles
      const totalCosto = movimientos.reduce((sum, m) => sum + m.costoTotal, 0)

      // Preparar los detalles para el backend
      const detalles = movimientos.map(movimiento => ({
        producto_nombre: movimiento.nombreProducto,
        cantidad: movimiento.cantidad,
        unidad_medida: movimiento.unidadMedidaId || null,
        costo_total: movimiento.costoTotal,
      }))

      // Crear el movimiento de caja
      const movimientoData: MovimientoCajaCreate = {
        tipo: tipoMovimiento,
        empresa: empresaMap[movimientos[0].empresa] || movimientos[0].empresa,
        total: totalCosto,
        descripcion: formData.descripcion.trim() || `Movimiento de ${tipoMovimiento === 'ENTRADA' ? 'entrada' : 'salida'} con ${movimientos.length} producto(s)`,
        detalles_create: detalles,
        estado: 'CONFIRMADO',
      }

      await createMovimientoCaja(movimientoData)

      toast({
        title: `${tipoMovimiento === 'ENTRADA' ? 'Entrada' : 'Salida'} Registrada`,
        description: `Movimiento de ${tipoMovimiento === 'ENTRADA' ? 'entrada' : 'salida'} por un total de Q${totalCosto.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} registrado exitosamente`,
      })

      // Redirigir a la página principal de caja
      router.push("/caja")

    } catch (error: any) {
      console.error(`Error al registrar ${tipoMovimiento.toLowerCase()}:`, error)
      toast({
        title: "Error",
        description: error.message || `No se pudo registrar el movimiento de ${tipoMovimiento === 'ENTRADA' ? 'entrada' : 'salida'}`,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const totalCosto = movimientos.reduce((sum, m) => sum + m.costoTotal, 0)

  const formatMonto = (monto: number) => {
    return `Q${monto.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link href="/caja">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            Nuevo Movimiento de Caja
          </h1>
          <p className="text-muted-foreground">
            Registra un nuevo movimiento de {tipoMovimiento === 'ENTRADA' ? 'entrada' : 'salida'} de efectivo al sistema de caja.
          </p>
        </div>
      </div>

      {/* Selector de tipo de movimiento */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Tipo de Movimiento</Label>
              <p className="text-sm text-muted-foreground">
                Selecciona si deseas registrar una entrada o una salida
              </p>
            </div>
            <Select
              value={tipoMovimiento}
              onValueChange={(value: 'ENTRADA' | 'SALIDA') => setTipoMovimiento(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENTRADA">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Entrada
                  </div>
                </SelectItem>
                <SelectItem value="SALIDA">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Salida
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Movimiento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="empresa">Empresa {movimientos.length === 0 ? '*' : ''}</Label>
              <Select
                value={formData.empresa}
                onValueChange={(value) => handleInputChange("empresa", value)}
              >
                <SelectTrigger id="empresa">
                  <SelectValue placeholder="Selecciona una empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FERRETERIA">Ferretería</SelectItem>
                  <SelectItem value="BLOQUERA">Bloquera</SelectItem>
                  <SelectItem value="PIEDRINERA">Piedrinera</SelectItem>
                  <SelectItem value="TALLER">Taller</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe el motivo del movimiento (opcional)"
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nombreProducto">Nombre del Producto {movimientos.length === 0 ? '*' : ''}</Label>
              <Input
                id="nombreProducto"
                type="text"
                placeholder="Ej: Cemento, Ladrillos, etc."
                value={formData.nombreProducto}
                onChange={(e) => handleInputChange("nombreProducto", e.target.value)}
                required={movimientos.length === 0}
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="cantidad">Cantidad {movimientos.length === 0 ? '*' : ''}</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cantidad}
                  onChange={(e) => handleInputChange("cantidad", e.target.value)}
                  required={movimientos.length === 0}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unidadMedida">Unidad de Medida</Label>
                <Select
                  value={formData.unidadMedida}
                  onValueChange={(value) => handleInputChange("unidadMedida", value)}
                  disabled={loadingUnidades}
                >
                  <SelectTrigger id="unidadMedida">
                    <SelectValue placeholder={loadingUnidades ? "Cargando..." : "Selecciona una unidad"} />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesMedida.map((unidad) => (
                      <SelectItem key={unidad.id} value={String(unidad.id)}>
                        {unidad.nombre} ({unidad.abreviatura})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="costoTotal">Costo Total (Q) {movimientos.length === 0 ? '*' : ''}</Label>
              <Input
                id="costoTotal"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.costoTotal}
                onChange={(e) => handleInputChange("costoTotal", e.target.value)}
                required={movimientos.length === 0}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" onClick={agregarMovimiento} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Movimiento
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de movimientos múltiples */}
        {movimientos.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Movimientos Agregados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Costo Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientos.map((movimiento) => (
                    <TableRow key={movimiento.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {movimiento.empresa === "FERRETERIA" ? "Ferretería" :
                           movimiento.empresa === "BLOQUERA" ? "Bloquera" :
                           movimiento.empresa === "PIEDRINERA" ? "Piedrinera" :
                           movimiento.empresa === "TALLER" ? "Taller" : movimiento.empresa}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {movimiento.nombreProducto}
                      </TableCell>
                      <TableCell>
                        {movimiento.cantidad.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {movimiento.unidadMedidaId 
                          ? unidadesMedida.find(u => u.id === movimiento.unidadMedidaId)?.abreviatura || '-'
                          : '-'}
                      </TableCell>
                      <TableCell className={`font-medium ${tipoMovimiento === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                        {tipoMovimiento === 'ENTRADA' ? '+' : '-'}{formatMonto(movimiento.costoTotal)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarMovimiento(movimiento.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total de Movimientos:</span>
                <span className="font-medium">{movimientos.length}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                <span>Total a Registrar:</span>
                <span className={tipoMovimiento === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}>
                  {tipoMovimiento === 'ENTRADA' ? '+' : '-'}{formatMonto(totalCosto)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Tipo de Movimiento:</span>
                <span className={tipoMovimiento === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}>
                  {tipoMovimiento === 'ENTRADA' ? 'ENTRADAS MÚLTIPLES' : 'SALIDAS MÚLTIPLES'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 mt-4">
          <Link href="/caja">
            <Button type="button" variant="outline" disabled={submitting}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar {movimientos.length} {tipoMovimiento === 'ENTRADA' ? 'Entradas' : 'Salidas'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

