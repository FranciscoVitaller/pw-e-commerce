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

src/
├── app/
│   ├── admin/            # Panel de control protegido para administradores
│   ├── api/              # Endpoints del backend (checkout y webhooks de MP)
│   ├── carrito/          # Resumen del carrito de compras
│   ├── checkout/         # Interfaz para finalizar la compra
│   ├── login/            # Pantalla de inicio de sesión
│   ├── producto/[id]/    # Vista detallada y dinámica de cada planta
│   ├── globals.css       # Hoja de estilos principal y paleta de colores
│   ├── layout.js         # Layout raíz (fuentes de Google y metadatos)
│   └── page.js           # Home page y catálogo principal de productos
│
├── context/
│   └── CartContext.js    # Lógica global para manejar los items del carrito
│
└── lib/
    └── supabase.js       # Configuración y cliente de conexión a Supabase

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
