"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../../context/CartContext';
import { construirProductoParaCarrito, formatearPrecio, normalizarProducto, obtenerCategoriaProducto, obtenerDescripcionProducto, obtenerDificultadProducto, obtenerNombreProducto, obtenerPrecioProducto } from '../../../lib/productos';

/**
 * Componente de Vista Detallada de Producto.
 * Obtiene y renderiza dinámicamente la información de una planta basándose en el ID de la URL.
 */
export default function DetalleProducto() {
  const params = useParams();
  const idProducto = params.id;
  const { agregarAlCarrito } = useCart();

  const [planta, setPlanta] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    /**
     * Consulta el catálogo local en formato JSON para encontrar el producto específico.
     */
    const obtenerDetalle = async () => {
      try {
        const respuesta = await fetch('/productos.json');
        const datos = await respuesta.json();
        const plantaEncontrada = datos.find((item) => item.id.toString() === idProducto);
        
        setPlanta(plantaEncontrada ? normalizarProducto(plantaEncontrada) : null);
        setCargando(false);
      } catch (error) {
        console.error("Error crítico al cargar el catálogo:", error);
        setCargando(false);
      }
    };
    obtenerDetalle();
  }, [idProducto]);

  // Manejo de estados de carga y error (Early returns)
  if (cargando) return <div className="container"><p>Cargando información botánica...</p></div>;
  if (!planta) return <div className="container"><p>Lo sentimos, no encontramos esa variedad en nuestro catálogo.</p></div>;

  return (
    <article className="container">
      {/* Encabezado local de la vista del producto */}
      <header style={{ marginBottom: '30px' }}>
        <Link href="/" style={{ color: 'var(--verde-principal)', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Volver al catálogo
        </Link>
      </header>
      
      <div className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '50px', backgroundColor: 'white' }}>
        <div style={{ borderLeft: '5px solid var(--verde-principal)', paddingLeft: '25px' }}>
          <h1 style={{ color: 'var(--verde-oscuro)', fontSize: '3rem', margin: 0 }}>
            {obtenerNombreProducto(planta)}
          </h1>
          <p style={{ color: 'var(--verde-principal)', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '10px' }}>
            Variedad de {obtenerCategoriaProducto(planta)}
          </p>
        </div>
        
        <div style={{ margin: '40px 0', fontSize: '1.2rem', color: '#444', lineHeight: '1.8' }}>
          <p>{obtenerDescripcionProducto(planta)}</p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
             <span style={{ backgroundColor: 'var(--verde-claro)', padding: '5px 15px', borderRadius: '15px', fontSize: '0.9rem', color: 'var(--verde-oscuro)' }}>
               Cuidado: {obtenerDificultadProducto(planta)}
             </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '30px' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--verde-oscuro)' }}>
            {formatearPrecio(obtenerPrecioProducto(planta))}
          </span>
          
          <button 
            className="btn-primario" 
            style={{ padding: '18px 45px', fontSize: '1.1rem' }}
            onClick={() => {
              agregarAlCarrito(construirProductoParaCarrito(planta));
              alert(`${obtenerNombreProducto(planta)} se sumó a tu carrito de compras.`);
            }}
          >
            Añadir al pedido
          </button>
        </div>
      </div>

      {/* Pie de página local de la vista del producto */}
      <footer style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>
        <p>Plantas Vita - Calidad Botánica Superior</p>
      </footer>
    </article>
  );
}