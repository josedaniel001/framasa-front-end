"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { ArrowLeft, Printer, DollarSign, Loader2 } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { AgregarPagosMultiplesDialog } from "@/components/facturacion/agregar-pagos-multiples-dialog"

const EMPRESA_INFO: Record<
  string,
  { label: string; className: string }
> = {
  FERRETERIA: {
    label: "Ferretería",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  BLOQUERA: {
    label: "Bloquera",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  PIEDRINERA: {
    label: "Piedrinera",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  MIXTA: {
    label: "Mixta",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
}

interface VentaDetallePageProps {
  params: Promise<{
    id: string
  }>
}

interface Factura {
  id: number
  numero_factura: string
  empresa: string
  empresa_display: string
  cliente_id: number
  cliente_nombre: string
  cliente_nit: string | null
  subtotal: number
  descuento: number
  total: number
  total_pagado: number
  saldo_pendiente: number
  estado: string
  estado_display: string
  observaciones: string | null
  usuario_id: number
  usuario_nombre: string
  fecha_factura: string
  fecha_vencimiento: string | null
  detalles: Array<{
    id: number
    producto_id: number
    producto_empresa: string
    producto_codigo: string
    producto_nombre: string
    cantidad: number
    precio_unitario: number
    descuento: number
    subtotal: number
  }>
  pagos: Array<{
    id: number
    tipo_pago: string
    tipo_pago_display: string
    monto: number
    referencia: string | null
    observaciones: string | null
    usuario_nombre: string
    fecha_pago: string
  }>
}

export default function VentaDetallePage({ params }: VentaDetallePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [factura, setFactura] = useState<Factura | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPagoDialog, setShowPagoDialog] = useState(false)
  const [facturaId, setFacturaId] = useState<string>("")

  useEffect(() => {
    const loadFactura = async () => {
      const resolvedParams = await params
      const id = resolvedParams.id
      setFacturaId(id)
      try {
        setLoading(true)
        const data = await apiGet<Factura>(API_ENDPOINTS.FACTURACION.FACTURA(id))
        setFactura(data)
      } catch (error: any) {
        console.error("Error al cargar factura:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la factura",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadFactura()
  }, [params, toast])

  const handlePagoAgregado = () => {
    // Recargar la factura
    if (facturaId) {
      apiGet<Factura>(API_ENDPOINTS.FACTURACION.FACTURA(facturaId))
        .then((data) => {
          setFactura(data)
        })
        .catch((error) => {
          console.error("Error al recargar factura:", error)
        })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!factura) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-3xl font-bold">Factura no encontrada</h1>
        <p className="text-muted-foreground">La factura con ID {facturaId} no existe.</p>
        <Button onClick={() => router.back()}>Volver a Ventas</Button>
      </div>
    )
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PAGADA":
        return "default"
      case "PENDIENTE":
        return "secondary"
      case "PARCIAL":
        return "secondary"
      case "ANULADA":
        return "destructive"
      case "BORRADOR":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <h1 className="text-3xl font-bold">Detalle de Factura: {factura.numero_factura}</h1>
        <div className="flex gap-2">
          {factura.saldo_pendiente > 0 && factura.estado !== "ANULADA" && (
            <Button onClick={() => setShowPagoDialog(true)}>
              <DollarSign className="mr-2 h-4 w-4" /> Registrar Pago
            </Button>
          )}
          <Button>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Número Factura:</span>
              <span className="font-medium">{factura.numero_factura}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Empresa:</span>
              <Badge variant="outline">{factura.empresa_display || factura.empresa}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium">{formatFecha(factura.fecha_factura)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={getStatusVariant(factura.estado)}>{factura.estado_display || factura.estado}</Badge>
            </div>
            {factura.fecha_vencimiento && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha Vencimiento:</span>
                <span className="font-medium">{formatFecha(factura.fecha_vencimiento)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">
                Q{factura.subtotal.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {factura.descuento > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descuento:</span>
                <span className="font-medium">
                  Q{factura.descuento.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold text-lg">
                Q{factura.total.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {factura.saldo_pendiente > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Pagado:</span>
                  <span className="font-medium text-green-600">
                    Q{factura.total_pagado.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo Pendiente:</span>
                  <span className="font-bold text-red-600">
                    Q{factura.saldo_pendiente.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="font-medium">{factura.cliente_nombre}</span>
            </div>
            {factura.cliente_nit && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">NIT:</span>
                <span className="font-medium">{factura.cliente_nit}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usuario:</span>
              <span className="font-medium">{factura.usuario_nombre}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Notas Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {factura.observaciones || "No hay observaciones adicionales para esta factura."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {factura.detalles.map((detalle) => (
                <TableRow key={detalle.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{detalle.producto_nombre}</div>
                      <div className="text-xs text-muted-foreground">{detalle.producto_codigo}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const info =
                        EMPRESA_INFO[detalle.producto_empresa] ||
                        EMPRESA_INFO.MIXTA
                      return (
                        <Badge
                          variant="outline"
                          className={`px-3 py-1 text-xs font-semibold ${info.className}`}
                        >
                          {info.label}
                        </Badge>
                      )
                    })()}
                  </TableCell>
                  <TableCell>{detalle.cantidad}</TableCell>
                  <TableCell>
                    Q {detalle.precio_unitario.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    Q {detalle.subtotal.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {factura.pagos && factura.pagos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Tipo de Pago</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {factura.pagos.map((pago) => (
                  <TableRow key={pago.id}>
                    <TableCell>{formatFecha(pago.fecha_pago)}</TableCell>
                    <TableCell className="font-medium">
                      Q{pago.monto.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{pago.tipo_pago_display || pago.tipo_pago}</TableCell>
                    <TableCell>{pago.referencia || "-"}</TableCell>
                    <TableCell>{pago.observaciones || "-"}</TableCell>
                    <TableCell>{pago.usuario_nombre}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AgregarPagosMultiplesDialog
        open={showPagoDialog}
        onOpenChange={setShowPagoDialog}
        facturaId={factura.id}
        clienteId={factura.cliente_id}
        totalFactura={factura.total}
        saldoPendiente={factura.saldo_pendiente}
        onPagosAgregados={() => {
          handlePagoAgregado()
          setShowPagoDialog(false)
        }}
      />
    </div>
  )
}
