"use client"

import { useState, useEffect, use, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Loader2, AlertCircle, Send, CheckCircle, XCircle, ShoppingCart, Download } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet } from "@/lib/api-client"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface ProductoDisponible {
  id: number | string
  codigo: string
  nombre: string
  precioVenta: number
  empresa: string
}

interface CotizacionAPI {
  id: number
  numero_cotizacion: string
  empresa: string
  empresa_display: string
  cliente: number
  cliente_nombre: string
  cliente_nit?: string
  subtotal: number | string
  descuento: number | string
  total: number | string
  estado: string
  estado_display: string
  observaciones?: string
  condiciones?: string
  fecha_vencimiento: string
  fecha_aceptacion?: string
  fecha_cotizacion: string
  factura_generada?: number
  factura_generada_numero?: string
  detalles: {
    id: number
    producto_codigo: string
    producto_nombre: string
    producto_empresa: string
    cantidad: number
    precio_unitario: number | string
    descuento: number | string
    subtotal: number | string
  }[]
}

interface CotizacionDetallePageProps {
  params: Promise<{
    id: string
  }>
}

export default function CotizacionDetallePage({ params }: CotizacionDetallePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { token } = useAuth()
  const { toast } = useToast()
  
  const [cotizacion, setCotizacion] = useState<CotizacionAPI | null>(null)
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoDisponible[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Función para obtener el precio original de un producto
  const obtenerPrecioOriginal = (productoCodigo: string, productoEmpresa: string): number => {
    const producto = productosDisponibles.find(
      (p) => p.codigo === productoCodigo && p.empresa === productoEmpresa
    ) || productosDisponibles.find((p) => p.codigo === productoCodigo)
    return producto?.precioVenta || 0
  }

  // Calcular el total con descuentos (suma de subtotales)
  const totalConDescuentos = useMemo(() => {
    if (!cotizacion?.detalles) return 0
    return cotizacion.detalles.reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0)
  }, [cotizacion])

  // Calcular el subtotal SIN descuentos (cantidad × precio original del producto)
  const subtotalSinDescuentos = useMemo(() => {
    if (!cotizacion?.detalles || productosDisponibles.length === 0) return 0
    return cotizacion.detalles.reduce((sum, d) => {
      const cantidad = Number(d.cantidad) || 0
      const precioOriginal = obtenerPrecioOriginal(d.producto_codigo, d.producto_empresa)
      // Si no encontramos el precio original, usamos el precio_unitario
      const precio = precioOriginal > 0 ? precioOriginal : Number(d.precio_unitario)
      return sum + (cantidad * precio)
    }, 0)
  }, [cotizacion, productosDisponibles])

  // Total de descuentos (diferencia entre subtotal sin descuentos y total con descuentos)
  const totalDescuentos = useMemo(() => {
    const descuento = subtotalSinDescuentos - totalConDescuentos
    return descuento > 0 ? descuento : 0
  }, [subtotalSinDescuentos, totalConDescuentos])

  // Cargar productos para obtener precios originales
  useEffect(() => {
    const loadProductos = async () => {
      try {
        const [ferreteria, bloquera, piedrinera] = await Promise.allSettled([
          apiGet<any>(API_ENDPOINTS.FERRETERIA.PRODUCTOS),
          apiGet<any>(API_ENDPOINTS.BLOQUERA.PRODUCTOS),
          apiGet<any>(API_ENDPOINTS.PIEDRINERA.PRODUCTOS),
        ])

        const productos: ProductoDisponible[] = []

        if (ferreteria.status === "fulfilled") {
          const data = ferreteria.value
          const productosData = Array.isArray(data) ? data : data?.results || data?.data || []
          productosData.forEach((p: any) => {
            productos.push({
              id: p.id,
              codigo: p.codigo || "",
              nombre: p.nombre || "",
              precioVenta: p.precioVenta || p.precio_venta || 0,
              empresa: "FERRETERIA",
            })
          })
        }

        if (bloquera.status === "fulfilled") {
          const data = bloquera.value
          const productosData = Array.isArray(data) ? data : data?.results || data?.data || []
          productosData.forEach((p: any) => {
            productos.push({
              id: p.id,
              codigo: p.codigo || "",
              nombre: p.nombre || "",
              precioVenta: p.precioVentaUnitario || p.precio_venta_unitario || p.precioVenta || p.precio_venta || 0,
              empresa: "BLOQUERA",
            })
          })
        }

        if (piedrinera.status === "fulfilled") {
          const data = piedrinera.value
          const productosData = Array.isArray(data) ? data : data?.results || data?.data || []
          productosData.forEach((p: any) => {
            productos.push({
              id: p.id,
              codigo: p.codigo || "",
              nombre: p.nombre || "",
              precioVenta: p.precioVentaPorMetroCubico || p.precioVenta || p.precio_venta_m3 || p.precio_venta || 0,
              empresa: "PIEDRINERA",
            })
          })
        }

        setProductosDisponibles(productos)
      } catch (error) {
        console.error("Error al cargar productos:", error)
      }
    }

    loadProductos()
  }, [])

  // Cargar cotización desde la API
  useEffect(() => {
    const fetchCotizacion = async () => {
      if (!token) return

      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/facturacion/cotizaciones/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Cotización no encontrada")
          }
          throw new Error("Error al cargar la cotización")
        }

        const data: CotizacionAPI = await response.json()
        setCotizacion(data)
      } catch (err) {
        console.error("Error al cargar cotización:", err)
        setError(err instanceof Error ? err.message : "Error al cargar la cotización")
      } finally {
        setLoading(false)
      }
    }

    fetchCotizacion()
  }, [token, id])

  const handleEnviar = async () => {
    if (!token || !cotizacion) return

    setActionLoading("enviar")
    try {
      const response = await fetch(`/api/facturacion/cotizaciones/${id}/enviar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al enviar la cotización")
      }

      const data = await response.json()
      setCotizacion(data)
      toast({
        title: "Cotización Enviada",
        description: "La cotización ha sido marcada como enviada al cliente.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error al enviar la cotización",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleAceptar = async () => {
    if (!token || !cotizacion) return

    setActionLoading("aceptar")
    try {
      const response = await fetch(`/api/facturacion/cotizaciones/${id}/aceptar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al aceptar la cotización")
      }

      const data = await response.json()
      setCotizacion(data)
      toast({
        title: "Cotización Aceptada",
        description: "La cotización ha sido marcada como aceptada.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error al aceptar la cotización",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRechazar = async () => {
    if (!token || !cotizacion) return

    setActionLoading("rechazar")
    try {
      const response = await fetch(`/api/facturacion/cotizaciones/${id}/rechazar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al rechazar la cotización")
      }

      const data = await response.json()
      setCotizacion(data)
      toast({
        title: "Cotización Rechazada",
        description: "La cotización ha sido marcada como rechazada.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error al rechazar la cotización",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Aceptar cotización e ir a pagar (redirige a ventas/nueva con datos pre-cargados)
  const handleAceptarEIrAPagar = async () => {
    if (!token || !cotizacion) return

    setActionLoading("aceptar_pagar")
    try {
      // Primero aceptar la cotización
      const response = await fetch(`/api/facturacion/cotizaciones/${id}/aceptar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al aceptar la cotización")
      }

      toast({
        title: "Cotización Aceptada",
        description: "Redirigiendo a crear factura...",
      })

      // Redirigir a la página de ventas con el ID de la cotización
      router.push(`/ferreteria/ventas/nueva?cotizacion_id=${cotizacion.id}`)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error al aceptar la cotización",
        variant: "destructive",
      })
      setActionLoading(null)
    }
  }

  // Ir a pagar (para cotizaciones ya aceptadas)
  const handleIrAPagar = () => {
    if (!cotizacion) return
    router.push(`/ferreteria/ventas/nueva?cotizacion_id=${cotizacion.id}`)
  }

  // Función para generar PDF de la cotización
  const handleGenerarPDF = () => {
    if (!cotizacion) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Colores
    const primaryColor: [number, number, number] = [41, 128, 185] // Azul profesional
    const darkColor: [number, number, number] = [44, 62, 80] // Gris oscuro
    const lightGray: [number, number, number] = [236, 240, 241] // Gris claro
    const greenColor: [number, number, number] = [39, 174, 96] // Verde para descuentos

    // ===== ENCABEZADO =====
    // Fondo del encabezado
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 45, "F")

    // Título de la empresa
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("FRAMASA", 15, 20)
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Ferretería | Bloquera | Piedrinera", 15, 28)

    // Número de cotización (lado derecho)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("COTIZACIÓN", pageWidth - 15, 15, { align: "right" })
    doc.setFontSize(16)
    doc.text(cotizacion.numero_cotizacion, pageWidth - 15, 25, { align: "right" })
    
    // Estado
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Estado: ${cotizacion.estado_display || cotizacion.estado}`, pageWidth - 15, 35, { align: "right" })

    // ===== INFORMACIÓN DE FECHAS Y CLIENTE =====
    let yPos = 52

    // Recuadro de información (más compacto)
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.roundedRect(10, yPos, pageWidth - 20, 28, 2, 2, "S")

    // Información del cliente (izquierda) - con NIT o CF
    doc.setTextColor(...darkColor)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("CLIENTE:", 15, yPos + 8)
    doc.setFont("helvetica", "normal")
    doc.text(cotizacion.cliente_nombre, 40, yPos + 8)
    
    doc.setFont("helvetica", "bold")
    doc.text("NIT:", 15, yPos + 16)
    doc.setFont("helvetica", "normal")
    doc.text(cotizacion.cliente_nit || "CF - Consumidor Final", 40, yPos + 16)

    // Información de fechas (derecha)
    doc.setFont("helvetica", "bold")
    doc.text("FECHA:", pageWidth - 75, yPos + 8)
    doc.setFont("helvetica", "normal")
    doc.text(formatDate(cotizacion.fecha_cotizacion), pageWidth - 55, yPos + 8)
    
    doc.setFont("helvetica", "bold")
    doc.text("VÁLIDA HASTA:", pageWidth - 75, yPos + 16)
    doc.setFont("helvetica", "normal")
    doc.text(formatDate(cotizacion.fecha_vencimiento), pageWidth - 45, yPos + 16)

    yPos += 35

    // ===== TABLA DE PRODUCTOS =====
    // La tabla automáticamente crea nuevas páginas si es necesario
    const tableData = cotizacion.detalles?.map((item) => {
      const precioOriginal = obtenerPrecioOriginal(item.producto_codigo, item.producto_empresa)
      const precioConDescuento = Number(item.precio_unitario)
      
      return [
        item.producto_codigo,
        item.producto_nombre,
        item.cantidad.toString(),
        `Q${precioOriginal > 0 ? precioOriginal.toFixed(2) : precioConDescuento.toFixed(2)}`,
        `Q${precioConDescuento.toFixed(2)}`,
        `Q${Number(item.subtotal).toFixed(2)}`
      ]
    }) || []

    autoTable(doc, {
      startY: yPos,
      head: [["Código", "Producto", "Cant.", "Precio Original", "Precio c/Desc.", "Subtotal"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        fontSize: 9,
      },
      bodyStyles: {
        textColor: darkColor,
        fontSize: 8,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 30 },
        1: { halign: "left", cellWidth: 55 },
        2: { halign: "center", cellWidth: 15 },
        3: { halign: "right", cellWidth: 28 },
        4: { halign: "right", cellWidth: 28 },
        5: { halign: "right", cellWidth: 28 },
      },
      alternateRowStyles: {
        fillColor: lightGray,
      },
      margin: { left: 10, right: 10 },
    })

    // Obtener posición Y después de la tabla
    const finalY = (doc as any).lastAutoTable.finalY + 5

    // ===== RESUMEN DE TOTALES (más compacto) =====
    const totalesX = pageWidth - 75
    const totalesWidth = 65

    // Fondo para totales (más compacto)
    const alturaTotal = totalDescuentos > 0 ? 32 : 26
    doc.setFillColor(...lightGray)
    doc.roundedRect(totalesX - 3, finalY, totalesWidth + 6, alturaTotal, 2, 2, "F")

    doc.setTextColor(...darkColor)
    doc.setFontSize(8)

    let totY = finalY + 6

    // Subtotal sin descuentos
    doc.setFont("helvetica", "normal")
    doc.text("Subtotal (sin desc.):", totalesX, totY)
    doc.text(`Q${subtotalSinDescuentos.toFixed(2)}`, totalesX + totalesWidth, totY, { align: "right" })
    totY += 6

    // Subtotal con descuentos
    doc.text("Subtotal (con desc.):", totalesX, totY)
    doc.text(`Q${totalConDescuentos.toFixed(2)}`, totalesX + totalesWidth, totY, { align: "right" })
    totY += 6

    // Total descuentos (en verde)
    if (totalDescuentos > 0) {
      doc.setTextColor(...greenColor)
      doc.text("Total Descuentos:", totalesX, totY)
      doc.text(`-Q${totalDescuentos.toFixed(2)}`, totalesX + totalesWidth, totY, { align: "right" })
      totY += 6
    }

    // Total a pagar
    doc.setTextColor(...darkColor)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("TOTAL:", totalesX, totY + 2)
    doc.setTextColor(...primaryColor)
    doc.text(`Q${totalConDescuentos.toFixed(2)}`, totalesX + totalesWidth, totY + 2, { align: "right" })

    // ===== OBSERVACIONES =====
    if (cotizacion.observaciones) {
      const obsY = finalY + alturaTotal + 8
      doc.setTextColor(...darkColor)
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.text("OBSERVACIONES:", 10, obsY)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      
      const splitObservaciones = doc.splitTextToSize(cotizacion.observaciones, pageWidth - 100)
      doc.text(splitObservaciones, 10, obsY + 6)
    }

    // ===== PIE DE PÁGINA =====
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setFillColor(...primaryColor)
    doc.rect(0, pageHeight - 20, pageWidth, 20, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text("Gracias por su preferencia • FRAMASA - Materiales de Construcción", pageWidth / 2, pageHeight - 12, { align: "center" })
    doc.text(`Documento generado el ${new Date().toLocaleDateString("es-GT")}`, pageWidth / 2, pageHeight - 6, { align: "center" })

    // Descargar PDF
    doc.save(`Cotizacion_${cotizacion.numero_cotizacion}.pdf`)

    toast({
      title: "PDF Generado",
      description: `Se ha descargado la cotización ${cotizacion.numero_cotizacion} en formato PDF`,
    })
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACEPTADA":
        return "default"
      case "ENVIADA":
      case "BORRADOR":
        return "secondary"
      case "RECHAZADA":
      case "VENCIDA":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Cargando cotización...</p>
      </div>
    )
  }

  if (error || !cotizacion) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "No se pudo cargar la cotización"}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.push("/ferreteria/cotizaciones")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Cotizaciones
        </Button>
      </div>
    )
  }

  const canEdit = cotizacion.estado === "BORRADOR"
  const canSend = cotizacion.estado === "BORRADOR"
  const canAccept = cotizacion.estado === "ENVIADA"
  const canReject = cotizacion.estado === "ENVIADA"
  const canAcceptAndPay = cotizacion.estado === "ENVIADA" || cotizacion.estado === "BORRADOR"
  const canGoToPay = cotizacion.estado === "ACEPTADA"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <h1 className="text-3xl font-bold">Cotización: {cotizacion.numero_cotizacion}</h1>
        <div className="flex gap-2">
          {canEdit && (
            <Link href={`/ferreteria/cotizaciones/${cotizacion.id}/editar`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Button>
            </Link>
          )}
          <Button variant="outline" onClick={handleGenerarPDF}>
            <Download className="mr-2 h-4 w-4" /> Descargar PDF
          </Button>
        </div>
      </div>

      {/* Acciones disponibles según el estado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Acciones
            <Badge variant={getStatusVariant(cotizacion.estado)}>
              {cotizacion.estado_display || cotizacion.estado}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {canSend && (
            <Button onClick={handleEnviar} disabled={actionLoading === "enviar"}>
              {actionLoading === "enviar" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Enviar al Cliente
            </Button>
          )}
          {canAccept && (
            <Button variant="default" onClick={handleAceptar} disabled={actionLoading === "aceptar"}>
              {actionLoading === "aceptar" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Aceptar
            </Button>
          )}
          {canReject && (
            <Button variant="destructive" onClick={handleRechazar} disabled={actionLoading === "rechazar"}>
              {actionLoading === "rechazar" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Rechazar
            </Button>
          )}
          {canAcceptAndPay && !cotizacion.factura_generada && (
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleAceptarEIrAPagar} 
              disabled={actionLoading === "aceptar_pagar"}
            >
              {actionLoading === "aceptar_pagar" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 h-4 w-4" />
              )}
              Aceptar e Ir a Pagar
            </Button>
          )}
          {canGoToPay && (
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleIrAPagar}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ir a Pagar
            </Button>
          )}
          {!canSend && !canAccept && !canReject && !canAcceptAndPay && !canGoToPay && (
            <p className="text-muted-foreground">No hay acciones disponibles para el estado actual.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Código:</span>
              <span className="font-medium">{cotizacion.numero_cotizacion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Empresa:</span>
              <Badge variant="outline">{cotizacion.empresa_display || cotizacion.empresa}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium">{formatDate(cotizacion.fecha_cotizacion)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vencimiento:</span>
              <span className="font-medium">{formatDate(cotizacion.fecha_vencimiento)}</span>
            </div>
            {cotizacion.fecha_aceptacion && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aceptación:</span>
                <span className="font-medium">{formatDate(cotizacion.fecha_aceptacion)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={getStatusVariant(cotizacion.estado)}>
                {cotizacion.estado_display || cotizacion.estado}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="font-medium">{cotizacion.cliente_nombre}</span>
            </div>
            {cotizacion.cliente_nit && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">NIT:</span>
                <span className="font-medium">{cotizacion.cliente_nit}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Totales</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal (sin descuentos):</span>
              <span className="font-medium">
                Q{subtotalSinDescuentos.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal (con descuentos):</span>
              <span className="font-medium">
                Q{totalConDescuentos.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {totalDescuentos > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Descuentos:</span>
                <span className="font-medium text-green-600">
                  -Q{totalDescuentos.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Total a Pagar:</span>
              <span className="font-bold text-lg">
                Q{totalConDescuentos.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {(cotizacion.observaciones || cotizacion.condiciones) && (
        <div className="grid gap-6 md:grid-cols-2">
          {cotizacion.observaciones && (
            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{cotizacion.observaciones}</p>
              </CardContent>
            </Card>
          )}
          {cotizacion.condiciones && (
            <Card>
              <CardHeader>
                <CardTitle>Condiciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{cotizacion.condiciones}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Productos Cotizados ({cotizacion.detalles?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Original</TableHead>
                <TableHead>Precio c/Desc.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cotizacion.detalles?.map((item) => {
                const precioOriginal = obtenerPrecioOriginal(item.producto_codigo, item.producto_empresa)
                const precioConDescuento = Number(item.precio_unitario)
                const tieneDescuento = precioOriginal > 0 && precioOriginal > precioConDescuento
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.producto_codigo}</TableCell>
                    <TableCell className="font-medium">{item.producto_nombre}</TableCell>
                    <TableCell>{item.cantidad}</TableCell>
                    <TableCell>
                      {precioOriginal > 0 ? (
                        <span className={tieneDescuento ? "text-muted-foreground line-through" : ""}>
                          Q{precioOriginal.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={tieneDescuento ? "text-green-600 font-medium" : ""}>
                        Q{precioConDescuento.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Q{Number(item.subtotal).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {(!cotizacion.detalles || cotizacion.detalles.length === 0) && (
            <p className="text-center text-muted-foreground py-4">No hay productos en esta cotización.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

