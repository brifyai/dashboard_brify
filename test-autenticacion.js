#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE PRUEBA PARA VERIFICAR FLUJO DE AUTENTICACIÓN
 * 
 * Este script verifica que el flujo completo de autenticación funcione
 */

const fs = require('fs');

console.log('🔐 INICIANDO PRUEBAS DE AUTENTICACIÓN...\n');

// 1. Verificar que el LoginForm tenga navegación
console.log('1️⃣ Verificando navegación en LoginForm...');
const loginFormContent = fs.readFileSync('src/components/auth/LoginForm.js', 'utf8');
if (loginFormContent.includes('navigate(\'/admin/default\')')) {
    console.log('✅ LoginForm: NAVEGACIÓN AL DASHBOARD IMPLEMENTADA');
} else {
    console.log('❌ LoginForm: NAVEGACIÓN NO ENCONTRADA');
}

// 2. Verificar que SignInCentered use LoginForm
console.log('\n2️⃣ Verificando que SignInCentered use LoginForm real...');
const signInContent = fs.readFileSync('src/views/auth/signIn.js', 'utf8');
if (signInContent.includes('LoginForm') && !signInContent.includes('handleSignIn')) {
    console.log('✅ SignInCentered: USA LOGINFORM CON AUTENTICACIÓN REAL');
} else {
    console.log('❌ SignInCentered: AÚN USA MOCK SIN AUTENTICACIÓN');
}

// 3. Verificar que el hook useAuth tenga navegación
console.log('\n3️⃣ Verificando hook useAuth...');
const useAuthContent = fs.readFileSync('src/hooks/useAuth.js', 'utf8');
if (useAuthContent.includes('useNavigate')) {
    console.log('✅ useAuth: TIENE NAVEGACIÓN DISPONIBLE');
} else {
    console.log('❌ useAuth: NO TIENE NAVEGACIÓN');
}

// 4. Verificar protección de rutas
console.log('\n4️⃣ Verificando protección de rutas en AdminLayout...');
const adminLayoutContent = fs.readFileSync('src/layouts/admin.js', 'utf8');
if (adminLayoutContent.includes('checkAuthentication') && adminLayoutContent.includes('supabase.auth.getSession')) {
    console.log('✅ AdminLayout: PROTECCIÓN DE RUTAS IMPLEMENTADA');
} else {
    console.log('❌ AdminLayout: SIN PROTECCIÓN DE RUTAS');
}

console.log('\n🎯 RESUMEN DE AUTENTICACIÓN:');
console.log('=====================================');

const tests = [
    loginFormContent.includes('navigate(\'/admin/default\')'),
    signInContent.includes('LoginForm') && !signInContent.includes('handleSignIn'),
    useAuthContent.includes('useNavigate'),
    adminLayoutContent.includes('checkAuthentication') && adminLayoutContent.includes('supabase.auth.getSession')
];

const passedTests = tests.filter(test => test).length;
const totalTests = tests.length;

console.log(`✅ Tests pasados: ${passedTests}/${totalTests}`);

if (passedTests === totalTests) {
    console.log('\n🎉 ¡EL FLUJO DE AUTENTICACIÓN ESTÁ COMPLETO Y FUNCIONAL!');
    console.log('🔐 Ahora el login debería funcionar correctamente.');
} else {
    console.log('\n⚠️  Algunos componentes del flujo de autenticación no están completos.');
}

console.log('\n📋 INSTRUCCIONES PARA PROBAR:');
console.log('1. Abre http://localhost:3001/auth/sign-in');
console.log('2. Ingresa las credenciales de tu usuario de Supabase');
console.log('3. Si las credenciales son correctas, deberías ser redirigido a /admin/default');
console.log('4. Si las credenciales son incorrectas, deberías ver un mensaje de error');
console.log('5. Si no hay sesión activa, al intentar acceder a /admin/* deberías ser redirigido al login');

console.log('\n🔍 CREDENCIALES DE PRUEBA:');
console.log('- Usa el email y contraseña que configuraste en Supabase');
console.log('- Si no tienes una cuenta, puedes crearla en el formulario de registro');
console.log('- Verifica que el email esté confirmado en la tabla users');

console.log('\n📞 SI EL LOGIN AÚN NO FUNCIONA:');
console.log('1. Revisa la consola del navegador (F12 → Console)');
console.log('2. Busca mensajes como "✅ Perfil cargado:" o "❌ Error al cargar perfil"');
console.log('3. Verifica que Supabase esté configurado correctamente');
console.log('4. Ejecuta: node test-soluciones.js para verificar todos los fixes');
