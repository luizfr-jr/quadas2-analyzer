import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { QUADAS2_PROMPT } from "@/lib/quadas2";
import { QuadasAnalysis } from "@/types/quadas2";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo PDF enviado." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "O arquivo deve ser um PDF." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "O arquivo PDF deve ter no máximo 10 MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            } as Parameters<typeof anthropic.messages.create>[0]["messages"][0]["content"][0],
            {
              type: "text",
              text: QUADAS2_PROMPT,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Resposta inesperada da API." },
        { status: 500 }
      );
    }

    let raw = content.text.trim();
    // Remove markdown code fences if present
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let analysis: QuadasAnalysis;
    try {
      analysis = JSON.parse(raw);
    } catch {
      console.error("JSON parse error. Raw:", raw.slice(0, 500));
      return NextResponse.json(
        { error: "Falha ao interpretar a análise. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis, fileName: file.name });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar o PDF." },
      { status: 500 }
    );
  }
}
