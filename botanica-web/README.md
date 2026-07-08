# 🌿 Plantas Vita — E-Commerce

Sitio web oficial de **Plantas Vita**, un e-commerce dedicado a la venta de plantas online para conectar a las personas con la naturaleza.

🔗 **Demo en vivo:** [pw-e-commerce-flame.vercel.app](https://pw-e-commerce-flame.vercel.app)

## 💻 Tecnologías (Stack)

| Capa | Elección |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | JavaScript |
| Estilos | CSS puro (variables globales, mobile-first) |
| Base de Datos | Supabase (PostgreSQL + Autenticación) |
| Pagos | Mercado Pago (API de Checkout y Webhooks) |
| Estado | React Context API |
| CI | GitHub Actions (lint + build en cada push/PR a `main`) |
| Despliegue | Vercel |

## 🚀 Desarrollo local

```bash
git clone https://github.com/FranciscoVitaller/pw-e-commerce.git
cd pw-e-commerce/botanica-web
cp .env.example .env.local   # completar con las credenciales reales (ver abajo)
npm install
npm run dev                  # http://localhost:3000
```

### Variables de entorno

Completar en `.env.local` (ver `.env.example`):

| Variable | De dónde sale |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (clave `anon`, segura para el cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (clave `service_role` — **solo servidor**, nunca exponerla al cliente) |
| `MP_ACCESS_TOKEN` | Mercado Pago → Tus integraciones → Credenciales |
| `MP_WEBHOOK_SECRET` | Mercado Pago → Tus integraciones → Webhooks (firma para validar `x-signature`) |

## 📜 Scripts

```bash
npm run dev      # inicia el servidor de desarrollo
npm run build    # crea la versión optimizada para producción
npm run start    # inicia el servidor en producción
npm run lint     # corre ESLint
```

## 📂 Estructura del proyecto

```
src/
├── app/
│   ├── admin/            # Panel CRUD de productos (protegido por email de admin)
│   ├── api/
│   │   ├── checkout/     # Valida stock, crea la orden y la preferencia de Mercado Pago
│   │   └── webhook/      # Recibe la notificación de pago y actualiza orden + stock
│   ├── carrito/          # Vista de página completa del carrito
│   ├── checkout/         # Formulario real de checkout (valida y llama a /api/checkout)
│   ├── login/            # Inicio de sesión / registro de clientes
│   ├── producto/[id]/    # Vista detallada de cada planta (lee de Supabase)
│   ├── globals.css       # Hoja de estilos principal, variables y media queries
│   ├── layout.js         # Layout raíz (fuente, metadatos, CartProvider)
│   └── page.js           # Home: catálogo, filtros y carrito lateral
│
├── context/
│   └── CartContext.js    # Estado global del carrito (en memoria, no persiste)
│
└── lib/
    └── supabase.js       # Cliente de Supabase para el navegador (clave anon)
```

## 🛒 Flujo de compra

1. El catálogo (`/`) lee los productos de la tabla `products` en Supabase.
2. Agregar al carrito actualiza `CartContext` (en memoria, se resetea al recargar).
3. "Finalizar Compra" pide iniciar sesión y lleva a `/checkout`.
4. `/checkout` valida los datos de contacto y llama a `/api/checkout`, que verifica stock, registra la orden (`orders` + `order_items`) y genera el link de pago de Mercado Pago.
5. Al aprobarse el pago, `/api/webhook` actualiza el estado de la orden y descuenta el stock vendido.

## 🔐 Panel de administración

`/admin` permite crear, editar y eliminar productos del catálogo. El acceso está limitado a un único email de administrador validado del lado del cliente — es un gate de UI sobre la autenticación de Supabase, no un reemplazo de reglas de seguridad a nivel de base de datos (RLS).

## ✒️ Autor

Francisco Vitaller
