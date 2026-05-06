export type Answer = "Sim" | "Não" | "Incerto";
export type RiskLevel = "Baixo" | "Alto" | "Incerto";

export interface SignalingQuestionResult {
  answer: Answer;
  justification: string;
}

export interface RiskAssessment {
  rating: RiskLevel;
  justification: string;
}

export interface DomainAnalysis {
  signalingQuestions: SignalingQuestionResult[];
  riskOfBias: RiskAssessment;
  applicabilityConcerns?: RiskAssessment;
}

export interface ArticleInfo {
  title: string;
  authors: string;
  year: string;
  journal: string;
  doi: string;
  objective: string;
  indexTest: string;
  referenceStandard: string;
  targetCondition: string;
  population: string;
  sampleSize: string;
}

export interface QuadasAnalysis {
  articleInfo: ArticleInfo;
  domains: {
    patientSelection: DomainAnalysis;
    indexTest: DomainAnalysis;
    referenceStandard: DomainAnalysis;
    flowAndTiming: Omit<DomainAnalysis, "applicabilityConcerns">;
  };
  overallAssessment: string;
  clinicalRelevance: string;
}
