"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

// Inicializamos Supabase para leer los datos
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminDashboard() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Función para traer las órdenes desde Supabase
  const obtenerOrdenes = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }); // Las más nuevas primero

      if (error) throw error;
      setOrdenes(data || []);
    } catch (error) {
      console.error("Error al cargar órdenes:", error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerOrdenes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      {/* Encabezado */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800">Panel de Administración</h1>
          <p className="text-gray-500 text-sm">Plantas Vita — Control de Ventas y Pedidos</p>
        </div>
        <Link href="/" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          🌱 Volver a la Tienda
        </Link>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            📦 Historial de Pedidos Recibidos ({ordenes.length})
          </h2>

          {cargando ? (
            <p className="text-gray-500 animate-pulse py-8 text-center">Cargando registros de Supabase...</p>
          ) : ordenes.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">Todavía no se registraron compras en la base de datos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-sm uppercase font-semibold">
                    <th className="p-3 border-b">ID Pedido</th>
                    <th className="p-3 border-b">Cliente (Email)</th>
                    <th className="p-3 border-b">Productos Comprados</th>
                    <th className="p-3 border-b text-right">Total Pagado</th>
                    <th className="p-3 border-b text-center">Estado MP</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {ordenes.map((orden) => (
                    <tr key={orden.id} className="hover:bg-gray-50 transition-colors">
                      {/* ID corto - ACÁ ESTÁ EL ARREGLO */}
                      <td className="p-3 font-mono text-xs text-gray-400">
                        {String(orden.id).substring(0, 8)}...
                      </td>
                      
                      {/* Email */}
                      <td className="p-3 font-medium text-gray-700">
                        {orden.user_email || "Usuario Invitado"}
                      </td>
                      
                      {/* Items del Carrito */}
                      <td className="p-3 text-gray-600">
                        <ul className="list-disc list-inside space-y-0.5">
                          {Array.isArray(orden.items) ? (
                            orden.items.map((item, idx) => (
                              <li key={idx}>
                                {item.nombre || item.name} <span className="text-gray-400">x{item.cantidad || 1}</span>
                              </li>
                            ))
                          ) : (
                            <span className="text-gray-400">Detalle no disponible</span>
                          )}
                        </ul>
                      </td>
                      
                      {/* Total */}
                      <td className="p-3 text-right font-bold text-emerald-700">
                        ${Number(orden.total || orden.total_price).toLocaleString("es-AR")}
                      </td>
                      
                      {/* Estado */}
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          orden.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {orden.status === 'pending' ? '⏳ Pendiente' : orden.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}