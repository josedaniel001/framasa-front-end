import { Pool } from 'pg'

/**
 * Configuración de la conexión a PostgreSQL
 * 
 * NOTA: Estas variables de entorno son opcionales y solo se usan para las rutas de API de Next.js
 * que aún consultan directamente la base de datos (como las rutas de ferretería).
 * 
 * La autenticación ahora se maneja completamente con Django JWT.
 * 
 * Si no tienes estas variables, se usarán valores por defecto.
 * Para producción, considera mover estas rutas también a Django.
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Función para ejecutar consultas
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Función para obtener un cliente del pool (para transacciones)
export async function getClient() {
  const client = await pool.connect()
  const query = client.query.bind(client)
  const release = client.release.bind(client)
  
  // Monitorear el tiempo que el cliente está en uso
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!')
  }, 5000)
  
  client.release = () => {
    clearTimeout(timeout)
    return release()
  }
  
  return client
}

// Función para probar la conexión
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()')
    console.log('Database connection successful:', result.rows[0])
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

export default pool

