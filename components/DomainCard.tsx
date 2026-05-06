"use client";

import { DomainAnalysis } from "@/types/quadas2";

interface DomainCardProps {
  name: string;
  description: string;
  signalingQuestions: string[];
  riskQuestion: string;
  applicabilityQuestion?: string | null;
  data: DomainAnalysis;
  hasApplicability: boolean;
}

function RiskBadge({ rating }: { rating: string }) {
  const colors: Record<string, string> = {
    Baixo: "bg-green-100 text-green-800 border-green-200",
    Alto: "bg-red-100 text-red-800 border-red-200",
    Incerto: "bg-amber-100 text-amber-800 border-amber-200",
  };
  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${colors[rating] ?? colors["Incerto"]}`}
    >
      {rating}
    </span>
  );
}

function AnswerBadge({ answer }: { answer: string }) {
  const colors: Record<string, string> = {
    Sim: "bg-green-600 text-white",
    Não: "bg-red-600 text-white",
    Incerto: "bg-amber-500 text-white",
  };
  return (
    <span
      className={`inline-flex items-center justify-center w-16 shrink-0 px-2 py-1 rounded text-xs font-bold ${colors[answer] ?? colors["Incerto"]}`}
    >
      {answer}
    </span>
  );
}

export default function DomainCard({
  name,
  description,
  signalingQuestions,
  riskQuestion,
  applicabilityQuestion,
  data,
  hasApplicability,
}: DomainCardProps) {
  return (
    <div className="bg-white rounded-xl border border-brand-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-brand-800 px-5 py-3">
        <h3 className="text-white font-bold text-base">{name}</h3>
        <p className="text-brand-200 text-xs mt-0.5">{description}</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Questões de sinalização */}
        <div>
          <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-3">
            Questões de Sinalização
          </h4>
          <div className="space-y-3">
            {signalingQuestions.map((q, i) => {
              const sq = data.signalingQuestions[i];
              return (
                <div key={i} className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <div className="flex items-start gap-3">
                    <AnswerBadge answer={sq?.answer ?? "Incerto"} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        <span className="text-brand-600 font-bold mr-1">Q{i + 1}.</span>
                        {q}
                      </p>
                      {sq?.justification && (
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                          {sq.justification}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risco de viés */}
        <div className="rounded-lg border border-brand-100 overflow-hidden">
          <div className="bg-brand-600 px-4 py-2">
            <p className="text-white text-xs font-bold uppercase tracking-wider">Risco de Viés</p>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <RiskBadge rating={data.riskOfBias?.rating ?? "Incerto"} />
              <p className="text-xs text-gray-600">{riskQuestion}</p>
            </div>
            {data.riskOfBias?.justification && (
              <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-2 mt-2">
                {data.riskOfBias.justification}
              </p>
            )}
          </div>
        </div>

        {/* Aplicabilidade */}
        {hasApplicability && applicabilityQuestion && data.applicabilityConcerns && (
          <div className="rounded-lg border border-brand-100 overflow-hidden">
            <div className="bg-brand-600 px-4 py-2">
              <p className="text-white text-xs font-bold uppercase tracking-wider">
                Preocupações com Aplicabilidade
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <RiskBadge rating={data.applicabilityConcerns.rating ?? "Incerto"} />
                <p className="text-xs text-gray-600">{applicabilityQuestion}</p>
              </div>
              {data.applicabilityConcerns.justification && (
                <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-2 mt-2">
                  {data.applicabilityConcerns.justification}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
