// 📋 SCRIPT DE DIAGNÓSTICO PARA CONSOLA DEL NAVEGADOR
// Copia y pega esto en la consola del navegador (F12 → Console)

console.log('🚀 === INICIANDO DIAGNÓSTICO COMPLETO DE AUTENTICACIÓN ===');

// Paso 1: Verificar si Supabase está disponible
console.log('\n1️⃣ VERIFICANDO DISPONIBILIDAD DE SUPABASE:');
if (typeof window.supabase !== 'undefined') {
    console.log('✅ Supabase está disponible en window.supabase');
} else {
    console.log('❌ Supabase NO está disponible en window.supabase');
    console.log('🔄 Intentando cargar Supabase manualmente...');
    
    // Cargar Supabase desde CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.onload = () => {
        console.log('✅ Supabase cargado desde CDN');
        continuarDiagnostico();
    };
    script.onerror = () => {
        console.log('❌ Error al cargar Supabase desde CDN');
        console.log('💡 La aplicación React debería haber cargado Supabase automáticamente');
    };
    document.head.appendChild(script);
}

function continuarDiagnostico() {
    // Configuración de Supabase
    const SUPABASE_URL = 'https://hvhmsecjrkmlqlruznfe.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aG1zZWNqcmttbHFscnV6bmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODkxMDYsImV4cCI6MjA4MDM2NTEwNn0.zE9klNhzyoW7tDqfE-69i4crKsdtzenP0i01c5xOgE4';

    let supabase;
    
    try {
        if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Cliente Supabase inicializado');
        } else {
            console.log('❌ No se pudo inicializar Supabase');
            return;
        }
    } catch (error) {
        console.log('❌ Error inicializando Supabase:', error.message);
        return;
    }

    // Paso 2: Verificar sesión actual
    console.log('\n2️⃣ VERIFICANDO SESIÓN ACTUAL:');
    supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
            console.log('❌ Error obteniendo sesión:', error.message);
            console.log('📋 Código de error:', error.code);
        } else if (data.session) {
            console.log('✅ Sesión ACTIVA encontrada');
            console.log('👤 Email:', data.session.user.email);
            console.log('🆔 User ID:', data.session.user.id);
            console.log('⏰ Expira:', new Date(data.session.expires_at * 1000).toLocaleString());
            
            // Verificar si el usuario está en la BD
            verificarUsuarioEnBD(data.session.user.id);
        } else {
            console.log('⚠️ NO hay sesión activa');
            console.log('ℹ️ Necesitas iniciar sesión primero');
        }
    }).catch(err => {
        console.log('❌ Error crítico verificando sesión:', err.message);
    });

    // Función para verificar usuario en BD
    function verificarUsuarioEnBD(userId) {
        console.log('\n3️⃣ VERIFICANDO USUARIO EN BASE DE DATOS:');
        supabase.from('users')
            .select('id, email, name, role, status, created_at, confirmed_at')
            .eq('id', userId)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    if (error.code === 'PGRST116') {
                        console.log('⚠️ Usuario NO encontrado en tabla users');
                        console.log('💡 Esto es normal - se creará automáticamente al acceder al dashboard');
                    } else {
                        console.log('❌ Error verificando usuario:', error.message);
                    }
                } else {
                    console.log('✅ Usuario encontrado en BD');
                    console.log('📋 Datos:', data);
                    
                    if (data.status === 'active') {
                        console.log('✅ Usuario está ACTIVO');
                    } else {
                        console.log(`⚠️ Usuario tiene estado: ${data.status}`);
                    }
                    
                    if (data.confirmed_at) {
                        console.log('✅ Email está confirmado');
                    } else {
                        console.log('⚠️ Email NO está confirmado');
                        console.log('💡 Revisa tu bandeja de entrada para confirmar el email');
                    }
                }
            });
    }

    // Paso 3: Probar login manual con credenciales
    console.log('\n4️⃣ PROBANDO LOGIN MANUAL:');
    console.log('💡 Para probar el login, ejecuta esta función en la consola:');
    console.log('');
    console.log('async function probarLoginManual(email, password) {');
    console.log('    console.log("=== PROBANDO LOGIN MANUAL ===");');
    console.log('    const { data, error } = await supabase.auth.signInWithPassword({ email, password });');
    console.log('    if (error) {');
    console.log('        console.log("❌ Error en login:", error.message);');
    console.log('        console.log("📋 Código:", error.code);');
    console.log('    } else if (data.session) {');
    console.log('        console.log("✅ ¡Login exitoso!");');
    console.log('        console.log("👤 Usuario:", data.user.email);');
    console.log('        console.log("🔄 Ahora deberías ser redirigido a /admin/default");');
    console.log('    }');
    console.log('}');
    console.log('');
    console.log('// Ejemplo de uso:');
    console.log('// probarLoginManual("tu-email@ejemplo.com", "tu-contraseña");');

    // Paso 4: Verificar conexión a la base de datos
    console.log('\n5️⃣ VERIFICANDO CONEXIÓN A BASE DE DATOS:');
    supabase.from('users')
        .select('count')
        .then(({ data, error }) => {
            if (error) {
                console.log('❌ Error conectando a BD:', error.message);
            } else {
                console.log('✅ Conexión a base de datos exitosa');
                console.log('📊 Usuarios totales:', data[0]?.count || 'desconocido');
            }
        });

    // Paso 5: Verificar configuración del proyecto
    console.log('\n6️⃣ CONFIGURACIÓN DETECTADA:');
    console.log('📡 URL:', SUPABASE_URL);
    console.log('🔑 KEY:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    console.log('🌐 Dominio actual:', window.location.origin);
    console.log('📍 Ruta actual:', window.location.pathname);

    // Paso 6: Diagnóstico de errores comunes
    console.log('\n7️⃣ DIAGNÓSTICO DE ERRORES COMUNES:');
    console.log('');
    console.log('🔍 Si el login falla, verifica estos códigos de error:');
    console.log('- invalid_credentials: Email o contraseña incorrectos');
    console.log('- email_not_confirmed: Necesitas confirmar tu email');
    console.log('- network_error: Problema de conexión con Supabase');
    console.log('- JWT_EXPIRED: Tu sesión expiró');
    console.log('');
    console.log('💡 Soluciones rápidas:');
    console.log('1. Verifica que tu email esté confirmado en Supabase');
    console.log('2. Asegúrate de usar las credenciales correctas');
    console.log('3. Revisa que Supabase esté en línea');
    console.log('4. Intenta crear una nueva cuenta si es necesario');

    // Paso 7: Función para crear usuario de prueba
    console.log('\n8️⃣ CREAR USUARIO DE PRUEBA (si es necesario):');
    console.log('');
    console.log('async function crearUsuarioPrueba() {');
    console.log('    const email = "test@ejemplo.com";');
    console.log('    const password = "123456";');
    console.log('    const { data, error } = await supabase.auth.signUp({ email, password });');
    console.log('    if (error) {');
    console.log('        console.log("❌ Error creando usuario:", error.message);');
    console.log('    } else {');
    console.log('        console.log("✅ Usuario creado. Revisa tu email para confirmar.");');
    console.log('    }');
    console.log('}');

    console.log('\n🎯 === DIAGNÓSTICO COMPLETADO ===');
    console.log('📋 Ahora intenta hacer login en la aplicación y observa los mensajes');
    console.log('🔍 Si encuentras errores, copia TODOS los mensajes de la consola y compártelos');
}

// Iniciar el diagnóstico automáticamente
setTimeout(continuarDiagnostico, 1000);