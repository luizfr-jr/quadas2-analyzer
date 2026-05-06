"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export default function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      setFileName(file.name);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: isLoading,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
        ${isDragActive ? "border-brand-500 bg-brand-50 scale-[1.01]" : "border-brand-300 bg-white hover:border-brand-500 hover:bg-brand-50"}
        ${isLoading ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-3">
        <div className={`p-4 rounded-full ${isDragActive ? "bg-brand-100" : "bg-brand-50"} transition-colors`}>
          <svg
            className={`w-10 h-10 ${isDragActive ? "text-brand-600" : "text-brand-400"} transition-colors`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {fileName ? (
          <div>
            <p className="font-semibold text-brand-700 text-lg">{fileName}</p>
            <p className="text-sm text-brand-500 mt-1">
              {isLoading ? "Analisando..." : "Clique ou arraste outro arquivo para substituir"}
            </p>
          </div>
        ) : (
          <div>
            <p className="font-semibold text-gray-700 text-lg">
              {isDragActive ? "Solte o PDF aqui" : "Arraste o PDF do artigo aqui"}
            </p>
            <p className="text-sm text-gray-500 mt-1">ou clique para selecionar</p>
            <p className="text-xs text-gray-400 mt-2">PDF • Máximo 10 MB</p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-brand-600 font-medium">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Aplicando QUADAS-2...
          </div>
        )}
      </div>
    </div>
  );
}
