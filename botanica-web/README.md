# 🌿 Plantas Vita - E-Commerce

Sitio web oficial de **Plantas Vita**, un e-commerce dedicado a la venta de plantas online para conectar a las personas con la naturaleza.

## 💻 Tecnologías (Stack)

| Capa | Elección |
| Framework | Next.js (App Router) |
| Lenguaje | JavaScript |
| Estilos | CSS Puro (Variables globales, Mobile First) |
| Base de Datos | Supabase (PostgreSQL + Autenticación) |
| Pagos | Mercado Pago (API de Checkout y Webhooks) |
| Estado | React Context API |

## 🌿 Ramas del Proyecto (Branches)

| Rama | Propósito |
| `main` | Producción — la versión final, estable y visible para los usuarios. |

## 🚀 Desarrollo Local

Para correr este proyecto en tu propia computadora, sigue estos pasos:

```bash
cp .env.example .env.local   # Completar con las credenciales de Supabase y Mercado Pago
npm install
npm run dev                  # El proyecto abrirá en http://localhost:3000

📂 Estructura del Proyecto
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