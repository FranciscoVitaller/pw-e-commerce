'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Checkout() {
  const [compraExitosa, setCompraExitosa] = useState(false);

  // Evento de JavaScript para manejar el formulario
  const manejarEnvio = (e) => {
    e.preventDefault(); // Evita que la página se recargue (¡Explicá esto en el oral!)
    setCompraExitosa(true); // Cambiamos el estado para mostrar el mensaje de éxito
  };

  // Si el formulario se envió bien, mostramos esto:
  if (compraExitosa) {
    return (
      <main className="container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>¡Gracias por tu compra en Plantas Vita! 🌱</h2>
        <p>Tu pedido ha sido procesado con éxito.</p>
        <Link href="/" style={{ color: 'green', textDecoration: 'underline' }}>
          Volver a la tienda
        </Link>
      </main>
    );
  }

  // Si no se envió, mostramos el formulario:
  return (
    <main className="container" style={{ padding: '20px' }}>
      <h2>Finalizar Compra</h2>
      <p>Por favor, completá tus datos para el envío.</p>

      {/* Formulario con validaciones HTML5 */}
      <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="nombre">Nombre completo:</label>
          {/* Validación: Campo obligatorio y mínimo 3 caracteres */}
          <input 
            type="text" 
            id="nombre" 
            name="nombre" 
            required 
            minLength="3" 
            placeholder="Ej: Juan Pérez" 
            style={{ padding: '8px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="email">Correo electrónico:</label>
          {/* Validación: Tiene que tener formato de @email */}
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            placeholder="ejemplo@correo.com" 
            style={{ padding: '8px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="telefono">Teléfono (10 dígitos):</label>
          {/* Validación: Solo números, exactamente 10 caracteres */}
          <input 
            type="tel" 
            id="telefono" 
            name="telefono" 
            required 
            pattern="[0-9]{10}" 
            title="Debe contener 10 números"
            placeholder="Ej: 1123456789" 
            style={{ padding: '8px' }}
          />
        </div>

        <button 
          type="submit" 
          style={{ padding: '10px', backgroundColor: '#4F7942', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
          Confirmar Pedido
        </button>
      </form>
    </main>
  );
}