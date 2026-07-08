export const normalizarProducto = (producto = {}) => {
  const nombre = producto.nombre ?? producto.name ?? producto.title ?? "";
  const categoria = producto.categoria ?? producto.category ?? producto.type ?? "General";
  const precio = Number(producto.precio ?? producto.price ?? 0);
  const descripcion = producto.descripcion ?? producto.description ?? "";
  const imagen = producto.imagen_url ?? producto.image_url ?? producto.imagenPrincipal ?? producto.imagen ?? "";

  return {
    ...producto,
    id: producto.id,
    nombre,
    name: nombre,
    categoria,
    category: categoria,
    precio,
    price: precio,
    descripcion,
    description: descripcion,
    imagen_url: imagen,
    image_url: imagen,
    imagenPrincipal: imagen,
    imagenHover: producto.imagenHover ?? producto.imagen_hover ?? "",
  };
};

export const obtenerNombreProducto = (producto = {}) => normalizarProducto(producto).nombre;

export const obtenerCategoriaProducto = (producto = {}) => normalizarProducto(producto).categoria;

export const obtenerPrecioProducto = (producto = {}) => normalizarProducto(producto).precio;

export const obtenerDescripcionProducto = (producto = {}) => normalizarProducto(producto).descripcion;

export const obtenerDificultadProducto = (producto = {}) => normalizarProducto(producto).dificultad ?? "General";

export const obtenerImagenProducto = (producto = {}) => normalizarProducto(producto).imagen_url;

export const formatearPrecio = (valor) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));

export const construirProductoParaCarrito = (producto) => {
  const normalizado = normalizarProducto(producto);
  return {
    ...normalizado,
    id: normalizado.id,
    nombre: normalizado.nombre,
    precio: normalizado.precio,
    categoria: normalizado.categoria,
    descripcion: normalizado.descripcion,
    imagen_url: normalizado.imagen_url,
    cantidad: 1,
  };
};
