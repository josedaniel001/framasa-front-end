"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Loader2, Calendar, User, FileText, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { getMovimientoCaja, type MovimientoCaja } from "@/lib/api/caja"

export default function DetalleMovimientoCajaPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [movimientoCaja, setMovimientoCaja] = useState<MovimientoCaja | null>(null)
  const [error, setError] = useState<string | null>(null)

  const id = params.id as string

  useEffect(() => {
    loadMovimiento()
  }, [id])

  const loadMovimiento = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getMovimientoCaja(id)
      setMovimientoCaja(data)
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

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatMonto = (monto: number) => {
    return `Q${monto.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getEmpresaDisplay = (empresa: string) => {
    const empresaMap: Record<string, string> = {
      'Ferretería': 'Ferretería',
      'Bloquera': 'Bloquera',
      'Piedrinera': 'Piedrinera',
      'Taller': 'Taller',
    }
    return empresaMap[empresa] || empresa
  }

  const getUsuarioDisplay = (createdById: number | null | undefined) => {
    if (createdById) {
      return `Usuario #${createdById}`
    }
    return "Sistema"
  }

  if (loading) {
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
            <h1 className="text-3xl font-bold">Detalle de Movimiento</h1>
            <p className="text-muted-foreground">Cargando información del movimiento...</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !movimientoCaja) {
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
            <h1 className="text-3xl font-bold">Detalle de Movimiento</h1>
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

  const totalCosto = Number(movimientoCaja.total)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/caja">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Detalle de Movimiento</h1>
            <p className="text-muted-foreground">Información completa del movimiento de caja</p>
          </div>
        </div>

        <Link href={`/caja/${movimientoCaja.id}/editar`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar Movimiento
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Información Principal */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {movimientoCaja.tipo === 'ENTRADA' ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              Información del Movimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Total del Movimiento
              </div>
              <div className={`text-2xl font-bold ${movimientoCaja.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                {movimientoCaja.tipo === 'ENTRADA' ? '+' : '-'}{formatMonto(totalCosto)}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Descripción
              </div>
              <div className="text-sm">
                {movimientoCaja.descripcion || 'Sin descripción'}
              </div>
            </div>

            {movimientoCaja.detalles && movimientoCaja.detalles.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Detalles ({movimientoCaja.detalles.length})
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Costo Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimientoCaja.detalles.map((detalle) => (
                      <TableRow key={detalle.id}>
                        <TableCell className="font-medium">
                          {detalle.producto_nombre}
                        </TableCell>
                        <TableCell>
                          {Number(detalle.cantidad).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className={`font-medium ${movimientoCaja.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                          {movimientoCaja.tipo === 'ENTRADA' ? '+' : '-'}{formatMonto(Number(detalle.costo_total))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>

        {/* Información del Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Fecha y Hora
              </div>
              <div className="text-sm font-medium">
                {formatFecha(movimientoCaja.fecha_hora)}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Usuario
              </div>
              <div className="text-sm font-medium">{getUsuarioDisplay(movimientoCaja.created_by_id)}</div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Empresa</div>
              <Badge variant="outline">{getEmpresaDisplay(movimientoCaja.empresa)}</Badge>
            </div>

            {movimientoCaja.referencia && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Referencia</div>
                  <div className="text-sm font-medium">{movimientoCaja.referencia}</div>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">ID del Movimiento</div>
              <div className="text-xs font-mono bg-muted p-2 rounded">
                {movimientoCaja.id}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Tipo</div>
              <Badge 
                variant={movimientoCaja.tipo === 'ENTRADA' ? 'default' : 'destructive'}
                className={movimientoCaja.tipo === 'ENTRADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
              >
                {movimientoCaja.tipo === 'ENTRADA' ? 'Entrada de Caja' : 'Salida de Caja'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de Auditoría */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Auditoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Fecha de Creación</div>
              <div className="text-sm font-medium">
                {movimientoCaja.created_at ? formatFecha(movimientoCaja.created_at) : "No disponible"}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Última Modificación</div>
              <div className="text-sm font-medium">
                {formatFecha(movimientoCaja.updated_at)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Estado</div>
              <Badge variant={movimientoCaja.estado === 'CONFIRMADO' ? 'default' : movimientoCaja.estado === 'ANULADO' ? 'destructive' : 'outline'}>
                {movimientoCaja.estado === 'CONFIRMADO' ? 'Confirmado' : 
                 movimientoCaja.estado === 'ANULADO' ? 'Anulado' : 
                 'Borrador'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

