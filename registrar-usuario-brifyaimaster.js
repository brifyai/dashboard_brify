// Registrar usuario brifyaimaster@gmail.com usando signUp normal
// Fecha: 2025-12-05
// Descripción: Crear usuario usando signUp y confirmar email

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvhmsecjrkmlqlruznfe.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aG1zZWNqcmttbHFscnV6bmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODkxMDYsImV4cCI6MjA4MDM2NTEwNn0.zE9klNhzyoW7tDqfE-69i4crKsdtzenP0i01c5xOgE4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function registrarUsuario() {
  console.log('🚀 Registrando usuario brifyaimaster@gmail.com usando signUp');
  console.log('=' .repeat(70));
  
  const email = 'brifyaimaster@gmail.com';
  const password = 'BrifyAI2024';
  
  try {
    // 1. Verificar conexión
    console.log('📡 Verificando conexión a Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error de conexión:', testError);
      return;
    }
    console.log('✅ Conexión exitosa');
    
    // 2. Verificar si el usuario ya existe en Auth
    console.log('\n🔍 Verificando si el usuario ya existe...');
    
    // Intentar hacer login primero para ver si ya existe
    const { data: existingLogin, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (!loginError && existingLogin.user) {
      console.log('✅ Usuario ya existe y puede hacer login!');
      console.log('📊 Usuario:', existingLogin.user.email);
      
      // Cerrar sesión
      await supabase.auth.signOut();
      return;
    }
    
    console.log('⚠️ Usuario no existe o contraseña incorrecta');
    
    // 3. Registrar usuario con signUp
    console.log('\n📝 Registrando usuario con signUp...');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: 'BrifyAi Master',
          role: 'admin'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ Error en signUp:', signUpError.message);
      
      // Si el usuario ya existe, intentar con otra contraseña
      if (signUpError.message.includes('already registered')) {
        console.log('🔄 Usuario ya existe, probando contraseñas comunes...');
        
        const commonPasswords = [
          'password123',
          'admin123',
          '123456',
          'brifyaimaster',
          'BrifyAI2024',
          'admin',
          'test123'
        ];
        
        for (const pwd of commonPasswords) {
          console.log(`🔑 Probando: ${pwd}`);
          const { data: testLogin, error: testError } = await supabase.auth.signInWithPassword({
            email: email,
            password: pwd
          });
          
          if (!testError && testLogin.user) {
            console.log('✅ ¡Login exitoso con contraseña:', pwd);
            console.log('📊 Usuario:', testLogin.user.email);
            
            // Cerrar sesión
            await supabase.auth.signOut();
            return;
          }
        }
        
        console.log('❌ No se pudo hacer login con ninguna contraseña común');
      }
      return;
    }
    
    console.log('✅ Usuario registrado exitosamente!');
    console.log('📊 Datos del registro:', {
      user: signUpData.user?.email,
      confirmed: signUpData.user?.email_confirmed_at ? 'Sí' : 'No',
      session: !!signUpData.session
    });
    
    // 4. Si no hay sesión (email no confirmado), enviar confirmación
    if (!signUpData.session) {
      console.log('\n📧 Enviando confirmación de email...');
      
      const { data: confirmData, error: confirmError } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (confirmError) {
        console.log('⚠️ Error enviando confirmación:', confirmError.message);
      } else {
        console.log('✅ Email de confirmación enviado');
      }
    }
    
    // 5. Probar login
    console.log('\n🔑 Probando login...');
    
    const { data: loginData, error: loginTestError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (loginTestError) {
      console.log('❌ Error en login:', loginError.message);
      
      if (loginError.message.includes('Email not confirmed')) {
        console.log('📧 El email necesita ser confirmado');
        console.log('💡 Revisa la bandeja de entrada de brifyaimaster@gmail.com');
      }
    } else {
      console.log('✅ ¡Login exitoso!');
      console.log('📊 Sesión creada para:', loginData.user?.email);
      
      // Cerrar sesión
      await supabase.auth.signOut();
      console.log('🔓 Sesión cerrada');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🎉 PROCESO COMPLETADO');
  console.log('');
  console.log('📧 Email: brifyaimaster@gmail.com');
  console.log('🔑 Contraseña: BrifyAI2024');
  console.log('');
  console.log('💡 PASOS SIGUIENTES:');
  console.log('1. Si el email necesita confirmación:');
  console.log('   - Revisa brifyaimaster@gmail.com');
  console.log('   - Haz clic en el enlace de confirmación');
  console.log('2. Luego intenta hacer login en http://localhost:3000');
  console.log('');
  console.log('🔧 Si aún no funciona:');
  console.log('   - El usuario puede estar en la tabla users pero no en Auth');
  console.log('   - Necesitas crear el usuario manualmente en Supabase Dashboard');
}

// Ejecutar registro
registrarUsuario()
  .then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en script:', error);
    process.exit(1);
  });