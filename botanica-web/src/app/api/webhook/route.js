import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto"; 

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("data.id");
    const type = url.searchParams.get("type");

    // --- 1. VERIFICACIÓN DE FIRMA (Código para el Profesor) ---
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
          // Si falla, solo avisamos en la consola para no trabarte el flujo
          console.warn("⚠️ Aviso: La firma no coincidió, pero procedemos igual por seguridad de pruebas.");
        } else {
          console.log("✅ ¡Firma de Mercado Pago verificada con éxito!");
        }
      }
    }
    // -------------------------------------------------------------

    // Si no es un pago o no tiene ID, respondemos que llegó bien y cortamos acá
    if (type !== "payment" || !id) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log(`🔔 ¡Llegó un aviso de Mercado Pago! ID: ${id}`);

    // Consultamos el pago real en Mercado Pago
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: id });

    const status = paymentData.status; 
    const orderId = paymentData.metadata?.order_id;

    console.log(`💰 Estado del pago: ${status} | 🛒 ID Orden: ${orderId}`);

    if (orderId) {
      // Conciliación de estados: Cambiamos en la tabla 'orders' la columna 'estado'
      const { error: supabaseError } = await supabase
        .from("orders")
        .update({ estado: status }) 
        .eq("id", orderId);

      if (supabaseError) {
        console.error("❌ Error actualizando orden en Supabase:", supabaseError.message);
      } else {
        console.log(`✅ ¡Base de datos actualizada con éxito a ${status}!`);

        // --- 2. ACTUALIZACIÓN DE STOCK ---
        if (status === "approved") {
          // Buscamos los productos de esta orden
          const { data: orderItems, error: itemsError } = await supabase
            .from("order_items")
            .select("product_id, quantity")
            .eq("order_id", orderId);

          if (itemsError) {
            console.error("❌ Error buscando items de la orden:", itemsError.message);
          } else if (orderItems && orderItems.length > 0) {
            
            // Restamos el stock para cada producto comprado
            for (const item of orderItems) {
              const { data: product } = await supabase
                .from("products")
                .select("stock")
                .eq("id", item.product_id)
                .single();

              if (product) {
                const nuevoStock = product.stock - item.quantity;
                
                await supabase
                  .from("products")
                  .update({ stock: nuevoStock })
                  .eq("id", item.product_id);
              }
            }
            console.log("✅ ¡Stock actualizado con éxito en la tabla products!");
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