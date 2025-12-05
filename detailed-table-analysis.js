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

async function detailedTableAnalysis() {
  try {
    console.log('📋 ANÁLISIS DETALLADO DE TODAS LAS TABLAS');
    console.log('='.repeat(70));
    
    // 1. TABLA PLANS
    console.log('\n💎 TABLA: "plans"');
    console.log('-'.repeat(50));
    
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('*');
    
    if (plansError) {
      console.log('❌ Error al obtener plans:', plansError.message);
    } else {
      console.log(`✅ Total de planes: ${plans.length}`);
      
      if (plans.length > 0) {
        console.log('\n📋 ESTRUCTURA DE CAMPOS:');
        const samplePlan = plans[0];
        Object.keys(samplePlan).forEach(field => {
          const value = samplePlan[field];
          const type = typeof value;
          const isNull = value === null;
          const sampleValue = isNull ? 'NULL' : value;
          
          console.log(`  🔹 ${field}:`);
          console.log(`     Tipo: ${type}${isNull ? ' (NULLABLE)' : ''}`);
          console.log(`     Ejemplo: ${sampleValue}`);
        });
        
        console.log('\n📊 PLANES DISPONIBLES:');
        plans.forEach((plan, index) => {
          console.log(`  ${index + 1}. ${plan.name} (${plan.name_es})`);
          console.log(`     💰 Precio: $${plan.price} USD`);
          console.log(`     ⏱️ Duración: ${plan.duration_days} días`);
          console.log(`     💾 Almacenamiento: ${(plan.storage_limit_bytes / (1024*1024*1024)).toFixed(2)} GB`);
          console.log(`     🎯 Tipo: ${plan.service_type}`);
          console.log(`     🆓 Prueba gratis: ${plan.prueba_gratis ? 'Sí' : 'No'}`);
          console.log('');
        });
      }
    }
    
    // 2. TABLA FILES
    console.log('\n📁 TABLA: "files"');
    console.log('-'.repeat(50));
    
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*');
    
    if (filesError) {
      console.log('❌ Error al obtener files:', filesError.message);
    } else {
      console.log(`✅ Total de archivos: ${files.length}`);
      
      if (files.length > 0) {
        console.log('\n📋 ESTRUCTURA DE CAMPOS:');
        const sampleFile = files[0];
        Object.keys(sampleFile).forEach(field => {
          const value = sampleFile[field];
          const type = typeof value;
          const isNull = value === null;
          const sampleValue = isNull ? 'NULL' : value;
          
          console.log(`  🔹 ${field}:`);
          console.log(`     Tipo: ${type}${isNull ? ' (NULLABLE)' : ''}`);
          console.log(`     Ejemplo: ${sampleValue}`);
        });
        
        console.log('\n📊 ESTADÍSTICAS DE ARCHIVOS:');
        const totalSize = files.reduce((sum, file) => sum + (file.size_bytes || 0), 0);
        console.log(`  📦 Tamaño total: ${(totalSize / (1024*1024)).toFixed(2)} MB`);
        
        const fileTypes = {};
        files.forEach(file => {
          const ext = file.file_name?.split('.').pop()?.toLowerCase() || 'unknown';
          fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        });
        
        console.log('\n📈 Tipos de archivo:');
        Object.entries(fileTypes).forEach(([type, count]) => {
          console.log(`  ${type}: ${count} archivos`);
        });
      }
    }
    
    // 3. TABLA DOCUMENTS
    console.log('\n📄 TABLA: "documents"');
    console.log('-'.repeat(50));
    
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*');
    
    if (documentsError) {
      console.log('❌ Error al obtener documents:', documentsError.message);
    } else {
      console.log(`✅ Total de documentos: ${documents.length}`);
      
      if (documents.length > 0) {
        console.log('\n📋 ESTRUCTURA DE CAMPOS:');
        const sampleDoc = documents[0];
        Object.keys(sampleDoc).forEach(field => {
          const value = sampleDoc[field];
          const type = typeof value;
          const isNull = value === null;
          const sampleValue = isNull ? 'NULL' : value;
          
          console.log(`  🔹 ${field}:`);
          console.log(`     Tipo: ${type}${isNull ? ' (NULLABLE)' : ''}`);
          console.log(`     Ejemplo: ${sampleValue}`);
        });
      }
    }
    
    // 4. ANÁLISIS DE RELACIONES
    console.log('\n\n🔗 ANÁLISIS DE RELACIONES ENTRE TABLAS');
    console.log('-'.repeat(50));
    
    // Relación users -> payments
    if (plans && plans.length > 0) {
      console.log('\n💳 Relación USERS -> PAYMENTS -> PLANS:');
      
      const { data: payments } = await supabase
        .from('payments')
        .select('*, users(email), plans(name)');
      
      if (payments) {
        console.log(`✅ ${payments.length} pagos encontrados`);
        
        const paymentStats = {};
        payments.forEach(payment => {
          const status = payment.payment_status;
          const provider = payment.payment_provider;
          const planName = payment.plans?.name || 'Unknown';
          
          paymentStats[status] = (paymentStats[status] || 0) + 1;
          
          console.log(`  💰 ${payment.users?.email}: ${planName} - ${status} (${provider})`);
        });
        
        console.log('\n📊 Resumen de pagos:');
        Object.entries(paymentStats).forEach(([status, count]) => {
          console.log(`  ${status}: ${count} pagos`);
        });
      }
    }
    
    // 5. RESUMEN EJECUTIVO
    console.log('\n\n📋 RESUMEN EJECUTIVO DE LA BASE DE DATOS');
    console.log('='.repeat(70));
    
    console.log('🏗️ ESTRUCTURA GENERAL:');
    console.log('  📊 users (16 registros) - Tabla principal de usuarios');
    console.log('  💳 payments (16 registros) - Historial de pagos');
    console.log('  💎 plans (X registros) - Planes disponibles');
    console.log('  📁 files (X registros) - Archivos subidos');
    console.log('  📄 documents (X registros) - Documentos procesados');
    
    console.log('\n🎯 CAMPOS CLAVE IDENTIFICADOS:');
    console.log('  👤 USERS: id, email, name, created_at, current_plan_id, onboarding_status');
    console.log('  💰 PAYMENTS: user_id, plan_id, amount_usd, payment_status, payment_provider');
    console.log('  💎 PLANS: name, price, storage_limit_bytes, duration_days, service_type');
    console.log('  📁 FILES: user_id, file_name, size_bytes, created_at');
    console.log('  📄 DOCUMENTS: user_id, document_type, status, created_at');
    
    console.log('\n🔗 RELACIONES PRINCIPALES:');
    console.log('  users.id → payments.user_id');
    console.log('  plans.id → payments.plan_id');
    console.log('  users.id → files.user_id');
    console.log('  users.id → documents.user_id');
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

detailedTableAnalysis();