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

async function completeDatabaseAnalysis() {
  try {
    console.log('🔍 ANÁLISIS COMPLETO DE LA BASE DE DATOS');
    console.log('='.repeat(60));
    
    // 1. ANALIZAR TABLA USERS EN DETALLE
    console.log('\n📊 TABLA: "users"');
    console.log('-'.repeat(40));
    
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Error al obtener usuarios:', usersError.message);
      return;
    }
    
    console.log(`✅ Total de registros: ${allUsers.length}`);
    
    // Analizar campos únicos y tipos
    const sampleUser = allUsers[0];
    console.log('\n📋 ESTRUCTURA DE CAMPOS:');
    
    Object.keys(sampleUser).forEach(field => {
      const value = sampleUser[field];
      const type = typeof value;
      const isNull = value === null;
      const sampleValue = isNull ? 'NULL' : 
                         type === 'object' ? JSON.stringify(value).substring(0, 50) + '...' : 
                         value;
      
      console.log(`  🔹 ${field}:`);
      console.log(`     Tipo: ${type}${isNull ? ' (NULLABLE)' : ''}`);
      console.log(`     Ejemplo: ${sampleValue}`);
    });
    
    // 2. ANALIZAR TABLA PAYMENTS
    console.log('\n\n💳 TABLA: "payments"');
    console.log('-'.repeat(40));
    
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*');
    
    if (paymentsError) {
      console.log('❌ Error al obtener payments:', paymentsError.message);
    } else {
      console.log(`✅ Total de registros: ${payments.length}`);
      
      if (payments.length > 0) {
        const samplePayment = payments[0];
        console.log('\n📋 ESTRUCTURA DE CAMPOS:');
        
        Object.keys(samplePayment).forEach(field => {
          const value = samplePayment[field];
          const type = typeof value;
          const isNull = value === null;
          const sampleValue = isNull ? 'NULL' : value;
          
          console.log(`  🔹 ${field}:`);
          console.log(`     Tipo: ${type}${isNull ? ' (NULLABLE)' : ''}`);
          console.log(`     Ejemplo: ${sampleValue}`);
        });
      }
    }
    
    // 3. BUSCAR MÁS TABLAS
    console.log('\n\n🔍 BÚSQUEDA DE OTRAS TABLAS');
    console.log('-'.repeat(40));
    
    const additionalTables = [
      'plans', 'subscriptions', 'user_plans', 'plan_features',
      'usage_logs', 'activity_logs', 'notifications', 'settings',
      'user_settings', 'files', 'uploads', 'documents',
      'chat_messages', 'conversations', 'telegram_data',
      'webhook_logs', 'api_keys', 'user_sessions'
    ];
    
    const foundTables = ['users', 'payments']; // Ya sabemos que existen
    
    for (const tableName of additionalTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          foundTables.push(tableName);
          console.log(`✅ Tabla encontrada: ${tableName}`);
          
          if (data && data.length > 0) {
            const fields = Object.keys(data[0]);
            console.log(`   Campos (${fields.length}): ${fields.join(', ')}`);
          }
        }
      } catch (err) {
        // Tabla no existe
      }
    }
    
    // 4. ANÁLISIS DETALLADO DE CAMPOS ESPECÍFICOS
    console.log('\n\n📈 ANÁLISIS DETALLADO DE DATOS');
    console.log('-'.repeat(40));
    
    // Analizar campo current_plan_id
    const planIds = [...new Set(allUsers.map(u => u.current_plan_id).filter(Boolean))];
    console.log(`📋 Plan IDs únicos encontrados: ${planIds.length}`);
    planIds.forEach((planId, index) => {
      const count = allUsers.filter(u => u.current_plan_id === planId).length;
      console.log(`   ${index + 1}. ${planId} (${count} usuarios)`);
    });
    
    // Analizar campo registered_via
    const registrationMethods = {};
    allUsers.forEach(user => {
      const method = user.registered_via || 'unknown';
      registrationMethods[method] = (registrationMethods[method] || 0) + 1;
    });
    
    console.log('\n📱 Métodos de registro:');
    Object.entries(registrationMethods).forEach(([method, count]) => {
      console.log(`   ${method}: ${count} usuarios`);
    });
    
    // Analizar onboarding_status
    const onboardingStatus = {};
    allUsers.forEach(user => {
      const status = user.onboarding_status || 'unknown';
      onboardingStatus[status] = (onboardingStatus[status] || 0) + 1;
    });
    
    console.log('\n🎯 Estados de onboarding:');
    Object.entries(onboardingStatus).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} usuarios`);
    });
    
    // Analizar completando_primera (JSON)
    console.log('\n📝 Análisis del campo "completando_primera" (JSON):');
    allUsers.slice(0, 3).forEach((user, index) => {
      if (user.completando_primera) {
        try {
          const jsonData = typeof user.completando_primera === 'string' ? 
            JSON.parse(user.completando_primera) : user.completando_primera;
          console.log(`   Usuario ${index + 1}:`, jsonData);
        } catch (e) {
          console.log(`   Usuario ${index + 1}: Error al parsear JSON`);
        }
      }
    });
    
    // 5. RESUMEN FINAL
    console.log('\n\n📋 RESUMEN FINAL');
    console.log('='.repeat(60));
    console.log(`✅ Total de tablas encontradas: ${foundTables.length}`);
    console.log(`📊 Tablas: ${foundTables.join(', ')}`);
    console.log(`👥 Total de usuarios: ${allUsers.length}`);
    
    if (payments && payments.length > 0) {
      console.log(`💳 Total de pagos: ${payments.length}`);
    }
    
    console.log('\n🎯 CAMPOS PRINCIPALES DE USERS:');
    console.log('   • id: UUID único del usuario');
    console.log('   • email: Correo electrónico');
    console.log('   • name: Nombre del usuario');
    console.log('   • created_at: Fecha de registro');
    console.log('   • current_plan_id: ID del plan actual');
    console.log('   • plan_expiration: Fecha de expiración del plan');
    console.log('   • registered_via: Método de registro (web, etc.)');
    console.log('   • onboarding_status: Estado del onboarding');
    console.log('   • admin: Si es administrador');
    console.log('   • is_active: Si está activo');
    console.log('   • completando_primera: JSON con progreso de onboarding');
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

completeDatabaseAnalysis();