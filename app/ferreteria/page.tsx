import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, FileText } from "lucide-react"
import Link from "next/link"

export default function FerreteriaHomePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Módulo de Ferretería</h1>
      <p className="text-muted-foreground">Gestión integral de productos, inventario, ventas y clientes.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/ferreteria/productos">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ver y gestionar productos</div>
              <p className="text-xs text-muted-foreground">Catálogo de todos los artículos disponibles.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ferreteria/inventario">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventario</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Control de stock</div>
              <p className="text-xs text-muted-foreground">Gestión de entradas, salidas y ajustes de inventario.</p>
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
              <div className="text-2xl font-bold">Registrar y consultar ventas</div>
              <p className="text-xs text-muted-foreground">Historial de transacciones y creación de nuevas ventas.</p>
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
              <div className="text-2xl font-bold">Crear y gestionar cotizaciones</div>
              <p className="text-xs text-muted-foreground">Generación de presupuestos para clientes.</p>
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
              <div className="text-2xl font-bold">Administrar base de clientes</div>
              <p className="text-xs text-muted-foreground">Información de contacto y historial de compras.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
