# Guía Paso a Paso: Agregar Columna password_hash

## 🎯 Objetivo
Agregar la columna `password_hash` a la tabla `users` en Supabase para permitir almacenamiento de contraseñas hasheadas.

## 📋 Pasos para Ejecutar

### Paso 1: Acceder a Supabase Dashboard
1. Ve a: https://supabase.com/dashboard
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto: **hvhmsecjrkmlqlruznfe**

### Paso 2: Abrir SQL Editor
1. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
2. Haz clic en **"New query"** para crear una nueva consulta

### Paso 3: Ejecutar el Comando SQL
Copia y pega el siguiente código en el editor:

```sql
-- Agregar columna password_hash a la tabla users
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Agregar comentario para documentación
COMMENT ON COLUMN users.password_hash IS 'Hash de la contraseña del usuario para autenticación local';

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_password_hash ON users(password_hash) WHERE password_hash IS NOT NULL;

-- Verificar que se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'password_hash';
```

### Paso 4: Ejecutar la Consulta
1. Haz clic en el botón **"Run"** (▶️) en la parte superior del editor
2. Espera a que se ejecute (debería tomar menos de 1 segundo)
3. Verifica que no aparezcan errores en la salida

### Paso 5: Verificar la Columna
1. Ve a **"Table Editor"** en el menú lateral
2. Selecciona la tabla **"users"**
3. Verifica que aparezca la nueva columna `password_hash` en la estructura

## 🔧 Después de Agregar la Columna

### Paso 6: Actualizar el Código (Opcional)
Si quieres usar la columna en el código, descomenta la línea en `src/views/admin/settings.js`:

```javascript
// En la función createUser, línea aproximada 174:
password_hash: userData.password, // Descomenta si agregaste la columna
```

### Paso 7: Probar la Funcionalidad
1. Ve a tu Dashboard en: http://localhost:3000
2. Navega a **Configuración** → **Gestión de Usuarios**
3. Intenta crear un nuevo usuario
4. ✅ Debería funcionar sin errores

## 🚨 Solución de Problemas

### Error: "relation users does not exist"
- Verifica que estés en el proyecto correcto
- Asegúrate de que la tabla `users` existe

### Error: "column password_hash already exists"
- La columna ya está agregada, no es un problema
- Puedes continuar con el paso 7

### Error de permisos
- Asegúrate de tener permisos de administrador en el proyecto
- Contacta al propietario del proyecto si es necesario

## 📊 Verificación Final

Después de completar todos los pasos, deberías ver:
- ✅ Columna `password_hash` en la tabla `users`
- ✅ Funcionalidad de creación de usuarios sin errores
- ✅ Dashboard funcionando correctamente

## 🔒 Nota de Seguridad

**Importante**: En un entorno de producción real, las contraseñas deberían:
1. **Nunca** almacenarse en texto plano
2. **Siempre** hashearse usando algoritmos seguros (bcrypt, argon2, etc.)
3. **Nunca** almacenarse en la base de datos sin hash

Este ejemplo es solo para desarrollo/testing.

---

**¿Necesitas ayuda?** Si encuentras algún problema, copia y pega el mensaje de error específico para recibir asistencia.