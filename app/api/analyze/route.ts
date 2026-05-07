import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { QUADAS2_PROMPT } from "@/lib/quadas2";
import { QuadasAnalysis } from "@/types/quadas2";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave GEMINI_API_KEY não configurada no servidor." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo PDF enviado." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "O arquivo deve ser um PDF." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "O arquivo PDF deve ter no máximo 10 MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64,
              },
            },
            { text: QUADAS2_PROMPT },
          ],
        },
      ],
    });

    let raw = (response.text ?? "").trim();
    // Remove markdown code fences if present
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let analysis: QuadasAnalysis;
    try {
      analysis = JSON.parse(raw);
    } catch {
      console.error("JSON parse error. Raw:", raw.slice(0, 800));
      return NextResponse.json(
        { error: "O modelo retornou uma resposta inválida. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis, fileName: file.name });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Analyze error:", message);
    return NextResponse.json(
      { error: `Erro ao processar: ${message}` },
      { status: 500 }
    );
  }
}
