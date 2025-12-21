"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Archive, ShoppingCart, Factory, Truck, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PiedrineraHomePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Módulo de Piedrinera</h1>
          <p className="text-muted-foreground">Gestión de agregados, producción, ventas y logística de materiales pétreos.</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/piedrinera/productos">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Catálogo de Agregados</div>
              <p className="text-xs text-muted-foreground">Ver y gestionar tipos de arena, grava y otros materiales.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/piedrinera/inventario">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventario</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Control de Inventario</div>
              <p className="text-xs text-muted-foreground">Gestión de stock de agregados y movimientos de inventario.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/piedrinera/ventas">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Registro de Ventas</div>
              <p className="text-xs text-muted-foreground">Crear facturas y gestionar ventas de materiales pétreos.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/piedrinera/produccion">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Producción</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Control de Producción</div>
              <p className="text-xs text-muted-foreground">Gestión de lotes de producción y procesos de extracción.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/piedrinera/camiones">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Camiones</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Flota de Transporte</div>
              <p className="text-xs text-muted-foreground">Administrar camiones, mantenimientos y asignaciones.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/piedrinera/despachos">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despachos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gestión de Despachos</div>
              <p className="text-xs text-muted-foreground">Control de entregas, rutas y estado de envíos.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
