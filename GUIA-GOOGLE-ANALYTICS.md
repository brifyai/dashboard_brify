# Guía: Conectar Google Analytics API

## Opciones Disponibles

### 1. **Google Analytics 4 (GA4) - Tracking Básico**
Para tracking de eventos y páginas visitadas.

### 2. **Google Analytics Data API v1** 
Para obtener datos de analytics y crear reportes.

## Implementación Recomendada

### Opción 1: GA4 con gtag (Más Simple)

#### Paso 1: Instalar dependencias
```bash
npm install gtag
```

#### Paso 2: Configurar en tu aplicación
```javascript
// src/config/analytics.js
import { gtag } from 'gtag';

export const GA_TRACKING_ID = 'TU_GA4_MEASUREMENT_ID';

export const pageview = (url) => {
  gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = (action, category, label, value) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
```

#### Paso 3: Configurar en App.js
```javascript
// src/App.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GA_TRACKING_ID, pageview } from './config/analytics';
import { gtag } from 'gtag';

function App() {
  const location = useLocation();

  useEffect(() => {
    const handleRouteChange = (url) => {
      pageview(url);
    };

    // Track page views
    handleRouteChange(location.pathname + location.search);
  }, [location]);

  useEffect(() => {
    // Initialize Google Analytics
    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID);
  }, []);

  return (
    // Your app content
  );
}
```

### Opción 2: Google Analytics Data API (Para Datos)

#### Paso 1: Instalar dependencias
```bash
npm install @google-analytics/data
```

#### Paso 2: Configurar credenciales
```javascript
// src/config/analyticsData.js
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: 'path/to/service-account-key.json',
});

export const getAnalyticsData = async (propertyId) => {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [
      {
        startDate: '30daysAgo',
        endDate: 'today',
      },
    ],
    dimensions: [
      { name: 'date' },
      { name: 'pagePath' },
    ],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'activeUsers' },
    ],
  });

  return response;
};
```

#### Paso 3: Usar en componente
```javascript
// src/components/AnalyticsDashboard.js
import React, { useState, useEffect } from 'react';
import { getAnalyticsData } from '../config/analyticsData';

function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAnalyticsData('TU_PROPERTY_ID');
        setData(result);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Cargando datos...</div>;

  return (
    <div>
      <h2>Datos de Google Analytics</h2>
      {/* Renderizar datos */}
    </div>
  );
}
```

## Configuración de Credenciales

### Para GA4 (gtag):
1. Ve a [Google Analytics](https://analytics.google.com/)
2. Crea una propiedad GA4
3. Obtén tu Measurement ID (G-XXXXXXXXXX)
4. Agrega el código de seguimiento

### Para Data API:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto
3. Habilita la "Google Analytics Data API"
4. Crea una cuenta de servicio
5. Descarga el archivo JSON de credenciales
6. En Google Analytics, agrega la cuenta de servicio como usuario

## Variables de Entorno

Crea un archivo `.env`:
```env
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_GA_PROPERTY_ID=123456789
```

## Ejemplo de Hook Personalizado

```javascript
// src/hooks/useAnalytics.js
import { useState, useEffect } from 'react';
import { gtag } from 'gtag';

export const useAnalytics = () => {
  const trackEvent = (action, category, label, value) => {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  };

  const trackPageView = (pagePath) => {
    gtag('config', 'TU_GA4_MEASUREMENT_ID', {
      page_path: pagePath,
    });
  };

  return {
    trackEvent,
    trackPageView,
  };
};
```

## Consideraciones de Seguridad

1. **No expongas credenciales** en el frontend
2. **Usa variables de entorno** para IDs sensibles
3. **Implementa rate limiting** para APIs
4. **Maneja errores** apropiadamente

## ¿Qué opción prefieres?

1. **Tracking básico** (GA4 con gtag) - Para saber qué páginas visitaron
2. **Análisis de datos** (Data API) - Para crear reportes y dashboards
3. **Ambas opciones** - Para tracking y análisis completo