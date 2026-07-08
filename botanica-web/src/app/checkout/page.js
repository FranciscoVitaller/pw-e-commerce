'use client';

/**
 * ARCHIVO: src/app/checkout/page.js
 * DESCRIPCIÓN: Formulario real de checkout. Valida los datos de contacto con
 * HTML5 (requerido, longitud mínima, patrón) y, al confirmar, arma la orden
 * con el carrito actual y llama a /api/checkout para generar la preferencia
 * de pago de Mercado Pago y redirigir al usuario a pagar.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';

export default function Checkout() {
  const router = useRouter();
  const { carrito, precioTotal, vaciarCarrito } = useCart();

  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsuario(user);
      setCargandoSesion(false);
    });
  }, []);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');

    if (!usuario) {
      router.push('/login');
      return;
    }

    const nombre = e.target.nombre.value;
    const telefono = e.target.telefono.value;

    setProcesando(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: carrito,
          userId: usuario.id,
          email: usuario.email,
          nombre,
          telefono,
        }),
      });

      const data = await response.json();

      if (data.init_point) {
        vaciarCarrito();
        window.location.href = data.init_point;
      } else {
        setError(data.error || 'Hubo un error al generar el pago.');
      }
    } catch (err) {
      console.error('Error al procesar el pago', err);
      setError('No se pudo conectar con el servidor de pagos.');
    }
    setProcesando(false);
  };

  if (cargandoSesion) {
    return <main className="container"><p>Cargando...</p></main>;
  }

  if (!usuario) {
    return (
      <main className="container" style={{ padding: '20px' }}>
        <h2>Finalizar Compra</h2>
        <p>Tenés que iniciar sesión para completar tu pedido.</p>
        <Link href="/login" className="btn-primario" style={{ display: 'inline-block', padding: '12px 30px', textDecoration: 'none' }}>
          Iniciar sesión
        </Link>
      </main>
    );
  }

  if (carrito.length === 0) {
    return (
      <main className="container" style={{ padding: '20px' }}>
        <h2>Finalizar Compra</h2>
        <p>Todavía no agregaste ninguna planta a tu carrito.</p>
        <Link href="/" style={{ color: 'var(--verde-principal)', textDecoration: 'underline' }}>
          Volver a la tienda
        </Link>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '20px' }}>
      <h2>Finalizar Compra</h2>
      <p>Comprando como <strong>{usuario.email}</strong>. Revisá tu pedido y completá tus datos de contacto.</p>

      <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0', maxWidth: '400px' }}>
        {carrito.map((item) => (
          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '8px 0' }}>
            <span>{item.cantidad} x {item.nombre}</span>
            <span>${item.precio * item.cantidad}</span>
          </li>
        ))}
      </ul>
      <p style={{ fontWeight: 'bold', fontSize: '1.2rem', maxWidth: '400px' }}>Total: ${precioTotal}</p>

      {error && (
        <div style={{ color: '#e74c3c', backgroundColor: '#fceae9', padding: '10px', borderRadius: '8px', maxWidth: '400px', marginBottom: '15px' }}>
          {error}
        </div>
      )}

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
          disabled={procesando}
          style={{ padding: '10px', backgroundColor: '#4F7942', color: 'white', border: 'none', cursor: procesando ? 'wait' : 'pointer', marginTop: '10px' }}>
          {procesando ? 'Procesando...' : 'Confirmar Pedido y Pagar'}
        </button>
      </form>
    </main>
  );
}
