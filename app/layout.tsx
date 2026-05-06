import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QUADAS-2 Analyzer",
  description:
    "Avaliação de qualidade de estudos de acurácia diagnóstica pela metodologia QUADAS-2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-brand-50 font-sans antialiased">
        {/* Header */}
        <header className="bg-brand-900 shadow-lg">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-brand-500 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-none">QUADAS-2 Analyzer</h1>
                <p className="text-brand-300 text-xs leading-tight mt-0.5">
                  Avaliação de Qualidade de Estudos de Acurácia Diagnóstica
                </p>
              </div>
            </div>
            <a
              href="https://www.acpjournals.org/doi/10.7326/0003-4819-155-8-201110180-00009"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-brand-300 hover:text-white text-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Whiting et al., 2011
            </a>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

        <footer className="mt-12 border-t border-brand-100 bg-white">
          <div className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
            Baseado em: Whiting PF, et al. QUADAS-2: A Revised Tool for the Quality Assessment of
            Diagnostic Accuracy Studies.{" "}
            <em>Ann Intern Med.</em> 2011;155(8):529-536.
          </div>
        </footer>
      </body>
    </html>
  );
}
