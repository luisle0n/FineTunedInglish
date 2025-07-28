# FineTunedInglish - Sistema de Gestión Académica

Este proyecto fue generado usando [Angular CLI](https://github.com/angular/angular-cli) versión 19.2.15.

## 📋 Descripción del Proyecto

FineTunedInglish es un sistema de gestión académica desarrollado en Angular que permite administrar docentes, aulas, horarios y programas de enseñanza de inglés. El sistema incluye diferentes roles de usuario (Coordinador, Gerente, Talento Humano) con funcionalidades específicas para cada uno.

## 🛠️ Tecnologías Utilizadas

### **Frontend:**
- **Angular**: 19.2.0
- **TypeScript**: 5.7.2
- **RxJS**: 7.8.0
- **Chart.js**: 4.5.0 (para gráficos estadísticos)
- **ng2-charts**: 8.0.0
- **JWT Decode**: 4.0.0 (para autenticación)
- **XLSX**: 0.18.5 (para importación de datos Excel/CSV)

### **State Management:**
- **NgRx Store**: 19.2.1
- **NgRx Effects**: 19.2.1
- **NgRx Entity**: 19.2.1
- **NgRx Store DevTools**: 19.2.1

### **Herramientas de Desarrollo:**
- **Angular CLI**: 19.2.15
- **Angular DevKit**: 19.2.15
- **Karma**: 6.4.0 (para testing)
- **Jasmine**: 5.6.0 (framework de testing)

## 🚀 Instalación y Configuración

### **Requisitos Previos:**
- Node.js (versión 18 o superior)
- npm (incluido con Node.js)
- Angular CLI: `npm install -g @angular/cli`

### **Instalación de Dependencias:**
```bash
npm install
```

### **Servidor de Desarrollo:**
Para iniciar el servidor de desarrollo local, ejecuta:

```bash
npm start
# o
ng serve
```

Una vez que el servidor esté ejecutándose, abre tu navegador y navega a `http://localhost:4200/`. La aplicación se recargará automáticamente cuando modifiques cualquier archivo fuente.

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── auth/                    # Autenticación y login
│   ├── components/              # Componentes compartidos
│   ├── guards/                  # Guards de autenticación
│   ├── interceptors/            # Interceptores HTTP
│   ├── roles/                   # Vistas específicas por rol
│   │   ├── coordinador/         # Dashboard y funcionalidades del coordinador
│   │   ├── gerencia/            # Dashboard y funcionalidades del gerente
│   │   └── talento-humano/      # Dashboard y funcionalidades de RRHH
│   ├── services/                # Servicios de API
│   ├── shared/                  # Componentes y servicios compartidos
│   ├── store/                   # Estado global (NgRx)
│   └── utils/                   # Utilidades y helpers
├── assets/                      # Recursos estáticos
└── styles/                      # Estilos globales
```

## 🎯 Funcionalidades Principales

### **Dashboard por Rol:**
- **Coordinador**: Gestión de horarios, aulas, clases y usuarios
- **Gerente**: Vista general con estadísticas y acciones rápidas
- **Talento Humano**: Gestión de docentes y carga masiva de datos

### **Características:**
- ✅ **Autenticación JWT** con roles y permisos
- ✅ **Dashboard interactivo** con gráficos estadísticos
- ✅ **Gestión de docentes** con carga masiva desde Excel/CSV
- ✅ **Generación de horarios** automática
- ✅ **Gestión de aulas** y asignación de clases
- ✅ **Acciones rápidas** con modales integrados
- ✅ **Responsive design** para dispositivos móviles

## 📊 Gráficos y Estadísticas

El sistema incluye visualizaciones de datos usando Chart.js:
- **Distribución por Tipo de Contrato** (gráfico de dona)
- **Distribución por Nivel de Inglés** (gráfico de barras)
- **Estadísticas de ocupación** de aulas
- **Métricas de rendimiento** docente

## 🔧 Comandos Útiles

### **Generación de Componentes:**
```bash
ng generate component nombre-componente
ng generate service nombre-servicio
ng generate guard nombre-guard
```

### **Construcción del Proyecto:**
```bash
ng build
```

Para una lista completa de comandos disponibles:
```bash
ng generate --help
```

### **Testing:**
```bash
# Tests unitarios
ng test

# Tests end-to-end
ng e2e
```

## 🌐 API Backend

El proyecto está configurado para conectarse a un backend en `http://localhost:3000`. Asegúrate de que el servidor backend esté ejecutándose antes de usar la aplicación.

### **Endpoints Principales:**
- `/auth/login` - Autenticación
- `/dashboard/estadisticas` - Estadísticas del dashboard
- `/docentes` - Gestión de docentes
- `/aulas` - Gestión de aulas
- `/clases` - Gestión de clases
- `/usuarios` - Gestión de usuarios
- `/programas/listar` - Lista de programas

## 📱 Responsive Design

La aplicación está optimizada para funcionar en:
- ✅ **Desktop** (1920px+)
- ✅ **Tablet** (768px - 1024px)
- ✅ **Mobile** (320px - 767px)

## 🎨 Estilos y UI

- **Material Icons** para iconografía consistente
- **CSS Grid y Flexbox** para layouts responsivos
- **Variables CSS** para temas personalizables
- **Componentes modulares** con estilos encapsulados

## 🔒 Seguridad

- **JWT Tokens** para autenticación
- **Guards de ruta** para protección de vistas
- **Interceptores HTTP** para manejo de errores
- **Validación de formularios** en frontend

## 📝 Notas de Desarrollo

### **Estructura de Componentes:**
- Todos los componentes son **standalone**
- Uso de **OnPush** change detection para optimización
- **Lazy loading** para módulos por rol

### **State Management:**
- **NgRx** para estado global
- **Actions, Reducers, Effects** para manejo de datos
- **Selectors** para consultas eficientes

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ usando Angular 19.2.0**
