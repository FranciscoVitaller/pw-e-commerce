import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, email, userId } = body; 

    console.log("🛒 Items recibidos en backend:", items);
    console.log(`👤 Usuario comprador: ${email}`);

    const totalCompra = items.reduce((acc, item) => acc + (Number(item.precio || item.price || 0) * Number(item.cantidad)), 0);

    // 1. Guardamos el ticket principal en la tabla "orders"
    const { data: orden, error: supabaseError } = await supabase
      .from("orders") 
      .insert([
        {
          user_id: userId,
          user_email: email || 'fran@prueba.com',
          items: items,
          estado: "pending",
          total: totalCompra,
        },
      ])
      .select()
      .single();

    if (supabaseError) {
      throw new Error(`Error al guardar en Supabase: ${supabaseError.message}`);
    }

    console.log(`💾 Orden guardada con éxito. ID: ${orden.id}`);

    // --- NUEVO: GUARDAR LA COMANDA EN order_items ---
    // Preparamos los datos tal cual como se llaman las columnas en tu foto
    const comandaParaGuardar = items.map((item) => ({
      order_id: orden.id,
      product_id: item.id,
      cantidad: Number(item.cantidad),
      precio_unitario: Number(item.precio || item.price || 0)
    }));

    // Le decimos a Supabase que los anote en la tabla
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(comandaParaGuardar);

    if (itemsError) {
      throw new Error(`Error al guardar en order_items: ${itemsError.message}`);
    }
    
    console.log("📝 ¡Comanda escrita! Productos anotados en order_items con éxito.");
    // ------------------------------------------------

    // 3. Creamos el link de Mercado Pago
    const preference = new Preference(client);
    
    const mpItems = items.map((item) => ({
      id: item.id.toString(),
      title: item.nombre || item.name,
      unit_price: Number(item.precio || item.price),
      quantity: Number(item.cantidad),
      currency_id: "ARS",
    }));

    const result = await preference.create({
      body: {
        items: mpItems,
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

    console.log("✅ ¡Link de pago generado con éxito!");

    return NextResponse.json({ 
      id: result.id, 
      init_point: result.init_point 
    });

  } catch (error) {
    console.error("❌ Error en checkout:", error);
    return NextResponse.json(
      { error: `Error interno: ${error.message}` },
      { status: 500 }
    );
  }
}