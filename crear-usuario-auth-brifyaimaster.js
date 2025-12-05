// Crear usuario en Supabase Auth para brifyaimaster@gmail.com
// Fecha: 2025-12-05
// Descripción: Registrar usuario en Supabase Auth para permitir login

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvhmsecjrkmlqlruznfe.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aG1zZWNqcmttbHFscnV6bmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODkxMDYsImV4cCI6MjA4MDM2NTEwNn0.zE9klNhzyoW7tDqfE-69i4crKsdtzenP0i01c5xOgE4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function crearUsuarioAuth() {
  console.log('🚀 Creando usuario en Supabase Auth para brifyaimaster@gmail.com');
  console.log('=' .repeat(70));
  
  const email = 'brifyaimaster@gmail.com';
  const password = 'BrifyAI2024'; // Contraseña que vamos a usar
  
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
    console.log('\n🔍 Verificando si el usuario ya existe en Auth...');
    try {
      const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (getUserError) {
        console.log('⚠️ No se pudo verificar usuario existente:', getUserError.message);
      } else if (existingUser.user) {
        console.log('⚠️ Usuario ya existe en Auth:', existingUser.user.id);
        console.log('🔄 Intentando actualizar contraseña...');
        
        // Intentar actualizar la contraseña
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.user.id,
          { password: password }
        );
        
        if (updateError) {
          console.log('❌ Error actualizando contraseña:', updateError.message);
        } else {
          console.log('✅ Contraseña actualizada exitosamente');
          console.log('🔑 Nueva contraseña configurada:', password);
        }
        
        return;
      }
    } catch (err) {
      console.log('⚠️ Error verificando usuario existente:', err.message);
    }
    
    // 3. Crear usuario en Supabase Auth
    console.log('\n👤 Creando usuario en Supabase Auth...');
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        name: 'BrifyAi Master',
        role: 'admin'
      }
    });
    
    if (authError) {
      console.error('❌ Error creando usuario en Auth:', authError);
      
      // Si es error de usuario ya existente, intentar método alternativo
      if (authError.message.includes('already registered')) {
        console.log('🔄 Usuario ya existe, intentando método alternativo...');
        
        // Método alternativo: usar signUp y luego confirmar
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password
        });
        
        if (signUpError) {
          console.error('❌ Error en signUp:', signUpError.message);
        } else {
          console.log('✅ Usuario registrado con signUp');
          console.log('📧 Verificar email si es necesario');
        }
      }
      return;
    }
    
    console.log('✅ Usuario creado exitosamente en Auth!');
    console.log('📊 Datos del usuario Auth:', {
      id: authData.user?.id,
      email: authData.user?.email,
      confirmed: authData.user?.email_confirmed_at ? 'Sí' : 'No',
      created: authData.user?.created_at
    });
    
    // 4. Verificar sincronización con tabla users
    console.log('\n🔄 Verificando sincronización con tabla users...');
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.log('⚠️ Error consultando tabla users:', userError.message);
    } else {
      console.log('✅ Usuario encontrado en tabla users:', {
        id: userData.id,
        name: userData.name,
        role: userData.role,
        status: userData.status
      });
      
      // Actualizar el ID en la tabla users para que coincida con Auth
      if (authData.user && userData.id !== authData.user.id) {
        console.log('🔄 Actualizando ID en tabla users...');
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ id: authData.user.id })
          .eq('email', email);
        
        if (updateError) {
          console.log('⚠️ Error actualizando ID:', updateError.message);
        } else {
          console.log('✅ ID actualizado en tabla users');
        }
      }
    }
    
    // 5. Probar login
    console.log('\n🔑 Probando login con las nuevas credenciales...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (loginError) {
      console.log('❌ Error en login:', loginError.message);
    } else {
      console.log('✅ ¡Login exitoso!');
      console.log('📊 Sesión creada:', {
        user: loginData.user?.email,
        session: !!loginData.session
      });
      
      // Cerrar sesión
      await supabase.auth.signOut();
      console.log('🔓 Sesión cerrada');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🎉 PROCESO COMPLETADO');
  console.log('📧 Email: brifyaimaster@gmail.com');
  console.log('🔑 Contraseña: BrifyAI2024');
  console.log('');
  console.log('💡 INSTRUCCIONES:');
  console.log('1. Ve a http://localhost:3000');
  console.log('2. Usa las credenciales de arriba para hacer login');
  console.log('3. Si aún no funciona, puede que necesites confirmar el email');
}

// Ejecutar creación de usuario
crearUsuarioAuth()
  .then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en script:', error);
    process.exit(1);
  });