"use client"; // Obligatorio porque usa estados

import { createContext, useContext, useState } from 'react';

// 1. Creamos el Contexto (el "espacio en la nube" para nuestros datos)
const CartContext = createContext();

// 2. Creamos el Proveedor (el componente que va a abrazar a toda nuestra app)
export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState([]);

  // Función para agregar (o sumar 1 si ya existe)
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

  // NUEVA: Función para restar 1 (y si llega a 0, lo elimina)
  const restarDelCarrito = (id) => {
    const existe = carrito.find((item) => item.id === id);
    if (existe.cantidad === 1) {
      // Si hay 1 solo, lo filtramos (lo sacamos del carrito)
      setCarrito(carrito.filter((item) => item.id !== id));
    } else {
      // Si hay más de 1, le restamos 1 a la cantidad
      setCarrito(carrito.map((item) =>
        item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
      ));
    }
  };

  // Función para vaciar todo
  const vaciarCarrito = () => setCarrito([]);

  // Calculamos cuántos ítems hay en total para el numerito rojo del ícono
  const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);
  
  // Calculamos el precio total acá para usarlo en cualquier lado
  const precioTotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

  return (
    // Pasamos todas estas funciones y variables para que cualquier página las pueda usar
    <CartContext.Provider value={{ carrito, agregarAlCarrito, restarDelCarrito, vaciarCarrito, cantidadTotal, precioTotal }}>
      {children}
    </CartContext.Provider>
  );
}

// 3. Creamos un "Hook" personalizado para que sea fácil usar este contexto
export const useCart = () => useContext(CartContext);