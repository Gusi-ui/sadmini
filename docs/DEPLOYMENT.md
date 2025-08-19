# Guía de Despliegue

Guía completa para desplegar el Sistema de Gestión de Ayuda Domiciliaria en diferentes plataformas.

## 📋 Antes de Empezar

### Prerrequisitos
- Proyecto de Supabase configurado
- Repositorio Git con el código
- Variables de entorno configuradas

### Variables de Entorno Requeridas

```env
# Obligatorias
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima

# Opcionales
VITE_MUNICIPALITY=Mataró
VITE_PWA_URL=https://tu-pwa.vercel.app
```

## 🚀 Vercel (Recomendado)

### Configuración Automática

1. **Conectar Repositorio**:
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "New Project"
   - Importa tu repositorio

2. **Configurar Build Settings**:
   ```
   Framework Preset: Vite
   Root Directory: admin-web
   Build Command: pnpm build
   Output Directory: dist
   Install Command: pnpm install
   ```

3. **Variables de Entorno**:
   - Ve a Settings > Environment Variables
   - Añade las variables requeridas

4. **Deploy**:
   - Haz clic en "Deploy"
   - El despliegue será automático

### Configuración Manual

```bash
# Instalar Vercel CLI
npm install -g vercel

# En el directorio admin-web/
cd admin-web
vercel

# Seguir las instrucciones
# Configurar variables de entorno
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Desplegar
vercel --prod
```

## 🔵 Netlify

### Configuración Automática

1. **Conectar Repositorio**:
   - Ve a [netlify.com](https://netlify.com)
   - "New site from Git"
   - Selecciona tu repositorio

2. **Build Settings**:
   ```
   Base directory: admin-web
   Build command: pnpm build
   Publish directory: admin-web/dist
   ```

3. **Variables de Entorno**:
   - Site settings > Environment variables
   - Añade las variables requeridas

### Configuración con netlify.toml

Crea `admin-web/netlify.toml`:

```toml
[build]
  base = "admin-web"
  publish = "dist"
  command = "pnpm build"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--prefix=admin-web"

# Redirects para SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Headers de seguridad
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## ☁️ AWS Amplify

1. **Configurar amplify.yml**:

Crea `amplify.yml` en la raíz:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd admin-web
        - npm install -g pnpm
        - pnpm install
    build:
      commands:
        - pnpm build
  artifacts:
    baseDirectory: admin-web/dist
    files:
      - '**/*'
  cache:
    paths:
      - admin-web/node_modules/**/*
```

2. **Deploy**:
   - AWS Console > Amplify
   - "New app" > "Host web app"
   - Conectar repositorio
   - Configurar variables de entorno

## 🐳 Docker

### Dockerfile

Crea `admin-web/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build app
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

Crea `admin-web/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}
```

### Docker Commands

```bash
# Build
docker build -t home-care-admin .

# Run
docker run -p 3000:80 home-care-admin

# Con variables de entorno
docker run -p 3000:80 \
  -e VITE_SUPABASE_URL=https://tu-proyecto.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=tu-clave \
  home-care-admin
```

## 📱 PWA (Progressive Web App)

La aplicación incluye configuración PWA automática:

- **Manifest**: Generado automáticamente
- **Service Worker**: Configurado para cache
- **Offline**: Funcionalidad básica offline

### Verificar PWA

1. Desplegar la aplicación
2. Chrome DevTools > Lighthouse
3. Ejecutar audit de PWA
4. Verificar puntuación > 90

## 🔒 Configuración de Dominio

### DNS Records

```
# Para dominio principal
A     @        IP_ADDRESS
AAAA  @        IPv6_ADDRESS

# Para www
CNAME www      tu-dominio.com

# Para subdominio admin
CNAME admin    tu-vercel-app.vercel.app
```

### SSL/HTTPS

- **Vercel/Netlify**: SSL automático
- **Custom**: Usar Let's Encrypt o Cloudflare

## 📊 Monitoreo

### Analytics

Añadir en `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking

```bash
# Instalar Sentry
pnpm add @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.MODE
})
```

## 🚨 Troubleshooting

### Build Errors

```bash
# Limpiar cache
rm -rf node_modules/.vite
rm -rf dist
pnpm install

# TypeScript errors
pnpm build --mode development
```

### Environment Variables

```bash
# Verificar en build
echo $VITE_SUPABASE_URL

# Debug en runtime
console.log(import.meta.env.VITE_SUPABASE_URL)
```

### Performance

1. **Bundle Analysis**:
   ```bash
   pnpm add -D rollup-plugin-visualizer
   pnpm build --analyze
   ```

2. **Optimizaciones**:
   - Code splitting automático
   - Tree shaking habilitado
   - Compression en servidor

## 📝 Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] Build exitoso localmente
- [ ] Tests pasando (si existen)
- [ ] PWA audit > 90
- [ ] SSL/HTTPS configurado
- [ ] Dominio apuntando correctamente
- [ ] Monitoreo configurado
- [ ] Backup de base de datos

## 📞 Soporte

¿Problemas con el despliegue?
1. Revisar logs de build
2. Verificar variables de entorno
3. Consultar documentación de la plataforma
4. Crear issue en el repositorio

---

**¡Tu aplicación está lista para producción! 🎉**
