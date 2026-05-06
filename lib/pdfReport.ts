import { QuadasAnalysis } from "@/types/quadas2";
import { QUADAS2_DOMAINS, QUADAS2_REFERENCE } from "./quadas2";

const GREEN = [22, 163, 74] as [number, number, number];
const DARK_GREEN = [20, 83, 45] as [number, number, number];
const LIGHT_GREEN = [220, 252, 231] as [number, number, number];
const RED = [220, 38, 38] as [number, number, number];
const LIGHT_RED = [254, 226, 226] as [number, number, number];
const AMBER = [180, 83, 9] as [number, number, number];
const LIGHT_AMBER = [254, 243, 199] as [number, number, number];
const GRAY = [107, 114, 128] as [number, number, number];
const LIGHT_GRAY = [249, 250, 251] as [number, number, number];
const WHITE = [255, 255, 255] as [number, number, number];
const BLACK = [17, 24, 39] as [number, number, number];

function riskColor(rating: string): [number, number, number] {
  if (rating === "Baixo") return GREEN;
  if (rating === "Alto") return RED;
  return AMBER;
}

function riskBg(rating: string): [number, number, number] {
  if (rating === "Baixo") return LIGHT_GREEN;
  if (rating === "Alto") return LIGHT_RED;
  return LIGHT_AMBER;
}

function answerColor(answer: string): [number, number, number] {
  if (answer === "Sim") return GREEN;
  if (answer === "Não") return RED;
  return AMBER;
}

function wrap(doc: import("jspdf").jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

function addPageHeader(doc: import("jspdf").jsPDF, pageW: number) {
  doc.setFillColor(...DARK_GREEN);
  doc.rect(0, 0, pageW, 12, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("QUADAS-2 Analyzer", 14, 8);
  doc.setFont("helvetica", "normal");
  const date = new Date().toLocaleDateString("pt-BR");
  doc.text(`Gerado em: ${date}`, pageW - 14, 8, { align: "right" });
}

function addPageFooter(doc: import("jspdf").jsPDF, pageW: number, pageH: number, pageNum: number) {
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(0, pageH - 10, pageW, 10, "F");
  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Referência: Whiting et al. QUADAS-2. Ann Intern Med. 2011;155(8):529-536.",
    14,
    pageH - 3.5
  );
  doc.text(`Página ${pageNum}`, pageW - 14, pageH - 3.5, { align: "right" });
}

export async function generateQuadasPDF(
  analysis: QuadasAnalysis,
  articleFileName: string
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let page = 1;

  // ─── PÁGINA 1: CAPA ───────────────────────────────────────────────
  doc.setFillColor(...DARK_GREEN);
  doc.rect(0, 0, pageW, 70, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("QUADAS-2", pageW / 2, 30, { align: "center" });
  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.text("Avaliador de Qualidade de Estudos de Acurácia Diagnóstica", pageW / 2, 40, {
    align: "center",
  });
  doc.setFontSize(9);
  doc.text("Quality Assessment of Diagnostic Accuracy Studies – 2", pageW / 2, 48, {
    align: "center",
  });

  // Data
  doc.setFillColor(...GREEN);
  doc.roundedRect(margin, 60, contentW, 10, 2, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Relatório gerado em: ${new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    pageW / 2,
    66.5,
    { align: "center" }
  );

  // Artigo analisado
  let y = 82;
  doc.setTextColor(...BLACK);
  doc.setFillColor(...LIGHT_GREEN);
  doc.roundedRect(margin, y - 5, contentW, 6, 1, 1, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text("ARTIGO ANALISADO", margin + 3, y);

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BLACK);
  const titleLines = wrap(doc, analysis.articleInfo.title, contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 5 + 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  const authLine = wrap(doc, analysis.articleInfo.authors, contentW);
  doc.text(authLine, margin, y);
  y += authLine.length * 4 + 2;

  doc.setFont("helvetica", "italic");
  doc.text(
    `${analysis.articleInfo.journal}, ${analysis.articleInfo.year}${analysis.articleInfo.doi ? " | DOI: " + analysis.articleInfo.doi : ""}`,
    margin,
    y
  );
  y += 8;

  // Info do artigo em grid
  const infoItems = [
    { label: "Teste Índice", value: analysis.articleInfo.indexTest },
    { label: "Padrão de Referência", value: analysis.articleInfo.referenceStandard },
    { label: "Condição Alvo", value: analysis.articleInfo.targetCondition },
    { label: "População", value: analysis.articleInfo.population },
    { label: "Tamanho Amostral", value: analysis.articleInfo.sampleSize },
  ];

  doc.setFont("helvetica", "normal");
  for (const item of infoItems) {
    if (y > pageH - 40) break;
    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(margin, y, contentW, 11, 1, 1, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_GREEN);
    doc.text(item.label, margin + 3, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BLACK);
    const valLines = wrap(doc, item.value || "Não informado", contentW - 60);
    doc.text(valLines, margin + 50, y + 4.5);
    y += 13;
  }

  // Objetivo
  if (analysis.articleInfo.objective && y < pageH - 40) {
    y += 3;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_GREEN);
    doc.text("Objetivo:", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BLACK);
    const objLines = wrap(doc, analysis.articleInfo.objective, contentW);
    doc.text(objLines, margin, y);
  }

  addPageFooter(doc, pageW, pageH, page);

  // ─── PÁGINA 2: SOBRE O QUADAS-2 ───────────────────────────────────
  doc.addPage();
  page++;
  addPageHeader(doc, pageW);
  addPageFooter(doc, pageW, pageH, page);

  y = 20;
  doc.setFillColor(...DARK_GREEN);
  doc.rect(margin, y, contentW, 8, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Sobre a Metodologia QUADAS-2", margin + 3, y + 5.5);

  y += 13;
  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const aboutText = [
    "O QUADAS-2 (Quality Assessment of Diagnostic Accuracy Studies - 2) é uma ferramenta revisada para",
    "avaliação da qualidade de estudos de acurácia diagnóstica, desenvolvida por Whiting et al. em 2011.",
    "É amplamente utilizada em revisões sistemáticas de estudos de testes diagnósticos.",
  ];
  doc.text(aboutText, margin, y);
  y += aboutText.length * 4.5 + 5;

  doc.setFont("helvetica", "normal");
  const aboutText2 = [
    "A ferramenta é estruturada em quatro domínios, cada um contendo questões de sinalização que",
    "auxiliam na avaliação do risco de viés e nas preocupações com a aplicabilidade dos resultados.",
  ];
  doc.text(aboutText2, margin, y);
  y += aboutText2.length * 4.5 + 8;

  // Domínios overview
  for (const domain of QUADAS2_DOMAINS) {
    doc.setFillColor(...LIGHT_GREEN);
    doc.roundedRect(margin, y, contentW, 7, 1, 1, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_GREEN);
    doc.text(domain.name, margin + 3, y + 4.8);
    y += 9;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...BLACK);
    const descLines = wrap(doc, domain.description, contentW - 4);
    doc.text(descLines, margin + 3, y);
    y += descLines.length * 4.2 + 2;

    // questões de sinalização
    for (let i = 0; i < domain.signalingQuestions.length; i++) {
      doc.setFillColor(...LIGHT_GRAY);
      doc.roundedRect(margin + 4, y, contentW - 4, 6.5, 1, 1, "F");
      doc.setTextColor(...GREEN);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`Q${i + 1}`, margin + 7, y + 4.2);
      doc.setTextColor(...BLACK);
      doc.setFont("helvetica", "normal");
      const qLines = wrap(doc, domain.signalingQuestions[i], contentW - 18);
      doc.text(qLines, margin + 13, y + 4.2);
      y += qLines.length > 1 ? qLines.length * 4 + 1 : 8;
    }
    y += 4;
  }

  // Referência
  y += 2;
  doc.setFillColor(...DARK_GREEN);
  doc.rect(margin, y, contentW, 7, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Referência Metodológica", margin + 3, y + 4.8);
  y += 10;

  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const refText = `${QUADAS2_REFERENCE.authors} ${QUADAS2_REFERENCE.title}. ${QUADAS2_REFERENCE.journal}. ${QUADAS2_REFERENCE.year};${QUADAS2_REFERENCE.volume}(${QUADAS2_REFERENCE.issue}):${QUADAS2_REFERENCE.pages}. DOI: ${QUADAS2_REFERENCE.doi}`;
  const refLines = wrap(doc, refText, contentW);
  doc.text(refLines, margin, y);
  y += refLines.length * 4.5 + 3;

  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "italic");
  doc.text(QUADAS2_REFERENCE.url, margin, y);

  // ─── PÁGINAS 3+: DOMÍNIOS ─────────────────────────────────────────
  const domainKeys = ["patientSelection", "indexTest", "referenceStandard", "flowAndTiming"] as const;

  for (let di = 0; di < QUADAS2_DOMAINS.length; di++) {
    doc.addPage();
    page++;
    addPageHeader(doc, pageW);
    addPageFooter(doc, pageW, pageH, page);

    const domain = QUADAS2_DOMAINS[di];
    const domainData = analysis.domains[domainKeys[di]] as import("@/types/quadas2").DomainAnalysis;

    y = 20;

    // Cabeçalho do domínio
    doc.setFillColor(...DARK_GREEN);
    doc.rect(margin, y, contentW, 10, "F");
    doc.setTextColor(...WHITE);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(domain.name, margin + 4, y + 6.8);
    y += 14;

    doc.setTextColor(...BLACK);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    const descLines = wrap(doc, domain.description, contentW);
    doc.text(descLines, margin, y);
    y += descLines.length * 4.5 + 6;

    // ── Questões de sinalização ──
    doc.setFillColor(...GREEN);
    doc.rect(margin, y, contentW, 7, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("QUESTÕES DE SINALIZAÇÃO", margin + 3, y + 4.8);
    y += 10;

    for (let qi = 0; qi < domain.signalingQuestions.length; qi++) {
      const sq = domainData.signalingQuestions[qi];
      const aColor = answerColor(sq?.answer ?? "Incerto");

      // Badge de resposta
      doc.setFillColor(...aColor);
      doc.roundedRect(margin, y, 20, 7, 1, 1, "F");
      doc.setTextColor(...WHITE);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(sq?.answer ?? "Incerto", margin + 10, y + 4.8, { align: "center" });

      // Pergunta
      doc.setTextColor(...BLACK);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      const qLines = wrap(doc, `Q${qi + 1}. ${domain.signalingQuestions[qi]}`, contentW - 25);
      doc.text(qLines, margin + 23, y + 4.8);
      y += Math.max(qLines.length * 4.2, 9);

      // Justificativa
      if (sq?.justification) {
        doc.setFillColor(...LIGHT_GRAY);
        const justLines = wrap(doc, sq.justification, contentW - 8);
        const justH = justLines.length * 4 + 5;
        doc.roundedRect(margin + 4, y, contentW - 4, justH, 1, 1, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text(justLines, margin + 7, y + 4);
        y += justH + 3;
      }
      y += 2;
    }

    y += 4;

    // ── Risco de viés ──
    const rb = domainData.riskOfBias;
    const rbColor = riskColor(rb?.rating ?? "Incerto");
    const rbBg = riskBg(rb?.rating ?? "Incerto");

    doc.setFillColor(...GREEN);
    doc.rect(margin, y, contentW, 7, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("RISCO DE VIÉS", margin + 3, y + 4.8);
    y += 10;

    doc.setFillColor(...rbBg);
    doc.roundedRect(margin, y, contentW, 9, 2, 2, "F");
    doc.setFillColor(...rbColor);
    doc.roundedRect(margin, y, 35, 9, 2, 2, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(rb?.rating ?? "Incerto", margin + 17.5, y + 5.8, { align: "center" });

    doc.setTextColor(...BLACK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const rbQ = wrap(doc, domain.riskQuestion, contentW - 42);
    doc.text(rbQ, margin + 38, y + 5.2);
    y += 13;

    if (rb?.justification) {
      doc.setFillColor(...LIGHT_GRAY);
      const jLines = wrap(doc, rb.justification, contentW - 8);
      const jH = jLines.length * 4 + 5;
      doc.roundedRect(margin + 4, y, contentW - 4, jH, 1, 1, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text(jLines, margin + 7, y + 4);
      y += jH + 6;
    }

    // ── Aplicabilidade (domínios 1–3) ──
    if (domain.hasApplicability && domainData.applicabilityConcerns) {
      const ap = domainData.applicabilityConcerns;
      const apColor = riskColor(ap?.rating ?? "Incerto");
      const apBg = riskBg(ap?.rating ?? "Incerto");

      doc.setFillColor(...GREEN);
      doc.rect(margin, y, contentW, 7, "F");
      doc.setTextColor(...WHITE);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("PREOCUPAÇÕES COM APLICABILIDADE", margin + 3, y + 4.8);
      y += 10;

      doc.setFillColor(...apBg);
      doc.roundedRect(margin, y, contentW, 9, 2, 2, "F");
      doc.setFillColor(...apColor);
      doc.roundedRect(margin, y, 35, 9, 2, 2, "F");
      doc.setTextColor(...WHITE);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(ap?.rating ?? "Incerto", margin + 17.5, y + 5.8, { align: "center" });

      doc.setTextColor(...BLACK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const apQ = wrap(doc, domain.applicabilityQuestion ?? "", contentW - 42);
      doc.text(apQ, margin + 38, y + 5.2);
      y += 13;

      if (ap?.justification) {
        doc.setFillColor(...LIGHT_GRAY);
        const jLines = wrap(doc, ap.justification, contentW - 8);
        const jH = jLines.length * 4 + 5;
        doc.roundedRect(margin + 4, y, contentW - 4, jH, 1, 1, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text(jLines, margin + 7, y + 4);
      }
    }
  }

  // ─── ÚLTIMA PÁGINA: SUMÁRIO ────────────────────────────────────────
  doc.addPage();
  page++;
  addPageHeader(doc, pageW);
  addPageFooter(doc, pageW, pageH, page);

  y = 20;
  doc.setFillColor(...DARK_GREEN);
  doc.rect(margin, y, contentW, 10, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo da Avaliação QUADAS-2", margin + 4, y + 6.8);
  y += 14;

  // Tabela resumo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableRows: any[][] = [];

  for (let di = 0; di < QUADAS2_DOMAINS.length; di++) {
    const domain = QUADAS2_DOMAINS[di];
    const data = analysis.domains[domainKeys[di]] as import("@/types/quadas2").DomainAnalysis;
    const rb = data.riskOfBias;
    const ap = data.applicabilityConcerns;

    const rbR = rb?.rating ?? "Incerto";
    const apR = ap?.rating ?? "N/A";

    tableRows.push([
      domain.name,
      {
        content: rbR,
        styles: {
          fillColor: riskBg(rbR),
          textColor: riskColor(rbR),
          fontStyle: "bold" as const,
        },
      },
      {
        content: apR === "N/A" ? "—" : apR,
        styles: {
          fillColor: apR === "N/A" ? [248, 250, 252] : riskBg(apR),
          textColor: apR === "N/A" ? [156, 163, 175] : riskColor(apR),
          fontStyle: "bold" as const,
        },
      },
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [["Domínio", "Risco de Viés", "Aplicabilidade"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: GREEN,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 40, halign: "center" },
      2: { cellWidth: 40, halign: "center" },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Avaliação geral
  doc.setFillColor(...GREEN);
  doc.rect(margin, y, contentW, 8, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("AVALIAÇÃO GERAL", margin + 3, y + 5.5);
  y += 12;

  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const oaLines = wrap(doc, analysis.overallAssessment, contentW);
  doc.text(oaLines, margin, y);
  y += oaLines.length * 4.5 + 8;

  // Relevância clínica
  doc.setFillColor(...GREEN);
  doc.rect(margin, y, contentW, 8, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("RELEVÂNCIA CLÍNICA", margin + 3, y + 5.5);
  y += 12;

  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const crLines = wrap(doc, analysis.clinicalRelevance, contentW);
  doc.text(crLines, margin, y);
  y += crLines.length * 4.5 + 8;

  // Rodapé de referência
  doc.setFillColor(...LIGHT_GREEN);
  doc.roundedRect(margin, y, contentW, 18, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK_GREEN);
  doc.text("Metodologia utilizada:", margin + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...BLACK);
  const refShort = `${QUADAS2_REFERENCE.authors} ${QUADAS2_REFERENCE.title}.`;
  const refShortLines = wrap(doc, refShort, contentW - 8);
  doc.text(refShortLines, margin + 4, y + 11);
  doc.setTextColor(...GREEN);
  doc.text(`${QUADAS2_REFERENCE.journal}. ${QUADAS2_REFERENCE.year};${QUADAS2_REFERENCE.volume}(${QUADAS2_REFERENCE.issue}):${QUADAS2_REFERENCE.pages}. DOI: ${QUADAS2_REFERENCE.doi}`, margin + 4, y + 16);

  const safeName = articleFileName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  doc.save(`quadas2_${safeName}_${new Date().toISOString().split("T")[0]}.pdf`);
}
