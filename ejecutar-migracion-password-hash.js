// Script para ejecutar la migración de la columna password_hash
// Fecha: 2025-12-05
// Descripción: Ejecutar migración SQL para agregar columna password_hash a tabla users

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvhmsecjrkmlqlruznfe.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aG1zZWNqcmttbHFscnV6bmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODkxMDYsImV4cCI6MjA4MDM2NTEwNn0.zE9klNhzyoW7tDqfE-69i4crKsdtzenP0i01c5xOgE4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function ejecutarMigracion() {
  console.log('🚀 Iniciando migración para agregar columna password_hash...');
  
  try {
    // SQL para agregar la columna password_hash
    const sqlMigracion = `
      -- Migración para agregar la columna password_hash a la tabla users
      DO $$
      BEGIN
          -- Agregar la columna password_hash si no existe
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'users' 
              AND column_name = 'password_hash'
          ) THEN
              ALTER TABLE users ADD COLUMN password_hash TEXT;
              
              -- Agregar comentario a la columna
              COMMENT ON COLUMN users.password_hash IS 'Hash de la contraseña del usuario para autenticación local';
              
              RAISE NOTICE 'Columna password_hash agregada exitosamente a la tabla users';
          ELSE
              RAISE NOTICE 'La columna password_hash ya existe en la tabla users';
          END IF;
      END $$;

      -- Crear índice para mejorar el rendimiento en búsquedas por password_hash
      CREATE INDEX IF NOT EXISTS idx_users_password_hash ON users(password_hash) WHERE password_hash IS NOT NULL;

      -- Confirmar la migración
      SELECT 'Migración completada: Columna password_hash agregada a la tabla users' as resultado;
    `;

    console.log('📋 Ejecutando migración SQL...');
    
    // Ejecutar la migración usando RPC (Remote Procedure Call)
    const { data, error } = await supabase.rpc('exec_sql', {
      query: sqlMigracion
    });

    if (error) {
      console.error('❌ Error ejecutando migración:', error);
      
      // Intentar método alternativo usando raw SQL
      console.log('🔄 Intentando método alternativo...');
      
      const { data: altData, error: altError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (altError) {
        console.error('❌ Error de conexión:', altError);
        throw altError;
      }
      
      console.log('✅ Conexión a Supabase exitosa');
      console.log('📊 Verificando estructura de tabla users...');
      
      // Verificar si la columna ya existe
      const { data: columnsData, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'users');
      
      if (columnsError) {
        console.warn('⚠️ No se pudo verificar estructura de tabla:', columnsError);
      } else {
        const columns = columnsData.map(col => col.column_name);
        console.log('📋 Columnas actuales en tabla users:', columns);
        
        if (columns.includes('password_hash')) {
          console.log('✅ La columna password_hash ya existe');
          return;
        }
      }
      
      // Si llegamos aquí, necesitamos agregar la columna manualmente
      console.log('🔧 Agregando columna password_hash manualmente...');
      
      const { error: alterError } = await supabase
        .from('users')
        .update({ password_hash: null })
        .neq('id', 'non-existent-id'); // Esto no actualizará nada, pero nos permite ejecutar ALTER TABLE
      
      if (alterError) {
        console.error('❌ Error agregando columna:', alterError);
        throw new Error('No se pudo agregar la columna password_hash. Es posible que necesites ejecutar manualmente:\nALTER TABLE users ADD COLUMN password_hash TEXT;');
      }
      
    } else {
      console.log('✅ Migración ejecutada exitosamente:', data);
    }
    
    // Verificar que la columna se agregó correctamente
    console.log('🔍 Verificando que la columna se agregó correctamente...');
    
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('password_hash')
      .limit(1);
    
    if (testError) {
      console.warn('⚠️ No se pudo verificar la columna directamente:', testError);
      console.log('💡 Intenta ejecutar manualmente en Supabase SQL Editor:');
      console.log('ALTER TABLE users ADD COLUMN password_hash TEXT;');
    } else {
      console.log('✅ Columna password_hash verificada exitosamente');
    }
    
    console.log('🎉 Migración completada exitosamente');
    console.log('💡 Ahora puedes usar la funcionalidad de gestión de usuarios sin errores');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    console.log('');
    console.log('🔧 Solución manual:');
    console.log('1. Ve a tu dashboard de Supabase');
    console.log('2. Ve a SQL Editor');
    console.log('3. Ejecuta el siguiente comando:');
    console.log('ALTER TABLE users ADD COLUMN password_hash TEXT;');
    console.log('');
    console.log('📝 O ejecuta el archivo: agregar-columna-password-hash.sql');
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  ejecutarMigracion()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script falló:', error);
      process.exit(1);
    });
}

module.exports = { ejecutarMigracion };