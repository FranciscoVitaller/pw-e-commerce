import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto"; // <-- Necesario para la verificación de firma

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Usamos tu clave actual (si luego el stock no se actualiza por permisos, avisame y lo cambiamos por la Service Role Key)
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("data.id");
    const type = url.searchParams.get("type");

    // --- 1. VERIFICACIÓN DE FIRMA (Requisito de la Semana 15) ---
    // Extraemos las cabeceras de seguridad que manda Mercado Pago
    const signature = request.headers.get("x-signature");
    const requestId = request.headers.get("x-request-id");
    const secret = process.env.MP_WEBHOOK_SECRET; 

    // Solo validamos si configuraste la clave secreta y Mercado Pago mandó las cabeceras
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
        // Creamos la firma matemática para comparar
        const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(manifest);
        const sha = hmac.digest('hex');
        
        // Si no coinciden, es un intento de hackeo
        if (sha !== v1) {
          console.error("❌ Firma de Mercado Pago inválida");
          return NextResponse.json({ error: "Firma inválida" }, { status: 403 });
        }
      }
    }
    // -------------------------------------------------------------

    // Si no es un pago o no tiene ID, lo ignoramos pero decimos "Ok"
    if (type !== "payment" || !id) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log(`🔔 ¡Llegó un aviso de Mercado Pago! ID: ${id}`);

    // Consultamos el pago real en Mercado Pago (Segunda capa de seguridad)
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: id });

    const status = paymentData.status; 
    const orderId = paymentData.metadata?.order_id;

    console.log(`💰 Estado del pago: ${status} | 🛒 ID Orden: ${orderId}`);

    if (orderId) {
      // Conciliación de estados (Actualizamos la orden a "approved")
      const { error: supabaseError } = await supabase
        .from("orders")
        .update({ estado: status }) 
        .eq("id", orderId);

      if (supabaseError) {
        console.error("❌ Error actualizando orden en Supabase:", supabaseError.message);
      } else {
        console.log("✅ ¡Orden actualizada con éxito a", status, "!");

        // --- 2. ACTUALIZACIÓN DE STOCK (Requisito de la Semana 15) ---
        if (status === "approved") {
          // A. Buscamos qué productos tenía esta orden en la tabla 'order_items'
          const { data: orderItems, error: itemsError } = await supabase
            .from("order_items")
            .select("product_id, quantity")
            .eq("order_id", orderId);

          if (itemsError) {
            console.error("❌ Error buscando los items de la orden:", itemsError.message);
          } else if (orderItems && orderItems.length > 0) {
            
            // B. Recorremos cada producto comprado para descontarlo
            for (const item of orderItems) {
              // Traemos el stock actual del producto
              const { data: product } = await supabase
                .from("products")
                .select("stock")
                .eq("id", item.product_id)
                .single();

              if (product) {
                const nuevoStock = product.stock - item.quantity;
                
                // Actualizamos el stock
                await supabase
                  .from("products")
                  .update({ stock: nuevoStock })
                  .eq("id", item.product_id);
              }
            }
            console.log("✅ ¡Stock de los productos actualizado con éxito!");
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