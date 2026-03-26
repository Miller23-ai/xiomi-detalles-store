# 🌸 Xiomi Detalles — Tienda Virtual

E-commerce completo con tienda pública + panel admin profesional, usando la misma base de datos que el sistema de gestión.

## 🌐 Rutas

| URL | Descripción |
|-----|-------------|
| `/` | Página de inicio (hero + productos destacados) |
| `/catalogo` | Catálogo con filtros por categoría, búsqueda y ordenamiento |
| `/catalogo?cat=Ramos` | Catálogo filtrado por categoría |
| `/producto/:id` | Detalle de producto con carrito |
| `/nosotras` | Página de la marca |
| `/admin` | Panel de administración (requiere login) |
| `/admin/pedidos` | Gestión de pedidos |
| `/admin/productos` | Gestión de productos con fotos |
| `/admin/clientes` | Historial de clientes |
| `/admin/reportes` | Reportes financieros con export Excel/PDF |
| `/admin/config` | Configuración del negocio |

## ✨ Funcionalidades

**Tienda pública:**
- Hero editorial con collage de productos
- Catálogo con filtros por categoría, búsqueda en tiempo real, ordenamiento
- Carrito de compras con persistencia en localStorage
- Notas de personalización por ítem
- Compra por WhatsApp (mensaje pre-generado con todos los productos)
- Buscador overlay con resultados instantáneos
- Página de detalle con qty, personalización y botón de WhatsApp directo
- Diseño totalmente responsivo, mobile-first

**Panel Admin:**
- Dashboard con KPIs, gráficas y alertas de stock bajo
- Gestión completa de productos con fotos (Supabase Storage)
- Pedidos con cambio de estado, acceso a WhatsApp del cliente
- Historial y estadísticas por cliente
- Reportes financieros exportables a Excel y PDF
- Configuración del negocio y mensajes WhatsApp

## 🚀 Deploy en Netlify

### Variables de entorno requeridas:
```
VITE_SUPABASE_URL       = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY  = eyJ...
VITE_STORE_NAME         = Xiomi Detalles
VITE_STORE_WA           = 51999888777
```

### Build settings:
- Build command: `npm run build`  
- Publish directory: `dist`

## 🗄️ Base de datos

Usa la misma base de datos del sistema de gestión (xiomi-detalles).  
Solo necesitas tener los productos con `activo = true` y `photo_url` para que aparezcan en la tienda.

## 💻 Desarrollo local

```bash
cp .env.example .env
# Editar .env con tus credenciales
npm install
npm run dev
```

---
Hecho con 💕 para Xiomi Detalles
