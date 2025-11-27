"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  ShoppingCart,
  Factory,
  Truck,
  Hammer,
  FileSpreadsheet,
} from "lucide-react"
import ExcelJS from "exceljs"
import { useToast } from "@/hooks/use-toast"

// Datos estáticos de la empresa
const empresaInfo = {
  nombre: "FRAMASA",
  nit: "12345678-9",
  direccion: "Ciudad de Guatemala, Guatemala",
  telefono: "+502 1234-5678",
  email: "info@framasa.com",
}

// Datos estáticos de Ferretería
const ferreteriaData = {
  ventasTotales: 125430.50,
  totalFacturas: 342,
  productosVendidos: 1847,
  clientesActivos: 156,
  productosEnStock: 1247,
  productosBajoStock: 23,
  topProductos: [
    { nombre: "Cemento UGC 50kg", cantidad: 450, ingresos: 22500.00 },
    { nombre: "Varilla #3", cantidad: 320, ingresos: 19200.00 },
    { nombre: "Arena Fina", cantidad: 280, ingresos: 14000.00 },
    { nombre: "Pintura Latex", cantidad: 150, ingresos: 11250.00 },
    { nombre: "Clavos 2.5 pulgadas", cantidad: 200, ingresos: 8000.00 },
  ],
  topClientes: [
    { nombre: "Constructora ABC", facturas: 45, total: 45000.00 },
    { nombre: "Inmobiliaria XYZ", facturas: 32, total: 32000.00 },
    { nombre: "Ingeniería 123", facturas: 28, total: 28000.00 },
  ],
}

// Datos estáticos de Bloquera
const bloqueraData = {
  produccionTotal: 12500,
  unidadesVendidas: 11200,
  ordenesCompletadas: 45,
  ordenesPendientes: 8,
  productosEnStock: 1300,
  productosBajoStock: 5,
  topProductos: [
    { nombre: "Block 15x20x40", cantidad: 6500, ingresos: 32500.00 },
    { nombre: "Block 20x20x40", cantidad: 3200, ingresos: 19200.00 },
    { nombre: "Block 10x20x40", cantidad: 1500, ingresos: 7500.00 },
  ],
  ordenesRecientes: [
    { numero: "BLQ-2024-001", cantidad: 500, estado: "Completada" },
    { numero: "BLQ-2024-002", cantidad: 300, estado: "En Proceso" },
    { numero: "BLQ-2024-003", cantidad: 200, estado: "Pendiente" },
  ],
}

// Datos estáticos de Piedrinera
const piedrineraData = {
  despachosTotales: 342,
  agregadosEnStock: 8450,
  ordenesPendientes: 18,
  camionesActivos: 12,
  totalCamiones: 15,
  topProductos: [
    { nombre: "Arena Fina", cantidad: 1200, ingresos: 24000.00 },
    { nombre: "Arena Gruesa", cantidad: 980, ingresos: 19600.00 },
    { nombre: "Piedrín 3/4", cantidad: 850, ingresos: 25500.00 },
    { nombre: "Piedrín 1/2", cantidad: 720, ingresos: 21600.00 },
  ],
  despachosRecientes: [
    { orden: "PD-2024-001", cantidad: 12, destino: "Obra Central", estado: "Completado" },
    { orden: "PD-2024-002", cantidad: 8, destino: "Proyecto Norte", estado: "En Ruta" },
    { orden: "PD-2024-003", cantidad: 15, destino: "Construcción Sur", estado: "Pendiente" },
  ],
}

// Datos estáticos de Taller
const tallerData = {
  ordenesCompletadas: 78,
  ordenesEnProceso: 12,
  ordenesPendientes: 5,
  materialesEnStock: 456,
  materialesBajoStock: 18,
  serviciosRealizados: 156,
  topMateriales: [
    { nombre: "Aceite Motor 15W-40", cantidad: 45, ingresos: 2250.00 },
    { nombre: "Filtro de Aire", cantidad: 32, ingresos: 1280.00 },
    { nombre: "Bujías", cantidad: 28, ingresos: 1120.00 },
    { nombre: "Frenos Delanteros", cantidad: 20, ingresos: 3000.00 },
  ],
  ordenesRecientes: [
    { numero: "TAL-2024-001", equipo: "Excavadora CAT", servicio: "Mantenimiento", estado: "Completada" },
    { numero: "TAL-2024-002", equipo: "Cargador", servicio: "Reparación", estado: "En Proceso" },
    { numero: "TAL-2024-003", equipo: "Volquete", servicio: "Revisión", estado: "Pendiente" },
  ],
}

export default function ReportesPage() {
  const { toast } = useToast()

  const exportarExcel = async (seccion: string, datos: any) => {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Resumen")

      // Crear hoja de resumen
      const resumenData: any[][] = [
        ["REPORTE GENERAL - " + seccion.toUpperCase()],
        ["Fecha de Generación", new Date().toLocaleDateString("es-GT")],
        [""],
        ["INDICADORES PRINCIPALES"],
      ]

      // Agregar datos según la sección
      if (seccion === "Ferretería") {
        resumenData.push(
          ["Ventas Totales", `Q ${datos.ventasTotales.toFixed(2)}`],
          ["Total de Facturas", datos.totalFacturas],
          ["Productos Vendidos", datos.productosVendidos],
          ["Clientes Activos", datos.clientesActivos],
          ["Productos en Stock", datos.productosEnStock],
          ["Productos Bajo Stock", datos.productosBajoStock],
          [""],
          ["TOP PRODUCTOS"],
          ["Producto", "Cantidad", "Ingresos (Q)"]
        )
        datos.topProductos.forEach((p: any) => {
          resumenData.push([p.nombre, p.cantidad, p.ingresos.toFixed(2)])
        })
        resumenData.push([""], ["TOP CLIENTES"], ["Cliente", "Facturas", "Total (Q)"])
        datos.topClientes.forEach((c: any) => {
          resumenData.push([c.nombre, c.facturas, c.total.toFixed(2)])
        })
      } else if (seccion === "Bloquera") {
        resumenData.push(
          ["Producción Total", datos.produccionTotal],
          ["Unidades Vendidas", datos.unidadesVendidas],
          ["Órdenes Completadas", datos.ordenesCompletadas],
          ["Órdenes Pendientes", datos.ordenesPendientes],
          ["Productos en Stock", datos.productosEnStock],
          ["Productos Bajo Stock", datos.productosBajoStock],
          [""],
          ["TOP PRODUCTOS"],
          ["Producto", "Cantidad", "Ingresos (Q)"]
        )
        datos.topProductos.forEach((p: any) => {
          resumenData.push([p.nombre, p.cantidad, p.ingresos.toFixed(2)])
        })
        resumenData.push([""], ["ÓRDENES RECIENTES"], ["Número", "Cantidad", "Estado"])
        datos.ordenesRecientes.forEach((o: any) => {
          resumenData.push([o.numero, o.cantidad, o.estado])
        })
      } else if (seccion === "Piedrinera") {
        resumenData.push(
          ["Despachos Totales", datos.despachosTotales],
          ["Agregados en Stock (m³)", datos.agregadosEnStock],
          ["Órdenes Pendientes", datos.ordenesPendientes],
          ["Camiones Activos", `${datos.camionesActivos}/${datos.totalCamiones}`],
          [""],
          ["TOP PRODUCTOS"],
          ["Producto", "Cantidad (m³)", "Ingresos (Q)"]
        )
        datos.topProductos.forEach((p: any) => {
          resumenData.push([p.nombre, p.cantidad, p.ingresos.toFixed(2)])
        })
        resumenData.push([""], ["DESPACHOS RECIENTES"], ["Orden", "Cantidad (m³)", "Destino", "Estado"])
        datos.despachosRecientes.forEach((d: any) => {
          resumenData.push([d.orden, d.cantidad, d.destino, d.estado])
        })
      } else if (seccion === "Taller") {
        resumenData.push(
          ["Órdenes Completadas", datos.ordenesCompletadas],
          ["Órdenes en Proceso", datos.ordenesEnProceso],
          ["Órdenes Pendientes", datos.ordenesPendientes],
          ["Materiales en Stock", datos.materialesEnStock],
          ["Materiales Bajo Stock", datos.materialesBajoStock],
          ["Servicios Realizados", datos.serviciosRealizados],
          [""],
          ["TOP MATERIALES"],
          ["Material", "Cantidad", "Ingresos (Q)"]
        )
        datos.topMateriales.forEach((m: any) => {
          resumenData.push([m.nombre, m.cantidad, m.ingresos.toFixed(2)])
        })
        resumenData.push([""], ["ÓRDENES RECIENTES"], ["Número", "Equipo", "Servicio", "Estado"])
        datos.ordenesRecientes.forEach((o: any) => {
          resumenData.push([o.numero, o.equipo, o.servicio, o.estado])
        })
      }

      // Agregar datos a la hoja
      worksheet.addRows(resumenData)

      // Ajustar anchos de columna
      worksheet.columns = [
        { width: 30 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
      ]

      // Estilizar encabezados
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          // Encabezado principal
          if (rowNumber === 1) {
            cell.font = { bold: true, size: 16 }
            cell.alignment = { horizontal: "center" }
          }
          // Títulos de sección
          else if (
            rowNumber === 4 ||
            (typeof resumenData[rowNumber - 1]?.[0] === "string" &&
              (resumenData[rowNumber - 1][0].includes("TOP") ||
                resumenData[rowNumber - 1][0].includes("ÓRDENES") ||
                resumenData[rowNumber - 1][0].includes("DESPACHOS") ||
                resumenData[rowNumber - 1][0].includes("CLIENTES")))
          ) {
            cell.font = { bold: true, size: 12 }
          }
        })
      })

      // Generar y descargar el archivo
      const fileName = `Reporte_${seccion}_${new Date().toISOString().split("T")[0]}.xlsx`
      const buffer = await workbook.xlsx.writeBuffer()
      
      // Crear blob y descargar
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Excel Generado",
        description: `El reporte de ${seccion} se ha descargado exitosamente.`,
      })
    } catch (error) {
      console.error("Error al generar Excel:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el archivo Excel. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes Generales</h1>
          <p className="text-muted-foreground">Información general de la empresa y sus secciones</p>
        </div>
      </div>

      {/* Información de la Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Información de la Empresa
          </CardTitle>
          <CardDescription>Datos generales de FRAMASA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p className="text-lg font-semibold">{empresaInfo.nombre}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">NIT</p>
              <p className="text-lg font-semibold">{empresaInfo.nit}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dirección</p>
              <p className="text-lg font-semibold">{empresaInfo.direccion}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
              <p className="text-lg font-semibold">{empresaInfo.telefono}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección Ferretería */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Ferretería
              </CardTitle>
              <CardDescription>Información general del módulo de ferretería</CardDescription>
            </div>
            <Button onClick={() => exportarExcel("Ferretería", ferreteriaData)} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Ventas Totales</p>
              <p className="text-2xl font-bold">Q {ferreteriaData.ventasTotales.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total de Facturas</p>
              <p className="text-2xl font-bold">{ferreteriaData.totalFacturas}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Productos Vendidos</p>
              <p className="text-2xl font-bold">{ferreteriaData.productosVendidos.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Clientes Activos</p>
              <p className="text-2xl font-bold">{ferreteriaData.clientesActivos}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Productos en Stock</p>
              <p className="text-2xl font-bold">{ferreteriaData.productosEnStock}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Productos Bajo Stock</p>
              <p className="text-2xl font-bold text-orange-600">{ferreteriaData.productosBajoStock}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Top 5 Productos</h3>
              <div className="space-y-2">
                {ferreteriaData.topProductos.map((producto, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">Cantidad: {producto.cantidad}</p>
                    </div>
                    <p className="font-semibold">Q {producto.ingresos.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Top 3 Clientes</h3>
              <div className="space-y-2">
                {ferreteriaData.topClientes.map((cliente, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{cliente.nombre}</p>
                      <p className="text-sm text-muted-foreground">{cliente.facturas} facturas</p>
                    </div>
                    <p className="font-semibold">Q {cliente.total.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección Bloquera */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5" />
                Bloquera
              </CardTitle>
              <CardDescription>Información general del módulo de bloquera</CardDescription>
            </div>
            <Button onClick={() => exportarExcel("Bloquera", bloqueraData)} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Producción Total</p>
              <p className="text-2xl font-bold">{bloqueraData.produccionTotal.toLocaleString()} unidades</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Unidades Vendidas</p>
              <p className="text-2xl font-bold">{bloqueraData.unidadesVendidas.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Órdenes Completadas</p>
              <p className="text-2xl font-bold">{bloqueraData.ordenesCompletadas}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Órdenes Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">{bloqueraData.ordenesPendientes}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Productos en Stock</p>
              <p className="text-2xl font-bold">{bloqueraData.productosEnStock}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Productos Bajo Stock</p>
              <p className="text-2xl font-bold text-orange-600">{bloqueraData.productosBajoStock}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Top 3 Productos</h3>
              <div className="space-y-2">
                {bloqueraData.topProductos.map((producto, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">Cantidad: {producto.cantidad}</p>
                    </div>
                    <p className="font-semibold">Q {producto.ingresos.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Órdenes Recientes</h3>
              <div className="space-y-2">
                {bloqueraData.ordenesRecientes.map((orden, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{orden.numero}</p>
                      <p className="text-sm text-muted-foreground">Cantidad: {orden.cantidad}</p>
                    </div>
                    <Badge variant={orden.estado === "Completada" ? "default" : orden.estado === "En Proceso" ? "secondary" : "outline"}>
                      {orden.estado}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección Piedrinera */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Piedrinera
              </CardTitle>
              <CardDescription>Información general del módulo de piedrinera</CardDescription>
            </div>
            <Button onClick={() => exportarExcel("Piedrinera", piedrineraData)} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Despachos Totales</p>
              <p className="text-2xl font-bold">{piedrineraData.despachosTotales}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Agregados en Stock</p>
              <p className="text-2xl font-bold">{piedrineraData.agregadosEnStock.toLocaleString()} m³</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Órdenes Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">{piedrineraData.ordenesPendientes}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Camiones Activos</p>
              <p className="text-2xl font-bold">
                {piedrineraData.camionesActivos}/{piedrineraData.totalCamiones}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Top 4 Productos</h3>
              <div className="space-y-2">
                {piedrineraData.topProductos.map((producto, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">Cantidad: {producto.cantidad} m³</p>
                    </div>
                    <p className="font-semibold">Q {producto.ingresos.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Despachos Recientes</h3>
              <div className="space-y-2">
                {piedrineraData.despachosRecientes.map((despacho, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{despacho.orden}</p>
                      <p className="text-sm text-muted-foreground">
                        {despacho.cantidad} m³ - {despacho.destino}
                      </p>
                    </div>
                    <Badge variant={despacho.estado === "Completado" ? "default" : despacho.estado === "En Ruta" ? "secondary" : "outline"}>
                      {despacho.estado}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección Taller */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Hammer className="h-5 w-5" />
                Taller
              </CardTitle>
              <CardDescription>Información general del módulo de taller</CardDescription>
            </div>
            <Button onClick={() => exportarExcel("Taller", tallerData)} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Órdenes Completadas</p>
              <p className="text-2xl font-bold">{tallerData.ordenesCompletadas}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Órdenes en Proceso</p>
              <p className="text-2xl font-bold text-blue-600">{tallerData.ordenesEnProceso}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Órdenes Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">{tallerData.ordenesPendientes}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Materiales en Stock</p>
              <p className="text-2xl font-bold">{tallerData.materialesEnStock}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Materiales Bajo Stock</p>
              <p className="text-2xl font-bold text-orange-600">{tallerData.materialesBajoStock}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Servicios Realizados</p>
              <p className="text-2xl font-bold">{tallerData.serviciosRealizados}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Top 4 Materiales</h3>
              <div className="space-y-2">
                {tallerData.topMateriales.map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{material.nombre}</p>
                      <p className="text-sm text-muted-foreground">Cantidad: {material.cantidad}</p>
                    </div>
                    <p className="font-semibold">Q {material.ingresos.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Órdenes Recientes</h3>
              <div className="space-y-2">
                {tallerData.ordenesRecientes.map((orden, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{orden.numero}</p>
                      <p className="text-sm text-muted-foreground">
                        {orden.equipo} - {orden.servicio}
                      </p>
                    </div>
                    <Badge variant={orden.estado === "Completada" ? "default" : orden.estado === "En Proceso" ? "secondary" : "outline"}>
                      {orden.estado}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

