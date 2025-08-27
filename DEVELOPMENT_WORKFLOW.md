# Flujo de Trabajo de Desarrollo

## 🌟 Configuración de Ramas

### Ramas Principales
- **`main`**: Rama de producción estable
- **`development`**: Rama de desarrollo para nuevas funcionalidades

### Flujo de Trabajo Recomendado

1. **Para nuevas funcionalidades:**
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/nombre-funcionalidad
   # Desarrollar la funcionalidad
   git add .
   git commit -m "feat: descripción de la funcionalidad"
   git push origin feature/nombre-funcionalidad
   # Crear Pull Request hacia development
   ```

2. **Para correcciones de bugs:**
   ```bash
   git checkout development
   git pull origin development
   git checkout -b fix/nombre-del-bug
   # Corregir el bug
   git add .
   git commit -m "fix: descripción de la corrección"
   git push origin fix/nombre-del-bug
   # Crear Pull Request hacia development
   ```

3. **Para despliegue a producción:**
   ```bash
   git checkout main
   git pull origin main
   git merge development
   git push origin main
   # Desplegar automáticamente en Vercel
   ```

## 🚀 Despliegue

### URLs de Producción
- **Admin Web**: https://admin-web-ebon.vercel.app
- **Worker PWA**: https://worker-pwa.vercel.app

### Comandos de Despliegue Manual
```bash
# Admin Web
cd admin-web
vercel --prod

# Worker PWA
cd worker-pwa
vercel --prod
```

## 📝 Convenciones de Commits

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan funcionalidad)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

## 🔧 Configuración de Desarrollo

### Variables de Entorno
Cada aplicación tiene su archivo `.env.example` con las variables necesarias.

### Instalación de Dependencias
```bash
# En cada aplicación (admin-web, worker-pwa)
pnpm install
```

### Desarrollo Local
```bash
# Admin Web
cd admin-web
pnpm dev

# Worker PWA
cd worker-pwa
pnpm dev
```

## 📋 Checklist antes de Merge a Main

- [ ] Tests pasan correctamente
- [ ] Build se genera sin errores
- [ ] Variables de entorno configuradas
- [ ] Documentación actualizada
- [ ] Funcionalidad probada en development
- [ ] Code review completado

## 🎯 Próximas Mejoras Sugeridas

1. **Funcionalidades Pendientes:**
   - Sistema de notificaciones push
   - Modo offline para PWA
   - Dashboard de analytics
   - Sistema de reportes

2. **Mejoras Técnicas:**
   - Tests automatizados
   - CI/CD pipeline
   - Monitoreo de errores
   - Optimización de performance

3. **UX/UI:**
   - Tema oscuro
   - Responsive design mejorado
   - Accesibilidad
   - Internacionalización

---

**Nota:** Este flujo de trabajo está diseñado para mantener la estabilidad en producción mientras permite desarrollo ágil de nuevas funcionalidades.