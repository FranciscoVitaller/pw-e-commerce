"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

// --- COMPONENTE: TarjetaProducto (Módulo D) ---
const TarjetaProducto = ({ planta }) => {
  const { agregarAlCarrito } = useCart();
  const [estaEnHover, setEstaEnHover] = useState(false);
  const imagenActual = estaEnHover ? planta.imagenHover : planta.imagenPrincipal;

  return (
    <article 
      className="card"
      onMouseEnter={() => setEstaEnHover(true)} 
      onMouseLeave={() => setEstaEnHover(false)} 
      style={{ overflow: 'hidden' }} 
    >
      <div className="contenedor-imagen">
        <img 
          src={imagenActual} 
          alt={`Imagen de ${planta.nombre}`}
          className="imagen-hover-suave" 
        />
      </div>

      <div style={{ padding: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--verde-oscuro)', margin: 0 }}>{planta.nombre}</h3>
          <p style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', margin: '5px 0 0 0' }}>{planta.categoria}</p>
          <p style={{ fontWeight: 'bold', fontSize: '1.6rem', margin: '15px 0', color: '#333' }}>${planta.precio}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => agregarAlCarrito(planta)} className="btn-primario">
            Añadir al carrito
          </button>
          <Link href={`/producto/${planta.id}`} style={{ textAlign: 'center', color: 'var(--verde-principal)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>
            Ver detalles
          </Link>
        </div>
      </div>
    </article>
  );
};

// --- COMPONENTE PRINCIPAL: Home ---
export default function Home() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("Todas");
  const { cantidadTotal } = useCart();

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const respuesta = await fetch('/productos.json');
        const datos = await respuesta.json();
        setProductos(datos);
        setCargando(false);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    obtenerProductos();
  }, []);

  const productosFiltrados = productos.filter((p) => 
    filtro === "Todas" || p.categoria === filtro
  );

  return (
    <div className="container">
      
      {/* BOTÓN DE CARRITO FLOTANTE (Módulo B: Posicionamiento Avanzado) */}
      {/* Usamos position: fixed para que se quede pegado a la pantalla al scrollear */}
      <Link 
        href="/carrito" 
        style={{ 
          position: 'fixed', 
          top: '30px', 
          right: '30px', 
          zIndex: 1000, /* Asegura que esté por encima de todo */
          backgroundColor: 'white', 
          width: '70px', 
          height: '70px', 
          borderRadius: '50%', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)', 
          textDecoration: 'none', 
          fontSize: '2.2rem',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        🛒
        {cantidadTotal > 0 && (
          <span style={{ 
            position: 'absolute', 
            top: '5px', 
            right: '5px', 
            backgroundColor: '#e74c3c', 
            color: 'white', 
            borderRadius: '50%', 
            padding: '2px 8px', 
            fontSize: '0.9rem', 
            fontWeight: 'bold',
            minWidth: '20px',
            textAlign: 'center'
          }}>
            {cantidadTotal}
          </span>
        )}
      </Link>

      {/* HERO SECTION */}
      <header style={{ 
        position: 'relative', 
        width: '100%', 
        height: '50vh', 
        minHeight: '400px',
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: '60px', 
        borderRadius: '20px', 
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: -10, left: -10, right: -10, bottom: -10, 
          backgroundImage: "url('/images/Monstera-Deliciosa-01.webp')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          filter: 'blur(6px) brightness(0.6)', 
          zIndex: 1 
        }}></div>

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '20px' }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: '4.5rem', 
            letterSpacing: '8px', 
            textTransform: 'uppercase', 
            margin: 0, 
            textShadow: '2px 4px 10px rgba(0,0,0,0.5)' 
          }}>
            Plantas Vita
          </h1>
          <p style={{ 
            color: '#DAD7CD', 
            fontSize: '1.2rem', 
            textTransform: 'uppercase', 
            letterSpacing: '3px', 
            marginTop: '15px' 
          }}>
            Tu Espacio Verde y Natural
          </p>
        </div>
      </header>

      {/* FILTROS */}
      <nav style={{ textAlign: 'center', marginBottom: '40px' }}>
        {["Todas", "Interior", "Exterior"].map((cat) => (
          <button 
            key={cat} 
            onClick={() => setFiltro(cat)} 
            className="btn-primario"
            style={{ 
              margin: '0 8px', 
              backgroundColor: filtro === cat ? 'var(--verde-oscuro)' : 'var(--verde-principal)' 
            }}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* GRILLA DE PRODUCTOS */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '60px' }}>
        {cargando ? (
          <p>Cargando catálogo...</p>
        ) : (
          productosFiltrados.map((planta) => (
            <TarjetaProducto key={planta.id} planta={planta} />
          ))
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--verde-oscuro)', color: 'white', borderRadius: '12px' }}>
        <p style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Plantas Vita</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--verde-claro)', opacity: 0.8 }}>© 2026 - Proyecto para el Parcial de Programación Web.</p>
      </footer>
    </div>
  );
}