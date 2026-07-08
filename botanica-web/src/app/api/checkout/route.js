import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

// Inicialización de servicios externos
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Endpoint POST para procesar el flujo de checkout.
 * Realiza la validación de stock, registra la orden en base de datos 
 * y delega la creación del link de pago a Mercado Pago.
 * 
 * @param {Request} request - Objeto de petición entrante de Next.js
 * @returns {NextResponse} Respuesta en formato JSON con el ID y el link de pago (init_point)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { items, email, userId, nombre, telefono } = body;

    // 1. Verificación estricta de stock disponible en base de datos
    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.id)
        .single();

      if (productError || !product) {
        throw new Error(`Fallo de integridad al consultar producto ID: ${item.id}`);
      }

      if (Number(product.stock) < Number(item.cantidad)) {
        return NextResponse.json(
          { error: `¡Ups! No hay stock suficiente de ${item.nombre}. Solo quedan ${product.stock} unidades disponibles.` },
          { status: 400 }
        );
      }
    }

    const totalCompra = items.reduce((acc, item) => acc + (Number(item.precio || 0) * Number(item.cantidad)), 0);

    // 2. Registro de la orden maestra en tabla "orders"
    const { data: orden, error: supabaseError } = await supabase
      .from("orders") 
      .insert([{
          user_id: userId,
          user_email: email || 'fran@prueba.com',
          items: items,
          estado: "pending",
          total: totalCompra,
      }])
      .select()
      .single();

    if (supabaseError) throw new Error(`Fallo de base de datos (Orders): ${supabaseError.message}`);

    // 3. Desglose y registro de items individuales en tabla "order_items"
    const comandaParaGuardar = items.map((item) => ({
      order_id: orden.id,
      product_id: item.id,
      cantidad: Number(item.cantidad),
      precio_unitario: Number(item.precio || 0)
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(comandaParaGuardar);

    if (itemsError) throw new Error(`Fallo de base de datos (Items): ${itemsError.message}`);

    // 4. Creación de la Preferencia de pago en Mercado Pago
    const preference = new Preference(client);
    
    const mpItems = items.map((item) => ({
      id: item.id.toString(),
      title: item.nombre,
      unit_price: Number(item.precio),
      quantity: Number(item.cantidad),
      currency_id: "ARS",
    }));

    const result = await preference.create({
      body: {
        items: mpItems,
        payer: {
          email: email || 'fran@prueba.com',
          ...(nombre ? { name: nombre } : {}),
          ...(telefono ? { phone: { number: telefono } } : {}),
        },
        notification_url: "https://pw-e-commerce-flame.vercel.app/api/webhook",
        metadata: {
          order_id: orden.id,
          user_email: email || 'fran@prueba.com'
        },
        back_urls: {
          success: "https://pw-e-commerce-flame.vercel.app", 
          failure: "https://pw-e-commerce-flame.vercel.app",
          pending: "https://pw-e-commerce-flame.vercel.app",
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ 
      id: result.id, 
      init_point: result.init_point 
    });

  } catch (error) {
    return NextResponse.json(
      { error: `Error de servidor: ${error.message}` },
      { status: 500 }
    );
  }
}