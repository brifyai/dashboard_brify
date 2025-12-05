// Script para probar el inicio de sesión del usuario registrado
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://hvhmsecjrkmlqlruznfe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aG1zZWNqcmttbHFscnV6bmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODkxMDYsImV4cCI6MjA4MDM2NTEwNn0.zE9klNhzyoW7tDqfE-69i4crKsdtzenP0i01c5xOgE4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🔐 Probando inicio de sesión para: camiloalegriabarra@gmail.com\n');

  try {
    // Intentar iniciar sesión
    console.log('📧 Iniciando sesión...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'camiloalegriabarra@gmail.com',
      password: 'Antonito26$'
    });

    if (error) {
      console.log('❌ Error al iniciar sesión:', error.message);
      console.log('🔍 Código de error:', error.code);
      console.log('💡 Sugerencia: Verifica que el email y contraseña sean correctos');
      return;
    }

    if (data.user) {
      console.log('✅ ¡Inicio de sesión exitoso!');
      console.log('\n📋 Datos del usuario:');
      console.log('   🆔 ID:', data.user.id);
      console.log('   📧 Email:', data.user.email);
      console.log('   👤 Nombre:', data.user.user_metadata?.full_name || 'No especificado');
      console.log('   🎭 Rol:', data.user.user_metadata?.role || 'user');
      console.log('   📅 Creado:', data.user.created_at);
      console.log('   🔐 Último acceso:', data.user.last_sign_in_at);

      // Verificar el perfil en la tabla users
      console.log('\n📊 Verificando perfil en base de datos...');
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.log('❌ Error al obtener perfil:', profileError.message);
      } else if (userProfile) {
        console.log('✅ Perfil encontrado en la base de datos');
        console.log('   🆔 Profile ID:', userProfile.id);
        console.log('   👤 Nombre completo:', userProfile.name);
        console.log('   📧 Email:', userProfile.email);
        console.log('   🎭 Rol:', userProfile.role);
        console.log('   📊 Estado:', userProfile.status);
      } else {
        console.log('⚠️  No se encontró perfil en la tabla users');
        console.log('   ℹ️  Esto puede ser normal si el trigger no se ejecutó');
      }

      // Cerrar sesión después de la prueba
      console.log('\n🚪 Cerrando sesión de prueba...');
      await supabase.auth.signOut();
      console.log('✅ Sesión cerrada exitosamente');

      console.log('\n🎉 ¡Prueba de inicio de sesión completada exitosamente!');
      console.log('\n💡 El usuario camiloalegriabarra@gmail.com está listo para usar');
      console.log('   Puede iniciar sesión en: http://localhost:3000/auth/sign-in');
      
    } else {
      console.log('⚠️  No se pudo obtener la información del usuario');
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar prueba
testLogin();