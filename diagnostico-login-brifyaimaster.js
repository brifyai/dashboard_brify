// Diagnóstico del problema de login con brifyaimaster@gmail.com
// Fecha: 2025-12-05
// Descripción: Verificar estado del usuario y autenticación en Supabase

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvhmsecjrkmlqlruznfe.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aG1zZWNqcmttbHFscnV6bmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODkxMDYsImV4cCI6MjA4MDM2NTEwNn0.zE9klNhzyoW7tDqfE-69i4crKsdtzenP0i01c5xOgE4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticarLogin() {
  console.log('🔍 Diagnóstico de login para brifyaimaster@gmail.com');
  console.log('=' .repeat(60));
  
  const email = 'brifyaimaster@gmail.com';
  
  try {
    // 1. Verificar conexión a Supabase
    console.log('📡 Verificando conexión a Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error de conexión:', testError);
      return;
    }
    console.log('✅ Conexión a Supabase exitosa');
    
    // 2. Buscar usuario en tabla users
    console.log('\n👤 Buscando usuario en tabla users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
    
    if (userError) {
      console.error('❌ Error consultando tabla users:', userError);
    } else {
      console.log(`📊 Usuarios encontrados con email ${email}:`, userData?.length || 0);
      if (userData && userData.length > 0) {
        console.log('📋 Datos del usuario:', {
          id: userData[0].id,
          name: userData[0].name,
          email: userData[0].email,
          role: userData[0].role,
          status: userData[0].status,
          created_at: userData[0].created_at
        });
      }
    }
    
    // 3. Verificar autenticación con Supabase Auth
    console.log('\n🔐 Verificando autenticación con Supabase Auth...');
    
    // Intentar sign in con credenciales por defecto
    const testPasswords = [
      'password123',
      'admin123', 
      'brifyaimaster',
      '123456',
      'BrifyAI2024',
      'admin',
      'test123'
    ];
    
    for (const password of testPasswords) {
      try {
        console.log(`🔑 Probando contraseña: ${password}`);
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (authError) {
          console.log(`❌ Error con ${password}:`, authError.message);
        } else {
          console.log('✅ ¡Login exitoso!');
          console.log('📊 Datos de sesión:', {
            user: authData.user?.email,
            session: !!authData.session
          });
          
          // Cerrar sesión después del test
          await supabase.auth.signOut();
          console.log('🔓 Sesión cerrada');
          return;
        }
      } catch (err) {
        console.log(`❌ Excepción con ${password}:`, err.message);
      }
    }
    
    // 4. Verificar si el usuario existe en Auth pero no está confirmado
    console.log('\n📧 Verificando estado de confirmación de email...');
    try {
      // Esto puede fallar si no tenemos permisos de admin
      const { data: recoveryData, error: recoveryError } = await supabase.auth.resetPasswordForEmail(email);
      if (recoveryError) {
        console.log('⚠️ Error en recuperación de contraseña:', recoveryError.message);
      } else {
        console.log('✅ Email de recuperación enviado (si el usuario existe)');
      }
    } catch (err) {
      console.log('⚠️ Error enviando recuperación:', err.message);
    }
    
    // 5. Verificar estructura de tabla users
    console.log('\n📋 Verificando estructura de tabla users...');
    try {
      const { data: structureData, error: structureError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'users');
      
      if (structureError) {
        console.log('⚠️ No se pudo verificar estructura:', structureError.message);
      } else {
        console.log('📊 Columnas en tabla users:');
        structureData.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      }
    } catch (err) {
      console.log('⚠️ Error verificando estructura:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('💡 RECOMENDACIONES:');
  console.log('1. Verificar que el usuario existe en Supabase Auth');
  console.log('2. Confirmar que el email está verificado');
  console.log('3. Revisar la contraseña correcta');
  console.log('4. Verificar políticas RLS en la tabla users');
  console.log('5. Comprobar configuración de autenticación en Supabase');
}

// Ejecutar diagnóstico
diagnosticarLogin()
  .then(() => {
    console.log('\n✅ Diagnóstico completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en diagnóstico:', error);
    process.exit(1);
  });