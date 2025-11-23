/**
 * Script para crear usuarios en la base de datos
 * Uso: node database/create-user.js <username> <email> <password> <rol>
 * Ejemplo: node database/create-user.js admin admin@framasa.com admin123 admin
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'framasa_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function createUser(username, email, password, rol) {
  try {
    // Hashear la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar el usuario
    const result = await pool.query(
      'INSERT INTO usuarios (username, email, password_hash, rol, activo) VALUES ($1, $2, $3, $4, true) RETURNING id, username, email, rol',
      [username, email, passwordHash, rol]
    );

    console.log('Usuario creado exitosamente:');
    console.log(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      console.error('Error: El usuario o email ya existe');
    } else {
      console.error('Error al crear usuario:', error);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Obtener argumentos de la línea de comandos
const [,, username, email, password, rol] = process.argv;

if (!username || !email || !password || !rol) {
  console.error('Uso: node create-user.js <username> <email> <password> <rol>');
  console.error('Roles disponibles: admin, gerente, vendedor, operador');
  process.exit(1);
}

const validRoles = ['admin', 'gerente', 'vendedor', 'operador'];
if (!validRoles.includes(rol)) {
  console.error(`Error: Rol inválido. Roles disponibles: ${validRoles.join(', ')}`);
  process.exit(1);
}

createUser(username, email, password, rol);

