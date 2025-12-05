// Script para verificar el usuario registrado
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://hvhmsecjrkmlqlruznfe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aG1zZWNqcmttbHFscnV6bmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODkxMDYsImV4cCI6MjA4MDM2NTEwNn0.zE9klNhzyoW7tDqfE-69i4crKsdtzenP0i01c5xOgE4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyUser() {
  console.log('🔍 Verificando usuario: camiloalegriabarra@gmail.com\n');

  try {
    // 1. Verificar en Auth
    console.log('1️⃣ Verificando en Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.getUserByEmail('camiloalegriabarra@gmail.com');
    
    if (authError) {
      console.log('❌ Error al verificar en Auth:', authError.message);
    } else if (authData.user) {
      console.log('✅ Usuario encontrado en Supabase Auth');
      console.log('   🆔 ID:', authData.user.id);
      console.log('   📧 Email:', authData.user.email);
      console.log('   👤 Nombre:', authData.user.user_metadata?.full_name || 'No especificado');
      console.log('   📝 Metadata:', JSON.stringify(authData.user.user_metadata, null, 2));
    } else {
      console.log('⚠️  Usuario no encontrado en Supabase Auth');
    }

    // 2. Verificar en la tabla users
    console.log('\n2️⃣ Verificando en tabla users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'camiloalegriabarra@gmail.com')
      .maybeSingle();

    if (userError) {
      console.log('❌ Error al verificar en tabla users:', userError.message);
    } else if (userData) {
      console.log('✅ Usuario encontrado en tabla users');
      console.log('   🆔 ID:', userData.id);
      console.log('   📧 Email:', userData.email);
      console.log('   👤 Nombre:', userData.name);
      console.log('   🎭 Rol:', userData.role);
      console.log('   📊 Estado:', userData.status);
      console.log('   📅 Creado:', userData.created_at);
      console.log('   📅 Actualizado:', userData.updated_at);
      if (userData.profile) {
        console.log('   👤 Perfil:', JSON.stringify(userData.profile, null, 2));
      }
    } else {
      console.log('⚠️  Usuario no encontrado en tabla users');
      console.log('   ℹ️  Esto puede ser normal si el trigger aún no se ha ejecutado');
    }

    // 3. Intentar iniciar sesión
    console.log('\n3️⃣ Probando inicio de sesión...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'camiloalegriabarra@gmail.com',
      password: 'Antonito26$'
    });

    if (signInError) {
      console.log('❌ Error al iniciar sesión:', signInError.message);
    } else if (signInData.user) {
      console.log('✅ Inicio de sesión exitoso');
      console.log('   🆔 Sesión ID:', signInData.session?.access_token?.substring(0, 20) + '...');
      console.log('   👤 Usuario autenticado:', signInData.user.email);
      
      // Cerrar sesión después de la prueba
      await supabase.auth.signOut();
      console.log('   🚪 Sesión de prueba cerrada');
    }

    console.log('\n🎉 Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar verificación
verifyUser();