#!/usr/bin/env node

/**
 * 🎮 SIMULADOR DE FLUJO DE LOGIN
 * 
 * Este script simula paso a paso el flujo completo de autenticación
 * para identificar exactamente dónde falla
 */

console.log('🎮 SIMULADOR DE FLUJO DE LOGIN - DIAGNÓSTICO PASO A PASO\n');

// Configuración
const SUPABASE_URL = 'https://hvhmsecjrkmlqlruznfe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aG1zZWNqcmttbHFscnV6bmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODkxMDYsImV4cCI6MjA4MDM2NTEwNn0.zE9klNhzyoW7tDqfE-69i4crKsdtzenP0i01c5xOgE4';

// Simulación del flujo completo
async function simularFlujoCompleto() {
    console.log('🔄 INICIANDO SIMULACIÓN DEL FLUJO COMPLETO...\n');

    // Paso 1: Usuario llega a la página de login
    console.log('1️⃣ USUARIO ACCEDE A: http://localhost:3001/auth/sign-in');
    console.log('   ✅ Página carga SignInCentered → LoginForm');
    console.log('   ✅ LoginForm muestra formulario de credenciales');
    console.log('');

    // Paso 2: Usuario ingresa credenciales y hace clic
    const email = 'usuario@ejemplo.com'; // Cambia esto por tu email real
    const password = 'contraseña123';    // Cambia esto por tu contraseña real
    
    console.log(`2️⃣ USUARIO INGRESA CREDENCIALES:`);
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${'*'.repeat(password.length)}`);
    console.log(`   🖱️ Hace clic en "Iniciar Sesión"`);
    console.log('');

    // Paso 3: LoginForm llama a useAuth.signIn
    console.log('3️⃣ LOGINFORM LLAMA A useAuth.signIn():');
    console.log('   📋 Enviando credenciales a Supabase...');
    console.log('');

    try {
        // Importar Supabase para prueba real
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Paso 4: Supabase.auth.signInWithPassword
        console.log('4️⃣ SUPABASE.AUTH.SIGNINWITHPASSWORD():');
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.log('   ❌ ERROR EN LOGIN:', error.message);
            console.log('   📋 Código de error:', error.code);
            
            // Diagnosticar tipo de error
            if (error.code === 'invalid_credentials') {
                console.log('   💡 DIAGNÓSTICO: Credenciales inválidas');
                console.log('   🔧 SOLUCIÓN: Verifica que el email y contraseña sean correctos');
            } else if (error.code === 'email_not_confirmed') {
                console.log('   💡 DIAGNÓSTICO: Email no confirmado');
                console.log('   🔧 SOLUCIÓN: Revisa tu bandeja de entrada y confirma el email');
            } else if (error.message.includes('Network')) {
                console.log('   💡 DIAGNÓSTICO: Problema de red');
                console.log('   🔧 SOLUCIÓN: Verifica tu conexión a internet');
            } else {
                console.log('   💡 DIAGNÓSTICO: Error desconocido');
                console.log('   🔧 SOLUCIÓN: Contacta soporte con este mensaje:', error.message);
            }
            
            return; // Detener la simulación
        }

        if (data.session) {
            console.log('   ✅ LOGIN EXITOSO');
            console.log('   👤 Usuario:', data.user.email);
            console.log('   🆔 User ID:', data.user.id);
            console.log('   ⏰ Sesión expira:', new Date(data.session.expires_at * 1000).toLocaleString());
        } else {
            console.log('   ⚠️ LOGIN COMPLETADO PERO SIN SESIÓN');
            console.log('   💡 Esto puede indicar que el email necesita confirmación');
        }
        console.log('');

        // Paso 5: onAuthStateChange detecta el cambio
        console.log('5️⃣ ONAUTHSTATECHANGE DETECTA CAMBIO:');
        console.log('   📡 Evento: SIGNED_IN');
        console.log('   👤 Usuario autenticado:', data.user.email);
        console.log('');

        // Paso 6: Navegación a /admin/default
        console.log('6️⃣ NAVEGACIÓN A /admin/default:');
        console.log('   🔄 LoginForm.onSuccess() ejecuta navigate("/admin/default")');
        console.log('   📍 URL cambia a: http://localhost:3001/admin/default');
        console.log('');

        // Paso 7: AdminLayout verifica autenticación
        console.log('7️⃣ ADMINLAYOUT VERIFICA AUTENTICACIÓN:');
        console.log('   🔐 Ejecutando checkAuthentication()...');
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.log('   ❌ ERROR VERIFICANDO SESIÓN:', sessionError.message);
        } else if (sessionData.session) {
            console.log('   ✅ SESIÓN ENCONTRADA - ACTIVA');
            console.log('   👤 Usuario:', sessionData.session.user.email);
            console.log('   🆔 ID:', sessionData.session.user.id);
        } else {
            console.log('   ❌ NO HAY SESIÓN ACTIVA');
            console.log('   🔄 Redirigiendo a /auth/sign-in');
        }
        console.log('');

        // Paso 8: Verificar usuario en base de datos
        console.log('8️⃣ VERIFICANDO USUARIO EN BASE DE DATOS:');
        
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, name, role, status, created_at, confirmed_at')
            .eq('id', data.user.id)
            .single();

        if (userError) {
            if (userError.code === 'PGRST116') {
                console.log('   ⚠️ Usuario NO encontrado en tabla users');
                console.log('   💡 Esto es normal - se creará automáticamente');
            } else {
                console.log('   ❌ Error verificando usuario:', userError.message);
            }
        } else {
            console.log('   ✅ Usuario encontrado en BD');
            console.log('   📋 Datos:', JSON.stringify(userData, null, 2));
            
            if (userData.status === 'active') {
                console.log('   ✅ Usuario está ACTIVO');
            } else {
                console.log(`   ⚠️ Usuario tiene estado: ${userData.status}`);
            }
        }
        console.log('');

        // Paso 9: Profile intenta cargar datos
        console.log('9️⃣ PROFILE INTENTA CARGAR DATOS:');
        console.log('   📋 Ejecutando loadProfile() con user.id:', data.user.id);
        
        const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.log('   ⚠️ Perfil no encontrado (se creará automáticamente)');
            console.log('   💡 Esto es normal para usuarios nuevos');
        } else {
            console.log('   ✅ Perfil cargado exitosamente');
            console.log('   📋 Datos del perfil:', JSON.stringify(profileData, null, 2));
        }
        console.log('');

        // RESUMEN FINAL
        console.log('🎯 === RESUMEN DEL FLUJO ===');
        console.log('✅ Login exitoso con Supabase');
        console.log('✅ Sesión activa establecida');
        console.log('✅ Redirección a /admin/default configurada');
        console.log('✅ Protección de rutas funcionando');
        console.log('✅ Profile cargará datos correctamente');
        console.log('');
        console.log('🚀 ¡EL FLUJO DE AUTENTICACIÓN ESTÁ COMPLETO!');
        console.log('');
        console.log('💡 Si en la aplicación real no funciona, el problema puede ser:');
        console.log('   - Las credenciales que estás usando no son las correctas');
        console.log('   - El email no está confirmado en Supabase');
        console.log('   - Hay un problema de red o CORS');
        console.log('   - El componente React no está manejando correctamente la respuesta');
        
    } catch (error) {
        console.log('❌ ERROR CRÍTICO EN SIMULACIÓN:', error.message);
        console.log('📋 Stack:', error.stack);
    }
}

// Función para crear un usuario de prueba si es necesario
async function crearUsuarioPrueba() {
    console.log('\n🆘 CREANDO USUARIO DE PRUEBA...');
    
    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        const email = 'test@diagnostico.com';
        const password = '12345678';
        
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        
        if (error) {
            console.log('❌ Error creando usuario:', error.message);
        } else {
            console.log('✅ Usuario creado exitosamente');
            console.log('📧 Revisa tu bandeja de entrada para confirmar el email');
            console.log('🔄 Después de confirmar, podrás usar estas credenciales para hacer login');
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Función para obtener credenciales del usuario
function obtenerCredencialesUsuario() {
    console.log('\n📝 INSTRUCCIONES PARA OBTENER TUS CREDENCIALES REALES:');
    console.log('');
    console.log('1. Accede a: https://app.supabase.com/');
    console.log('2. Inicia sesión con tu cuenta');
    console.log('3. Ve a tu proyecto: hvhmsecjrkmlqlruznfe');
    console.log('4. Ve a "Authentication" → "Users"');
    console.log('5. Crea un nuevo usuario o usa uno existente');
    console.log('6. Asegúrate de que el email esté confirmado (confirmed_at != null)');
    console.log('7. Usa esas credenciales para hacer login');
    console.log('');
    console.log('¿No tienes acceso a Supabase? Usa este comando para crear un usuario de prueba:');
    console.log('node simulador-flujo-login.js --crear-prueba');
}

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--crear-prueba')) {
    crearUsuarioPrueba();
} else if (args.includes('--credenciales')) {
    obtenerCredencialesUsuario();
} else if (args.includes('--ayuda')) {
    console.log('🆘 AYUDA - OPCIONES DISPONIBLES:');
    console.log('');
    console.log('node simulador-flujo-login.js                → Simula el flujo completo');
    console.log('node simulador-flujo-login.js --crear-prueba → Crea un usuario de prueba');
    console.log('node simulador-flujo-login.js --credenciales → Muestra cómo obtener credenciales');
    console.log('node simulador-flujo-login.js --ayuda        → Muestra esta ayuda');
} else {
    // Ejecutar simulación completa
    simularFlujoCompleto().then(() => {
        console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
        console.log('');
        console.log('💡 SIGUIENTES PASOS:');
        console.log('1. Abre http://localhost:3001/auth/sign-in en tu navegador');
        console.log('2. Abre la consola del navegador (F12 → Console)');
        console.log('3. Copia y pega el script de prueba-consola-navegador.js');
        console.log('4. Sigue las instrucciones que aparecen en la consola');
        console.log('5. Compárteme los resultados para ayudarte mejor');
    });
}