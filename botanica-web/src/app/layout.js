// Importamos 'Lora' en lugar de 'Inter' para darle un toque más elegante y natural
import { Lora } from "next/font/google"; 
import "./globals.css";
import { CartProvider } from "../context/CartContext";

// Configuramos la nueva fuente
const lora = Lora({ subsets: ["latin"] });

// METADATA: Esto es lo que aparece en la pestaña del navegador y en Google (SEO)
export const metadata = {
  title: "Plantas Vita",
  description: "Tu espacio verde y natural",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* Aplicamos la fuente a todo el cuerpo (body) de la página */}
      <body className={lora.className}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}