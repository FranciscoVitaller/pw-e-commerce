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
| Despliegue | Vercel |

## 🚀 Desarrollo local

```bash
git clone https://github.com/FranciscoVitaller/pw-e-commerce.git
cd pw-e-commerce/botanica-web
cp .env.example .env.local
npm install
npm run dev
```

### Variables de entorno

Completar en `.env.local` (ver `.env.example`):

| Variable | De dónde sale |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (clave `anon`, segura para el cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (clave `service_role` — solo servidor) |
| `MP_ACCESS_TOKEN` | Mercado Pago → Credenciales |
| `MP_WEBHOOK_SECRET` | Mercado Pago → Webhooks |

## 📜 Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## 📂 Estructura del proyecto

```text
src/
├── app/
│   ├── admin/
│   ├── api/
│   ├── carrito/
│   ├── checkout/
│   ├── login/
│   ├── producto/[id]/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── context/
│   └── CartContext.js
└── lib/
    └── supabase.js
```

## 🛒 Flujo de compra

1. El catálogo lee los productos desde Supabase.
2. Agregar al carrito actualiza el estado global.
3. Al finalizar compra se dirige al checkout.
4. El backend crea la orden y la preferencia de pago con Mercado Pago.
5. El webhook actualiza el estado de la orden y el stock.

## 🔐 Panel de administración

La ruta `/admin` permite crear, editar y eliminar productos del catálogo.

## ✒️ Autor

Francisco Vitaller
