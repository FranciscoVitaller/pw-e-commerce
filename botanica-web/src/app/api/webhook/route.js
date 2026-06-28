import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("data.id");
    const type = searchParams.get("type");

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
      const { error: supabaseError } = await supabase
        .from("ordenes")
        .update({ estado: status }) 
        .eq("id", orderId);

      if (supabaseError) {
        console.error("❌ Error en Supabase:", supabaseError.message);
      } else {
        console.log("✅ ¡Base de datos actualizada con éxito a approved!");
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("❌ Error en el webhook:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 200 });
  }
}