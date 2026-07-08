"use client";

/**
 * ARCHIVO: src/app/page.js
 * DESCRIPCIÓN: Página principal (Home) del e-commerce. 
 * Muestra el catálogo de plantas, filtros de búsqueda y el carrito de compras lateral.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

/**
 * COMPONENTE: TarjetaProducto
 * Renderiza la información individual de una planta, el link a su vista de
 * detalle y el botón para agregar al carrito.
 */
function TarjetaProducto({ planta, agregarAlCarrito }) {
  // Nota: Se eliminó el estado "zoom" y los eventos onMouseOver porque
  // esas animaciones ahora se manejan de forma nativa y optimizada desde el CSS.

  return (
    <article className="tarjeta-producto">
      <Link href={`/producto/${planta.id}`} className="tarjeta-producto-link">
        <div className="imagen-contenedor">
          <Image
            src={planta.imagen_url || "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=80"}
            alt={planta.nombre}
            className="imagen-planta"
            width={500}
            height={500}
            unoptimized
          />
        </div>
        <h3 className="titulo-planta">{planta.nombre}</h3>
        <p className="categoria-planta">
          {planta.categoria || "General"}
        </p>
      </Link>

      <div className="acciones-planta">
        <span className="precio-planta">${planta.precio}</span>
        <button
          onClick={() => agregarAlCarrito(planta)}
          className="btn-sumar"
        >
          Sumar 🛒
        </button>
      </div>
    </article>
  );
}

/**
 * COMPONENTE PRINCIPAL: Home
 * Gestiona el estado global de la página, la autenticación y la vista del catálogo.
 */
export default function Home() {
  // Estados de la aplicación
  const [plantas, setPlantas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Estados para filtros
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  
  // Hooks personalizados y de Next.js
  const { agregarAlCarrito, carrito, cantidadTotal, precioTotal, vaciarCarrito, restarDelCarrito } = useCart();
  const router = useRouter();

  /**
   * Efecto de inicialización: Obtiene las plantas de Supabase y verifica la sesión del usuario.
   */
  useEffect(() => {
    const traerPlantas = async () => {
      if (!supabase) {
        setPlantas([]);
        setCargando(false);
        return;
      }

      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Error al traer plantas:", error.message);
      } else {
        setPlantas(data);
      }
    };

    const verificarUsuario = async () => {
      if (!supabase) {
        setUsuario(null);
        setCargando(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUsuario(user);
      setCargando(false);
    };

    traerPlantas();
    verificarUsuario();

    if (!supabase) {
      return;
    }

    // Listener para cambios en la sesión de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * Cierra la sesión del usuario en Supabase, vacía el carrito y redirige al login.
   */
  const manejarCerrarSesion = async () => {
    await supabase.auth.signOut();
    vaciarCarrito();
    router.push("/login");
  };
  
  /**
   * Deriva al checkout real (src/app/checkout/page.js), que arma la orden
   * con el carrito actual y llama a /api/checkout.
   */
  const manejarPago = () => {
    if (!usuario) {
      alert("Debes iniciar sesión para comprar.");
      router.push("/login");
      return;
    }
    router.push("/checkout");
  };

  // Filtrado reactivo de plantas según búsqueda y categoría
  const plantasFiltradas = plantas.filter((planta) => {
    const nombrePlanta = (planta.nombre || "").toLowerCase();
    const categoriaPlanta = (planta.categoria || "General");

    const coincideBusqueda = nombrePlanta.includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === "Todas" || categoriaPlanta === categoriaFiltro;

    return coincideBusqueda && coincideCategoria;
  });

  // Extracción de categorías únicas para el select
  const categoriasUnicas = ["Todas", ...new Set(plantas.map(p => p.categoria || "General"))];

  if (cargando) {
    return <div className="pantalla-carga">Cargando Plantas Vita... 🌿</div>;
  }

  return (
    <div className="home-layout">
      
      <header className="header-principal">
        <div className="header-vacio"></div>

        <div className="header-logo">
          <h1>🌿 Plantas Vita</h1>
        </div>

        <div className="header-acciones">
          {usuario ? (
            <>
              <span className="saludo-usuario">Hola, <strong>{usuario.email}</strong></span>
              <button onClick={manejarCerrarSesion} className="btn-salir">Salir</button>
            </>
          ) : (
            <button onClick={() => router.push("/login")} className="btn-login">Iniciar Sesión</button>
          )}
        </div>
      </header>

      <main className="main-contenedor">
        
        <section className="seccion-catalogo">
          <h2>Nuestro Catálogo</h2>
          
          <div className="filtros-contenedor">
            <input 
              type="text" 
              placeholder="Buscar planta por nombre..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda"
            />
            <select 
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="select-categoria"
            >
              {categoriasUnicas.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grilla-plantas">
            {plantasFiltradas.length === 0 ? (
              <p className="mensaje-vacio">No se encontraron plantas con esos filtros.</p>
            ) : (
              plantasFiltradas.map((planta) => (
                <TarjetaProducto 
                  key={planta.id} 
                  planta={planta} 
                  agregarAlCarrito={agregarAlCarrito} 
                />
              ))
            )}
          </div>
        </section>

        <aside className="aside-carrito">
          <h2>Tu Carrito ({cantidadTotal})</h2>
          <Link href="/carrito" className="link-carrito-completo">Ver carrito completo →</Link>

          {carrito.length === 0 ? (
            <p className="carrito-vacio">Aún no elegiste ninguna planta.</p>
          ) : (
            <>
              <div className="lista-carrito">
                {carrito.map((item) => (
                  <div key={item.id} className="item-carrito">
                    <div>
                      <div className="item-nombre">{item.nombre}</div>
                      <div className="item-precio">{item.cantidad} x ${item.precio}</div>
                    </div>
                    <div className="item-controles">
                      <button onClick={() => restarDelCarrito(item.id)} className="btn-restar">-</button>
                      <button onClick={() => agregarAlCarrito(item)} className="btn-sumar-pequeno">+</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="carrito-total-contenedor">
                <div className="carrito-total">
                  <span>Total:</span>
                  <span className="total-precio">${precioTotal}</span>
                </div>
                <button onClick={manejarPago} className="btn-pagar">
                  Finalizar Compra 💳
                </button>
                <button onClick={vaciarCarrito} className="btn-vaciar">Vaciar Carrito</button>
              </div>
            </>
          )}
        </aside>
      </main>

      <footer className="footer-principal">
        <p>© 2026 Plantas Vita - Todos los derechos reservados.</p>
        <p className="footer-subtitulo">Proyecto Integrador - E-Commerce B2C</p>
      </footer>
    </div>
  );
}