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

async function analyzeDatabaseStructure() {
  try {
    console.log('🔍 Analizando estructura completa de la base de datos...\n');
    
    // Obtener todas las tablas del esquema público
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_schema_tables', { schema_name: 'public' });
    
    if (tablesError) {
      console.log('❌ No se pudo obtener las tablas via RPC, intentando método alternativo...');
      
      // Método alternativo: intentar acceder a información de tablas conocidas
      const knownTables = ['users', 'profiles', 'sessions', 'auth.users', 'auth.sessions'];
      
      for (const tableName of knownTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(0); // Solo obtener estructura, no datos
          
          if (!error) {
            console.log(`✅ Tabla encontrada: ${tableName}`);
          }
        } catch (err) {
          // Tabla no existe o no accesible
        }
      }
    } else {
      console.log('📋 Tablas encontradas:', tables);
    }
    
    // Intentar obtener estructura de la tabla users (que sabemos que existe)
    console.log('\n🔍 Analizando tabla "users"...');
    const { data: usersSample, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Error al acceder a tabla users:', usersError.message);
      return;
    }
    
    // Obtener todos los usuarios para analizar la estructura
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*');
    
    if (allUsersError) {
      console.error('❌ Error al obtener usuarios:', allUsersError.message);
      return;
    }
    
    console.log(`✅ Tabla "users" contiene ${allUsers.length} registros`);
    
    // Analizar estructura basándose en los datos
    if (allUsers.length > 0) {
      const sampleUser = allUsers[0];
      console.log('\n📊 ESTRUCTURA DE LA TABLA "users":');
      console.log('='.repeat(50));
      
      Object.keys(sampleUser).forEach(field => {
        const value = sampleUser[field];
        const type = typeof value;
        const isNull = value === null;
        const sampleValue = isNull ? 'NULL' : value;
        
        console.log(`📄 Campo: "${field}"`);
        console.log(`   Tipo: ${type}${isNull ? ' (NULLABLE)' : ''}`);
        console.log(`   Ejemplo: ${sampleValue}`);
        console.log('');
      });
    }
    
    // Intentar otras consultas para descubrir más estructura
    console.log('\n🔍 Buscando otras tablas accesibles...');
    
    const commonTableNames = [
      'profiles', 'user_profiles', 'accounts', 'sessions', 'tokens',
      'settings', 'preferences', 'notifications', 'logs', 'activity',
      'products', 'orders', 'transactions', 'payments', 'subscriptions'
    ];
    
    const foundTables = [];
    
    for (const tableName of commonTableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          foundTables.push(tableName);
          console.log(`✅ Tabla encontrada: ${tableName}`);
          
          // Si tiene datos, mostrar estructura
          if (data && data.length > 0) {
            const sample = data[0];
            console.log(`   Campos: ${Object.keys(sample).join(', ')}`);
          }
        }
      } catch (err) {
        // Tabla no existe
      }
    }
    
    if (foundTables.length === 0) {
      console.log('ℹ️  Solo se encontró la tabla "users"');
    }
    
    // Mostrar estadísticas de la tabla users
    console.log('\n📈 ESTADÍSTICAS DE LA TABLA "users":');
    console.log('='.repeat(50));
    console.log(`Total de registros: ${allUsers.length}`);
    
    // Analizar campos específicos
    const emailCount = allUsers.filter(u => u.email && u.email.trim()).length;
    const planCount = allUsers.filter(u => u.plan).length;
    const tokensCount = allUsers.filter(u => u.tokens_consumed && u.tokens_consumed > 0).length;
    
    console.log(`Usuarios con email: ${emailCount}`);
    console.log(`Usuarios con plan definido: ${planCount}`);
    console.log(`Usuarios con tokens consumidos: ${tokensCount}`);
    
    // Mostrar algunos ejemplos de datos
    console.log('\n👥 EJEMPLOS DE DATOS:');
    console.log('='.repeat(50));
    allUsers.slice(0, 3).forEach((user, index) => {
      console.log(`Usuario ${index + 1}:`);
      console.log(`  Email: ${user.email || 'N/A'}`);
      console.log(`  Plan: ${user.plan || 'N/A'}`);
      console.log(`  Tokens: ${user.tokens_consumed || 0}`);
      console.log(`  Creado: ${user.created_at || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

analyzeDatabaseStructure();