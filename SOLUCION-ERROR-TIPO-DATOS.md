# Solución del Error 22P02 - Tipo de Datos Incorrecto

## Problema Identificado

El error `22P02: invalid input syntax for type bigint` indica que:

1. **La columna `id` en la tabla `users` está definida como `bigint`**
2. **Supabase Auth genera UUIDs (strings) como IDs de usuario**
3. **Hay una incompatibilidad de tipos de datos**

## Solución Completa

### Paso 1: Ejecutar Migración de Base de Datos

Ejecuta el archivo `migracion-corregir-usuarios.sql` en tu base de datos Supabase:

```sql
-- Este archivo contiene la migración completa para:
-- 1. Corregir el tipo de columna id a UUID
-- 2. Crear índices para rendimiento
-- 3. Configurar RLS (Row Level Security)
-- 4. Crear triggers automáticos
```

### Paso 2: Verificar Estructura

Después de la migración, verifica que la tabla tenga la estructura correcta:

```sql
-- Ejecutar verificar-tabla-usuarios.sql para confirmar
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';
```

**Resultado esperado:** `id` debe ser de tipo `uuid`

### Paso 3: Solución Temporal en el Código

El código ya incluye manejo específico para este error:

```javascript
// En src/views/admin/profile.js
if (error.code === '22P02') {
  toast({
    title: 'Error de configuración',
    description: 'Hay un problema con la configuración de la base de datos. Contacta al administrador.',
    status: 'error',
    duration: 8000,
    isClosable: true,
  });
  return;
}
```

## Archivos Creados

1. **`migracion-corregir-usuarios.sql`** - Migración completa de la base de datos
2. **`verificar-tabla-usuarios.sql`** - Script para verificar la estructura
3. **`corregir-tipo-id-usuarios.sql`** - Migración simple para solo corregir el tipo

## Instrucciones de Ejecución

### En Supabase Dashboard:
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a "SQL Editor"
3. Ejecuta el contenido de `migracion-corregir-usuarios.sql`

### Verificación:
```sql
-- Verificar que la migración fue exitosa
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';
```

**Debe retornar:** `uuid`

## Resultado Esperado

Después de ejecutar la migración:

1. ✅ **Error 22P02 eliminado**
2. ✅ **Perfiles se cargan correctamente**
3. ✅ **Creación automática de perfiles funcional**
4. ✅ **URL `http://localhost:3000/admin/profile` funcionando**

## Notas Importantes

- **Esta migración es segura** - No elimina datos existentes
- **Se crean índices automáticamente** para mejorar rendimiento
- **RLS está configurado** para seguridad de datos
- **Triggers automáticos** para `updated_at`

## Soporte

Si persisten problemas después de la migración:
1. Verificar que la migración se ejecutó correctamente
2. Revisar logs de Supabase para errores adicionales
3. Confirmar que el usuario tiene permisos en la tabla `users`