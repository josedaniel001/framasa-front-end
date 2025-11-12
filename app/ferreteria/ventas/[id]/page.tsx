"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getSampleVentasFerreteria, getSampleClientesFerreteria, getSamplePagos } from "@/lib/sample-data"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Printer, DollarSign } from "lucide-react"
import Link from "next/link"
import { RegistrarPagoDialog } from "@/components/ventas/registrar-pago-dialog"
import { TipoVenta, EstadoPago } from "@/types/database"
import type { Pago } from "@/types/database"

interface VentaDetallePageProps {
  params: {
    id: string
  }
}

export default function VentaDetallePage({ params }: VentaDetallePageProps) {
  const router = useRouter()
  const [ventas, setVentas] = useState(getSampleVentasFerreteria())
  const [pagos, setPagos] = useState(getSamplePagos())
  const clientes = getSampleClientesFerreteria()
  const [showPagoDialog, setShowPagoDialog] = useState(false)

  // Obtener la venta actualizada de la lista
  const venta = useMemo(() => {
    return ventas.find((v) => v.id === params.id)
  }, [ventas, params.id])

  if (!venta) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-3xl font-bold">Venta no encontrada</h1>
        <p className="text-muted-foreground">La venta con ID {params.id} no existe.</p>
        <Button onClick={() => router.back()}>Volver a Ventas</Button>
      </div>
    )
  }

  const clienteInfo = clientes.find((c) => c.id === venta.clienteId || c.nombre === venta.cliente)
  const pagosVenta = useMemo(() => {
    return pagos.filter((p) => p.ventaId === venta.id)
  }, [pagos, venta.id])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completada":
        return "default"
      case "Pendiente":
        return "secondary"
      case "Cancelada":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getEstadoPagoVariant = (estado?: EstadoPago) => {
    switch (estado) {
      case EstadoPago.PAGADO:
        return "default"
      case EstadoPago.PARCIAL:
        return "secondary"
      case EstadoPago.VENCIDO:
        return "destructive"
      case EstadoPago.PENDIENTE:
        return "outline"
      default:
        return "outline"
    }
  }

  const handlePagoRegistrado = (nuevoPago: Pago) => {
    // Agregar el pago a la lista
    setPagos([...pagos, nuevoPago])

    // Actualizar la venta con el nuevo estado de pago
    const ventaActualizada = { ...venta }
    const montoPagadoAnterior = venta.montoPagado || 0
    const nuevoMontoPagado = montoPagadoAnterior + nuevoPago.monto
    const nuevoSaldoPendiente = venta.total - nuevoMontoPagado

    ventaActualizada.montoPagado = nuevoMontoPagado
    ventaActualizada.saldoPendiente = nuevoSaldoPendiente

    if (nuevoSaldoPendiente <= 0) {
      ventaActualizada.estadoPago = EstadoPago.PAGADO
      ventaActualizada.estado = "Completada"
    } else if (nuevoMontoPagado > 0 && nuevoMontoPagado < venta.total) {
      ventaActualizada.estadoPago = EstadoPago.PARCIAL
    } else {
      ventaActualizada.estadoPago = EstadoPago.PENDIENTE
    }

    // Actualizar la lista de ventas
    setVentas(ventas.map((v) => (v.id === venta.id ? ventaActualizada : v)))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <h1 className="text-3xl font-bold">Detalle de Venta: {venta.codigo}</h1>
        <div className="flex gap-2">
          {venta.tipoVenta === TipoVenta.CREDITO && (venta.saldoPendiente || 0) > 0 && (
            <Button onClick={() => setShowPagoDialog(true)}>
              <DollarSign className="mr-2 h-4 w-4" /> Registrar Pago
            </Button>
          )}
          <Link href={`/ferreteria/ventas/${venta.id}/editar`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
          </Link>
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
              <span className="text-muted-foreground">Código:</span>
              <span className="font-medium">{venta.codigo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium">{venta.fecha}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={getStatusVariant(venta.estado)}>{venta.estado}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo de Venta:</span>
              <Badge variant={venta.tipoVenta === TipoVenta.CREDITO ? "secondary" : "outline"}>
                {venta.tipoVenta === TipoVenta.CREDITO ? "Crédito" : "Contado"}
              </Badge>
            </div>
            {venta.tipoVenta === TipoVenta.CREDITO && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado de Pago:</span>
                  <Badge variant={getEstadoPagoVariant(venta.estadoPago)}>
                    {venta.estadoPago === EstadoPago.PAGADO
                      ? "Pagado"
                      : venta.estadoPago === EstadoPago.PARCIAL
                        ? "Pago Parcial"
                        : venta.estadoPago === EstadoPago.VENCIDO
                          ? "Vencido"
                          : "Pendiente"}
                  </Badge>
                </div>
                {venta.fechaVencimiento && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha Vencimiento:</span>
                    <span className="font-medium">
                      {new Date(venta.fechaVencimiento).toLocaleDateString("es-GT")}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold text-lg">Q{venta.total.toFixed(2)}</span>
            </div>
            {venta.tipoVenta === TipoVenta.CREDITO && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto Pagado:</span>
                  <span className="font-medium text-green-600">
                    Q{(venta.montoPagado || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo Pendiente:</span>
                  <span className="font-bold text-red-600">
                    Q{(venta.saldoPendiente || 0).toFixed(2)}
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
              <span className="font-medium">{venta.cliente}</span>
            </div>
            {clienteInfo && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NIT:</span>
                  <span className="font-medium">{clienteInfo.nit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span className="font-medium">{clienteInfo.telefono}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{clienteInfo.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dirección:</span>
                  <span className="font-medium text-right">{clienteInfo.direccion}</span>
                </div>
              </>
            )}
            {!clienteInfo && <p className="text-muted-foreground text-sm">Detalles del cliente no disponibles.</p>}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Notas Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {/* Asumiendo que la venta tiene una propiedad 'notas' */}
              {/* @ts-ignore */}
              {venta.notas || "No hay notas adicionales para esta venta."}
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
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venta.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.nombreProducto}</TableCell>
                  <TableCell>{item.cantidad}</TableCell>
                  <TableCell>Q{item.precioUnitario.toFixed(2)}</TableCell>
                  <TableCell className="text-right">Q{item.subtotal.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {venta.tipoVenta === TipoVenta.CREDITO && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            {pagosVenta.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagosVenta.map((pago) => (
                    <TableRow key={pago.id}>
                      <TableCell>
                        {new Date(pago.fechaPago).toLocaleDateString("es-GT", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-medium">Q{pago.monto.toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{pago.metodoPago}</TableCell>
                      <TableCell>{pago.referencia || "-"}</TableCell>
                      <TableCell>{pago.observaciones || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No se han registrado pagos para esta venta.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <RegistrarPagoDialog
        open={showPagoDialog}
        onOpenChange={setShowPagoDialog}
        venta={venta}
        onPagoRegistrado={handlePagoRegistrado}
      />
    </div>
  )
}
