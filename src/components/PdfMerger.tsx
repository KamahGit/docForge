import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Merge, Upload, Download, X, GripVertical } from 'lucide-react';

interface PdfFile {
  id: string;
  name: string;
  data: ArrayBuffer;
  pageCount: number;
}

export default function PdfMerger() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (fileList: FileList) => {
    const newFiles: PdfFile[] = [];
    for (const file of Array.from(fileList)) {
      if (file.type !== 'application/pdf') continue;
      const data = await file.arrayBuffer();
      try {
        const pdf = await PDFDocument.load(data);
        newFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          data,
          pageCount: pdf.getPageCount(),
        });
      } catch {
        alert(`Failed to read: ${file.name}`);
      }
    }
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      alert('Please add at least 2 PDF files to merge.');
      return;
    }
    setMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const pdf = await PDFDocument.load(file.data);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const bytes = await mergedPdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged-document.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error merging PDFs: ' + (err as Error).message);
    }
    setMerging(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Merge className="w-5 h-5 text-emerald-400" />
          PDF Merger
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Combine multiple PDF files into a single document. Drag to reorder.
        </p>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
        >
          <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-300 font-medium">Drop PDF files here or click to browse</p>
          <p className="text-xs text-gray-500 mt-1">Supports multiple files</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">
                {files.length} file{files.length !== 1 ? 's' : ''} •{' '}
                {files.reduce((sum, f) => sum + f.pageCount, 0)} total pages
              </span>
              <button
                onClick={() => setFiles([])}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            </div>

            {files.map((file, index) => (
              <div
                key={file.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index.toString());
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(index);
                }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  if (fromIndex !== index) moveFile(fromIndex, index);
                  setDragOverIndex(null);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  dragOverIndex === index
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                <span className="text-xs text-gray-500 font-mono w-6">#{index + 1}</span>
                <span className="flex-1 text-sm text-white truncate">{file.name}</span>
                <span className="text-xs text-gray-500">{file.pageCount} pg</span>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Merge button */}
        {files.length >= 2 && (
          <button
            onClick={mergePdfs}
            disabled={merging}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {merging ? 'Merging...' : `Merge ${files.length} PDFs`}
          </button>
        )}
      </div>
    </div>
  );
}
