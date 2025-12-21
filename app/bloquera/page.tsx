"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Archive, ClipboardList, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function BloqueraHomePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Módulo de Bloquera</h1>
          <p className="text-muted-foreground">Control de producción, inventario y órdenes de fabricación de bloques de concreto.</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/bloquera/productos">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Catálogo de Productos</div>
              <p className="text-xs text-muted-foreground">Ver y gestionar tipos de bloques y productos de concreto.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/bloquera/inventario">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventario</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Control de Inventario</div>
              <p className="text-xs text-muted-foreground">Gestión de stock de bloques y movimientos de inventario.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/bloquera/ordenes">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Órdenes</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Órdenes de Producción</div>
              <p className="text-xs text-muted-foreground">Crear y gestionar órdenes de fabricación de bloques.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
