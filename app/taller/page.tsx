"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList, Cog, ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function TallerHomePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Módulo de Taller</h1>
          <p className="text-muted-foreground">Gestión de mantenimiento, reparaciones y control de maquinaria y equipos.</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/taller/ordenes">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Órdenes</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Órdenes de Trabajo</div>
              <p className="text-xs text-muted-foreground">Crear y gestionar órdenes de mantenimiento y reparación.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/taller/maquinaria">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maquinaria</CardTitle>
              <Cog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Control de Equipos</div>
              <p className="text-xs text-muted-foreground">Administrar maquinaria, mantenimientos y estado operativo.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/taller/compra-repuestos">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compra de Repuestos</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gestión de Repuestos</div>
              <p className="text-xs text-muted-foreground">Control de compras, inventario y pedidos de repuestos.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
