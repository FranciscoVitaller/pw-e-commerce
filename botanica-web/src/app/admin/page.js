"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase"; 
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  const [nuevoProd, setNuevoProd] = useState({
    nombre: "",
    precio: "",
    stock: "",
    categoria: ""
  });

  const router = useRouter();

  useEffect(() => {
    traerProductos();
  }, []);

  const traerProductos = async () => {
    const { data, error } = await supabase.from("products").select("*").order('id', { ascending: false });
    if (error) {
      console.error("Error al traer productos:", error);
    } else {
      setProductos(data);
    }
    setCargando(false);
  };

  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoProd({ ...nuevoProd, [name]: value });
  };

  const agregarProducto = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("products")
      .insert([
        { 
          name: nuevoProd.nombre, 
          price: Number(nuevoProd.precio), 
          stock: Number(nuevoProd.stock),
          category: nuevoProd.categoria 
        }
      ])
      .select();

    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      setMostrarModal(false);
      setNuevoProd({ nombre: "", precio: "", stock: "", categoria: "" });
      setProductos([data[0], ...productos]);
    }
  };

  if (cargando) {
    return <div style={{ textAlign: "center", marginTop: "50px", color: "white" }}>Cargando Panel de Control... 🌿</div>;
  }

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      backgroundImage: "url('https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2000&auto=format&fit=crop')",
      backgroundSize: "cover",
      backgroundAttachment: "fixed",
      fontFamily: "system-ui, sans-serif" 
    }}>
      
      {/* SIDEBAR ESTILO VITA */}
      <aside style={{ 
        width: "260px", 
        backgroundColor: "rgba(30, 61, 47, 0.9)", 
        backdropFilter: "blur(10px)",
        padding: "30px 20px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "25px",
        color: "white"
      }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontWeight: "200", fontSize: "1.5rem", letterSpacing: "2px" }}>🌿 VITA</h2>
          <span style={{ fontSize: "0.7rem", opacity: 0.8, letterSpacing: "1px" }}>GESTIÓN INTERNA</span>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ padding: "12px 15px", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", opacity: 0.6 }}>Resumen</div>
          <div style={{ padding: "12px 15px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.1)", cursor: "pointer", fontSize: "0.9rem", fontWeight: "bold" }}>Inventario de Plantas</div>
          <div style={{ padding: "12px 15px", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", opacity: 0.6 }}>Órdenes de Compra</div>
        </nav>
        
        <button onClick={() => router.push("/")} style={{ marginTop: "auto", padding: "12px", backgroundColor: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem" }}>
          ← Ir a la Tienda
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, padding: "40px", backgroundColor: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(10px)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "2.2rem", fontWeight: "300", color: "#1e3d2f" }}>Gestión de Stock</h1>
            <p style={{ margin: "5px 0 0 0", color: "#555" }}>Tienes {productos.length} variedades registradas</p>
          </div>
          <button 
            onClick={() => setMostrarModal(true)}
            style={{ 
              backgroundColor: "#2ecc71", 
              color: "white", 
              border: "none", 
              padding: "12px 25px", 
              borderRadius: "30px", 
              fontWeight: "bold", 
              cursor: "pointer", 
              boxShadow: "0 4px 15px rgba(46, 204, 113, 0.3)",
              transition: "0.3s"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#27ae60"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2ecc71"}
          >
            + Añadir Nueva Planta
          </button>
        </div>

        {/* TABLA ESTILO VITA */}
        <div style={{ backgroundColor: "white", borderRadius: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8faf9", color: "#1e3d2f", fontSize: "0.85rem", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: "20px" }}>ESPECIE</th>
                <th style={{ padding: "20px" }}>PRECIO</th>
                <th style={{ padding: "20px" }}>STOCK DISPONIBLE</th>
                <th style={{ padding: "20px" }}>ESTADO</th>
                <th style={{ padding: "20px", textAlign: "right" }}>GESTIÓN</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: "1px solid #f9f9f9", transition: "0.2s" }}>
                  <td style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={{ fontSize: "1.2rem" }}>🌱</div>
                      <div>
                        <div style={{ fontWeight: "600", color: "#333" }}>{prod.name || prod.nombre}</div>
                        <div style={{ color: "#888", fontSize: "0.75rem", textTransform: "uppercase" }}>{prod.category || prod.categoria || "General"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "18px 20px", color: "#27ae60", fontWeight: "bold" }}>${prod.price || prod.precio}</td>
                  <td style={{ padding: "18px 20px", color: "#555" }}>{prod.stock || 0} unidades</td>
                  <td style={{ padding: "18px 20px" }}>
                    <span style={{ color: "#27ae60", fontSize: "0.75rem", fontWeight: "bold", border: "1px solid #27ae60", padding: "3px 8px", borderRadius: "20px" }}>DISPONIBLE</span>
                  </td>
                  <td style={{ padding: "18px 20px", textAlign: "right", color: "#aaa", fontSize: "0.8rem" }}>
                    <span style={{ cursor: "pointer", marginRight: "15px", textDecoration: "underline" }}>Modificar</span>
                    <span style={{ cursor: "pointer", color: "#e74c3c" }}>Quitar</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL PARA AGREGAR PRODUCTO */}
      {mostrarModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(30, 61, 47, 0.6)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "20px", width: "100%", maxWidth: "450px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <h2 style={{ marginTop: 0, marginBottom: "25px", color: "#1e3d2f", fontWeight: "300", textAlign: "center" }}>Nueva Planta para el Catálogo</h2>
            <form onSubmit={agregarProducto} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>NOMBRE DE LA PLANTA</label>
                <input required type="text" name="nombre" value={nuevoProd.nombre} onChange={manejarCambioInput} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9", outline: "none" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>CATEGORÍA</label>
                <input required type="text" name="categoria" value={nuevoProd.categoria} onChange={manejarCambioInput} placeholder="Ej: Interior, Exterior..." style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9", outline: "none" }} />
              </div>

              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>PRECIO ($)</label>
                  <input required type="number" name="precio" value={nuevoProd.precio} onChange={manejarCambioInput} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>STOCK</label>
                  <input required type="number" name="stock" value={nuevoProd.stock} onChange={manejarCambioInput} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9", outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "20px" }}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: "12px 25px", backgroundColor: "transparent", color: "#aaa", border: "none", cursor: "pointer", fontWeight: "bold" }}>CANCELAR</button>
                <button type="submit" style={{ padding: "12px 30px", backgroundColor: "#1e3d2f", color: "white", border: "none", borderRadius: "30px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>GUARDAR PLANTA</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}