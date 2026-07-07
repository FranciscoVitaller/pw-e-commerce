/**
 * ARCHIVO: src/app/layout.js
 * DESCRIPCIÓN: Archivo raíz de Next.js que define la estructura HTML global.
 * Aquí configuramos la fuente tipográfica, los metadatos para SEO y el proveedor del carrito.
 */

import { Lora } from "next/font/google"; 
import "./globals.css";
import { CartProvider } from "../context/CartContext";

// Configuración de la tipografía de Google Fonts
const lora = Lora({ subsets: ["latin"] });

/**
 * Metadatos de la aplicación para el posicionamiento en buscadores (SEO)
 * y la pestaña del navegador.
 */
export const metadata = {
  title: "Plantas Vita",
  description: "Tu espacio verde y natural",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={lora.className}>
        {/* Envolvemos toda la app en el CartProvider para que el estado del carrito sea global */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}