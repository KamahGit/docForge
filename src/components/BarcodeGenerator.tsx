import { useState, useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { Barcode, Download, Copy } from 'lucide-react';

const barcodeFormats = [
  { value: 'CODE128', label: 'Code 128', example: 'DOC-2024-001' },
  { value: 'CODE39', label: 'Code 39', example: 'ABC123' },
  { value: 'EAN13', label: 'EAN-13', example: '5901234123457' },
  { value: 'EAN8', label: 'EAN-8', example: '96385074' },
  { value: 'UPC', label: 'UPC-A', example: '123456789012' },
  { value: 'ITF14', label: 'ITF-14', example: '12345678901231' },
  { value: 'MSI', label: 'MSI', example: '123456' },
  { value: 'pharmacode', label: 'Pharmacode', example: '1234' },
  { value: 'codabar', label: 'Codabar', example: 'A12345B' },
];

export default function BarcodeGenerator() {
  const [format, setFormat] = useState('CODE128');
  const [value, setValue] = useState('DOC-2024-001');
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(80);
  const [showText, setShowText] = useState(true);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [lineColor, setLineColor] = useState('#000000');
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    try {
      JsBarcode(canvasRef.current, value, {
        format,
        width,
        height,
        displayValue: showText,
        background: bgColor,
        lineColor,
        margin: 10,
        fontSize: 14,
        font: 'monospace',
      });
      setError('');
    } catch (err) {
      setError((err as Error).message || 'Invalid barcode value for selected format');
    }
  }, [value, format, width, height, showText, bgColor, lineColor]);

  const downloadBarcode = (fmt: 'png' | 'svg') => {
    if (!canvasRef.current || error) return;
    if (fmt === 'png') {
      const url = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `barcode-${value}.png`;
      a.click();
    } else {
      // Generate SVG from canvas data
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const img = canvasRef.current;
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}">
        <image href="${dataUrl}" width="${img.width}" height="${img.height}"/>
      </svg>`;
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barcode-${value}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Barcode className="w-5 h-5 text-emerald-400" />
          Barcode Generator
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Generate barcodes in 9+ formats. Download as PNG or SVG.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Barcode Format</label>
              <select
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value);
                  const fmt = barcodeFormats.find((f) => f.value === e.target.value);
                  if (fmt) setValue(fmt.example);
                }}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {barcodeFormats.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Value</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bar Width</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.5}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <span className="text-xs text-gray-500">{width}px</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Height</label>
                <input
                  type="range"
                  min={30}
                  max={200}
                  step={10}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <span className="text-xs text-gray-500">{height}px</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs text-gray-500 font-mono">{bgColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Line Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs text-gray-500 font-mono">{lineColor}</span>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showText}
                onChange={(e) => setShowText(e.target.checked)}
                className="rounded bg-gray-800 border-gray-700 text-emerald-500"
              />
              Show text below barcode
            </label>

            {/* Download buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => downloadBarcode('png')}
                disabled={!!error}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                PNG
              </button>
              <button
                onClick={() => downloadBarcode('svg')}
                disabled={!!error}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                SVG
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
            <div className="rounded-xl bg-white p-6 flex items-center justify-center min-h-[200px] border border-gray-700">
              {error ? (
                <p className="text-red-500 text-sm text-center">{error}</p>
              ) : (
                <canvas ref={canvasRef} />
              )}
            </div>
            {!error && (
              <p className="text-xs text-gray-500 mt-2">
                Format: {barcodeFormats.find((f) => f.value === format)?.label} • Value: {value}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
