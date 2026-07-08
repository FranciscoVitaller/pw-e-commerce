"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../../context/CartContext';
import { supabase } from '../../../lib/supabase';

/**
 * Componente de Vista Detallada de Producto.
 * Obtiene y renderiza dinámicamente la información de una planta basándose en el ID de la URL,
 * leyendo directamente de la tabla "products" de Supabase (el mismo origen que usa el catálogo
 * y el panel de administración) para que siempre refleje el estado real del inventario.
 */
export default function DetalleProducto() {
  const params = useParams();
  const idProducto = params.id;
  const { agregarAlCarrito } = useCart();

  const [planta, setPlanta] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDetalle = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", idProducto)
        .single();

      if (error) {
        console.error("Error al traer el producto:", error.message);
      }
      setPlanta(data);
      setCargando(false);
    };
    obtenerDetalle();
  }, [idProducto]);

  // Manejo de estados de carga y error (Early returns)
  if (cargando) return <main className="container"><p>Cargando información botánica...</p></main>;
  if (!planta) return <main className="container"><p>Lo sentimos, no encontramos esa variedad en nuestro catálogo.</p></main>;

  return (
    <main className="container">
      {/* Encabezado local de la vista del producto */}
      <header style={{ marginBottom: '30px' }}>
        <Link href="/" style={{ color: 'var(--verde-principal)', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Volver al catálogo
        </Link>
      </header>

      <article className="card producto-detalle" style={{ maxWidth: '900px', margin: '0 auto', padding: '50px', backgroundColor: 'white' }}>
        <div style={{ borderLeft: '5px solid var(--verde-principal)', paddingLeft: '25px' }}>
          <h1 style={{ color: 'var(--verde-oscuro)', fontSize: '3rem', margin: 0 }}>
            {planta.nombre}
          </h1>
          <p style={{ color: 'var(--verde-principal)', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '10px' }}>
            Variedad de {planta.categoria}
          </p>
        </div>
        
        <div style={{ margin: '40px 0', fontSize: '1.2rem', color: '#444', lineHeight: '1.8' }}>
          <p>{planta.descripcion}</p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {planta.dificultad && (
              <span style={{ backgroundColor: 'var(--verde-claro)', padding: '5px 15px', borderRadius: '15px', fontSize: '0.9rem', color: 'var(--verde-oscuro)' }}>
                Cuidado: {planta.dificultad}
              </span>
            )}
            <span style={{ backgroundColor: 'var(--verde-claro)', padding: '5px 15px', borderRadius: '15px', fontSize: '0.9rem', color: 'var(--verde-oscuro)' }}>
              {Number(planta.stock) > 0 ? `Stock disponible: ${planta.stock}` : 'Sin stock'}
            </span>
          </div>
        </div>

        <div className="producto-precio-acciones" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '30px' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--verde-oscuro)' }}>
            ${planta.precio}
          </span>

          <button
            className="btn-primario"
            style={{ padding: '18px 45px', fontSize: '1.1rem' }}
            disabled={Number(planta.stock) <= 0}
            onClick={() => {
              agregarAlCarrito(planta);
              alert(`${planta.nombre} se sumó a tu carrito de compras.`);
            }}
          >
            Añadir al pedido
          </button>
        </div>
      </article>

      {/* Pie de página local de la vista del producto */}
      <footer style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>
        <p>Plantas Vita - Calidad Botánica Superior</p>
      </footer>
    </main>
  );
}