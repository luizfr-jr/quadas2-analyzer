import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { QUADAS2_PROMPT } from "@/lib/quadas2";
import { QuadasAnalysis } from "@/types/quadas2";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64,
        },
      },
      QUADAS2_PROMPT,
    ]);

    let raw = result.response.text().trim();
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
      { error: "Erro interno ao processar o PDF. Verifique se a chave GEMINI_API_KEY está configurada." },
      { status: 500 }
    );
  }
}
