import React from 'react';
import { AssetType, ProjectState, TextLayer } from '../types';
import { 
    Layers, Plus, Trash2, Wand2, 
    AlignLeft, AlignCenter, AlignRight, 
    ArrowUpToLine, ArrowDownToLine, MoveVertical,
    RectangleVertical, Presentation, Image as ImageIcon, Hexagon,
    RotateCcw
} from 'lucide-react';

interface Props {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  onGenerate: () => void;
  onAddText: () => void;
  onReset: () => void;
  error: string | null;
}

const ControlPanel: React.FC<Props> = ({ project, setProject, onGenerate, onAddText, onReset, error }) => {
  
  const hasContent = !!project.background || !!project.svgContent;

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>, dim: 'width' | 'height') => {
    const val = parseInt(e.target.value, 10);
    setProject(prev => ({ ...prev, [dim]: isNaN(val) ? 0 : val }));
  };

  const handleTextLayerChange = (id: string, key: keyof TextLayer, value: any) => {
    setProject(prev => ({
      ...prev,
      textLayers: prev.textLayers.map(l => l.id === id ? { ...l, [key]: value } : l)
    }));
  };

  const deleteLayer = (id: string) => {
    setProject(prev => ({
        ...prev,
        textLayers: prev.textLayers.filter(l => l.id !== id)
    }));
  };

  const getPlaceholder = (type: AssetType) => {
      switch(type) {
          case AssetType.POSTER: return "e.g., A minimalist jazz concert poster with a saxophone silhouette in neon blue.";
          case AssetType.SLIDE: return "e.g., A quarterly business review slide with a clean sidebar and white content area.";
          case AssetType.ICON: return "e.g., A flat vector icon of a rocket ship launching.";
          case AssetType.LOGO: return "e.g., A geometric hexagon logo for a cyber security startup.";
          default: return "Describe your design...";
      }
  };

  const ASSET_OPTS = [
      { type: AssetType.POSTER, icon: <RectangleVertical size={20} />, label: "Poster" },
      { type: AssetType.SLIDE, icon: <Presentation size={20} />, label: "Slide" },
      { type: AssetType.ICON, icon: <ImageIcon size={20} />, label: "Icon" },
      { type: AssetType.LOGO, icon: <Hexagon size={20} />, label: "Logo" },
  ];

  return (
    <div className="p-6 flex flex-col gap-8 pb-32">
      
      {/* 1. Configuration */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/5">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
                <Wand2 size={16} className="text-indigo-500 dark:text-indigo-400" /> Generator
            </h2>
            {hasContent && (
                <button 
                    type="button"
                    onClick={onReset}
                    className="text-xs text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-600/30 font-semibold border border-blue-200 dark:border-blue-500/20"
                >
                    <RotateCcw size={12} /> Start New
                </button>
            )}
        </div>
        
        {/* Asset Type Selector */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex justify-between">
              Asset Type
              {hasContent && <span className="text-gray-400 dark:text-gray-500 font-normal normal-case opacity-75 italic">(Locked)</span>}
          </label>
          <div className={`grid grid-cols-2 gap-3 ${hasContent ? 'opacity-40 pointer-events-none' : ''}`}>
            {ASSET_OPTS.map(({ type, icon, label }) => (
              <button
                key={type}
                type="button"
                disabled={hasContent}
                onClick={() => setProject(p => ({ ...p, assetType: type, 
                    // High-quality defaults
                    width: type === AssetType.POSTER ? 1080 : type === AssetType.SLIDE ? 1920 : 1024,
                    height: type === AssetType.POSTER ? 1350 : type === AssetType.SLIDE ? 1080 : 1024
                }))}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group text-left relative overflow-hidden ${
                  project.assetType === type 
                    ? 'bg-white dark:bg-gray-800 border-indigo-500/50 text-gray-900 dark:text-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/20 dark:ring-0' 
                    : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-white/10'
                }`}
                title={label}
              >
                <div className={`p-2 rounded-lg transition-colors duration-300 ${project.assetType === type ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-600 group-hover:text-gray-700 dark:group-hover:text-gray-400'}`}>
                    {icon}
                </div>
                <span className="text-xs font-semibold">{label}</span>
                {project.assetType === type && <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Dimensions (px)</label>
            <div className={`flex items-center gap-3 ${hasContent ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="relative w-full group">
                    <input 
                        type="number" 
                        value={project.width} 
                        disabled={hasContent}
                        onChange={(e) => handleDimensionChange(e, 'width')}
                        className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 pl-9 transition-all placeholder-gray-400"
                    />
                    <span className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 text-xs font-mono group-hover:text-gray-600 dark:group-hover:text-gray-400">W</span>
                </div>
                <span className="text-gray-400 dark:text-gray-600 font-light">×</span>
                <div className="relative w-full group">
                    <input 
                        type="number" 
                        value={project.height}
                        disabled={hasContent}
                        onChange={(e) => handleDimensionChange(e, 'height')}
                        className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 pl-9 transition-all placeholder-gray-400"
                    />
                     <span className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 text-xs font-mono group-hover:text-gray-600 dark:group-hover:text-gray-400">H</span>
                </div>
            </div>
        </div>

        {/* Brief */}
        <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Creative Brief</label>
            <textarea 
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none h-32 leading-relaxed placeholder-gray-400 dark:placeholder-gray-600 transition-all"
                placeholder={getPlaceholder(project.assetType)}
                value={project.brief}
                onChange={(e) => setProject(p => ({ ...p, brief: e.target.value }))}
            />
        </div>

        {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-200 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 animate-pulse"></span>
                {error}
            </div>
        )}

        <button 
            type="button"
            onClick={onGenerate}
            disabled={project.isGenerating || project.isAnalyzing}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 dark:disabled:from-gray-700 dark:disabled:to-gray-700 dark:disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 group uppercase text-xs tracking-wider"
        >
            <Wand2 size={18} className={project.isGenerating ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'} />
            {project.isGenerating ? 'Designing...' : hasContent ? 'Regenerate All' : 'Generate Design'}
        </button>
      </section>

      {/* 2. Layer Controls (Only if not SVG/Icon mode) */}
      {(project.assetType === AssetType.POSTER || project.assetType === AssetType.SLIDE) && (
          <section className="space-y-6 border-t border-gray-200 dark:border-white/5 pt-8">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={16} className="text-purple-500 dark:text-purple-400" /> Layers
                </h2>
                <button 
                    onClick={onAddText} 
                    type="button" 
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors px-2 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                >
                    <Plus size={14} /> Add
                </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar -mr-2 pl-1 pb-4">
                {project.textLayers.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-xl text-gray-400 dark:text-gray-600 text-xs flex flex-col items-center gap-3 bg-gray-50/50 dark:bg-white/[0.02]">
                        <Layers size={28} className="opacity-20" />
                        <span>No text layers yet</span>
                    </div>
                )}
                {project.textLayers.map((layer, idx) => (
                    <div key={layer.id} className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-white/5 group hover:border-gray-300 dark:hover:border-white/10 hover:shadow-md dark:hover:bg-gray-800/60 transition-all shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-700/50 text-[10px] font-mono text-gray-500 dark:text-gray-400">{idx + 1}</span>
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Text Layer</span>
                            </div>
                            <button onClick={() => deleteLayer(layer.id)} type="button" className="text-gray-400 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1">
                                <Trash2 size={14} />
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <textarea 
                                value={layer.text}
                                onChange={(e) => handleTextLayerChange(layer.id, 'text', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/5 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 min-h-[70px] resize-none placeholder-gray-400 dark:placeholder-gray-600 transition-all"
                                placeholder="Enter text content..."
                            />
                        </div>
                        
                        <div className="space-y-3">
                            {/* Alignment Controls */}
                            <div className="flex items-center justify-between gap-1 p-1 bg-gray-50 dark:bg-black/30 rounded-lg border border-gray-200 dark:border-white/5">
                                <div className="flex flex-1 justify-center gap-0.5">
                                    <button 
                                        type="button"
                                        onClick={() => handleTextLayerChange(layer.id, 'align', 'left')}
                                        className={`p-1.5 rounded-md flex-1 flex justify-center ${layer.align === 'left' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-0' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5'}`}
                                        title="Align Left"
                                    >
                                        <AlignLeft size={16} />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleTextLayerChange(layer.id, 'align', 'center')}
                                        className={`p-1.5 rounded-md flex-1 flex justify-center ${layer.align === 'center' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-0' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5'}`}
                                        title="Align Center"
                                    >
                                        <AlignCenter size={16} />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleTextLayerChange(layer.id, 'align', 'right')}
                                        className={`p-1.5 rounded-md flex-1 flex justify-center ${layer.align === 'right' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-0' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5'}`}
                                        title="Align Right"
                                    >
                                        <AlignRight size={16} />
                                    </button>
                                </div>
                                <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1"></div>
                                <div className="flex flex-1 justify-center gap-0.5">
                                    <button 
                                        type="button"
                                        onClick={() => handleTextLayerChange(layer.id, 'verticalAlign', 'top')}
                                        className={`p-1.5 rounded-md flex-1 flex justify-center ${layer.verticalAlign === 'top' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-0' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5'}`}
                                        title="Align Top"
                                    >
                                        <ArrowUpToLine size={16} />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleTextLayerChange(layer.id, 'verticalAlign', 'center')}
                                        className={`p-1.5 rounded-md flex-1 flex justify-center ${(!layer.verticalAlign || layer.verticalAlign === 'center') ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-0' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5'}`}
                                        title="Align Middle"
                                    >
                                        <MoveVertical size={16} />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleTextLayerChange(layer.id, 'verticalAlign', 'bottom')}
                                        className={`p-1.5 rounded-md flex-1 flex justify-center ${layer.verticalAlign === 'bottom' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-0' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5'}`}
                                        title="Align Bottom"
                                    >
                                        <ArrowDownToLine size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Font Styles */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-0.5">Size</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={layer.fontSize}
                                            onChange={(e) => handleTextLayerChange(layer.id, 'fontSize', parseInt(e.target.value))}
                                            className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500/50"
                                        />
                                        <span className="absolute right-3 top-2 text-[10px] text-gray-400 dark:text-gray-500">px</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-0.5">Weight</label>
                                    <select 
                                        value={layer.fontWeight}
                                        onChange={(e) => handleTextLayerChange(layer.id, 'fontWeight', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                                    >
                                        <option value="normal">Regular</option>
                                        <option value="bold">Bold</option>
                                        <option value="300">Light</option>
                                        <option value="800">Heavy</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-0.5">Max Width</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={layer.boxWidth || 80}
                                            onChange={(e) => handleTextLayerChange(layer.id, 'boxWidth', parseInt(e.target.value))}
                                            className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500/50"
                                            min="10" max="100"
                                        />
                                        <span className="absolute right-3 top-2 text-[10px] text-gray-400 dark:text-gray-500">%</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-0.5">Color</label>
                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-2">
                                        <input 
                                            type="color" 
                                            value={layer.color}
                                            onChange={(e) => handleTextLayerChange(layer.id, 'color', e.target.value)}
                                            className="w-5 h-5 rounded cursor-pointer bg-transparent border-none p-0"
                                        />
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono uppercase truncate">{layer.color}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </section>
      )}
    </div>
  );
};

export default ControlPanel;