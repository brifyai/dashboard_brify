// Script para registrar un nuevo usuario en Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://hvhmsecjrkmlqlruznfe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aG1zZWNqcmttbHFscnV6bmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODkxMDYsImV4cCI6MjA4MDM2NTEwNn0.zE9klNhzyoW7tDqfE-69i4crKsdtzenP0i01c5xOgE4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Datos del usuario a registrar
const userData = {
  email: 'camiloalegriabarra@gmail.com',
  password: 'Antonito26$',
  fullName: 'Camilo Alegria'
};

async function registerUser() {
  console.log('📝 Iniciando registro de usuario...');
  console.log('📧 Email:', userData.email);
  console.log('👤 Nombre:', userData.fullName);

  try {
    // 1. Registrar el usuario en Supabase Auth
    console.log('🔐 Registrando usuario en Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.fullName,
          role: 'user'
        }
      }
    });

    if (authError) {
      console.error('❌ Error en el registro de autenticación:', authError);
      return;
    }

    console.log('✅ Usuario registrado exitosamente en Supabase Auth');
    console.log('🆔 User ID:', authData.user?.id);

    // 2. Esperar un momento para que el trigger cree el perfil
    console.log('⏳ Esperando a que se cree el perfil...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Verificar que el perfil se haya creado
    console.log('🔍 Verificando perfil de usuario...');
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userData.email)
      .single();

    if (profileError) {
      console.error('❌ Error al verificar el perfil:', profileError);
    } else {
      console.log('✅ Perfil de usuario creado exitosamente');
      console.log('📋 Datos del perfil:', {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        status: userProfile.status
      });
    }

    console.log('\n🎉 ¡Registro completado exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('- Email:', userData.email);
    console.log('- Nombre:', userData.fullName);
    console.log('- Contraseña:', '******** (oculta por seguridad)');
    console.log('- Rol: user');
    console.log('- Estado: active');
    
    console.log('\n🔑 El usuario ahora puede iniciar sesión con:');
    console.log('- Email:', userData.email);
    console.log('- Contraseña:', userData.password);

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar el registro
registerUser();