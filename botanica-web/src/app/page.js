"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

// Mapa detallado de imágenes para cada producto (base y hover)
const mapaDeImagenes = {
  cactus: {
    base: "https://images.unsplash.com/photo-1518173946687-a4c189b663f7?q=80&w=400&h=300&auto=format&fit=crop", // Primer plano de cactus
    hover: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=400&h=300&auto=format&fit=crop" // Zoom muy cercano en espinas
  },
  helecho: {
    base: "https://images.unsplash.com/photo-1549416805-4f243003254c?q=80&w=400&h=300&auto=format&fit=crop", // Helecho exuberante
    hover: "https://images.unsplash.com/photo-1521191024510-749e75ff8523?q=80&w=400&h=300&auto=format&fit=crop" // Detalle de frondas
  },
  monstera: {
    base: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=400&h=300&auto=format&fit=crop", // Hojas de Monstera
    hover: "https://images.unsplash.com/photo-1616486791244-34538d4e489c?q=80&w=400&h=300&auto=format&fit=crop" // Primer plano de agujeros de hoja
  }
};

// Función para obtener la imagen base o hover de un producto por su nombre
const getImagenParaPlanta = (planta, tipo) => {
  const nombre = (planta.name || planta.nombre || "").toLowerCase();
  if (nombre.includes("cactus")) return mapaDeImagenes.cactus[tipo];
  if (nombre.includes("helecho")) return mapaDeImagenes.helecho[tipo];
  if (nombre.includes("monstera")) return mapaDeImagenes.monstera[tipo];
  // Imagen por defecto si no se encuentra
  return tipo === "base"
    ? "https://images.unsplash.com/photo-1501004318641-729e8e2c86e7?q=80&w=400&h=300&auto=format&fit=crop"
    : "https://images.unsplash.com/photo-1473448912268-202a115b0d5a?q=80&w=400&h=300&auto=format&fit=crop";
};

// Componente de imagen para manejar el efecto hover
const HoverableImage = ({ baseSrc, hoverSrc, alt }) => {
  const [currentSrc, setCurrentSrc] = useState(baseSrc);

  return (
    <img
      src={currentSrc}
      alt={alt}
      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "src 0.3s ease-in-out" }}
      onMouseEnter={() => setCurrentSrc(hoverSrc)}
      onMouseLeave={() => setCurrentSrc(baseSrc)}
    />
  );
};

export default function Home() {
  const [plantas, setPlantas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [pagando, setPagando] = useState(false);
  
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

  if (cargando) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Cargando Plantas Vita...</div>;
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      {/* Encabezado modificado: centrado y delicado */}
      <div style={{ backgroundColor: "#1e3d2f", color: "white", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1 }}>{/* Espaciador izquierdo */}</div>
        <div style={{ flex: 2, textAlign: "center" }}>
          {/* Título centrado con fuente delicada */}
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "300", fontFamily: "'Poppins', sans-serif" }}>🌿 Plantas Vita</h1>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "15px", justifyContent: "flex-end" }}>
          {usuario ? (
            <>
              <span style={{ fontSize: "0.9rem" }}>Conectado como: <strong>{usuario.email}</strong></span>
              <button onClick={manejarCerrarSesion} style={{ backgroundColor: "#e74c3c", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>Cerrar Sesión</button>
            </>
          ) : (
            <button onClick={() => router.push("/login")} style={{ backgroundColor: "#2ecc71", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>Iniciar Sesión</button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", display: "flex", gap: "30px" }}>
        <div style={{ flex: 3 }}>
          <h1 style={{ color: "#1e3d2f", marginBottom: "30px" }}>Nuestro Catálogo de Plantas</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
            {plantas.map((planta) => (
              <div key={planta.id} style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  {/* Contenedor de imagen modificado: desbordamiento oculto para las fotos */}
                  <div style={{ width: "100%", height: "200px", backgroundColor: "#eee", borderRadius: "8px", marginBottom: "15px", overflow: "hidden" }}>
                    {/* Imagen dinámica con efecto hover */}
                    <HoverableImage
                      baseSrc={getImagenParaPlanta(planta, 'base')}
                      hoverSrc={getImagenParaPlanta(planta, 'hover')}
                      alt={planta.name || planta.nombre}
                    />
                  </div>
                  <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{planta.name || planta.nombre}</h3>
                  <p style={{ color: "#777", fontSize: "0.9rem", margin: "0 0 15px 0" }}>Categoría: {planta.category || planta.categoria || "General"}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "bold", fontSize: "1.2rem", color: "#1e3d2f" }}>${planta.price || planta.precio}</span>
                  <button onClick={() => agregarAlCarrito(planta)} style={{ backgroundColor: "#1e3d2f", color: "white", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer" }}>Agregar 🛒</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "fit-content" }}>
          <h2 style={{ marginTop: "0", color: "#1e3d2f", borderBottom: "2px solid #f0f0f0", paddingBottom: "10px" }}>Tu Carrito ({cantidadTotal})</h2>
          {carrito.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center", marginTop: "20px" }}>El carrito está vacío.</p>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "20px", maxHeight: "300px", overflowY: "auto" }}>
                {carrito.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
                    <div>
                      <div style={{ fontWeight: "bold" }}>{item.name || item.nombre}</div>
                      <div style={{ color: "#777" }}>{item.cantidad} x ${item.price || item.precio}</div>
                    </div>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button onClick={() => restarDelCarrito(item.id)} style={{ padding: "2px 8px", cursor: "pointer" }}>-</button>
                      <button onClick={() => agregarAlCarrito(item)} style={{ padding: "2px 8px", cursor: "pointer" }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "2px solid #f0f0f0", paddingTop: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.1rem", marginBottom: "15px" }}>
                  <span>Total:</span>
                  <span style={{ color: "#1e3d2f" }}>${precioTotal}</span>
                </div>
                <button onClick={manejarPago} disabled={pagando} style={{ width: "100%", backgroundColor: pagando ? "#95a5a6" : "#2ecc71", color: "white", border: "none", padding: "12px", borderRadius: "5px", fontWeight: "bold", fontSize: "1rem", cursor: pagando ? "wait" : "pointer" }}>
                  {pagando ? "Conectando..." : "Iniciar Compra 💳"}
                </button>
                <button onClick={vaciarCarrito} style={{ width: "100%", backgroundColor: "transparent", color: "#aaa", border: "none", marginTop: "10px", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}>Vaciar Carrito</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}