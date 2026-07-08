"use client";

import { createContext, useContext, useState } from 'react';

/**
 * Contexto global para el carrito de compras.
 * @type {React.Context}
 */
const CartContext = createContext();

/**
 * Proveedor del contexto del carrito.
 * Envuelve a la aplicación para proveer y mantener el estado global de las compras.
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Componentes hijos.
 */
export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState([]);

  /**
   * Agrega un producto al carrito o incrementa su cantidad si ya existe.
   * @param {Object} planta - Objeto con los datos de la planta seleccionada.
   */
  const agregarAlCarrito = (planta) => {
    const existe = carrito.find((item) => item.id === planta.id);
    if (existe) {
      setCarrito(carrito.map((item) =>
        item.id === planta.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { ...planta, cantidad: 1 }]);
    }
  };

  /**
   * Resta una unidad de un producto del carrito. Si la cantidad llega a 0, lo elimina por completo.
   * @param {string|number} id - Identificador único del producto a modificar.
   */
  const restarDelCarrito = (id) => {
    const existe = carrito.find((item) => item.id === id);
    if (existe.cantidad === 1) {
      setCarrito(carrito.filter((item) => item.id !== id));
    } else {
      setCarrito(carrito.map((item) =>
        item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
      ));
    }
  };

  /**
   * Vacía completamente el carrito de compras, restaurando el estado inicial.
   */
  const vaciarCarrito = () => setCarrito([]);

  // Variables derivadas del estado actual del carrito
  const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);
  const precioTotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

  return (
    <CartContext.Provider value={{ carrito, agregarAlCarrito, restarDelCarrito, vaciarCarrito, cantidadTotal, precioTotal }}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook personalizado para facilitar el acceso al contexto del carrito en cualquier componente.
 * @returns {Object} Valores y funciones del estado global del carrito.
 */
export const useCart = () => useContext(CartContext);