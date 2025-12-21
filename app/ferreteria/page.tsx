"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Archive, ShoppingCart, FileText, Users, CreditCard, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function FerreteriaHomePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Módulo de Ferretería</h1>
          <p className="text-muted-foreground">Gestión integral de productos, inventario, ventas y clientes de la ferretería.</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/ferreteria/productos">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Catálogo de Productos</div>
              <p className="text-xs text-muted-foreground">Ver, crear y editar productos disponibles en la ferretería.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ferreteria/inventario">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventario</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Control de Inventario</div>
              <p className="text-xs text-muted-foreground">Gestión de stock, movimientos y alertas de inventario.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ferreteria/ventas">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Registro de Ventas</div>
              <p className="text-xs text-muted-foreground">Crear facturas, consultar historial y gestionar transacciones.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ferreteria/cotizaciones">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cotizaciones</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gestión de Cotizaciones</div>
              <p className="text-xs text-muted-foreground">Crear presupuestos, enviar a clientes y convertir a ventas.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ferreteria/clientes">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Base de Clientes</div>
              <p className="text-xs text-muted-foreground">Administrar información de clientes y fiados.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ferreteria/cuentas-por-cobrar">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cuentas por Cobrar</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gestión de Créditos</div>
              <p className="text-xs text-muted-foreground">Control de pagos pendientes y estados de cuenta de clientes.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
