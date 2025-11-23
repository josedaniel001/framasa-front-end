-- Script SQL para crear las tablas necesarias para los reportes de ferretería
-- Ejecuta este script en tu base de datos PostgreSQL

-- Tabla de clientes de ferretería
CREATE TABLE IF NOT EXISTS clientes_ferreteria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    nit VARCHAR(50) UNIQUE,
    direccion TEXT,
    email VARCHAR(255),
    telefono VARCHAR(50),
    fecha_registro DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos de ferretería
CREATE TABLE IF NOT EXISTS productos_ferreteria (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    precio_venta DECIMAL(10, 2) NOT NULL,
    costo_unitario DECIMAL(10, 2),
    unidad_medida VARCHAR(50),
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ventas de ferretería
CREATE TABLE IF NOT EXISTS ventas_ferreteria (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    fecha DATE NOT NULL,
    cliente_id INTEGER NOT NULL REFERENCES clientes_ferreteria(id),
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'COMPLETADA',
    tipo_venta VARCHAR(50) DEFAULT 'CONTADO', -- CONTADO, CREDITO, TRANSFERENCIA, CHEQUE
    fecha_vencimiento DATE,
    monto_pagado DECIMAL(10, 2) DEFAULT 0,
    saldo_pendiente DECIMAL(10, 2) DEFAULT 0,
    estado_pago VARCHAR(50) DEFAULT 'PAGADO', -- PAGADO, PENDIENTE, PARCIAL
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de items de venta
CREATE TABLE IF NOT EXISTS items_venta (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES ventas_ferreteria(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos_ferreteria(id),
    nombre_producto VARCHAR(255) NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas_ferreteria(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas_ferreteria(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_tipo ON ventas_ferreteria(tipo_venta);
CREATE INDEX IF NOT EXISTS idx_items_venta ON items_venta(venta_id);
CREATE INDEX IF NOT EXISTS idx_items_producto ON items_venta(producto_id);
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes_ferreteria(activo);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos_ferreteria(activo);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON clientes_ferreteria 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at 
    BEFORE UPDATE ON productos_ferreteria 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventas_updated_at 
    BEFORE UPDATE ON ventas_ferreteria 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

