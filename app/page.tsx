"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import AnalysisResults from "@/components/AnalysisResults";
import { QuadasAnalysis } from "@/types/quadas2";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<QuadasAnalysis | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(file: File) {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro desconhecido.");
        return;
      }

      setAnalysis(data.analysis);
    } catch {
      setError("Falha na conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Intro */}
      {!analysis && !isLoading && (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-brand-900">
            Avalie a qualidade do seu estudo diagnóstico
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-sm leading-relaxed">
            Faça upload do PDF de um artigo de acurácia diagnóstica. A ferramenta aplicará
            automaticamente a metodologia <strong>QUADAS-2</strong> e gerará um relatório completo
            em PDF com a avaliação de risco de viés e aplicabilidade em cada domínio.
          </p>
        </div>
      )}

      {/* Upload */}
      <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-700">Erro na análise</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-brand-100 rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-48 bg-brand-100 rounded-xl" />
            <div className="h-48 bg-brand-100 rounded-xl" />
          </div>
          <div className="h-24 bg-brand-100 rounded-xl" />
          <p className="text-center text-sm text-brand-600 font-medium animate-pulse">
            Aplicando QUADAS-2 ao artigo... isso pode levar até 1 minuto.
          </p>
        </div>
      )}

      {/* Resultados */}
      {analysis && !isLoading && (
        <AnalysisResults analysis={analysis} fileName={fileName} />
      )}

      {/* Instruções iniciais */}
      {!analysis && !isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {[
            {
              icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
              title: "1. Envie o PDF",
              desc: "Arraste ou selecione o arquivo PDF do artigo científico a ser avaliado.",
            },
            {
              icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
              title: "2. Análise automática",
              desc: "A IA aplica a metodologia QUADAS-2 e avalia os 4 domínios com justificativas.",
            },
            {
              icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              title: "3. Baixe o relatório",
              desc: "Gere um relatório completo em PDF com a avaliação e referências metodológicas.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-white rounded-xl border border-brand-100 p-4 text-center shadow-sm"
            >
              <div className="flex justify-center mb-3">
                <div className="bg-brand-100 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={step.icon}
                    />
                  </svg>
                </div>
              </div>
              <h3 className="font-bold text-brand-800 text-sm">{step.title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
