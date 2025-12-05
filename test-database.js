const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://leoyybfbnjajkktprhro.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlb3l5YmZibmphamtrdHByaHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MTQ0MTYsImV4cCI6MjA2NDM5MDQxNn0.VfJoDIHgXB1k4kwgndmr2yLNDeDBBIrOVsbqaSWrjHU',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

async function checkUsersTable() {
  try {
    console.log('🔍 Verificando tabla users...');
    
    // Verificar estructura de la tabla
    const { data: structure, error: structureError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Error al acceder a la tabla:', structureError.message);
      return;
    }
    
    console.log('✅ Tabla users accesible');
    
    // Contar total de usuarios
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error al contar usuarios:', countError.message);
      return;
    }
    
    console.log('📊 Total de usuarios:', count);
    
    // Obtener algunos usuarios de ejemplo
    const { data: sampleUsers, error: sampleError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (sampleError) {
      console.error('❌ Error al obtener usuarios:', sampleError.message);
      return;
    }
    
    console.log('👥 Usuarios de ejemplo:');
    sampleUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} - Plan: ${user.plan || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

checkUsersTable();