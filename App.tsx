import React, { useState, useRef, useEffect } from 'react';
import { AssetType, ProjectState, TextLayer } from './types';
import { generateBackground, generateSvgIcon, suggestLayout } from './services/geminiService';
import Canvas from './components/Canvas';
import ControlPanel from './components/ControlPanel';
import Header from './components/Header';
import { 
  Loader2, Download, RefreshCw, LayoutTemplate, 
  MousePointer2, ZoomIn, ZoomOut, Maximize 
} from 'lucide-react';

const getInitialState = (): ProjectState => ({
  assetType: AssetType.POSTER,
  brief: '',
  width: 1080,
  height: 1350,
  background: null,
  textLayers: [],
  isGenerating: false,
  isAnalyzing: false,
  svgContent: null,
});

export default function App() {
  const [project, setProject] = useState<ProjectState>(getInitialState());
  const [error, setError] = useState<string | null>(null);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Zoom State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFitToScreen, setIsFitToScreen] = useState<boolean>(true);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Apply theme class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Monitor viewport size for "Fit to Screen" calculation
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Calculate effective scale
  const getEffectiveScale = () => {
    if (isFitToScreen && viewportSize.width > 0 && viewportSize.height > 0) {
      const padding = 80; // Space around canvas
      const availableW = Math.max(0, viewportSize.width - padding);
      const availableH = Math.max(0, viewportSize.height - padding);
      
      // Limit fit scale to 1 (100%) so small images don't look blurry, 
      // unless users want to see it huge, but generally fit = see whole thing.
      return Math.min(scaleX, scaleY, 1); 
      
      var scaleX = availableW / project.width;
      var scaleY = availableH / project.height;
      return Math.min(scaleX, scaleY, 1);
    }
    return zoomLevel;
  };

  const currentScale = getEffectiveScale();

  const handleZoomIn = () => {
    setIsFitToScreen(false);
    setZoomLevel(prev => Math.min(prev + 0.1, 3.0)); // Max 300%
  };

  const handleZoomOut = () => {
    setIsFitToScreen(false);
    setZoomLevel(prev => Math.max(prev - 0.1, 0.1)); // Min 10%
  };

  const handleFitToScreen = () => {
    setIsFitToScreen(true);
  };

  const calculatePixelFontSize = (width: number, height: number, percent: number) => {
    const baseDimension = Math.min(width, height);
    return Math.max(12, Math.floor(baseDimension * (percent / 100)));
  };

  const handleReset = () => {
    if (window.confirm("Start a new project? Current artwork will be cleared.")) {
      setProject(prev => ({
        ...getInitialState(),
        assetType: prev.assetType,
        width: prev.width,
        height: prev.height,
        brief: '',
        background: null,
        svgContent: null,
        textLayers: []
      }));
      setError(null);
      setIsFitToScreen(true);
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
        const svgCode = await generateSvgIcon(project.brief, project.assetType);
        setProject(prev => ({
          ...prev,
          svgContent: svgCode,
          isGenerating: false,
          textLayers: []
        }));
      } else {
        const imageBase64 = await generateBackground(project.brief, project.assetType);
        
        setProject(prev => ({ 
          ...prev, 
          background: imageBase64,
          isGenerating: false,
          isAnalyzing: true 
        }));

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
        if (!project.background) return;

        const canvas = document.createElement('canvas');
        canvas.width = project.width;
        canvas.height = project.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = project.background;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
        ctx.drawImage(img, 0, 0, project.width, project.height);

        project.textLayers.forEach(layer => {
            ctx.save();
            ctx.fillStyle = layer.color;
            ctx.font = `${layer.fontWeight === 'bold' ? 'bold' : layer.fontWeight === '300' ? '300' : 'normal'} ${layer.fontSize}px ${layer.fontFamily}, sans-serif`;
            ctx.textAlign = layer.align;
            ctx.textBaseline = 'top';

            const x = (layer.x / 100) * project.width;
            let y = (layer.y / 100) * project.height;
            const maxWidth = (layer.boxWidth / 100) * project.width;

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

            if (layer.verticalAlign === 'center') {
                y -= totalHeight / 2;
            } else if (layer.verticalAlign === 'bottom') {
                y -= totalHeight;
            }

            lines.forEach((l, i) => {
                let drawX = x; // Align handles X anchor
                ctx.fillText(l.trim(), drawX, y + (i * lineHeight));
            });

            ctx.restore();
        });

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
    <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-200">
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <main className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Controls */}
        <aside className="w-[340px] flex-shrink-0 border-r border-gray-200 dark:border-white/5 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm overflow-y-auto z-20 custom-scrollbar flex flex-col transition-colors duration-200">
          <ControlPanel 
            project={project} 
            setProject={setProject} 
            onGenerate={handleGenerate}
            onAddText={addTextLayer}
            onReset={handleReset}
            error={error}
          />
        </aside>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col relative bg-gray-100 dark:bg-gray-950 min-w-0 transition-colors duration-200">
           
           {/* Workspace Toolbar */}
           <div className="h-14 border-b border-gray-200 dark:border-white/5 bg-white/50 dark:bg-gray-900/30 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0 z-10 transition-colors duration-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <MousePointer2 size={14} />
                    Selection Mode
                  </span>
                  <span className="w-px h-4 bg-gray-300 dark:bg-white/10"></span>
                  <span>{project.width} x {project.height}px</span>
                </div>
                
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-gray-200 dark:bg-white/5 rounded-lg p-0.5 border border-gray-300 dark:border-white/5 ml-4 transition-colors">
                  <button 
                    onClick={handleZoomOut}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 rounded transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="text-[10px] w-12 text-center font-mono text-gray-600 dark:text-gray-400">
                    {Math.round(currentScale * 100)}%
                  </span>
                  <button 
                    onClick={handleZoomIn}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 rounded transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <div className="w-px h-3 bg-gray-300 dark:bg-white/10 mx-1"></div>
                  <button 
                    onClick={handleFitToScreen}
                    className={`p-1.5 rounded transition-colors ${isFitToScreen ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'}`}
                    title="Fit to Screen"
                  >
                    <Maximize size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(project.background && !project.isAnalyzing) && (
                  <button 
                    onClick={handleRegenerateLayout}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors border border-gray-200 dark:border-white/5 shadow-sm"
                  >
                    <LayoutTemplate size={14} />
                    Remix Layout
                  </button>
                )}
                
                {(project.background || project.svgContent) && !project.isGenerating && (
                   <button 
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-indigo-500/20"
                   >
                      <Download size={14} />
                      Download
                   </button>
                )}
              </div>
           </div>

           {/* Canvas Container Area */}
           <section className="flex-1 relative overflow-hidden flex flex-col">
              {/* Background Pattern */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.03] opacity-5" 
                   style={{ 
                       backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', 
                       backgroundSize: '20px 20px' 
                   }} 
              />
              
              {/* Scrollable Viewport */}
              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-auto p-8 custom-scrollbar relative flex flex-col"
              >
                 {/* This wrapper grows with the canvas to force scrollbars, and margin-auto centers it when small */}
                 <div className="m-auto relative transition-all duration-200 ease-out" style={{
                   width: project.width * currentScale,
                   height: project.height * currentScale,
                   minWidth: project.width * currentScale,
                   minHeight: project.height * currentScale
                 }}>
                   <div className="shadow-2xl shadow-black/20 dark:shadow-black ring-1 ring-black/5 dark:ring-white/10 rounded-sm">
                     <Canvas 
                       project={project} 
                       scale={currentScale}
                       onUpdateLayer={updateTextLayer}
                       onRemoveLayer={removeTextLayer}
                     />
                     
                     {/* Loading Overlays - Positioned relative to canvas */}
                     {project.isGenerating && (
                       <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                         <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                         <p className="text-indigo-600 dark:text-indigo-200 font-medium tracking-wide text-sm">Generating pixels...</p>
                       </div>
                     )}
                     
                     {project.isAnalyzing && (
                       <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                         <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                         <p className="text-purple-600 dark:text-purple-200 font-medium tracking-wide text-sm">Analyzing composition...</p>
                       </div>
                     )}
                   </div>
                 </div>
              </div>

               {/* Empty State / Hints (Global) */}
               {!project.background && !project.svgContent && !project.isGenerating && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                   <div className="text-center max-w-md p-8">
                     <div className="bg-white/50 dark:bg-gray-800/30 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-1 ring-gray-200 dark:ring-white/5 backdrop-blur-sm shadow-sm">
                        <RefreshCw className="text-gray-400 dark:text-gray-600" size={32} strokeWidth={1.5} />
                     </div>
                     <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 tracking-tight">Design Workspace</h3>
                     <p className="text-gray-500 text-sm leading-relaxed">Configure your project in the sidebar to generate a new asset.</p>
                   </div>
                 </div>
               )}
           </section>
        </div>
      </main>
    </div>
  );
}