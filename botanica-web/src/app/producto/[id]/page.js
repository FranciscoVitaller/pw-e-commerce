"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../../context/CartContext";
import { supabase } from "../../../lib/supabase";
import {
  construirProductoParaCarrito,
  formatearPrecio,
  normalizarProducto,
  obtenerCategoriaProducto,
  obtenerDescripcionProducto,
  obtenerDificultadProducto,
  obtenerNombreProducto,
  obtenerPrecioProducto,
} from "../../../lib/productos";

export default function DetalleProducto() {
  const params = useParams();
  const idProducto = params?.id;
  const { agregarAlCarrito } = useCart();

  const [planta, setPlanta] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDetalle = async () => {
      if (!supabase || !idProducto) {
        setPlanta(null);
        setCargando(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", idProducto)
          .maybeSingle();

        if (error) throw error;
        setPlanta(data ? normalizarProducto(data) : null);
      } catch (error) {
        console.error("Error al traer el producto:", error);
        setPlanta(null);
      } finally {
        setCargando(false);
      }
    };

    obtenerDetalle();
  }, [idProducto]);

  if (cargando) {
    return (
      <main className="container">
        <p>Cargando información botánica...</p>
      </main>
    );
  }

  if (!planta) {
    return (
      <main className="container">
        <p>Lo sentimos, no encontramos esa variedad en nuestro catálogo.</p>
      </main>
    );
  }

  return (
    <main className="container">
      <header style={{ marginBottom: "30px" }}>
        <Link href="/" style={{ color: "var(--verde-principal)", textDecoration: "none", fontWeight: "bold" }}>
          ← Volver al catálogo
        </Link>
      </header>

      <article
        className="card producto-detalle"
        style={{ maxWidth: "900px", margin: "0 auto", padding: "50px", backgroundColor: "white" }}
      >
        <div style={{ borderLeft: "5px solid var(--verde-principal)", paddingLeft: "25px" }}>
          <h1 style={{ color: "var(--verde-oscuro)", fontSize: "3rem", margin: 0 }}>
            {obtenerNombreProducto(planta)}
          </h1>
          <p style={{ color: "var(--verde-principal)", fontWeight: "bold", textTransform: "uppercase", marginTop: "10px" }}>
            Variedad de {obtenerCategoriaProducto(planta)}
          </p>
        </div>

        <div style={{ margin: "40px 0", fontSize: "1.2rem", color: "#444", lineHeight: "1.8" }}>
          <p>{obtenerDescripcionProducto(planta)}</p>
          <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <span
              style={{
                backgroundColor: "var(--verde-claro)",
                padding: "5px 15px",
                borderRadius: "15px",
                fontSize: "0.9rem",
                color: "var(--verde-oscuro)",
              }}
            >
              Cuidado: {obtenerDificultadProducto(planta)}
            </span>
            <span
              style={{
                backgroundColor: "var(--verde-claro)",
                padding: "5px 15px",
                borderRadius: "15px",
                fontSize: "0.9rem",
                color: "var(--verde-oscuro)",
              }}
            >
              {Number(planta.stock) > 0 ? `Stock disponible: ${planta.stock}` : "Sin stock"}
            </span>
          </div>
        </div>

        <div
          className="producto-precio-acciones"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: "30px" }}
        >
          <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--verde-oscuro)" }}>
            {formatearPrecio(obtenerPrecioProducto(planta))}
          </span>

          <button
            className="btn-primario"
            style={{ padding: "18px 45px", fontSize: "1.1rem" }}
            disabled={Number(planta.stock) <= 0}
            onClick={() => {
              agregarAlCarrito(construirProductoParaCarrito(planta));
              alert(`${obtenerNombreProducto(planta)} se sumó a tu carrito de compras.`);
            }}
          >
            Añadir al pedido
          </button>
        </div>
      </article>

      <footer style={{ textAlign: "center", marginTop: "50px", color: "#888" }}>
        <p>Plantas Vita - Calidad Botánica Superior</p>
      </footer>
    </main>
  );
}