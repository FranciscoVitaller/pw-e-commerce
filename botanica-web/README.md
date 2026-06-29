# 🌿 E-Commerce Botánico - Entrega Final (Semana 16)

Este proyecto es una plataforma funcional de comercio electrónico dedicada a la venta de plantas y artículos botánicos. Está desarrollada con un enfoque moderno utilizando **Next.js** para el frontend y backend, **Supabase** como base de datos relacional y **Mercado Pago** como pasarela de procesamiento de pagos internacional.

---

## 💼 1. Modelo de Negocio (B2C)

El proyecto adopta un modelo de negocio **B2C (Business-to-Consumer)** de venta directa.
* **Propuesta de Valor:** Ofrecer una experiencia digital fluida, rápida y segura para la adquisición de plantas, eliminando la necesidad de traslado físico a un vivero.
* **Fuentes de Ingresos:** Modelo transaccional directo basado en el margen de ganancia por cada artículo botánico vendido a través de la plataforma.
* **Ventaja Operativa:** Control automático de inventario en tiempo real acoplado al flujo de pagos, evitando pérdidas por sobreventa y reduciendo la intervención manual.

---

## 🏗️ 2. Arquitectura de Software (C4 Model)

Siguiendo los lineamientos de **C4 Model**, se detalla la estructura del sistema en sus niveles de Contexto y Contenedor.

### Nivel 1: Contexto del Sistema
```mermaid
graph TD
    Usuario[👤 Cliente / Comprador] -->|Navega y compra| Tienda[🛒 Sistema E-Commerce]
    Tienda -->|Notifica pagos aprobados/rechazados| MP[💳 Mercado Pago Gateway]
    Tienda -->|Consulta y persiste datos| Supabase[(🗄️ Supabase DB)]