"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

// 🌿 SUBCOMPONENTE DE TARJETA INDEPENDIENTE (Mantiene tus estilos exactos pero suma el zoom individual)
function TarjetaProducto({ planta, agregarAlCarrito }) {
  const [zoom, setZoom] = useState(false);

  return (
    <div 
      style={{ 
        backgroundColor: "white", 
        padding: "15px", 
        borderRadius: "12px", 
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "space-between", 
        transition: "transform 0.2s" 
      }} 
      onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
      onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
    >
      <div>
        {/* CONTENEDOR DE IMAGEN CON OVERFLOW HIDDEN */}
        <div style={{ width: "100%", height: "220px", borderRadius: "8px", marginBottom: "15px", overflow: "hidden", position: "relative" }}>
          <img 
            // 🔥 Intenta leer 'imagen_url' (Admin), si no existe usa 'image_url' (catálogo base) o un repuesto seguro
            src={planta.imagen_url || planta.image_url || "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=80"} 
            alt={planta.name || planta.nombre}
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover", 
              transition: "transform 0.5s ease-in-out",
              // Aplica el zoom de forma individual cuando el mouse entra en esta tarjeta
              transform: zoom ? "scale(1.12)" : "scale(1)"
            }}
          />
        </div>
        <h3 style={{ margin: "0 0 5px 0", color: "#1e3d2f", fontSize: "1.3rem" }}>{planta.name || planta.nombre}</h3>
        <p style={{ color: "#7f8c8d", fontSize: "0.9rem", margin: "0 0 15px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {planta.category || planta.categoria || "General"}
        </p>
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: "bold", fontSize: "1.4rem", color: "#27ae60" }}>${planta.price || planta.precio}</span>
        <button 
          onClick={() => agregarAlCarrito(planta)} 
          style={{ backgroundColor: "#1e3d2f", color: "white", border: "none", padding: "10px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: "background 0.3s" }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2ecc71"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1e3d2f"}
        >
          Sumar 🛒
        </button>
      </div>
    </div>
  );
}

// 🏠 TU COMPONENTE PRINCIPAL ORIGINAL COMPLETAMENTE INTACTO
export default function Home() {
  const [plantas, setPlantas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [pagando, setPagando] = useState(false);
  
  // Estados para el buscador y filtro
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  
  const { agregarAlCarrito, carrito, cantidadTotal, precioTotal, vaciarCarrito, restarDelCarrito } = useCart();
  const router = useRouter();

  useEffect(() => {
    const traerPlantas = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Error al traer plantas:", error.message);
      } else {
        setPlantas(data);
      }
    };

    const verificarUsuario = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUsuario(user);
      setCargando(false);
    };

    traerPlantas();
    verificarUsuario();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const manejarCerrarSesion = async () => {
    await supabase.auth.signOut();
    vaciarCarrito();
    router.push("/login");
  };
  
  const manejarPago = async () => {
    if (!usuario) {
      alert("Debes iniciar sesión para comprar.");
      router.push("/login");
      return;
    }

    setPagando(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items: carrito,
          userId: usuario.id,
          email: usuario.email 
        }),
      });
      
      const data = await response.json();
      
      if (data.init_point) {
        vaciarCarrito(); 
        window.location.href = data.init_point; 
      } else {
        alert(data.error || "Hubo un error al generar el pago.");
      }
    } catch (error) {
      console.error("Error al procesar el pago", error);
      alert("No se pudo conectar con el servidor de pagos.");
    }
    setPagando(false);
  };

  // Lógica de filtrado y búsqueda
  const plantasFiltradas = plantas.filter((planta) => {
    const nombrePlanta = (planta.name || planta.nombre || "").toLowerCase();
    const categoriaPlanta = (planta.category || planta.categoria || "General");
    
    const coincideBusqueda = nombrePlanta.includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === "Todas" || categoriaPlanta === categoriaFiltro;
    
    return coincideBusqueda && coincideCategoria;
  });

  const categoriasUnicas = ["Todas", ...new Set(plantas.map(p => p.category || p.categoria || "General"))];

  if (cargando) {
    return <div style={{ textAlign: "center", marginTop: "50px", fontSize: "1.5rem" }}>Cargando Plantas Vita... 🌿</div>;
  }

  return (
    <div style={{ 
      fontFamily: "system-ui, -apple-system, sans-serif", 
      minHeight: "100vh",
      backgroundImage: "url('https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2000&auto=format&fit=crop')",
      backgroundSize: "cover",
      backgroundAttachment: "fixed",
      backgroundPosition: "center",
      display: "flex",
      flexDirection: "column"
    }}>
      
      {/* HEADER / NAVBAR CON BLUR */}
      <div style={{ 
        backgroundColor: "rgba(30, 61, 47, 0.8)", 
        backdropFilter: "blur(10px)",
        color: "white", 
        padding: "15px 30px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}>
        <div style={{ flex: 1 }}></div>

        <div style={{ flex: 2, textAlign: "center" }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: "2rem", 
            fontWeight: "200", 
            fontFamily: "Georgia, serif", 
            letterSpacing: "3px" 
          }}>
            🌿 Plantas Vita
          </h1>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "15px", justifyContent: "flex-end" }}>
          {usuario ? (
            <>
              <span style={{ fontSize: "0.9rem" }}>Hola, <strong>{usuario.email}</strong></span>
              <button onClick={manejarCerrarSesion} style={{ backgroundColor: "transparent", color: "white", border: "1px solid white", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", transition: "0.3s" }}>Salir</button>
            </>
          ) : (
            <button onClick={() => router.push("/login")} style={{ backgroundColor: "#2ecc71", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Iniciar Sesión</button>
          )}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL CON BLUR */}
      <div style={{ 
        flex: 1,
        maxWidth: "1200px", 
        margin: "40px auto", 
        padding: "30px", 
        display: "flex", 
        gap: "30px",
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(15px)",
        borderRadius: "15px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
      }}>
        
        {/* COLUMNA IZQUIERDA: CATÁLOGO */}
        <div style={{ flex: 3 }}>
          <h2 style={{ color: "#1e3d2f", marginTop: 0, fontSize: "2rem" }}>Nuestro Catálogo</h2>
          
          {/* BARRA DE BÚSQUEDA Y FILTRO */}
          <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
            <input 
              type="text" 
              placeholder="Buscar planta por nombre..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem", outline: "none" }}
            />
            <select 
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem", cursor: "pointer", backgroundColor: "white" }}
            >
              {categoriasUnicas.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* GRILLA DE PRODUCTOS - Llama a nuestra nueva Tarjeta con Zoom */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "25px" }}>
            {plantasFiltradas.length === 0 ? (
              <p style={{ color: "#666" }}>No se encontraron plantas con esos filtros.</p>
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
        </div>

        {/* COLUMNA DERECHA: CARRITO */}
        <div style={{ flex: 1, backgroundColor: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", height: "fit-content", position: "sticky", top: "100px" }}>
          <h2 style={{ marginTop: "0", color: "#1e3d2f", borderBottom: "2px solid #ecf0f1", paddingBottom: "15px", fontSize: "1.5rem" }}>Tu Carrito ({cantidadTotal})</h2>
          
          {carrito.length === 0 ? (
            <p style={{ color: "#95a5a6", textAlign: "center", marginTop: "30px", padding: "20px 0" }}>Aún no elegiste ninguna planta.</p>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "20px", maxHeight: "350px", overflowY: "auto", paddingRight: "5px" }}>
                {carrito.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f9f9f9", paddingBottom: "10px" }}>
                    <div>
                      <div style={{ fontWeight: "bold", color: "#2c3e50" }}>{item.name || item.nombre}</div>
                      <div style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>{item.cantidad} x ${item.price || item.precio}</div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button onClick={() => restarDelCarrito(item.id)} style={{ padding: "5px 10px", cursor: "pointer", backgroundColor: "#ecf0f1", border: "none", borderRadius: "5px", fontWeight: "bold", color: "#e74c3c" }}>-</button>
                      <button onClick={() => agregarAlCarrito(item)} style={{ padding: "5px 10px", cursor: "pointer", backgroundColor: "#ecf0f1", border: "none", borderRadius: "5px", fontWeight: "bold", color: "#27ae60" }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ borderTop: "2px solid #ecf0f1", paddingTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.3rem", marginBottom: "20px" }}>
                  <span>Total:</span>
                  <span style={{ color: "#27ae60" }}>${precioTotal}</span>
                </div>
                <button onClick={manejarPago} disabled={pagando} style={{ width: "100%", backgroundColor: pagando ? "#95a5a6" : "#27ae60", color: "white", border: "none", padding: "15px", borderRadius: "8px", fontWeight: "bold", fontSize: "1.1rem", cursor: pagando ? "wait" : "pointer", transition: "0.3s", boxShadow: "0 4px 6px rgba(39, 174, 96, 0.2)" }}>
                  {pagando ? "Procesando..." : "Finalizar Compra 💳"}
                </button>
                <button onClick={vaciarCarrito} style={{ width: "100%", backgroundColor: "transparent", color: "#95a5a6", border: "none", marginTop: "15px", fontSize: "0.9rem", cursor: "pointer", textDecoration: "underline" }}>Vaciar Carrito</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: "#152b21", color: "#bdc3c7", textAlign: "center", padding: "20px", marginTop: "auto" }}>
        <p style={{ margin: 0 }}>© 2026 Plantas Vita - Todos los derechos reservados.</p>
        <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem" }}>Proyecto Integrador - E-Commerce B2C</p>
      </footer>

    </div>
  );
}