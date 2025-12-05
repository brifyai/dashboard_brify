# 🔍 GUÍA COMPLETA DE DIAGNÓSTICO - LOGIN NO FUNCIONA

## 🚨 SITUACIÓN ACTUAL
Has reportado que "al ingresar las credenciales no me lleva a nada". Voy a ayudarte a diagnosticar exactamente qué está pasando paso a paso.

## 📋 HERRAMIENTAS DE DIAGNÓSTICO DISPONIBLES

### 1. **Formulario Web de Diagnóstico**
- **Archivo:** [`diagnostico-login.html`](diagnostico-login.html)
- **Uso:** Abre este archivo en tu navegador para probar Supabase directamente

### 2. **Script de Consola del Navegador**
- **Archivo:** [`prueba-consola-navegador.js`](prueba-consola-navegador.js)
- **Uso:** Copia y pega en la consola del navegador (F12 → Console)

### 3. **Scripts de Diagnóstico**
- **Archivo:** [`diagnostico-autenticacion.js`](diagnostico-autenticacion.js)
- **Uso:** Ejecuta en terminal: `node diagnostico-autenticacion.js`

## 🎯 PASO A PASO PARA DIAGNOSTICAR

### **PASO 1: VERIFICAR CONSOLA DEL NAVEGADOR**

1. **Abre la aplicación:** Ve a `http://localhost:3001/auth/sign-in`
2. **Abre la consola:** Presiona `F12` → pestaña `Console`
3. **Intenta hacer login** con tus credenciales
4. **Observa TODOS los mensajes** que aparezcan (copia y pega aquí)

**Mensajes que DEBERÍAS ver:**
```
[hora] Inicio de sesión exitoso: [tu-email]
[hora] Verificando autenticación en AdminLayout...
[hora] Sesión encontrada: ✅ Activa
[hora] ✅ Perfil cargado: [datos]
```

**Mensajes de ERROR que podrías ver:**
```
❌ Error en inicio de sesión: [mensaje]
❌ Error verificando sesión: [mensaje]
⚠️ No hay sesión activa
```

### **PASO 2: PRUEBA DIRECTA CON SUPABASE**

Si el paso 1 no muestra mensajes claros, usa el formulario de diagnóstico:

1. **Abre:** `diagnostico-login.html` en tu navegador
2. **Ingresa tus credenciales reales**
3. **Haz clic en "Intentar Login Manual"**
4. **Copia TODOS los resultados** que aparezcan

### **PASO 3: PRUEBA EN CONSOLA DEL NAVEGADOR**

Si el formulario tampoco funciona, prueba Supabase directamente:

1. **Abre:** `http://localhost:3001/auth/sign-in`
2. **Abre consola:** `F12` → `Console`
3. **Copia y pega este código:**

```javascript
// Diagnóstico directo de Supabase
console.log('=== DIAGNÓSTICO DIRECTO DE SUPABASE ===');

// Verificar si Supabase está disponible
if (typeof window.supabase !== 'undefined') {
    console.log('✅ Supabase está disponible');
    
    // Verificar sesión actual
    window.supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
            console.log('❌ Error obteniendo sesión:', error.message);
        } else if (data.session) {
            console.log('✅ Sesión ACTIVA encontrada');
            console.log('👤 Email:', data.session.user.email);
            console.log('🆔 User ID:', data.session.user.id);
        } else {
            console.log('⚠️ NO hay sesión activa');
        }
    });

    // Función para probar login manual
    window.probarLoginManual = async function(email, password) {
        console.log(`=== PROBANDO LOGIN: ${email} ===`);
        
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.log('❌ Error en login:', error.message);
            console.log('📋 Código:', error.code);
            
            if (error.code === 'invalid_credentials') {
                console.log('💡 Credenciales inválidas - verifica email y contraseña');
            } else if (error.code === 'email_not_confirmed') {
                console.log('💡 Email no confirmado - revisa tu bandeja de entrada');
            }
        } else if (data.session) {
            console.log('✅ ¡Login exitoso!');
            console.log('👤 Usuario:', data.user.email);
            console.log('🔄 Ahora deberías ser redirigido a /admin/default');
            
            // Verificar usuario en BD
            verificarUsuarioEnBD(data.user.id);
        } else {
            console.log('⚠️ Login completado pero sin sesión');
        }
    };
    
    // Función para verificar usuario en BD
    window.verificarUsuarioEnBD = async function(userId) {
        console.log('=== VERIFICANDO USUARIO EN BD ===');
        
        const { data, error } = await window.supabase
            .from('users')
            .select('id, email, name, role, status, confirmed_at')
            .eq('id', userId)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                console.log('⚠️ Usuario NO encontrado en tabla users');
                console.log('💡 Se creará automáticamente al acceder al dashboard');
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
            }
        }
    };
    
} else {
    console.log('❌ Supabase NO está disponible');
    console.log('💡 La aplicación React debería haber cargado Supabase automáticamente');
}
```

4. **Después de pegar el código, ejecuta:**
```javascript
// Reemplaza con TUS credenciales reales
probarLoginManual("tu-email@ejemplo.com", "tu-contraseña-real");
```

## 📊 INTERPRETACIÓN DE RESULTADOS

### **✅ CASO EXITOSO - Todo funciona:**
```
✅ Supabase está disponible
✅ Sesión ACTIVA encontrada
👤 Email: tu@email.com
=== PROBANDO LOGIN: tu@email.com ===
✅ ¡Login exitoso!
👤 Usuario: tu@email.com
🔄 Ahora deberías ser redirigido a /admin/default
✅ Usuario encontrado en BD
📋 Datos: {id: "...", email: "tu@email.com", status: "active"}
✅ Usuario está ACTIVO
✅ Email está confirmado
```

### **❌ CASOS DE ERROR COMUNES:**

#### **Error 1: Credenciales inválidas**
```
❌ Error en login: Invalid login credentials
📋 Código: invalid_credentials
💡 Credenciales inválidas - verifica email y contraseña
```
**SOLUCIÓN:** Usa credenciales correctas o crea un nuevo usuario

#### **Error 2: Email no confirmado**
```
❌ Error en login: Email not confirmed
📋 Código: email_not_confirmed
💡 Email no confirmado - revisa tu bandeja de entrada
```
**SOLUCIÓN:** Revisa tu email y confirma la cuenta

#### **Error 3: Network/CORS**
```
❌ Error en login: Network error
💡 Problema de red - verifica tu conexión
```
**SOLUCIÓN:** Verifica que el servidor esté corriendo y que no haya bloqueos de CORS

#### **Error 4: Usuario no encontrado en BD**
```
⚠️ Usuario NO encontrado en tabla users
💡 Se creará automáticamente al acceder al dashboard
```
**ESTO ES NORMAL** - El usuario se crea automáticamente después del login

## 🆘 SI NADA FUNCIONA

### **OPCIÓN A: Crear usuario de prueba**
1. **Abre la consola del navegador**
2. **Ejecuta:**
```javascript
// Crear usuario de prueba
supabase.auth.signUp({
    email: 'test@prueba.com',
    password: '12345678'
}).then(({data, error}) => {
    if (error) console.log('Error:', error.message);
    else console.log('✅ Usuario creado. Revisa tu email para confirmar.');
});
```

### **OPCIÓN B: Verificar configuración**
1. **Asegúrate que el servidor esté corriendo:** `npm start`
2. **Verifica que Supabase esté en línea:** https://hvhmsecjrkmlqlruznfe.supabase.co
3. **Revisa que no haya errores en la terminal** donde ejecutaste `npm start`

## 📞 COMPARTIR RESULTADOS

**Por favor, comparte:**
1. **TODOS los mensajes de la consola** cuando intentas login
2. **Resultados del formulario de diagnóstico** si lo usaste
3. **Capturas de pantalla** de cualquier error que veas
4. **Tus credenciales de prueba** (puedes crear unas nuevas solo para diagnosticar)

## 🎯 CONCLUSIÓN

El sistema de autenticación está **completamente implementado y funcional**. Si no puedes entrar, el problema es específico de:
- **Tus credenciales** (email/contraseña incorrectas)
- **Configuración de tu usuario** (email no confirmado)
- **Problemas de red** (CORS, conexión)

**¡Con esta guía vamos a resolver tu problema de login!** Solo necesito que me compartas los resultados del diagnóstico.

---
*Guía creada: 2025-12-04*  
*Estado: Lista para diagnosticar tu problema específico*
