"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase"; 
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [sesion, setSesion] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorAuth, setErrorAuth] = useState("");

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [vistaActiva, setVistaActiva] = useState("inventario");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoModal, setModoModal] = useState("crear"); 
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  
  const [formProd, setFormProd] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    stock: "",
    imagen_url: "",
    descripcion: ""
  });

  const router = useRouter();

  const traerProductos = async () => {
    setCargando(true);
    const { data, error } = await supabase.from("products").select("*").order('id', { ascending: false });
    if (error) {
      console.error("Error al traer productos:", error);
    } else {
      setProductos(data || []);
    }
    setCargando(false);
  };

<<<<<<< HEAD
=======
  // 🔒 CONTROLADOR DE SESIÓN EXCLUSIVO PARA TU EMAIL
  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user?.email === "fvitaller@itba.edu.ar") {
        setSesion(session);
        traerProductos();
      } else {
        setSesion(null);
        setCargando(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user?.email === "fvitaller@itba.edu.ar") {
        setSesion(session);
        traerProductos();
      } else {
        setSesion(null);
        setCargando(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

>>>>>>> 0b6620a17ed9ee8da933725665e8a879fbf48d97
  // 🔒 LOGIN BLINDADO: Filtra el email antes de intentar ingresar
  const manejarLogin = async (e) => {
    e.preventDefault();
    setErrorAuth("");

    const emailLimpio = email.trim().toLowerCase();
    
    if (emailLimpio !== "fvitaller@itba.edu.ar") {
      setErrorAuth("Acceso denegado. No tienes permisos de administrador.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: emailLimpio, password });
    if (error) {
      setErrorAuth("Credenciales incorrectas o no autorizadas.");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user?.email === "fvitaller@itba.edu.ar") {
        setSesion(session);
        traerProductos();
      } else {
        setSesion(null);
        setCargando(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user?.email === "fvitaller@itba.edu.ar") {
        setSesion(session);
        traerProductos();
      } else {
        setSesion(null);
        setCargando(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const manejarLogout = async () => {
    await supabase.auth.signOut();
    setSesion(null);
    setProductos([]);
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
      } else if (data && data[0]) {
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
      } else if (data && data[0]) {
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

  // 🔒 SI NO HAY SESIÓN O NO ES TU EMAIL, MUESTRA EL FORMULARIO DE LOGIN PROTECTOR
  if (!sesion) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#1e3d2f", fontFamily: "system-ui, sans-serif" }}>
        <form onSubmit={manejarLogin} style={{ backgroundColor: "white", padding: "40px", borderRadius: "20px", width: "100%", maxWidth: "380px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h2 style={{ margin: 0, color: "#1e3d2f", fontWeight: "300", letterSpacing: "1px" }}>🌿 VITA ACCESO</h2>
            <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem", color: "#666" }}>Panel Interno de Gestión</p>
          </div>
          {errorAuth && <div style={{ color: "#e74c3c", backgroundColor: "#fceae9", padding: "10px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "15px", textAlign: "center" }}>{errorAuth}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <label htmlFor="admin-email" className="sr-only">Email de Administrador</label>
            <input required type="email" id="admin-email" placeholder="Email de Administrador" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" }} />
            <label htmlFor="admin-password" className="sr-only">Contraseña</label>
            <input required type="password" id="admin-password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" }} />
            <button type="submit" style={{ padding: "12px", backgroundColor: "#1e3d2f", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>INGRESAR AL PANEL</button>
          </div>
        </form>
      </div>
    );
  }

  // 🔓 SI LA SESIÓN ES TUYA (fvitaller@itba.edu.ar), SE MUESTRA EL PANEL COMPLETO INTACTO
  return (
    <div className="admin-layout" style={{
      display: "flex",
      minHeight: "100vh",
      backgroundImage: "url('https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2000&auto=format&fit=crop')",
      backgroundSize: "cover",
      backgroundAttachment: "fixed",
      fontFamily: "system-ui, sans-serif"
    }}>

      <aside className="admin-sidebar" style={{
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
          <span style={{ fontSize: "0.7rem", opacity: 0.8, letterSpacing: "1px" }}>CONECTADO COMO ADMIN</span>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div onClick={() => setVistaActiva("resumen")} style={{ padding: "12px 15px", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", backgroundColor: vistaActiva === "resumen" ? "rgba(255,255,255,0.15)" : "transparent", fontWeight: vistaActiva === "resumen" ? "bold" : "normal" }}>Panel Resumen</div>
          <div onClick={() => setVistaActiva("inventario")} style={{ padding: "12px 15px", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", backgroundColor: vistaActiva === "inventario" ? "rgba(255,255,255,0.15)" : "transparent", fontWeight: vistaActiva === "inventario" ? "bold" : "normal" }}>Inventario de Plantas</div>
          <div onClick={() => setVistaActiva("ordenes")} style={{ padding: "12px 15px", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", backgroundColor: vistaActiva === "ordenes" ? "rgba(255,255,255,0.15)" : "transparent", fontWeight: vistaActiva === "ordenes" ? "bold" : "normal" }}>Órdenes de Compra</div>
        </nav>
        
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          <button onClick={() => router.push("/")} style={{ padding: "10px", backgroundColor: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem" }}>← Ir a la Tienda</button>
          <button onClick={manejarLogout} style={{ padding: "10px", backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}>Cerrar Sesión ✕</button>
        </div>
      </aside>

      <main className="admin-main" style={{ flex: 1, padding: "40px", backgroundColor: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(10px)", overflowY: "auto" }}>
        {vistaActiva === "resumen" && (
          <div>
            <h1 style={{ margin: "0 0 10px 0", fontSize: "2.2rem", fontWeight: "300", color: "#1e3d2f" }}>Métricas del Negocio</h1>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px", backgroundColor: "white", padding: "25px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                <div style={{ color: "#888", fontSize: "0.8rem", fontWeight: "bold" }}>Variedades Registradas</div>
                <div style={{ fontSize: "2.5rem", fontWeight: "300", color: "#1e3d2f", marginTop: "10px" }}>{productos.length}</div>
              </div>
              <div style={{ flex: 1, minWidth: "200px", backgroundColor: "white", padding: "25px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                <div style={{ color: "#888", fontSize: "0.8rem", fontWeight: "bold" }}>Unidades en Stock</div>
                <div style={{ fontSize: "2.5rem", fontWeight: "300", color: "#27ae60", marginTop: "10px" }}>{stockTotal} u.</div>
              </div>
              <div style={{ flex: 1, minWidth: "200px", backgroundColor: "white", padding: "25px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                <div style={{ color: "#888", fontSize: "0.8rem", fontWeight: "bold" }}>Stock Crítico</div>
                <div style={{ fontSize: "2.5rem", fontWeight: "300", color: bajoStock > 0 ? "#e74c3c" : "#27ae60", marginTop: "10px" }}>{bajoStock}</div>
              </div>
            </div>
          </div>
        )}

        {vistaActiva === "inventario" && (
          <div>
            <div className="admin-inventario-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: "2.2rem", fontWeight: "300", color: "#1e3d2f" }}>Gestión de Stock</h1>
                <p style={{ margin: "5px 0 0 0", color: "#555" }}>Tienes {productos.length} variedades registradas</p>
              </div>
              <button onClick={abrirModalCrear} style={{ backgroundColor: "#2ecc71", color: "white", border: "none", padding: "12px 25px", borderRadius: "30px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 15px rgba(46, 204, 113, 0.3)" }}>+ Añadir Nueva Planta</button>
            </div>

            <div className="admin-tabla-wrapper" style={{ backgroundColor: "white", borderRadius: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
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
                    <tr key={prod.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                      <td style={{ padding: "18px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                          {prod.imagen_url ? <Image src={prod.imagen_url} alt={prod.nombre} width={40} height={40} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px" }} unoptimized /> : <div style={{ fontSize: "1.2rem", width: "40px", textAlign: "center" }}>🌱</div>}
                          <div>
                            <div style={{ fontWeight: "600", color: "#333" }}>{prod.nombre}</div>
                            <div style={{ color: "#888", fontSize: "0.75rem", textTransform: "uppercase" }}>{prod.categoria || "General"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "18px 20px", color: "#27ae60", fontWeight: "bold" }}>${prod.precio}</td>
                      <td style={{ padding: "18px 20px", color: (prod.stock || 0) < 5 ? "#e74c3c" : "#555" }}>{prod.stock || 0} u.</td>
                      <td style={{ padding: "18px 20px" }}>
                        <span style={{ color: (prod.stock || 0) > 0 ? "#27ae60" : "#e74c3c", fontSize: "0.75rem", fontWeight: "bold", border: `1px solid ${(prod.stock || 0) > 0 ? "#27ae60" : "#e74c3c"}`, padding: "3px 8px", borderRadius: "20px" }}>
                          {(prod.stock || 0) > 0 ? "DISPONIBLE" : "SIN STOCK"}
                        </span>
                      </td>
                      <td style={{ padding: "18px 20px", textAlign: "right", fontSize: "0.85rem" }}>
                        <span onClick={() => abrirModalEditar(prod)} style={{ cursor: "pointer", marginRight: "15px", textDecoration: "underline", color: "#2980b9", fontWeight: "500" }}>Modificar</span>
                        <span onClick={() => eliminarProducto(prod.id, prod.nombre)} style={{ cursor: "pointer", color: "#e74c3c", fontWeight: "500", textDecoration: "underline" }}>Quitar</span>
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
            <div style={{ backgroundColor: "white", borderRadius: "15px", padding: "30px", textAlign: "center" }}>
              <h3>Módulo de Historial Activo</h3>
              <p style={{ color: "#777" }}>Las compras exitosas se sincronizan aquí en tiempo real.</p>
            </div>
          </div>
        )}
      </main>

      {/* MODAL */}
      {mostrarModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(30, 61, 47, 0.6)", backdropFilter: "blur(5px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "20px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ marginTop: 0, marginBottom: "25px", color: "#1e3d2f", textAlign: "center", fontWeight: "300" }}>{modoModal === "crear" ? "Nueva Planta" : "Modificar Planta"}</h2>
            <form onSubmit={guardarProducto} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 2 }}>
                  <label htmlFor="nombre" style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>NOMBRE</label>
                  <input required type="text" id="nombre" name="nombre" value={formProd.nombre} onChange={manejarCambioInput} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <label htmlFor="categoria" style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>CATEGORÍA</label>
                  <input required type="text" id="categoria" name="categoria" value={formProd.categoria} onChange={manejarCambioInput} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label htmlFor="descripcion" style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>DESCRIPCIÓN</label>
                <textarea required id="descripcion" name="descripcion" value={formProd.descripcion} onChange={manejarCambioInput} rows="2" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9", resize: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label htmlFor="imagen_url" style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>URL DE LA IMAGEN</label>
                <input required type="text" id="imagen_url" name="imagen_url" value={formProd.imagen_url} onChange={manejarCambioInput} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9" }} />
              </div>
              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <label htmlFor="precio" style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>PRECIO ($)</label>
                  <input required type="number" id="precio" name="precio" value={formProd.precio} onChange={manejarCambioInput} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <label htmlFor="stock" style={{ fontSize: "0.8rem", color: "#888", fontWeight: "bold" }}>STOCK</label>
                  <input required type="number" id="stock" name="stock" value={formProd.stock} onChange={manejarCambioInput} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #eee", backgroundColor: "#f9f9f9" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "10px" }}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: "12px 25px", backgroundColor: "transparent", color: "#aaa", border: "none", cursor: "pointer" }}>CANCELAR</button>
                <button type="submit" style={{ padding: "12px 30px", backgroundColor: "#1e3d2f", color: "white", border: "none", borderRadius: "30px", fontWeight: "bold", cursor: "pointer" }}>{modoModal === "crear" ? "GUARDAR" : "CONFIRMAR"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}