"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase"; 
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [vistaActiva, setVistaActiva] = useState("inventario");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoModal, setModoModal] = useState("crear"); 
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  
  // 🔥 AHORA EL ESTADO TIENE EXACTAMENTE TUS COLUMNAS 🔥
  const [formProd, setFormProd] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    stock: "",
    imagen_url: "",
    descripcion: ""
  });

  const router = useRouter();

  useEffect(() => {
    traerProductos();
  }, []);

  const traerProductos = async () => {
    // Traemos los productos ordenados por los más nuevos primero
    const { data, error } = await supabase.from("products").select("*").order('id', { ascending: false });
    if (error) {
      console.error("Error al traer productos:", error);
    } else {
      setProductos(data);
    }
    setCargando(false);
  };

  const abrirModalCrear = () => {
    setModoModal("crear");
    setIdSeleccionado(null);
    setFormProd({ nombre: "", categoria: "", precio: "", stock: "", imagen_url: "", descripcion: "" });
    setMostrarModal(true);
  };

  const abrirModalEditar = (prod) => {
    setModoModal("editar");
    setIdSeleccionado(prod.id);
    setFormProd({
      nombre: prod.nombre || "",
      categoria: prod.categoria || "",
      precio: prod.precio || "",
      stock: prod.stock || 0,
      imagen_url: prod.imagen_url || "",
      descripcion: prod.descripcion || ""
    });
    setMostrarModal(true);
  };

  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    setFormProd({ ...formProd, [name]: value });
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    
    // 🔥 OBJETO EXACTO PARA SUPABASE 🔥
    const datosPlanta = {
      nombre: formProd.nombre, 
      categoria: formProd.categoria,
      precio: Number(formProd.precio),
      stock: Number(formProd.stock),
      imagen_url: formProd.imagen_url,
      descripcion: formProd.descripcion
    };

    if (modoModal === "crear") {
      const { data, error } = await supabase
        .from("products")
        .insert([datosPlanta])
        .select();

      if (error) {
        alert("Error al guardar: " + error.message);
      } else {
        setProductos([data[0], ...productos]);
        setMostrarModal(false);
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .update(datosPlanta)
        .eq("id", idSeleccionado)
        .select();

      if (error) {
        alert("Error al actualizar: " + error.message);
      } else {
        setProductos(productos.map(p => p.id === idSeleccionado ? data[0] : p));
        setMostrarModal(false);
      }
    }
  };

  const eliminarProducto = async (id, nombre) => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${nombre}" del catálogo?`)) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        alert("Error al eliminar: " + error.message);
      } else {
        setProductos(productos.filter(p => p.id !== id));
      }
    }
  };

  const stockTotal = productos.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const bajoStock = productos.filter(p => (Number(p.stock) || 0) < 5).length;

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
          <div 
            onClick={() => setVistaActiva("resumen")}
            style={{ 
              padding: "12px 15px", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem",
              backgroundColor: vistaActiva === "resumen" ? "rgba(255,255,255,0.15)" : "transparent",
              fontWeight: vistaActiva === "resumen" ? "bold" : "normal",
              opacity: vistaActiva === "resumen" ? 1 : 0.7, transition: "0.2s"
            }}>
            Panel Resumen
          </div>
          <div 
            onClick={() => setVistaActiva("inventario")}
            style={{ 
              padding: "12px 15px", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem",
              backgroundColor: vistaActiva === "inventario" ? "rgba(255,255,255,0.15)" : "transparent",
              fontWeight: vistaActiva === "inventario" ? "bold" : "normal",
              opacity: vistaActiva === "inventario" ? 1 : 0.7, transition: "0.2s"
            }}>
            Inventario de Plantas
          </div>
          <div 
            onClick={() => setVistaActiva("ordenes")}
            style={{ 
              padding: "12px 15px", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem",
              backgroundColor: vistaActiva === "ordenes" ? "rgba(255,255,255,0.15)" : "transparent",
              fontWeight: vistaActiva === "ordenes" ? "bold" : "normal",
              opacity: vistaActiva === "ordenes" ? 1 : 0.7, transition: "0.2s"
            }}>
            Órdenes de Compra
          </div>
        </nav>
        
        <button onClick={() => router.push("/")} style={{ marginTop: "auto", padding: "12px", backgroundColor: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem" }}>
          ← Ir a la Tienda
        </button>
      </aside>

      <main style={{ flex: 1, padding: "40px", backgroundColor: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(10px)", overflowY: "auto" }}>
        
        {vistaActiva === "resumen" && (
          <div>
            <h1 style={{ margin: "0 0 10px 0", fontSize: "2.2rem", fontWeight: "300", color: "#1e3d2f" }}>Métricas del Negocio</h1>
            <p style={{ margin: "0 0 30px 0", color: "#555" }}>Análisis rápido del estado de tu catálogo botánico.</p>
            
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px", backgroundColor: "white", padding: "25px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                <div style={{ color: "#888", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>Variedades Registradas</div>
                <div style={{ fontSize: "2.5rem", fontWeight: "300", color: "#1e3d2f", marginTop: "10px" }}>{productos.length}</div>
              </div>
              <div style={{ flex: 1, minWidth: "200px", backgroundColor: "white", padding: "25px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                <div style={{ color: "#888", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>Unidades Totales en Stock</div>
                <div style={{ fontSize: "2.5rem", fontWeight: "300", color: "#27ae60", marginTop: "10px" }}>{stockTotal} u.</div>
              </div>
              <div style={{ flex: 1, minWidth: "200px", backgroundColor: "white", padding: "25px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                <div style={{ color: "#888", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>Alertas de Stock Crítico</div>
                <div style={{ fontSize: "2.5rem", fontWeight: "300", color: bajoStock > 0 ? "#e74c3c" : "#27ae60", marginTop: "10px" }}>{bajoStock}</div>
                <p style={{ margin: "5px 0 0 0", fontSize: "0.75rem", color: "#888" }}>Menos de 5 unidades disponibles</p>
              </div>
            </div>
          </div>
        )}

        {vistaActiva === "inventario" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: "2.2rem", fontWeight: "300", color: "#1e3d2f" }}>Gestión de Stock</h1>
                <p style={{ margin: "5px 0 0 0", color: "#555" }}>Tienes {productos.length} variedades registradas</p>
              </div>
              <button 
                onClick={abrirModalCrear}
                style={{ 
                  backgroundColor: "#2ecc71", color: "white", border: "none", padding: "12px 25px", 
                  borderRadius: "30px", fontWeight: "bold", cursor: "pointer", 
                  boxShadow: "0 4px 15px rgba(46, 204, 113, 0.3)", transition: "0.3s"
                }}
              >
                + Añadir Nueva Planta
              </button>
            </div>

            <div style={{ backgroundColor: "white", borderRadius: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8faf9", color: "#1e3d2f", fontSize: "0.85rem", borderBottom: "1px solid #eee" }}>
                    <th style={{ padding: "20px" }}>ESPECIE</th>
                    <th style={{ padding: "20px" }}>PRECIO</th>
                    <th style={{ padding: "20px" }}>STOCK</th>
                    <th style={{ padding: "20px" }}>ESTADO</th>
                    <th style={{ padding: "20px", textAlign: "right" }}>GESTIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((prod) => (
                    <tr key={prod.id} style={{ borderBottom: "1px solid #f9f9f9", transition: "0.2s" }}>
                      <td style={{ padding: "18px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                          {prod.imagen_url ? (
                            <img src={prod.imagen_url} alt={prod.nombre} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px" }} />
                          ) : (
                            <div style={{ fontSize: "1.2rem", width: "40px", textAlign: "center" }}>🌱</div>
                          )}
                          <div>
                            <div style={{ fontWeight: "600", color: "#333" }}>{prod.nombre}</div>
                            <div style={{ color: "#888", fontSize: "0.75rem", textTransform: "uppercase" }}>{prod.categoria || "General"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "18px 20px", color: "#27ae60", fontWeight: "bold" }}>${prod.precio}</td>
                      <td style={{ padding: "18px 20px", color: (prod.stock || 0) < 5 ? "#e74c3c" : "#555", fontWeight: (prod.stock || 0) < 5 ? "bold" : "normal" }}>
                        {prod.stock || 0} u.
                      </td>
                      <td style={{ padding: "18px 20px" }}>
                        <span style={{ 
                          color: (prod.stock || 0) > 0 ? "#27ae60" : "#e74c3c", 
                          fontSize: "0.75rem", fontWeight: "bold", 
                          border: `1px solid ${(prod.stock || 0) > 0 ? "#27ae60" : "#e74c3c"}`, 
                          padding: "3px 8px", borderRadius: "20px" 
                        }}>
                          {(prod.stock || 0) > 0 ? "DISPONIBLE" : "SIN STOCK"}
                        </span>
                      </td>
                      <td style={{ padding: "18px 20px", textAlign: "right", fontSize: "0.85rem" }}>
                        <span 
                          onClick={() => abrirModalEditar(prod)} 
                          style={{ cursor: "pointer", marginRight: "15px", textDecoration: "underline", color: "#2980b9", fontWeight: "500" }}
                        >
                          Modificar
                        </span>
                        <span 
                          onClick={() => eliminarProducto(prod.id, prod.nombre)}
                          style={{ cursor: "pointer", color: "#e74c3c", fontWeight: "500", textDecoration: "underline" }}
                        >
                          Quitar
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {vistaActiva === "ordenes" && (
          <div>
            <h1 style={{ margin: "0 0 10px 0", fontSize: "2.2rem", fontWeight: "300", color: "#1e3d2f" }}>Registro de Órdenes</h1>
            <p style={{ margin: "0 0 30px 0", color: "#555" }}>Monitoreo de transacciones e intenciones de compra procesadas en la pasarela.</p>
            
            <div style={{ backgroundColor: "white", borderRadius: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", padding: "30px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📋</div>
              <h3 style={{ margin: 0, color: "#1e3d2f", fontWeight: "400" }}>Módulo de Historial Activo</h3>
              <p style={{ color: "#777", maxWidth: "500px", margin: "10px auto 0 auto", fontSize: "0.9rem", lineHeight: "1.5" }}>
                Las compras procesadas exitosamente mediante MercadoPago impactan directamente en tu cuenta de Supabase vinculada. Las solicitudes se sincronizan en tiempo real.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* MODAL CON TODOS LOS CAMPOS */}
      {mostrarModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(30, 61, 47, 0.6)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "20px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ marginTop: 0, marginBottom: "25px", color: "#1e3d2f", fontWeight: "300", textAlign: "center" }}>
              {modoModal === "crear" ? "Nueva Planta para el Catálogo" : "Modificar Datos de la Planta"}
            </h2>
            <form onSubmit={guardarProducto} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              
              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 2 }}>
                  <label style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>NOMBRE DE LA PLANTA</label>
                  <input required type="text" name="nombre" value={formProd.nombre} onChange={manejarCambioInput} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>CATEGORÍA</label>
                  <input required type="text" name="categoria" value={formProd.categoria} onChange={manejarCambioInput} placeholder="Ej: Interior" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9", outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>DESCRIPCIÓN</label>
                <textarea required name="descripcion" value={formProd.descripcion} onChange={manejarCambioInput} rows="2" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9", outline: "none", resize: "none" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>URL DE LA IMAGEN</label>
                <input required type="text" name="imagen_url" value={formProd.imagen_url} onChange={manejarCambioInput} placeholder="Ej: /img/monstera.jpg" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9", outline: "none" }} />
              </div>

              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>PRECIO ($)</label>
                  <input required type="number" name="precio" value={formProd.precio} onChange={manejarCambioInput} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>STOCK</label>
                  <input required type="number" name="stock" value={formProd.stock} onChange={manejarCambioInput} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9", outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "10px" }}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: "12px 25px", backgroundColor: "transparent", color: "#aaa", border: "none", cursor: "pointer", fontWeight: "bold" }}>CANCELAR</button>
                <button type="submit" style={{ padding: "12px 30px", backgroundColor: "#1e3d2f", color: "white", border: "none", borderRadius: "30px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                  {modoModal === "crear" ? "GUARDAR PLANTA" : "CONFIRMAR CAMBIOS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}