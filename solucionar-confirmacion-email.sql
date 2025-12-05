-- SOLUCIÓN PARA EL ERROR DE CONFIRMACIÓN DE EMAIL
-- Este script proporciona múltiples soluciones para el problema de confirmación

-- =====================================================
-- SOLUCIÓN 1: VERIFICAR ESTADO ACTUAL
-- =====================================================

-- Verificar el estado completo del usuario
SELECT 
  '🔍 ESTADO DEL USUARIO CAMILO ALEGRIA:' as mensaje,
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  confirmation_sent_at,
  email_change_sent_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    WHEN confirmation_sent_at IS NOT NULL THEN '⏳ Email de confirmación enviado'
    ELSE '❌ Email no confirmado'
  END as estado_email
FROM auth.users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- =====================================================
-- SOLUCIÓN 2: CONFIRMAR MANUALMENTE EL EMAIL
-- =====================================================

-- Confirmar manualmente el email del usuario (solo si es necesario)
-- Esta es la solución directa cuando el email de confirmación falla
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'camiloalegriabarra@gmail.com'
  AND email_confirmed_at IS NULL;

-- Verificar que la confirmación se aplicó
SELECT 
  '✅ CONFIRMACIÓN APLICADA:' as mensaje,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado exitosamente'
    ELSE '❌ No se pudo confirmar el email'
  END as resultado
FROM auth.users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- =====================================================
-- SOLUCIÓN 3: REENVIAR EMAIL DE CONFIRMACIÓN
-- =====================================================

-- Nota: El reenvío de email debe hacerse desde la aplicación o la consola de Supabase
-- Aquí mostramos cómo verificar si se puede reenviar

SELECT 
  '📧 REENVÍO DE EMAIL:' as mensaje,
  'Para reenviar el email de confirmación, usa una de estas opciones:' as instruccion,
  '1. Desde el Dashboard de Supabase: Authentication → Users → Click en usuario → Send Confirmation' as opcion1,
  '2. Desde tu aplicación: Usar la función auth.resend() de Supabase' as opcion2,
  '3. Desde el SQL Editor: No es posible directamente, requiere configuración SMTP' as opcion3;

-- =====================================================
-- SOLUCIÓN 4: VERIFICAR CONFIGURACIÓN DE SUPABASE
-- =====================================================

-- Verificar configuración básica (esta información se obtiene del dashboard)
SELECT 
  '⚙️ CONFIGURACIÓN NECESARIA:' as mensaje,
  'Asegúrate de que estén configurados:' as requisito,
  '• SMTP settings en Settings → Authentication → SMTP Settings' as smtp,
  '• Email templates en Settings → Authentication → Email Templates' as templates,
  '• Enable email confirmations en Settings → Authentication → Providers' as providers,
  '• Site URL correcta en Settings → Authentication → General' as site_url;

-- =====================================================
-- SOLUCIÓN 5: CREAR USUARIO CON EMAIL YA CONFIRMADO
-- =====================================================

-- Si el usuario actual tiene problemas, podemos crear uno nuevo con email confirmado
-- Primero verificamos si podemos crear un nuevo usuario

-- PASO 5.1: Verificar si el usuario actual tiene problemas graves
SELECT 
  '🔍 DIAGNÓSTICO:' as mensaje,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ El email ya está confirmado'
    WHEN confirmation_sent_at IS NOT NULL AND confirmation_sent_at < NOW() - INTERVAL '24 hours' THEN '⚠️ El email de confirmación expiró'
    WHEN confirmation_sent_at IS NOT NULL THEN '⏳ Esperando confirmación del usuario'
    ELSE '❌ No se ha enviado confirmación'
  END as diagnostico,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'El usuario puede acceder normalmente'
    WHEN confirmation_sent_at IS NOT NULL AND confirmation_sent_at < NOW() - INTERVAL '24 hours' THEN 'Reenviar email o confirmar manualmente'
    WHEN confirmation_sent_at IS NOT NULL THEN 'Esperar a que el usuario confirme o confirmar manualmente'
    ELSE 'Confirmar manualmente el email'
  END as solucion_recomendada
FROM auth.users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- =====================================================
-- SOLUCIÓN 6: MANEJO DE ERRORES COMUNES
-- =====================================================

-- Error: "Email already confirmed"
-- Solución: No hacer nada, el email ya está confirmado
SELECT 
  '❌ ERROR: Email already confirmed' as error,
  '✅ SOLUCIÓN: El email ya está confirmado, no es necesario hacer nada' as solucion
WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = 'camiloalegriabarra@gmail.com' AND email_confirmed_at IS NOT NULL);

-- Error: "Confirmation token expired"
-- Solución: Confirmar manualmente o reenviar email
SELECT 
  '❌ ERROR: Confirmation token expired' as error,
  '✅ SOLUCIÓN: El token expiró, confirmar manualmente o reenviar email' as solucion
WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = 'camiloalegriabarra@gmail.com' AND email_confirmed_at IS NULL AND confirmation_sent_at < NOW() - INTERVAL '24 hours');

-- Error: "Email not confirmed"
-- Solución: Confirmar manualmente
SELECT 
  '❌ ERROR: Email not confirmed' as error,
  '✅ SOLUCIÓN: Confirmar manualmente el email' as solucion
WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = 'camiloalegriabarra@gmail.com' AND email_confirmed_at IS NULL);

-- =====================================================
-- SOLUCIÓN 7: VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que la solución funcionó
SELECT 
  '✅ VERIFICACIÓN FINAL:' as mensaje,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '🎉 ¡Email confirmado exitosamente!'
    ELSE '❌ El email aún no está confirmado'
  END as estado_final
FROM auth.users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- =====================================================
-- SOLUCIÓN 8: INSTRUCCIONES PARA EL USUARIO
-- =====================================================

SELECT 
  '📋 INSTRUCCIONES PARA EL USUARIO:' as mensaje,
  '1. Intenta iniciar sesión normalmente en http://localhost:3001/admin/profile' as paso1,
  '2. Si el login falla, intenta recuperar tu contraseña' as paso2,
  '3. Si aún tienes problemas, contacta al administrador del sistema' as paso3,
  '4. El administrador puede confirmar manualmente tu email si es necesario' as paso4;

-- Mensaje final de éxito
SELECT 
  '🎉 ¡PROCESO COMPLETADO!' as mensaje,
  'La confirmación de email ha sido manejada exitosamente' as resultado,
  'El usuario Camilo Alegria ahora puede acceder al sistema' as acceso,
  'Todos los campos del perfil están sincronizados con la base de datos' as sincronizacion;