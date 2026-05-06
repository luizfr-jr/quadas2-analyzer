"use client";

import { QuadasAnalysis } from "@/types/quadas2";
import { QUADAS2_DOMAINS } from "@/lib/quadas2";
import DomainCard from "./DomainCard";
import ReportGenerator from "./ReportGenerator";

interface AnalysisResultsProps {
  analysis: QuadasAnalysis;
  fileName: string;
}

const DOMAIN_KEYS = [
  "patientSelection",
  "indexTest",
  "referenceStandard",
  "flowAndTiming",
] as const;

function RiskDot({ rating }: { rating?: string }) {
  const colors: Record<string, string> = {
    Baixo: "bg-green-500",
    Alto: "bg-red-500",
    Incerto: "bg-amber-400",
  };
  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${colors[rating ?? "Incerto"] ?? "bg-amber-400"}`}
    />
  );
}

export default function AnalysisResults({ analysis, fileName }: AnalysisResultsProps) {
  const { articleInfo, domains, overallAssessment, clinicalRelevance } = analysis;

  return (
    <div className="space-y-6">
      {/* Artigo analisado */}
      <div className="bg-white rounded-xl border border-brand-100 shadow-sm overflow-hidden">
        <div className="bg-brand-900 px-5 py-3 flex items-center justify-between">
          <h2 className="text-white font-bold text-base">Artigo Analisado</h2>
          <ReportGenerator analysis={analysis} fileName={fileName} />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 leading-snug">{articleInfo.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{articleInfo.authors}</p>
          <p className="text-sm text-brand-700 font-medium mt-0.5">
            {articleInfo.journal}
            {articleInfo.year ? `, ${articleInfo.year}` : ""}
            {articleInfo.doi ? (
              <span className="text-gray-400 font-normal"> • DOI: {articleInfo.doi}</span>
            ) : null}
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Teste Índice", value: articleInfo.indexTest },
              { label: "Padrão de Referência", value: articleInfo.referenceStandard },
              { label: "Condição Alvo", value: articleInfo.targetCondition },
              { label: "População", value: articleInfo.population },
              { label: "Tamanho Amostral", value: articleInfo.sampleSize },
            ].map(({ label, value }) =>
              value ? (
                <div key={label} className="bg-brand-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-brand-600 font-bold uppercase tracking-wide">{label}</p>
                  <p className="text-sm text-gray-800 mt-0.5">{value}</p>
                </div>
              ) : null
            )}
          </div>

          {articleInfo.objective && (
            <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Objetivo</p>
              <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{articleInfo.objective}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabela resumo de risco */}
      <div className="bg-white rounded-xl border border-brand-100 shadow-sm overflow-hidden">
        <div className="bg-brand-800 px-5 py-3">
          <h2 className="text-white font-bold text-base">Resumo da Avaliação</h2>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-100">
                <th className="text-left py-2 px-3 text-brand-800 font-bold">Domínio</th>
                <th className="text-center py-2 px-3 text-brand-800 font-bold">Risco de Viés</th>
                <th className="text-center py-2 px-3 text-brand-800 font-bold">Aplicabilidade</th>
              </tr>
            </thead>
            <tbody>
              {QUADAS2_DOMAINS.map((domain, i) => {
                const data = domains[DOMAIN_KEYS[i]];
                return (
                  <tr key={domain.id} className="border-b border-gray-50 hover:bg-brand-50 transition-colors">
                    <td className="py-2.5 px-3 text-gray-700 font-medium">{domain.name}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1.5">
                        <RiskDot rating={data?.riskOfBias?.rating} />
                        <span className="text-xs font-semibold text-gray-700">
                          {data?.riskOfBias?.rating ?? "Incerto"}
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {(() => {
                        const ap = (data as import("@/types/quadas2").DomainAnalysis).applicabilityConcerns;
                        return domain.hasApplicability && ap ? (
                          <span className="inline-flex items-center gap-1.5">
                            <RiskDot rating={ap.rating} />
                            <span className="text-xs font-semibold text-gray-700">{ap.rating}</span>
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Domínios detalhados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {QUADAS2_DOMAINS.map((domain, i) => {
          const data = domains[DOMAIN_KEYS[i]] as import("@/types/quadas2").DomainAnalysis;
          return (
            <DomainCard
              key={domain.id}
              name={domain.name}
              description={domain.description}
              signalingQuestions={domain.signalingQuestions}
              riskQuestion={domain.riskQuestion}
              applicabilityQuestion={domain.applicabilityQuestion}
              data={data}
              hasApplicability={domain.hasApplicability}
            />
          );
        })}
      </div>

      {/* Avaliação geral */}
      <div className="bg-white rounded-xl border border-brand-100 shadow-sm overflow-hidden">
        <div className="bg-brand-800 px-5 py-3">
          <h2 className="text-white font-bold text-base">Avaliação Geral</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
              Síntese metodológica
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{overallAssessment}</p>
          </div>
          {clinicalRelevance && (
            <div className="border-t border-brand-50 pt-4">
              <h3 className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                Relevância clínica
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">{clinicalRelevance}</p>
            </div>
          )}
        </div>
      </div>

      {/* Rodapé de referência */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl px-5 py-4 text-xs text-brand-700">
        <span className="font-bold">Metodologia: </span>
        Whiting PF, Rutjes AWS, Westwood ME, et al. QUADAS-2: A Revised Tool for the Quality Assessment of Diagnostic
        Accuracy Studies. <em>Ann Intern Med.</em> 2011;155(8):529-536.{" "}
        <a
          href="https://www.acpjournals.org/doi/10.7326/0003-4819-155-8-201110180-00009"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-brand-600 hover:text-brand-800"
        >
          DOI: 10.7326/0003-4819-155-8-201110180-00009
        </a>
      </div>
    </div>
  );
}
