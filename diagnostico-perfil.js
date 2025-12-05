// Script de diagnóstico para el problema del perfil
import { supabase } from './src/config/supabase.js';

async function diagnosticarProblemaPerfil() {
  console.log('🔍 Iniciando diagnóstico del problema de perfil...\n');

  try {
    // 1. Verificar sesión actual
    console.log('1️⃣ Verificando sesión actual...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error al obtener sesión:', sessionError);
      return;
    }

    if (!session) {
      console.log('⚠️ No hay sesión activa');
      console.log('💡 Solución: El usuario debe iniciar sesión primero');
      return;
    }

    console.log('✅ Sesión activa encontrada');
    console.log('👤 Usuario ID:', session.user.id);
    console.log('📧 Email:', session.user.email);

    // 2. Verificar si existe el registro en la tabla users
    console.log('\n2️⃣ Verificando registro en tabla users...');
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.error('❌ Error al buscar usuario en tabla users:', userError);
      
      if (userError.code === 'PGRST116') {
        console.log('💡 No existe registro en tabla users para este usuario');
        console.log('💡 Solución: Crear registro automáticamente');
      }
      return;
    }

    console.log('✅ Registro encontrado en tabla users:');
    console.log('📋 Datos:', userRecord);

    // 3. Crear perfil si no existe
    if (!userRecord) {
      console.log('\n3️⃣ Creando perfil automáticamente...');
      
      const newProfile = {
        id: session.user.id,
        email: session.user.email,
        first_name: session.user.user_metadata?.full_name?.split(' ')[0] || '',
        last_name: session.user.user_metadata?.full_name?.split(' ')[1] || '',
        role: session.user.user_metadata?.role || 'user',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('users')
        .insert([newProfile])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error al crear perfil:', createError);
        return;
      }

      console.log('✅ Perfil creado exitosamente');
    }

    console.log('\n🎉 Diagnóstico completado');

  } catch (error) {
    console.error('💥 Error crítico durante diagnóstico:', error);
  }
}

// Ejecutar diagnóstico
diagnosticarProblemaPerfil();