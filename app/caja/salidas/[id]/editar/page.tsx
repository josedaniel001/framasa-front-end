"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Save, TrendingDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface MovimientoCaja {
  id: number
  tipo: 'ENTRADA' | 'SALIDA'
  monto: number
  descripcion: string
  empresa: string
  empresa_display: string
  fecha: string
  usuario: string
  referencia?: string
  created_at?: string
  updated_at?: string
}

export default function EditarSalidaCajaPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [movimiento, setMovimiento] = useState<MovimientoCaja | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    empresa: "",
    monto: "",
    descripcion: "",
    referencia: "",
  })

  const id = params.id as string

  useEffect(() => {
    loadMovimiento()
  }, [id])

  const loadMovimiento = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulación de carga de datos - en producción vendría de la API
      const mockData: MovimientoCaja = {
        id: parseInt(id),
        tipo: 'SALIDA',
        monto: 300.00,
        descripcion: 'Pago de servicios eléctricos - Recibo #001',
        empresa: 'BLOQUERA',
        empresa_display: 'Bloquera',
        fecha: '2025-12-15T11:15:00Z',
        usuario: 'María García',
        referencia: 'REC-001',
        created_at: '2025-12-15T11:15:00Z',
        updated_at: '2025-12-15T11:15:00Z',
      }

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500))

      setMovimiento(mockData)
      setFormData({
        empresa: mockData.empresa,
        monto: mockData.monto.toString(),
        descripcion: mockData.descripcion,
        referencia: mockData.referencia || "",
      })
    } catch (err: any) {
      console.error("Error al cargar movimiento:", err)
      setError(err.message || "Error al cargar el movimiento de caja")
      toast({
        title: "Error",
        description: "No se pudo cargar el movimiento de caja",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!formData.empresa) {
      toast({
        title: "Error",
        description: "Selecciona una empresa",
        variant: "destructive",
      })
      return
    }

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un monto válido mayor a 0",
        variant: "destructive",
      })
      return
    }

    if (!formData.descripcion.trim()) {
      toast({
        title: "Error",
        description: "Ingresa una descripción",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Simulación de API call - en producción esto iría a la API real
      const salidaData = {
        tipo: 'SALIDA',
        empresa: formData.empresa,
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion.trim(),
        referencia: formData.referencia.trim() || undefined,
      }

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log("Actualizando salida de caja:", salidaData)

      toast({
        title: "Salida Actualizada",
        description: `Salida actualizada exitosamente`,
      })

      // Redirigir al detalle del movimiento
      router.push(`/caja/salidas/${id}`)

    } catch (error: any) {
      console.error("Error al actualizar salida:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la salida",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatMonto = (monto: number) => {
    return `Q${monto.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/caja/salidas/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Editar Salida</h1>
            <p className="text-muted-foreground">Cargando información del movimiento...</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !movimiento) {
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
            <h1 className="text-3xl font-bold">Editar Salida</h1>
            <p className="text-muted-foreground">Error al cargar la información</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              {error || "No se encontró el movimiento de caja solicitado."}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link href={`/caja/salidas/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Salida</h1>
          <p className="text-muted-foreground">Modifica la información del movimiento de caja</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Información Actual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Información Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Empresa Actual</div>
              <div className="font-medium">{movimiento.empresa_display}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Monto Actual</div>
              <div className="text-lg font-bold text-red-600">
                -{formatMonto(movimiento.monto)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Descripción Actual</div>
              <p className="text-sm">{movimiento.descripcion}</p>
            </div>

            {movimiento.referencia && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Referencia Actual</div>
                <div className="text-sm font-medium">{movimiento.referencia}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulario de Edición */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Editar Información</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="empresa">Empresa *</Label>
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
                  <Label htmlFor="monto">Monto (Q) *</Label>
                  <Input
                    id="monto"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.monto}
                    onChange={(e) => handleInputChange("monto", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el motivo de la salida"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="referencia">Referencia (Opcional)</Label>
                <Input
                  id="referencia"
                  type="text"
                  placeholder="Número de recibo, factura, etc."
                  value={formData.referencia}
                  onChange={(e) => handleInputChange("referencia", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Referencia opcional para identificar la transacción
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Link href={`/caja/salidas/${id}`}>
                  <Button type="button" variant="outline" disabled={submitting}>
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Actualizar Salida
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Vista Previa de Cambios */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa de Cambios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Nuevo Monto</div>
              <div className={`text-lg font-bold ${parseFloat(formData.monto) !== movimiento.monto ? 'text-blue-600' : 'text-red-600'}`}>
                -{formatMonto(parseFloat(formData.monto) || 0)}
                {parseFloat(formData.monto) !== movimiento.monto && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (antes: -{formatMonto(movimiento.monto)})
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Nueva Empresa</div>
              <div className={`font-medium ${formData.empresa !== movimiento.empresa ? 'text-blue-600' : ''}`}>
                {formData.empresa === "FERRETERIA" ? "Ferretería" :
                 formData.empresa === "BLOQUERA" ? "Bloquera" :
                 formData.empresa === "PIEDRINERA" ? "Piedrinera" :
                 formData.empresa === "TALLER" ? "Taller" : "No seleccionada"}
                {formData.empresa !== movimiento.empresa && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (antes: {movimiento.empresa_display})
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
