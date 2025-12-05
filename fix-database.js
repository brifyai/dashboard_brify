const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hvhmsecjrkmlqlruznfe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aG1zZWNqcmttbHFscnV6bmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODkxMDYsImV4cCI6MjA4MDM2NTEwNn0.zE9klNhzyoW7tDqfE-69i4crKsdtzenP0i01c5xOgE4'
);

async function fixDatabase() {
  try {
    console.log('🔍 Verificando estructura de la tabla users...');
    
    // Crear usuario con ID numérico (bigint)
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        id: 1, // Usar ID numérico en lugar de UUID
        email: 'camiloalegriabarra@gmail.com',
        name: 'Camilo Alegria',
        first_name: 'Camilo',
        last_name: 'Alegria',
        role: 'admin',
        status: 'active',
        phone: '+56912345678',
        location: 'Santiago, Chile',
        department: 'Engineering',
        skills: ['React', 'Node.js', 'JavaScript'],
        language: 'es',
        timezone: 'UTC-3',
        email_notifications: 'all',
        two_factor_auth: 'disabled',
        preferences: {},
        join_date: '2024-01-15',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error al crear usuario:', createError);
      
      // Si el usuario ya existe, intentar actualizarlo
      if (createError.code === '23505') {
        console.log('🔄 Usuario ya existe, actualizando...');
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            email: 'camiloalegriabarra@gmail.com',
            name: 'Camilo Alegria',
            first_name: 'Camilo',
            last_name: 'Alegria',
            role: 'admin',
            status: 'active',
            phone: '+56912345678',
            location: 'Santiago, Chile',
            department: 'Engineering',
            skills: ['React', 'Node.js', 'JavaScript'],
            language: 'es',
            timezone: 'UTC-3',
            email_notifications: 'all',
            two_factor_auth: 'disabled',
            preferences: {},
            join_date: '2024-01-15',
            updated_at: new Date().toISOString()
          })
          .eq('id', 1)
          .select()
          .single();
        
        if (updateError) {
          console.error('❌ Error al actualizar usuario:', updateError);
        } else {
          console.log('✅ Usuario actualizado exitosamente:', updatedUser);
        }
      }
    } else {
      console.log('✅ Usuario creado exitosamente:', newUser);
    }
    
    // Verificar usuarios
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error al verificar usuarios:', usersError);
    } else {
      console.log('👥 Total de usuarios:', users?.length || 0);
      if (users && users.length > 0) {
        console.log('📋 Usuario de ejemplo:', users[0]);
      }
    }
    
    console.log('✅ Proceso completado');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

fixDatabase();