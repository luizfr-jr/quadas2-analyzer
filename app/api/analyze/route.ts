import Groq from "groq-sdk";
import pdfParse from "pdf-parse";
import { NextRequest, NextResponse } from "next/server";
import { QUADAS2_PROMPT } from "@/lib/quadas2";
import { extractRelevantText } from "@/lib/extractSections";
import { QuadasAnalysis } from "@/types/quadas2";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave GROQ_API_KEY não configurada no servidor." },
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

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfData = await pdfParse(buffer);
    const fullText = pdfData.text?.trim() ?? "";

    if (fullText.length < 200) {
      return NextResponse.json(
        { error: "Não foi possível extrair texto do PDF. O arquivo pode ser uma imagem escaneada sem OCR." },
        { status: 400 }
      );
    }

    // Extract the most relevant sections (Abstract + Methods + Results)
    // ~18000 chars ≈ 4500 tokens + ~1500 (prompt) + ~3500 (response) = ~9500 total < 12k TPM
    const relevantText = extractRelevantText(fullText, 18000);

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Você receberá as seções mais relevantes de um artigo científico de acurácia diagnóstica (Abstract, Métodos, Resultados). Aplique rigorosamente a metodologia QUADAS-2 conforme as instruções abaixo.\n\n=== CONTEÚDO DO ARTIGO ===\n${relevantText}\n\n=== INSTRUÇÕES QUADAS-2 ===\n${QUADAS2_PROMPT}`,
        },
      ],
      max_tokens: 3500,
      temperature: 0.1,
    });

    let raw = (completion.choices[0]?.message?.content ?? "").trim();
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
