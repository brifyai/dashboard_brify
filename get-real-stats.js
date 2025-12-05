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

async function getDetailedStats() {
  try {
    console.log('📊 Obteniendo estadísticas detalladas...');
    
    // Obtener todos los usuarios con sus datos completos
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('❌ Error al obtener usuarios:', allError.message);
      return;
    }
    
    console.log(`✅ Total de usuarios: ${allUsers.length}`);
    
    // Analizar fechas de registro
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let todayCount = 0;
    let last7DaysCount = 0;
    let last30DaysCount = 0;
    
    console.log('\n📅 Análisis de registros por fecha:');
    console.log(`Fecha actual: ${now.toISOString()}`);
    console.log(`Hoy (desde medianoche): ${today.toISOString()}`);
    console.log(`Últimos 7 días desde: ${last7Days.toISOString()}`);
    console.log(`Últimos 30 días desde: ${last30Days.toISOString()}`);
    
    // Analizar cada usuario
    const recentUsers = [];
    allUsers.forEach((user, index) => {
      const createdAt = new Date(user.created_at);
      
      // Contar por períodos
      if (createdAt >= today) todayCount++;
      if (createdAt >= last7Days) last7DaysCount++;
      if (createdAt >= last30Days) last30DaysCount++;
      
      // Usuarios recientes (últimos 5)
      if (index < 5) {
        recentUsers.push({
          email: user.email,
          created_at: user.created_at,
          plan: user.plan || 'Free',
          tokens_consumed: user.tokens_consumed || 0
        });
      }
      
      console.log(`${index + 1}. ${user.email} - Creado: ${createdAt.toLocaleDateString()} - Plan: ${user.plan || 'Free'}`);
    });
    
    // Calcular tokens totales
    const totalTokens = allUsers.reduce((sum, user) => {
      return sum + (user.tokens_consumed || 0);
    }, 0);
    
    // Analizar distribución de planes
    const planDistribution = {};
    allUsers.forEach(user => {
      const plan = user.plan || 'Free';
      planDistribution[plan] = (planDistribution[plan] || 0) + 1;
    });
    
    // Mostrar resultados
    console.log('\n📈 ESTADÍSTICAS FINALES:');
    console.log('='.repeat(50));
    console.log(`Total de usuarios: ${allUsers.length}`);
    console.log(`Registrados hoy: ${todayCount}`);
    console.log(`Registrados últimos 7 días: ${last7DaysCount}`);
    console.log(`Registrados últimos 30 días: ${last30DaysCount}`);
    console.log(`Total tokens consumidos: ${totalTokens.toLocaleString()}`);
    
    console.log('\n📊 Distribución de planes:');
    Object.entries(planDistribution).forEach(([plan, count]) => {
      const percentage = ((count / allUsers.length) * 100).toFixed(1);
      console.log(`  ${plan}: ${count} usuarios (${percentage}%)`);
    });
    
    console.log('\n👥 Usuarios más recientes:');
    recentUsers.forEach((user, index) => {
      const date = new Date(user.created_at).toLocaleDateString();
      console.log(`  ${index + 1}. ${user.email} - ${date} - ${user.plan} - ${user.tokens_consumed} tokens`);
    });
    
    // Generar datos para el componente
    console.log('\n🔧 DATOS PARA EL COMPONENTE:');
    console.log('='.repeat(50));
    console.log(`totalUsers: ${allUsers.length}`);
    console.log(`last30Days: ${last30DaysCount}`);
    console.log(`last7Days: ${last7DaysCount}`);
    console.log(`todayUsers: ${todayCount}`);
    console.log(`totalTokens: ${totalTokens}`);
    console.log('planDistribution:', JSON.stringify(planDistribution, null, 2));
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

getDetailedStats();