-- VERIFICAR ESTADO DEL USUARIO CAMILO ALEGRIA
-- Este script verifica el estado completo del usuario en Supabase

-- PASO 1: Verificar estado en auth.users
SELECT 
  'ESTADO EN AUTH.USERS:' as mensaje,
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  confirmation_sent_at,
  email_change_sent_at
FROM auth.users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 2: Verificar estado en tabla users
SELECT 
  'ESTADO EN TABLA USERS:' as mensaje,
  id,
  email,
  name,
  first_name,
  last_name,
  status,
  created_at,
  updated_at
FROM users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 3: Verificar si el email está confirmado
SELECT 
  'VERIFICACIÓN DE EMAIL:' as mensaje,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado el ' || email_confirmed_at
    WHEN confirmation_sent_at IS NOT NULL THEN '⏳ Email de confirmación enviado el ' || confirmation_sent_at
    ELSE '❌ Email no confirmado'
  END as estado_email,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'El usuario puede acceder normalmente'
    WHEN confirmation_sent_at IS NOT NULL THEN 'El usuario debe revisar su email y hacer clic en el enlace de confirmación'
    ELSE 'Se debe enviar un nuevo email de confirmación'
  END as accion_recomendada
FROM auth.users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 4: Verificar configuración de autenticación
SELECT 
  'CONFIGURACIÓN DE AUTENTICACIÓN:' as mensaje,
  'Verifica que la confirmación de email esté habilitada en la configuración de Supabase' as recomendacion;

-- PASO 5: Solución alternativa - Confirmar manualmente el email
-- Si el email de confirmación no funciona, podemos confirmar manualmente
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'camiloalegriabarra@gmail.com' AND email_confirmed_at IS NULL) THEN
        RAISE NOTICE '⚠️ El email no está confirmado. Se puede confirmar manualmente si es necesario.';
    ELSE
        RAISE NOTICE '✅ El email ya está confirmado o no requiere confirmación.';
    END IF;
END $$;

-- PASO 6: Verificar últimos intentos de confirmación
SELECT 
  'ÚLTIMOS INTENTOS:' as mensaje,
  confirmation_sent_at,
  email_change_sent_at,
  CASE 
    WHEN confirmation_sent_at > NOW() - INTERVAL '24 hours' THEN '✅ Confirmación enviada recientemente'
    WHEN confirmation_sent_at IS NOT NULL THEN '⏳ Confirmación enviada hace más de 24 horas'
    ELSE '❌ No se ha enviado confirmación'
  END as estado_confirmacion
FROM auth.users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 7: Verificar si hay problemas con el servidor de email
SELECT 
  'SERVIDOR DE EMAIL:' as mensaje,
  'Verifica que la configuración de SMTP esté correcta en Supabase' as verificacion;