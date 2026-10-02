import { useState, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { Layers, Upload, Download, RotateCw, Trash2, GripVertical } from 'lucide-react';

interface PageItem {
  index: number;
  rotation: number;
}

export default function PdfPageOrganizer() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [pdfName, setPdfName] = useState('');
  const [pages, setPages] = useState<PageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPdf = async (file: File) => {
    const data = await file.arrayBuffer();
    try {
      const pdf = await PDFDocument.load(data);
      const count = pdf.getPageCount();
      setPdfData(data);
      setPdfName(file.name);
      setPages(Array.from({ length: count }, (_, i) => ({ index: i, rotation: 0 })));
    } catch {
      alert('Failed to read PDF file.');
    }
  };

  const rotatePage = (pageIndex: number) => {
    setPages((prev) =>
      prev.map((p, i) =>
        i === pageIndex ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
  };

  const rotateAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 })));
  };

  const deletePage = (pageIndex: number) => {
    setPages((prev) => prev.filter((_, i) => i !== pageIndex));
  };

  const movePage = (fromIndex: number, toIndex: number) => {
    setPages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const applyChanges = async () => {
    if (!pdfData || pages.length === 0) return;
    setProcessing(true);
    try {
      const srcDoc = await PDFDocument.load(pdfData);
      const newDoc = await PDFDocument.create();

      for (const page of pages) {
        const [copiedPage] = await newDoc.copyPages(srcDoc, [page.index]);
        copiedPage.setRotation(degrees(page.rotation));
        newDoc.addPage(copiedPage);
      }

      const bytes = await newDoc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfName.replace('.pdf', '')}-organized.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    }
    setProcessing(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          PDF Page Organizer
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Reorder, rotate, and delete pages within your PDF document.
        </p>

        {!pdfData ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
          >
            <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-300 font-medium">Drop a PDF file here or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files && loadPdf(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {pdfName} • {pages.length} page{pages.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={rotateAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Rotate All
                </button>
                <button
                  onClick={() => { setPdfData(null); setPdfName(''); setPages([]); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors"
                >
                  Load Different PDF
                </button>
              </div>
            </div>

            {/* Pages grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[500px] overflow-y-auto p-3 rounded-lg bg-gray-800/30 border border-gray-700">
              {pages.map((page, index) => (
                <div
                  key={`${page.index}-${index}`}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIndex(index);
                  }}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    if (fromIndex !== index) movePage(fromIndex, index);
                    setDragOverIndex(null);
                  }}
                  className={`relative group rounded-lg border-2 transition-all ${
                    dragOverIndex === index
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  {/* Page preview placeholder */}
                  <div
                    className="aspect-[3/4] flex items-center justify-center rounded"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                  >
                    <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-500">{page.index + 1}</span>
                    </div>
                  </div>

                  {/* Overlay controls */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => rotatePage(index)}
                      className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deletePage(index)}
                      className="p-1.5 rounded-full bg-red-500/60 hover:bg-red-500/80 text-white transition-colors"
                      title="Delete page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Drag handle */}
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-3.5 h-3.5 text-white/60" />
                  </div>

                  {/* Page number badge */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-medium">
                    P{index + 1}
                  </div>

                  {/* Rotation indicator */}
                  {page.rotation !== 0 && (
                    <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-amber-500/80 text-[9px] text-white font-medium">
                      {page.rotation}°
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary & Apply */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500">
                Drag pages to reorder • Hover to rotate or delete
              </p>
              <button
                onClick={applyChanges}
                disabled={processing || pages.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {processing ? 'Processing...' : 'Apply & Download'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
