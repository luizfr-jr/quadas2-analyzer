export const QUADAS2_DOMAINS = [
  {
    id: "patientSelection" as const,
    name: "Domínio 1: Seleção de Pacientes",
    description:
      "Avalia se o processo de recrutamento e seleção de pacientes pode ter introduzido viés.",
    signalingQuestions: [
      "A amostra de pacientes foi consecutiva ou aleatória?",
      "O desenho caso-controle foi evitado?",
      "O estudo evitou exclusões inapropriadas?",
    ],
    riskQuestion: "A seleção de pacientes poderia ter introduzido viés?",
    applicabilityQuestion:
      "Há preocupações de que os pacientes e o contexto incluídos não correspondam à questão de revisão?",
    hasApplicability: true,
  },
  {
    id: "indexTest" as const,
    name: "Domínio 2: Teste Índice",
    description:
      "Avalia se a condução ou interpretação do teste índice pode ter introduzido viés.",
    signalingQuestions: [
      "Os resultados do teste índice foram interpretados sem o conhecimento dos resultados do padrão de referência?",
      "Se um limiar foi utilizado, ele foi pré-especificado?",
    ],
    riskQuestion:
      "A condução ou interpretação do teste índice poderia ter introduzido viés?",
    applicabilityQuestion:
      "Há preocupações de que o teste índice, sua condução ou interpretação diferem da questão de revisão?",
    hasApplicability: true,
  },
  {
    id: "referenceStandard" as const,
    name: "Domínio 3: Padrão de Referência",
    description:
      "Avalia se o padrão de referência e sua condução podem ter introduzido viés.",
    signalingQuestions: [
      "O padrão de referência provavelmente classificará corretamente a condição alvo?",
      "Os resultados do padrão de referência foram interpretados sem o conhecimento dos resultados do teste índice?",
    ],
    riskQuestion:
      "O padrão de referência, sua condução ou interpretação poderiam ter introduzido viés?",
    applicabilityQuestion:
      "Há preocupações de que a condição alvo, conforme definida pelo padrão de referência, não corresponde à questão de revisão?",
    hasApplicability: true,
  },
  {
    id: "flowAndTiming" as const,
    name: "Domínio 4: Fluxo e Tempo",
    description: "Avalia se o fluxo de pacientes pode ter introduzido viés.",
    signalingQuestions: [
      "Houve um intervalo apropriado entre o teste índice e o padrão de referência?",
      "Todos os pacientes receberam o mesmo padrão de referência?",
      "Todos os pacientes foram incluídos na análise?",
    ],
    riskQuestion: "O fluxo de pacientes poderia ter introduzido viés?",
    applicabilityQuestion: null,
    hasApplicability: false,
  },
];

export const QUADAS2_REFERENCE = {
  authors:
    "Whiting PF, Rutjes AWS, Westwood ME, Mallett S, Deeks JJ, Reitsma JB, et al.",
  title:
    "QUADAS-2: A Revised Tool for the Quality Assessment of Diagnostic Accuracy Studies",
  journal: "Annals of Internal Medicine",
  year: "2011",
  volume: "155",
  issue: "8",
  pages: "529-536",
  doi: "10.7326/0003-4819-155-8-201110180-00009",
  url: "https://www.acpjournals.org/doi/10.7326/0003-4819-155-8-201110180-00009",
};

export const QUADAS2_PROMPT = `Você é um especialista em revisões sistemáticas e estudos de acurácia diagnóstica. Analise o artigo científico fornecido usando a metodologia QUADAS-2 (Quality Assessment of Diagnostic Accuracy Studies - 2).

Extraia as informações do artigo e avalie cada domínio conforme a metodologia QUADAS-2 de Whiting et al. (2011).

DOMÍNIO 1: SELEÇÃO DE PACIENTES
Questões de sinalização:
1.1. A amostra de pacientes foi consecutiva ou aleatória?
1.2. O desenho caso-controle foi evitado?
1.3. O estudo evitou exclusões inapropriadas?
Risco de viés: A seleção de pacientes poderia ter introduzido viés?
Aplicabilidade: Há preocupações de que os pacientes e o contexto incluídos não correspondam à questão de revisão?

DOMÍNIO 2: TESTE ÍNDICE
Questões de sinalização:
2.1. Os resultados do teste índice foram interpretados sem o conhecimento dos resultados do padrão de referência?
2.2. Se um limiar foi utilizado, ele foi pré-especificado?
Risco de viés: A condução ou interpretação do teste índice poderia ter introduzido viés?
Aplicabilidade: Há preocupações de que o teste índice, sua condução ou interpretação diferem da questão de revisão?

DOMÍNIO 3: PADRÃO DE REFERÊNCIA
Questões de sinalização:
3.1. O padrão de referência provavelmente classificará corretamente a condição alvo?
3.2. Os resultados do padrão de referência foram interpretados sem o conhecimento dos resultados do teste índice?
Risco de viés: O padrão de referência, sua condução ou interpretação poderiam ter introduzido viés?
Aplicabilidade: Há preocupações de que a condição alvo, conforme definida pelo padrão de referência, não corresponde à questão de revisão?

DOMÍNIO 4: FLUXO E TEMPO
Questões de sinalização:
4.1. Houve um intervalo apropriado entre o teste índice e o padrão de referência?
4.2. Todos os pacientes receberam o mesmo padrão de referência?
4.3. Todos os pacientes foram incluídos na análise?
Risco de viés: O fluxo de pacientes poderia ter introduzido viés?

RESPOSTAS POSSÍVEIS:
- Questões de sinalização: "Sim" / "Não" / "Incerto"
- Risco de viés: "Baixo" / "Alto" / "Incerto"
- Preocupações de aplicabilidade: "Baixo" / "Alto" / "Incerto"

Retorne APENAS um JSON válido (sem markdown, sem blocos de código, sem texto adicional) com esta estrutura EXATA:
{
  "articleInfo": {
    "title": "título completo do artigo",
    "authors": "autores (sobrenome, iniciais)",
    "year": "ano de publicação",
    "journal": "nome do periódico",
    "doi": "DOI se disponível, senão vazio",
    "objective": "objetivo principal do estudo em 1-2 frases",
    "indexTest": "nome do teste diagnóstico avaliado",
    "referenceStandard": "padrão de referência utilizado",
    "targetCondition": "condição alvo sendo diagnosticada",
    "population": "descrição da população estudada",
    "sampleSize": "número total de participantes"
  },
  "domains": {
    "patientSelection": {
      "signalingQuestions": [
        { "answer": "Sim/Não/Incerto", "justification": "justificativa baseada no texto do artigo" },
        { "answer": "Sim/Não/Incerto", "justification": "justificativa baseada no texto do artigo" },
        { "answer": "Sim/Não/Incerto", "justification": "justificativa baseada no texto do artigo" }
      ],
      "riskOfBias": { "rating": "Baixo/Alto/Incerto", "justification": "justificativa detalhada" },
      "applicabilityConcerns": { "rating": "Baixo/Alto/Incerto", "justification": "justificativa detalhada" }
    },
    "indexTest": {
      "signalingQuestions": [
        { "answer": "Sim/Não/Incerto", "justification": "justificativa baseada no texto do artigo" },
        { "answer": "Sim/Não/Incerto", "justification": "justificativa baseada no texto do artigo" }
      ],
      "riskOfBias": { "rating": "Baixo/Alto/Incerto", "justification": "justificativa detalhada" },
      "applicabilityConcerns": { "rating": "Baixo/Alto/Incerto", "justification": "justificativa detalhada" }
    },
    "referenceStandard": {
      "signalingQuestions": [
        { "answer": "Sim/Não/Incerto", "justification": "justificativa baseada no texto do artigo" },
        { "answer": "Sim/Não/Incerto", "justification": "justificativa baseada no texto do artigo" }
      ],
      "riskOfBias": { "rating": "Baixo/Alto/Incerto", "justification": "justificativa detalhada" },
      "applicabilityConcerns": { "rating": "Baixo/Alto/Incerto", "justification": "justificativa detalhada" }
    },
    "flowAndTiming": {
      "signalingQuestions": [
        { "answer": "Sim/Não/Incerto", "justification": "justificativa baseada no texto do artigo" },
        { "answer": "Sim/Não/Incerto", "justification": "justificativa baseada no texto do artigo" },
        { "answer": "Sim/Não/Incerto", "justification": "justificativa baseada no texto do artigo" }
      ],
      "riskOfBias": { "rating": "Baixo/Alto/Incerto", "justification": "justificativa detalhada" }
    }
  },
  "overallAssessment": "avaliação geral detalhada do estudo com pontos fortes e limitações metodológicas (3-5 frases)",
  "clinicalRelevance": "relevância clínica da pesquisa e contexto na prática médica (2-3 frases)"
}`;
