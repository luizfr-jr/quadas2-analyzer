"use client";

import { useState } from "react";
import { QuadasAnalysis } from "@/types/quadas2";

interface ReportGeneratorProps {
  analysis: QuadasAnalysis;
  fileName: string;
}

export default function ReportGenerator({ analysis, fileName }: ReportGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const { generateQuadasPDF } = await import("@/lib/pdfReport");
      await generateQuadasPDF(analysis, fileName.replace(".pdf", ""));
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Erro ao gerar o relatório PDF. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={generating}
      className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 disabled:bg-brand-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
    >
      {generating ? (
        <>
          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Gerando PDF...
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Baixar Relatório PDF
        </>
      )}
    </button>
  );
}
