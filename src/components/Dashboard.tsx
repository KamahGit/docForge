import {
  FileText,
  Merge,
  Scissors,
  Barcode,
  Image,
  Layers,
  Shield,
  Zap,
  HardDrive,
  ArrowRight,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tool: any) => void;
}

const toolCards = [
  {
    id: 'generator',
    title: 'PDF Generator',
    description: 'Create PDFs from text with custom fonts, headers, and formatting',
    icon: FileText,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'merger',
    title: 'PDF Merger',
    description: 'Combine multiple PDF files into a single document',
    icon: Merge,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'splitter',
    title: 'PDF Splitter',
    description: 'Extract pages or split PDFs into individual files',
    icon: Scissors,
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'barcode',
    title: 'Barcode Generator',
    description: 'Generate Code128, EAN, UPC, Code39, and more barcode types',
    icon: Barcode,
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'image2pdf',
    title: 'Image → PDF',
    description: 'Convert JPG, PNG, and other images to PDF documents',
    icon: Image,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'organizer',
    title: 'Page Organizer',
    description: 'Reorder, rotate, and delete pages within PDF documents',
    icon: Layers,
    color: 'from-amber-500 to-orange-600',
  },
];

const features = [
  { icon: Shield, title: '100% Private', desc: 'All processing happens in-browser. Zero data leaves your machine.' },
  { icon: Zap, title: 'Zero Dependencies', desc: 'No API keys, no rate limits, no monthly fees. Ever.' },
  { icon: HardDrive, title: 'Self-Hosted', desc: 'Deploy on your own server. Full control over your infrastructure.' },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Bytescout SDK Replacement
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Your Own Document Processing SDK
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            A free, self-hosted replacement for Bytescout SDK. Generate PDFs, merge documents,
            create barcodes, and more — all running locally on your server with zero external dependencies.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <Icon className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Tool Cards */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolCards.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onNavigate(tool.id)}
                className="group text-left bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all hover:shadow-lg hover:shadow-black/20"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                  {tool.title}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-400" />
                </h3>
                <p className="text-sm text-gray-400">{tool.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Built With Open Source Libraries</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { name: 'pdf-lib', desc: 'PDF creation & modification' },
            { name: 'jsPDF', desc: 'Advanced PDF generation' },
            { name: 'JsBarcode', desc: 'Barcode generation (30+ formats)' },
            { name: 'fontkit', desc: 'Custom font embedding' },
          ].map((lib) => (
            <div
              key={lib.name}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm">
                <span className="text-white font-medium">{lib.name}</span>
                <span className="text-gray-500 ml-2">{lib.desc}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
