import React, { useState, useRef, useCallback } from 'react';
import { AssetType, ProjectState, TextLayer } from './types';
import { generateBackground, generateSvgIcon, suggestLayout } from './services/geminiService';
import Canvas from './components/Canvas';
import ControlPanel from './components/ControlPanel';
import Header from './components/Header';
import { Loader2, Download, RefreshCw, LayoutTemplate } from 'lucide-react';

// Factory function to ensure fresh state objects
const getInitialState = (): ProjectState => ({
  assetType: AssetType.POSTER,
  brief: '',
  width: 800,
  height: 1000,
  background: null,
  textLayers: [],
  isGenerating: false,
  isAnalyzing: false,
  svgContent: null,
});

export default function App() {
  const [project, setProject] = useState<ProjectState>(getInitialState());
  const [error, setError] = useState<string | null>(null);

  const calculatePixelFontSize = (width: number, height: number, percent: number) => {
    const baseDimension = Math.min(width, height);
    return Math.max(12, Math.floor(baseDimension * (percent / 100)));
  };

  const handleReset = () => {
    if (window.confirm("Start a new project? Current artwork will be cleared.")) {
      setProject(prev => ({
        ...getInitialState(),
        // Preserve user's current configuration preferences
        assetType: prev.assetType,
        width: prev.width,
        height: prev.height,
        // Clear brief and content
        brief: '',
        background: null,
        svgContent: null,
        textLayers: []
      }));
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!project.brief) {
      setError("Please enter a brief description.");
      return;
    }
    setError(null);
    setProject(prev => ({ ...prev, isGenerating: true, background: null, svgContent: null, textLayers: [] }));

    try {
      if (project.assetType === AssetType.ICON || project.assetType === AssetType.LOGO) {
        // SVG Generation Flow
        const svgCode = await generateSvgIcon(project.brief, project.assetType);
        setProject(prev => ({
          ...prev,
          svgContent: svgCode,
          isGenerating: false,
          textLayers: []
        }));
      } else {
        // Image + Layout Flow
        const imageBase64 = await generateBackground(project.brief, project.assetType);
        
        setProject(prev => ({ 
          ...prev, 
          background: imageBase64,
          isGenerating: false,
          isAnalyzing: true 
        }));

        // Chain layout analysis
        const layoutSuggestion = await suggestLayout(imageBase64, project.brief, project.assetType);
        
        setProject(prev => ({
          ...prev,
          isAnalyzing: false,
          textLayers: layoutSuggestion.textLayers.map(layer => ({
            ...layer,
            id: crypto.randomUUID(),
            fontSizePct: layer.fontSize,
            fontSize: calculatePixelFontSize(prev.width, prev.height, layer.fontSize),
            boxWidth: layer.boxWidth || 80,
            x: layer.x, 
            y: layer.y,
            verticalAlign: layer.verticalAlign || 'center'
          }))
        }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate content.");
      setProject(prev => ({ ...prev, isGenerating: false, isAnalyzing: false }));
    }
  };

  const handleRegenerateLayout = async () => {
    if (!project.background) return;
    setProject(prev => ({ ...prev, isAnalyzing: true }));
    try {
      const layoutSuggestion = await suggestLayout(project.background, project.brief, project.assetType);
      setProject(prev => ({
        ...prev,
        isAnalyzing: false,
        textLayers: layoutSuggestion.textLayers.map(layer => ({
          ...layer,
          id: crypto.randomUUID(),
          fontSizePct: layer.fontSize,
          fontSize: calculatePixelFontSize(project.width, project.height, layer.fontSize),
          boxWidth: layer.boxWidth || 80,
          verticalAlign: layer.verticalAlign || 'center'
        }))
      }));
    } catch (err: any) {
      setError("Failed to regenerate layout.");
      setProject(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    setProject(prev => ({
      ...prev,
      textLayers: prev.textLayers.map(layer => layer.id === id ? { ...layer, ...updates } : layer)
    }));
  };

  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: crypto.randomUUID(),
      text: "New Text",
      x: 50,
      y: 50,
      color: "#ffffff",
      fontSize: 24,
      fontSizePct: 3,
      fontFamily: "Inter",
      fontWeight: "bold",
      align: "center",
      verticalAlign: "center",
      boxWidth: 80
    };
    setProject(prev => ({ ...prev, textLayers: [...prev.textLayers, newLayer] }));
  };

  const removeTextLayer = (id: string) => {
    setProject(prev => ({
      ...prev,
      textLayers: prev.textLayers.filter(l => l.id !== id)
    }));
  };

  const handleDownload = async () => {
    try {
      if (project.assetType === AssetType.ICON || project.assetType === AssetType.LOGO) {
        if (!project.svgContent) return;
        const blob = new Blob([project.svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `genstudio-${project.assetType.toLowerCase()}-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Poster / Slide - Render to Canvas
        if (!project.background) return;

        const canvas = document.createElement('canvas');
        canvas.width = project.width;
        canvas.height = project.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Draw Background
        const img = new Image();
        img.src = project.background;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
        ctx.drawImage(img, 0, 0, project.width, project.height);

        // 2. Draw Text Layers
        project.textLayers.forEach(layer => {
            ctx.save();
            ctx.fillStyle = layer.color;
            ctx.font = `${layer.fontWeight === 'bold' ? 'bold' : layer.fontWeight === '300' ? '300' : 'normal'} ${layer.fontSize}px ${layer.fontFamily}, sans-serif`;
            ctx.textAlign = layer.align;
            ctx.textBaseline = 'top'; // handle vertical manually for multiline

            const x = (layer.x / 100) * project.width;
            let y = (layer.y / 100) * project.height;
            const maxWidth = (layer.boxWidth / 100) * project.width;

            // Simple line wrapping
            const words = layer.text.split(' ');
            let line = '';
            const lines = [];
            
            for(let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);

            const lineHeight = layer.fontSize * 1.3;
            const totalHeight = lines.length * lineHeight;

            // Adjust Y for anchor point
            if (layer.verticalAlign === 'center') {
                y -= totalHeight / 2;
            } else if (layer.verticalAlign === 'bottom') {
                y -= totalHeight;
            }
            // if top, y stays as is

            lines.forEach((l, i) => {
                // Adjust X for alignment
                let drawX = x;
                if (layer.align === 'left') {
                    // x is left edge
                    drawX = x;
                } else if (layer.align === 'right') {
                    // x is right edge
                    drawX = x; 
                } else {
                    // x is center
                    drawX = x;
                }
                ctx.fillText(l.trim(), drawX, y + (i * lineHeight));
            });

            ctx.restore();
        });

        // 3. Download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `genstudio-${project.assetType.toLowerCase()}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error("Download failed", e);
      setError("Failed to download image.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-gray-100 overflow-hidden">
      <Header />
      
      <main className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Controls */}
        <aside className="w-80 flex-shrink-0 border-r border-gray-800 bg-gray-900 overflow-y-auto z-10 custom-scrollbar">
          <ControlPanel 
            project={project} 
            setProject={setProject} 
            onGenerate={handleGenerate}
            onAddText={addTextLayer}
            onReset={handleReset}
            error={error}
          />
        </aside>

        {/* Canvas Area */}
        <section className="flex-1 relative bg-gray-950 flex flex-col items-center justify-center p-8 overflow-hidden">
           {/* Toolbar for quick actions */}
           <div className="absolute top-4 right-4 flex gap-2 z-20">
              {(project.background && !project.isAnalyzing) && (
                <button 
                  onClick={handleRegenerateLayout}
                  className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-md shadow-lg border border-gray-700 flex items-center gap-2 text-sm transition-colors"
                  title="Regenerate Layout Only"
                >
                  <LayoutTemplate size={16} />
                  <span>Remix Layout</span>
                </button>
              )}
              
              {(project.background || project.svgContent) && !project.isGenerating && (
                 <button 
                    onClick={handleDownload}
                    className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-md shadow-lg flex items-center gap-2 text-sm transition-colors font-medium"
                    title="Download Asset"
                 >
                    <Download size={16} />
                    <span>Download</span>
                 </button>
              )}
           </div>

           <div className="relative shadow-2xl shadow-black/50 transition-all duration-300">
             <Canvas 
               project={project} 
               onUpdateLayer={updateTextLayer}
               onRemoveLayer={removeTextLayer}
             />
             
             {/* Loading Overlays */}
             {project.isGenerating && (
               <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-md">
                 <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                 <p className="text-blue-200 font-medium">Generating pixels...</p>
               </div>
             )}
             
             {project.isAnalyzing && (
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-md">
                 <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                 <p className="text-purple-200 font-medium">Analyzing composition...</p>
               </div>
             )}
           </div>

           {/* Empty State / Hints */}
           {!project.background && !project.svgContent && !project.isGenerating && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="text-gray-600 text-center max-w-md p-6 border-2 border-dashed border-gray-800 rounded-xl">
                 <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="text-gray-500" />
                 </div>
                 <h3 className="text-xl font-semibold mb-2">Ready to Create</h3>
                 <p>Select an asset type and enter a brief to start generating your design.</p>
               </div>
             </div>
           )}
        </section>
      </main>
    </div>
  );
}