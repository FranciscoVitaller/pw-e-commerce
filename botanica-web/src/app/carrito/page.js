"use client";

import Link from 'next/link';
import { useCart } from '../../context/CartContext';

export default function CarritoPage() {
  const { carrito, agregarAlCarrito, restarDelCarrito, vaciarCarrito, precioTotal } = useCart();

  const finalizarCompra = () => {
    alert(`Gracias por elegir Plantas Vita 🌿\nTu pedido por $${precioTotal} está siendo procesado.`);
    vaciarCarrito();
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '40px' }}>
        <Link href="/" style={{ color: 'var(--verde-principal)', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Volver a la tienda
        </Link>
        <h1 style={{ color: 'var(--verde-oscuro)', fontSize: '2.5rem', marginTop: '20px' }}>Tu Carrito</h1>
      </header>

      {carrito.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '15px', boxShadow: 'var(--sombra)' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Todavía no has sumado ninguna planta a tu colección.</p>
          <Link href="/" className="btn-primario" style={{ display: 'inline-block', marginTop: '25px', padding: '12px 30px' }}>
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: 'var(--sombra)' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {carrito.map((item) => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '20px 0' }}>
                <div style={{ flex: '1' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--verde-oscuro)' }}>{item.nombre}</h3>
                  <p style={{ color: '#888', fontSize: '0.9rem' }}>Precio unitario: ${item.precio}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#f9f9f9', padding: '8px 15px', borderRadius: '30px' }}>
                  <button onClick={() => restarDelCarrito(item.id)} style={{ border: 'none', background: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>-</button>
                  <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.cantidad}</span>
                  <button onClick={() => agregarAlCarrito(item)} style={{ border: 'none', background: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>+</button>
                </div>

                <div style={{ width: '120px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.3rem', color: 'var(--verde-oscuro)' }}>
                  ${item.precio * item.cantidad}
                </div>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid var(--verde-claro)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#666', marginBottom: '5px' }}>Total de la compra:</p>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--verde-oscuro)', margin: 0 }}>${precioTotal}</h2>
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={vaciarCarrito} style={{ padding: '12px 25px', backgroundColor: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Vaciar Carrito
              </button>
              <button onClick={finalizarCompra} className="btn-primario" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
                Finalizar Compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}