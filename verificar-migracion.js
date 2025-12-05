// Script para verificar que la migración se ejecutó correctamente
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://hvhmsecjrkmlqlruznfe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aG1zZWNqcmttbHFscnV6bmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODkxMDYsImV4cCI6MjA4MDM2NTEwNn0.zE9klNhzyoW7tDqfE-69i4crKsdtzenP0i01c5xOgE4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarMigracion() {
  console.log('🔍 Verificando migración de perfil...\n');

  try {
    // 1. Verificar estructura de la tabla
    console.log('1️⃣ Verificando estructura de la tabla users...');
    const { data: estructura, error: estructuraError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'users')
      .in('column_name', ['first_name', 'last_name', 'phone', 'location', 'department', 'skills', 'join_date', 'language', 'timezone', 'email_notifications', 'two_factor_auth', 'preferences']);

    if (estructuraError) {
      console.error('❌ Error al verificar estructura:', estructuraError);
    } else {
      console.log('✅ Estructura verificada:');
      estructura.forEach(col => {
        console.log(`   📋 ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
      });
    }

    // 2. Verificar datos del usuario Camilo Alegria
    console.log('\n2️⃣ Verificando datos de Camilo Alegria...');
    const { data: camiloData, error: camiloError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'camiloalegriabarra@gmail.com')
      .single();

    if (camiloError) {
      console.error('❌ Error al obtener datos de Camilo:', camiloError);
    } else if (camiloData) {
      console.log('✅ Datos de Camilo Alegria:');
      console.log(`   👤 Nombre: ${camiloData.first_name} ${camiloData.last_name}`);
      console.log(`   📍 Ubicación: ${camiloData.location}`);
      console.log(`   🏢 Departamento: ${camiloData.department}`);
      console.log(`   📞 Teléfono: ${camiloData.phone}`);
      console.log(`   🎭 Rol: ${camiloData.role}`);
      console.log(`   🌍 Idioma: ${camiloData.language}`);
      console.log(`   ⏰ Zona horaria: ${camiloData.timezone}`);
      console.log(`   📧 Notificaciones: ${camiloData.email_notifications}`);
      console.log(`   🔐 2FA: ${camiloData.two_factor_auth}`);
      console.log(`   📝 Bio: ${camiloData.bio}`);
      console.log(`   🎯 Habilidades: ${camiloData.skills?.join(', ') || 'Ninguna'}`);
      console.log(`   📅 Fecha ingreso: ${camiloData.join_date}`);
      console.log(`   🖼️ Avatar: ${camiloData.avatar_url || 'Por defecto'}`);
    } else {
      console.log('⚠️ No se encontró el usuario Camilo Alegria');
    }

    // 3. Verificar estadísticas generales
    console.log('\n3️⃣ Verificando estadísticas generales...');
    const { data: stats, error: statsError } = await supabase
      .from('users')
      .select('id, first_name, last_name, department, language, timezone')
      .not('first_name', 'is', null)
      .limit(5);

    if (statsError) {
      console.error('❌ Error al obtener estadísticas:', statsError);
    } else {
      console.log(`✅ Usuarios con perfil completo: ${stats.length}`);
      stats.forEach(user => {
        console.log(`   📊 ${user.first_name} ${user.last_name} | ${user.department} | ${user.language} | ${user.timezone}`);
      });
    }

    // 4. Probar actualización de perfil
    console.log('\n4️⃣ Probando actualización de perfil...');
    if (camiloData) {
      const updateData = {
        phone: '+56987654321',
        location: 'Providencia, Santiago',
        bio: 'Ingeniero de software actualizado con éxito!',
        skills: ['React', 'Node.js', 'TypeScript', 'Supabase', 'PostgreSQL'],
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('email', 'camiloalegriabarra@gmail.com');

      if (updateError) {
        console.error('❌ Error al actualizar perfil:', updateError);
      } else {
        console.log('✅ Perfil actualizado exitosamente');
      }
    }

    console.log('\n🎉 Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error crítico en verificación:', error);
  }
}

// Ejecutar verificación
verificarMigracion();