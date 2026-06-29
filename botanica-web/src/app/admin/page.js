"use client";

import { useEffect, useState } from "react";
// 👇 ACÁ ESTÁ EL CAMBIO: agregamos ../ extra
import { supabase } from "../../lib/supabase"; 
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  // Estado para el formulario de nuevo producto
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
    
    // Insertamos en Supabase
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
      // Si salió bien, cerramos el modal, limpiamos el formulario y actualizamos la lista
      setMostrarModal(false);
      setNuevoProd({ nombre: "", precio: "", stock: "", categoria: "" });
      setProductos([data[0], ...productos]);
    }
  };

  if (cargando) {
    return <div style={{ backgroundColor: "#0a0a0a", color: "white", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>Cargando panel...</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#09090b", color: "#ededed", fontFamily: "system-ui, sans-serif" }}>
      
      {/* SIDEBAR (Menú lateral) */}
      <aside style={{ width: "250px", borderRight: "1px solid #27272a", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#f97316", marginBottom: "20px" }}>
          VITA <span style={{ color: "#71717a", fontSize: "0.9rem", fontWeight: "normal" }}>admin</span>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button style={{ textAlign: "left", padding: "10px 15px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#a1a1aa", cursor: "pointer", fontSize: "1rem" }}>Dashboard</button>
          <button style={{ textAlign: "left", padding: "10px 15px", borderRadius: "8px", border: "none", backgroundColor: "rgba(249, 115, 22, 0.1)", color: "#f97316", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" }}>📦 Productos</button>
          <button style={{ textAlign: "left", padding: "10px 15px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#a1a1aa", cursor: "pointer", fontSize: "1rem" }}>📋 Pedidos</button>
        </nav>
        
        <button onClick={() => router.push("/")} style={{ marginTop: "auto", padding: "10px", backgroundColor: "#27272a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Volver a la tienda</button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, padding: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.8rem" }}>Productos</h1>
            <p style={{ margin: "5px 0 0 0", color: "#a1a1aa" }}>{productos.length} productos en total</p>
          </div>
          <button 
            onClick={() => setMostrarModal(true)}
            style={{ backgroundColor: "#f97316", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            + Nuevo producto
          </button>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <div style={{ backgroundColor: "#18181b", borderRadius: "12px", border: "1px solid #27272a", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #27272a", color: "#a1a1aa", fontSize: "0.9rem" }}>
                <th style={{ padding: "15px 20px", fontWeight: "normal" }}>Producto</th>
                <th style={{ padding: "15px 20px", fontWeight: "normal" }}>Precio</th>
                <th style={{ padding: "15px 20px", fontWeight: "normal" }}>Stock</th>
                <th style={{ padding: "15px 20px", fontWeight: "normal" }}>Estado</th>
                <th style={{ padding: "15px 20px", fontWeight: "normal", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: "1px solid #27272a", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#27272a"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                  <td style={{ padding: "15px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", backgroundColor: "#27272a", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>🌿</div>
                      <div>
                        <div style={{ fontWeight: "bold" }}>{prod.name || prod.nombre}</div>
                        <div style={{ color: "#71717a", fontSize: "0.8rem" }}>{prod.category || prod.categoria || "Sin categoría"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "15px 20px", color: "#f97316", fontWeight: "bold" }}>${prod.price || prod.precio}</td>
                  <td style={{ padding: "15px 20px" }}>{prod.stock || 0} u.</td>
                  <td style={{ padding: "15px 20px" }}>
                    <span style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>Activo</span>
                  </td>
                  <td style={{ padding: "15px 20px", textAlign: "right", color: "#a1a1aa", fontSize: "0.9rem" }}>
                    <span style={{ cursor: "pointer", marginRight: "15px" }}>Editar</span>
                    <span style={{ cursor: "pointer", color: "#ef4444" }}>Desactivar</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL PARA AGREGAR PRODUCTO */}
      {mostrarModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#18181b", padding: "30px", borderRadius: "12px", border: "1px solid #27272a", width: "100%", maxWidth: "400px" }}>
            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Crear nuevo producto</h2>
            <form onSubmit={agregarProducto} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "0.9rem", color: "#a1a1aa" }}>Nombre del producto</label>
                <input required type="text" name="nombre" value={nuevoProd.nombre} onChange={manejarCambioInput} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #3f3f46", backgroundColor: "#27272a", color: "white", outline: "none" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "0.9rem", color: "#a1a1aa" }}>Categoría</label>
                <input required type="text" name="categoria" value={nuevoProd.categoria} onChange={manejarCambioInput} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #3f3f46", backgroundColor: "#27272a", color: "white", outline: "none" }} />
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
                  <label style={{ fontSize: "0.9rem", color: "#a1a1aa" }}>Precio ($)</label>
                  <input required type="number" name="precio" value={nuevoProd.precio} onChange={manejarCambioInput} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #3f3f46", backgroundColor: "#27272a", color: "white", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1 }}>
                  <label style={{ fontSize: "0.9rem", color: "#a1a1aa" }}>Stock</label>
                  <input required type="number" name="stock" value={nuevoProd.stock} onChange={manejarCambioInput} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #3f3f46", backgroundColor: "#27272a", color: "white", outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: "10px 15px", backgroundColor: "transparent", color: "white", border: "1px solid #3f3f46", borderRadius: "6px", cursor: "pointer" }}>Cancelar</button>
                <button type="submit" style={{ padding: "10px 15px", backgroundColor: "#f97316", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>Guardar producto</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}