import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { image } = body ?? {};
  if (!image) return NextResponse.json({ error: "Imagem obrigatória (base64)." }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_VISION_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Extraia dados desta nota fiscal/comprovante de compra de eletrodoméstico. Responda em JSON com campos: customerName, phone, cpfCnpj, applianceType, brand, model, serialNumber, voltage, purchaseDate (YYYY-MM-DD)." },
            { type: "image_url", image_url: { url: image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}` } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  try {
    return NextResponse.json({ source: "openai", ...JSON.parse(content) });
  } catch {
    return NextResponse.json({ error: "Falha ao parsear resposta da IA." }, { status: 500 });
  }
}