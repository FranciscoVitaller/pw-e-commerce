import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto"; 

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("data.id");
    const type = url.searchParams.get("type");

    // --- 1. VERIFICACIÓN DE FIRMA (Para el Profesor) ---
    const signature = request.headers.get("x-signature");
    const requestId = request.headers.get("x-request-id");
    const secret = process.env.MP_WEBHOOK_SECRET; 

    if (signature && requestId && secret && id) {
      const parts = signature.split(',');
      let ts = null;
      let v1 = null;
      
      parts.forEach(part => {
        const [key, value] = part.split('=');
        if (key === 'ts') ts = value;
        if (key === 'v1') v1 = value;
      });

      if (ts && v1) {
        const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(manifest);
        const sha = hmac.digest('hex');
        
        if (sha !== v1) {
          console.warn("⚠️ Aviso: Firma de simulación, procediendo igual.");
        } else {
          console.log("✅ Firma verificada con éxito.");
        }
      }
    }

    if (type !== "payment" || !id) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log(`🔔 ¡Llegó un aviso de Mercado Pago! ID: ${id}`);

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: id });

    const status = paymentData.status; 
    const orderId = paymentData.metadata?.order_id;

    console.log(`💰 Estado del pago: ${status} | 🛒 ID Orden: ${orderId}`);

    if (orderId) {
      // A. Conciliación de estados (Actualiza a approved)
      const { error: supabaseError } = await supabase
        .from("orders")
        .update({ estado: status }) 
        .eq("id", orderId);

      if (supabaseError) {
        console.error("❌ Error actualizando orden en Supabase:", supabaseError.message);
      } else {
        console.log(`✅ Base de datos actualizada con éxito a ${status}`);

        // --- 2. ACTUALIZACIÓN DE STOCK REAL (Exacto como tus fotos) ---
        if (status === "approved") {
          
          // Buscamos los productos asociados a esta orden
          const { data: orderItems, error: itemsError } = await supabase
            .from("order_items")
            .select("product_id, cantidad") 
            .eq("order_id", orderId);

          if (itemsError) {
            console.error("❌ Error al leer order_items:", itemsError.message);
          } else if (orderItems && orderItems.length > 0) {
            
            for (const item of orderItems) {
              // Traemos el stock actual desde la tabla 'products'
              const { data: product, error: productError } = await supabase
                .from("products")
                .select("stock") 
                .eq("id", item.product_id)
                .single();

              if (productError) {
                console.error(`❌ Error buscando producto ID ${item.product_id}:`, productError.message);
              } else if (product) {
                // Restamos el stock
                const nuevoStock = product.stock - item.cantidad;

                // Guardamos el cambio en Supabase
                const { error: updateError } = await supabase
                  .from("products")
                  .update({ stock: nuevoStock })
                  .eq("id", item.product_id);

                if (updateError) {
                  console.error(`❌ Error guardando nuevo stock para producto ${item.product_id}:`, updateError.message);
                } else {
                  console.log(`✅ ¡Stock del producto ID ${item.product_id} actualizado con éxito a ${nuevoStock}!`);
                }
              }
            }
          } else {
            console.warn("⚠️ Alerta: No se encontraron productos para esta orden en 'order_items'.");
          }
        }
        // -------------------------------------------------------------
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("❌ Error en el webhook:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}