import { NextResponse } from "next/server";
import Stripe from "stripe";

// Inicializa o Stripe com a chave secreta do servidor
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Usa uma versão estável recente
});

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();

    let priceId;

    // Seleciona o ID do preço com base no plano enviado pelo frontend
    // Isso permite usar as variáveis de ambiente do servidor (sem NEXT_PUBLIC)
    if (plan === 'basic') {
      priceId = process.env.STRIPE_PRICE_ID_BASIC;
    } else if (plan === 'pro') {
      priceId = process.env.STRIPE_PRICE_ID_PRO;
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "ID do Preço não configurado nas variáveis de ambiente." },
        { status: 500 }
      );
    }

    // Cria a sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription", // 'subscription' para recorrente, 'payment' para pagamento único
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Erro no Stripe Checkout:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao criar checkout" },
      { status: 500 }
    );
  }
}