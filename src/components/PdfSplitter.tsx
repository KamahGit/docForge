import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Scissors, Upload, Download, FileText } from 'lucide-react';

export default function PdfSplitter() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [pdfName, setPdfName] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [splitMode, setSplitMode] = useState<'extract' | 'range' | 'all'>('extract');
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPdf = async (file: File) => {
    const data = await file.arrayBuffer();
    try {
      const pdf = await PDFDocument.load(data);
      const count = pdf.getPageCount();
      setPdfData(data);
      setPdfName(file.name);
      setPageCount(count);
      setSelectedPages(new Set());
      setRangeStart(1);
      setRangeEnd(count);
    } catch {
      alert('Failed to read PDF file.');
    }
  };

  const togglePage = (page: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedPages(new Set(Array.from({ length: pageCount }, (_, i) => i + 1)));
  };

  const deselectAll = () => {
    setSelectedPages(new Set());
  };

  const extractPages = async () => {
    if (!pdfData) return;
    setProcessing(true);
    try {
      let pagesToExtract: number[] = [];

      if (splitMode === 'extract') {
        pagesToExtract = Array.from(selectedPages).sort((a, b) => a - b);
      } else if (splitMode === 'range') {
        const start = Math.max(1, rangeStart);
        const end = Math.min(pageCount, rangeEnd);
        pagesToExtract = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      } else {
        pagesToExtract = Array.from({ length: pageCount }, (_, i) => i + 1);
      }

      if (pagesToExtract.length === 0) {
        alert('No pages selected.');
        setProcessing(false);
        return;
      }

      const srcDoc = await PDFDocument.load(pdfData);
      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(srcDoc, pagesToExtract.map((p) => p - 1));
      pages.forEach((page) => newDoc.addPage(page));

      const bytes = await newDoc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfName.replace('.pdf', '')}-extracted.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    }
    setProcessing(false);
  };

  const splitAll = async () => {
    if (!pdfData) return;
    setProcessing(true);
    try {
      const srcDoc = await PDFDocument.load(pdfData);
      for (let i = 0; i < srcDoc.getPageCount(); i++) {
        const newDoc = await PDFDocument.create();
        const [page] = await newDoc.copyPages(srcDoc, [i]);
        newDoc.addPage(page);
        const bytes = await newDoc.save();
        const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pdfName.replace('.pdf', '')}-page-${i + 1}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    }
    setProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Scissors className="w-5 h-5 text-emerald-400" />
          PDF Splitter
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Extract specific pages or split a PDF into individual page files.
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
          <div className="space-y-6">
            {/* File info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-white flex-1">{pdfName}</span>
              <span className="text-xs text-gray-400">{pageCount} pages</span>
              <button
                onClick={() => { setPdfData(null); setPdfName(''); setPageCount(0); }}
                className="text-xs text-gray-500 hover:text-red-400"
              >
                Remove
              </button>
            </div>

            {/* Mode selector */}
            <div className="flex gap-2">
              {[
                { id: 'extract' as const, label: 'Extract Pages' },
                { id: 'range' as const, label: 'Page Range' },
                { id: 'all' as const, label: 'Split All' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSplitMode(mode.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    splitMode === mode.id
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-200'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Extract mode */}
            {splitMode === 'extract' && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <button onClick={selectAll} className="text-xs text-emerald-400 hover:underline">Select All</button>
                  <button onClick={deselectAll} className="text-xs text-gray-500 hover:underline">Deselect All</button>
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-2 max-h-64 overflow-y-auto p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => togglePage(page)}
                      className={`aspect-square rounded-lg text-sm font-medium flex items-center justify-center transition-all ${
                        selectedPages.has(page)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">{selectedPages.size} pages selected</p>
              </div>
            )}

            {/* Range mode */}
            {splitMode === 'range' && (
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-300">From:</label>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={rangeStart}
                  onChange={(e) => setRangeStart(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
                <label className="text-sm text-gray-300">To:</label>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-gray-500">
                  ({Math.max(0, Math.min(rangeEnd, pageCount) - Math.max(1, rangeStart) + 1)} pages)
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {splitMode !== 'all' ? (
                <button
                  onClick={extractPages}
                  disabled={processing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {processing ? 'Processing...' : 'Extract Pages'}
                </button>
              ) : (
                <button
                  onClick={splitAll}
                  disabled={processing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {processing ? 'Processing...' : `Split into ${pageCount} files`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
