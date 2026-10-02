import { useState } from 'react';
import Dashboard from './components/Dashboard';
import PdfGenerator from './components/PdfGenerator';
import PdfMerger from './components/PdfMerger';
import PdfSplitter from './components/PdfSplitter';
import BarcodeGenerator from './components/BarcodeGenerator';
import ImageToPdf from './components/ImageToPdf';
import PdfPageOrganizer from './components/PdfPageOrganizer';
import {
  FileText,
  Merge,
  Scissors,
  Barcode,
  Image,
  Layers,
  Home,
  Server,
  Menu,
  X,
} from 'lucide-react';

type Tool = 'dashboard' | 'generator' | 'merger' | 'splitter' | 'barcode' | 'image2pdf' | 'organizer';

const tools = [
  { id: 'dashboard' as Tool, label: 'Dashboard', icon: Home },
  { id: 'generator' as Tool, label: 'PDF Generator', icon: FileText },
  { id: 'merger' as Tool, label: 'PDF Merger', icon: Merge },
  { id: 'splitter' as Tool, label: 'PDF Splitter', icon: Scissors },
  { id: 'barcode' as Tool, label: 'Barcode Generator', icon: Barcode },
  { id: 'image2pdf' as Tool, label: 'Image → PDF', icon: Image },
  { id: 'organizer' as Tool, label: 'Page Organizer', icon: Layers },
];

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderTool = () => {
    switch (activeTool) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTool} />;
      case 'generator': return <PdfGenerator />;
      case 'merger': return <PdfMerger />;
      case 'splitter': return <PdfSplitter />;
      case 'barcode': return <BarcodeGenerator />;
      case 'image2pdf': return <ImageToPdf />;
      case 'organizer': return <PdfPageOrganizer />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <Server className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">DocForge</h1>
              <p className="text-xs text-gray-400">Self-Hosted SDK</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {tool.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">All processing runs locally</p>
            <p className="text-xs text-emerald-400 font-medium">🔒 No data leaves your server</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-gray-800 flex items-center px-4 lg:px-6 gap-4 bg-gray-900/50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-gray-200">
            {tools.find((t) => t.id === activeTool)?.label || 'Dashboard'}
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              v1.0.0
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderTool()}
        </div>
      </main>
    </div>
  );
}
