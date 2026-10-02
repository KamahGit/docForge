import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { Image, Upload, Download, X, GripVertical } from 'lucide-react';

interface ImageFile {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

export default function ImageToPdf() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('fit');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState(10);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = async (fileList: FileList) => {
    const newImages: ImageFile[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const dims = await getImageDimensions(dataUrl);
      newImages.push({
        id: crypto.randomUUID(),
        name: file.name,
        dataUrl,
        width: dims.width,
        height: dims.height,
      });
    }
    setImages((prev) => [...prev, ...newImages]);
  };

  const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = dataUrl;
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    try {
      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: pageSize === 'fit' ? 'a4' : pageSize,
      });

      for (let i = 0; i < images.length; i++) {
        if (i > 0) doc.addPage();

        const img = images[i];

        if (pageSize === 'fit') {
          // Set page size to match image
          const imgWidthMm = img.width * 0.264583; // px to mm at 96dpi
          const imgHeightMm = img.height * 0.264583;
          (doc.internal.pageSize as any).width = imgWidthMm;
          (doc.internal.pageSize as any).height = imgHeightMm;
          doc.addImage(img.dataUrl, 'JPEG', 0, 0, imgWidthMm, imgHeightMm);
        } else {
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const availWidth = pageWidth - margin * 2;
          const availHeight = pageHeight - margin * 2;

          const imgRatio = img.width / img.height;
          const pageRatio = availWidth / availHeight;

          let drawWidth: number, drawHeight: number;
          if (imgRatio > pageRatio) {
            drawWidth = availWidth;
            drawHeight = availWidth / imgRatio;
          } else {
            drawHeight = availHeight;
            drawWidth = availHeight * imgRatio;
          }

          const x = margin + (availWidth - drawWidth) / 2;
          const y = margin + (availHeight - drawHeight) / 2;

          doc.addImage(img.dataUrl, 'JPEG', x, y, drawWidth, drawHeight);
        }
      }

      doc.save('images-to-pdf.pdf');
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    }
    setProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Image className="w-5 h-5 text-emerald-400" />
          Image to PDF Converter
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Convert JPG, PNG, and other images to a single PDF document.
        </p>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
        >
          <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-300 font-medium">Drop images here or click to browse</p>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, WebP supported</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addImages(e.target.files)}
          />
        </div>

        {/* Settings */}
        {images.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="a4">A4</option>
                  <option value="letter">Letter</option>
                  <option value="fit">Fit to Image</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Margin (mm)</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Image thumbnails */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{images.length} image{images.length !== 1 ? 's' : ''}</span>
                <button
                  onClick={() => setImages([])}
                  className="text-xs text-gray-500 hover:text-red-400"
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                      if (fromIndex !== index) moveImage(fromIndex, index);
                    }}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-gray-700 bg-gray-800"
                  >
                    <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <button
                        onClick={() => removeImage(img.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full bg-red-500/80 text-white transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                      #{index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={generatePdf}
              disabled={processing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {processing ? 'Generating...' : `Generate PDF (${images.length} images)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
