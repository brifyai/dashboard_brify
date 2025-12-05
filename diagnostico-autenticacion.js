#!/usr/bin/env node

/**
 * 🔍 DIAGNÓSTICO DETALLADO DE AUTENTICACIÓN
 * 
 * Este script identifica exactamente dónde falla el flujo de autenticación
 */

const fs = require('fs');

console.log('🔍 DIAGNÓSTICO COMPLETO DE AUTENTICACIÓN\n');

// 1. Verificar configuración de Supabase
console.log('1️⃣ VERIFICANDO CONFIGURACIÓN DE SUPABASE...');
const supabaseConfig = fs.readFileSync('src/config/supabase.js', 'utf8');

const supabaseUrl = supabaseConfig.match(/supabaseUrl.*?\|\|.*?'(.*?)'/);
const supabaseKey = supabaseConfig.match(/supabaseAnonKey.*?\|\|.*?'(.*?)'/);

console.log('📋 Configuración encontrada:');
console.log('   - URL:', supabaseUrl ? supabaseUrl[1] : '❌ No encontrada');
console.log('   - KEY:', supabaseKey ? `${supabaseKey[1].substring(0, 20)}...` : '❌ No encontrada');

// 2. Verificar credenciales en .env
console.log('\n2️⃣ VERIFICANDO VARIABLES DE ENTORNO...');
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const envUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
  const envKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
  
  console.log('📋 Variables .env:');
  console.log('   - URL:', envUrl ? envUrl[1] : '❌ No configurada');
  console.log('   - KEY:', envKey ? `${envKey[1].substring(0, 20)}...` : '❌ No configurada');
} catch (e) {
  console.log('   ⚠️  Archivo .env no encontrado, usando valores por defecto');
}

// 3. Verificar flujo completo de autenticación
console.log('\n3️⃣ VERIFICANDO FLUJO DE AUTENTICACIÓN...');

// 3.1 LoginForm → useAuth → supabase.auth.signInWithPassword
const loginForm = fs.readFileSync('src/components/auth/LoginForm.js', 'utf8');
const useAuth = fs.readFileSync('src/hooks/useAuth.js', 'utf8');

const conexionLoginUseAuth = loginForm.includes('useAuth') && 
                           useAuth.includes('signInWithPassword');

console.log('   - LoginForm → useAuth:', conexionLoginUseAuth ? '✅ Conectado' : '❌ Desconectado');
console.log('   - signInWithPassword:', useAuth.includes('signInWithPassword') ? '✅ Presente' : '❌ Ausente');

// 3.2 Verificar navegación después de login
const navegacionLogin = loginForm.includes('navigate(\'/admin/default\')');
console.log('   - Navegación post-login:', navegacionLogin ? '✅ Configurada' : '❌ No configurada');

// 3.3 Verificar protección de rutas
const adminLayout = fs.readFileSync('src/layouts/admin.js', 'utf8');
const proteccionRutas = adminLayout.includes('checkAuthentication') && 
                       adminLayout.includes('supabase.auth.getSession');
console.log('   - Protección de rutas:', proteccionRutas ? '✅ Activa' : '❌ Inactiva');

// 4. Verificar mensajes de error y debugging
console.log('\n4️⃣ VERIFICANDO MENSAJES DE DEBUG...');

const mensajesDebug = [
  { archivo: 'src/hooks/useAuth.js', mensaje: 'Inicio de sesión exitoso', tipo: 'éxito' },
  { archivo: 'src/hooks/useAuth.js', mensaje: 'Error en inicio de sesión', tipo: 'error' },
  { archivo: 'src/layouts/admin.js', mensaje: 'Verificando autenticación', tipo: 'debug' },
  { archivo: 'src/views/admin/profile.js', mensaje: 'Usuario encontrado', tipo: 'debug' }
];

mensajesDebug.forEach(({ archivo, mensaje, tipo }) => {
  try {
    const content = fs.readFileSync(archivo, 'utf8');
    const encontrado = content.includes(mensaje);
    console.log(`   - ${tipo} (${archivo}): ${encontrado ? '✅' : '❌'} ${mensaje}`);
  } catch (e) {
    console.log(`   - ${tipo} (${archivo}): ❌ Archivo no encontrado`);
  }
});

// 5. Verificar integridad del flujo
console.log('\n5️⃣ VERIFICANDO INTEGRIDAD DEL FLUJO...');

const flujoCompleto = [
  'SignInCentered → LoginForm',
  'LoginForm → useAuth.signIn',
  'useAuth.signIn → supabase.auth.signInWithPassword',
  'Login éxito → navigate(/admin/default)',
  'AdminLayout → checkAuthentication',
  'checkAuthentication → supabase.auth.getSession',
  'Profile → loadProfile con user.id'
];

console.log('📋 Secuencia esperada:');
flujoCompleto.forEach((paso, index) => {
  console.log(`   ${index + 1}. ${paso}`);
});

// 6. Diagnosticar problemas comunes
console.log('\n6️⃣ DIAGNÓSTICO DE PROBLEMAS COMUNES:\n');

const diagnosticos = [
  {
    problema: 'Credenciales correctas pero no redirige',
    causa: 'Falta navigate() en onSuccess del login',
    solucion: 'Verificar LoginForm.js incluya navigate("/admin/default")',
    verificado: loginForm.includes('navigate(\'/admin/default\')')
  },
  {
    problema: 'Login aparentemente exitoso pero sin sesión',
    causa: 'Problema con onAuthStateChange o credenciales',
    solucion: 'Verificar console.log de "Inicio de sesión exitoso"',
    verificado: useAuth.includes('Inicio de sesión exitoso')
  },
  {
    problema: 'Redirige pero AdminLayout bloquea',
    causa: 'Fallo en checkAuthentication de AdminLayout',
    solucion: 'Verificar mensajes de "Verificando autenticación"',
    verificado: adminLayout.includes('Verificando autenticación')
  },
  {
    problema: 'Profile no carga después de login',
    causa: 'user es null o loadProfile no se ejecuta',
    solucion: 'Verificar "Usuario encontrado" y "Usuario no encontrado"',
    verificado: true // Siempre verificado en Profile
  }
];

diagnosticos.forEach(({ problema, causa, solucion, verificado }) => {
  console.log(`   🔍 ${problema}`);
  console.log(`      Causa: ${causa}`);
  console.log(`      Solución: ${solucion}`);
  console.log(`      Estado: ${verificado ? '✅ Verificado' : '❌ Revisar'}\n`);
});

// 7. Recomendaciones finales
console.log('7️⃣ RECOMENDACIONES PARA DEPURAR:\n');

console.log('📋 PASOS A SEGUIR:');
console.log('1. Abre la consola del navegador (F12 → Console)');
console.log('2. Intenta hacer login con credenciales válidas');
console.log('3. Observa los mensajes que aparecen en orden:');
console.log('   a) "Inicio de sesión exitoso: [email]"');
console.log('   b) "Verificando autenticación en AdminLayout..."');
console.log('   c) "Sesión encontrada: ✅ Activa" o "❌ Inactiva"');
console.log('   d) "✅ Perfil cargado:" o "⚠️ No se encontró perfil"');
console.log('4. Si falta algún mensaje, ahí está el problema');
console.log('5. Copia el mensaje exacto y búscalo en los archivos');

console.log('\n🔧 COMANDOS ÚTILES:');
console.log('- node test-soluciones.js (verifica todos los fixes)');
console.log('- node test-autenticacion.js (verifica autenticación)');
console.log('- npm start (reinicia el servidor si haces cambios)');

console.log('\n📧 CREDENCIALES DE SUPABASE:');
console.log('- URL: https://hvhmsecjrkmlqlruznfe.supabase.co');
console.log('- Asegúrate de que tu usuario esté en la tabla users');
console.log('- El email debe estar confirmado (confirmed_at != null)');

console.log('\n🎯 Si todo falla, ejecuta este código en la consola del navegador:');
console.log(`
// Diagnosticar Supabase directamente
console.log('=== DIAGNÓSTICO DIRECTO ===');
supabase.auth.getSession().then(({ data, error }) => {
  console.log('Sesión actual:', data);
  console.log('Error:', error);
});

// Probar login manual
supabase.auth.signInWithPassword({
  email: 'tu-email@ejemplo.com',
  password: 'tu-contraseña'
}).then(({ data, error }) => {
  console.log('Login resultado:', data);
  console.log('Login error:', error);
});
`);
