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
      { type: AssetType.POSTER, icon: <RectangleVertical size={18} />, label: "Poster" },
      { type: AssetType.SLIDE, icon: <Presentation size={18} />, label: "Slide" },
      { type: AssetType.ICON, icon: <ImageIcon size={18} />, label: "Icon" },
      { type: AssetType.LOGO, icon: <Hexagon size={18} />, label: "Logo" },
  ];

  return (
    <div className="p-6 flex flex-col gap-8 pb-32">
      
      {/* 1. Configuration Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/5">
            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Wand2 size={14} className="text-teal-500 dark:text-teal-400" /> Creation Studio
            </h2>
            {hasContent && (
                <button 
                    type="button"
                    onClick={onReset}
                    className="text-[10px] text-teal-600 dark:text-teal-300 hover:text-teal-800 dark:hover:text-white flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-600/20 font-semibold border border-teal-100 dark:border-teal-500/20"
                >
                    <RotateCcw size={10} /> New
                </button>
            )}
        </div>
        
        {/* Asset Type Selector */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
              Asset Type
              {hasContent && <span className="text-gray-400 font-normal italic text-[10px]">(Locked)</span>}
          </label>
          <div className={`grid grid-cols-2 gap-2 ${hasContent ? 'opacity-50 pointer-events-none' : ''}`}>
            {ASSET_OPTS.map(({ type, icon, label }) => (
              <button
                key={type}
                type="button"
                disabled={hasContent}
                onClick={() => setProject(p => ({ ...p, assetType: type, 
                    // Set sensible defaults
                    width: type === AssetType.POSTER ? 1080 : type === AssetType.SLIDE ? 1920 : 1024,
                    height: type === AssetType.POSTER ? 1350 : type === AssetType.SLIDE ? 1080 : 1024
                }))}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all duration-200 relative overflow-hidden ${
                  project.assetType === type 
                    ? 'bg-white dark:bg-gray-800 border-teal-500/50 text-gray-900 dark:text-white shadow-sm ring-1 ring-teal-500/20' 
                    : 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-white/5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className={`p-1.5 rounded-md ${project.assetType === type ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/20' : 'text-gray-400'}`}>
                    {icon}
                </div>
                <span className="text-xs font-medium">{label}</span>
                {project.assetType === type && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-l-lg"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Dimensions (px)</label>
            <div className={`flex items-center gap-2 ${hasContent ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="relative w-full">
                    <input 
                        type="number" 
                        value={project.width} 
                        disabled={hasContent}
                        onChange={(e) => handleDimensionChange(e, 'width')}
                        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 pl-8 transition-all"
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400 text-[10px] font-bold">W</span>
                </div>
                <span className="text-gray-400 text-xs">×</span>
                <div className="relative w-full">
                    <input 
                        type="number" 
                        value={project.height}
                        disabled={hasContent}
                        onChange={(e) => handleDimensionChange(e, 'height')}
                        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 pl-8 transition-all"
                    />
                     <span className="absolute left-3 top-2.5 text-gray-400 text-[10px] font-bold">H</span>
                </div>
            </div>
        </div>

        {/* Brief */}
        <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Creative Brief</label>
            <div className="relative">
                <textarea 
                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 resize-none h-28 leading-relaxed placeholder-gray-400 transition-all shadow-sm"
                    placeholder={getPlaceholder(project.assetType)}
                    value={project.brief}
                    onChange={(e) => setProject(p => ({ ...p, brief: e.target.value }))}
                />
            </div>
        </div>

        {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-300 text-xs flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                {error}
            </div>
        )}

        <button 
            type="button"
            onClick={onGenerate}
            disabled={project.isGenerating || project.isAnalyzing}
            className="w-full bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group uppercase text-xs tracking-wider"
        >
            <Wand2 size={16} className={project.isGenerating ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'} />
            {project.isGenerating ? 'Designing...' : hasContent ? 'Regenerate' : 'Generate Design'}
        </button>
      </section>

      {/* 2. Layer Controls (Only if not SVG/Icon mode) */}
      {(project.assetType === AssetType.POSTER || project.assetType === AssetType.SLIDE) && (
          <section className="space-y-5 border-t border-gray-200 dark:border-white/5 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} className="text-indigo-500 dark:text-indigo-400" /> Layers
                </h2>
                <button 
                    onClick={onAddText} 
                    type="button" 
                    className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-transparent hover:border-gray-200 dark:hover:border-white/10 flex items-center gap-1"
                >
                    <Plus size={12} /> Add Layer
                </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar -mr-2 pl-1 pb-4">
                {project.textLayers.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-xl text-gray-400 text-xs flex flex-col items-center gap-2 bg-gray-50/50 dark:bg-white/[0.02]">
                        <Layers size={24} className="opacity-20" />
                        <span>No text layers added</span>
                    </div>
                )}
                {project.textLayers.map((layer, idx) => (
                    <div key={layer.id} className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 border border-gray-200 dark:border-white/5 group hover:border-gray-300 dark:hover:border-white/10 transition-all shadow-sm">
                        
                        {/* Layer Header */}
                        <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-white/5 pb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700/50 text-[9px] font-mono text-gray-500 dark:text-gray-400 flex items-center justify-center">{idx + 1}</span>
                                <input 
                                    type="text" 
                                    value={layer.text}
                                    onChange={(e) => handleTextLayerChange(layer.id, 'text', e.target.value)}
                                    className="bg-transparent border-none p-0 text-xs font-medium text-gray-700 dark:text-gray-200 focus:ring-0 w-32 truncate"
                                />
                            </div>
                            <button onClick={() => deleteLayer(layer.id)} type="button" className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                                <Trash2 size={12} />
                            </button>
                        </div>
                        
                        <div className="mb-3">
                            <textarea 
                                value={layer.text}
                                onChange={(e) => handleTextLayerChange(layer.id, 'text', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-lg p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 min-h-[60px] resize-none"
                                placeholder="Text content..."
                            />
                        </div>
                        
                        {/* Layer Controls Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            {/* Font Size & Weight */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase">Size</label>
                                <div className="flex items-center bg-gray-50 dark:bg-black/20 rounded border border-gray-200 dark:border-white/5 px-2 py-1.5">
                                    <input 
                                        type="number" 
                                        value={layer.fontSize}
                                        onChange={(e) => handleTextLayerChange(layer.id, 'fontSize', parseInt(e.target.value))}
                                        className="w-full bg-transparent border-none p-0 text-xs text-gray-900 dark:text-white focus:ring-0"
                                    />
                                    <span className="text-[9px] text-gray-400">px</span>
                                </div>
                            </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase">Weight</label>
                                <select 
                                    value={layer.fontWeight}
                                    onChange={(e) => handleTextLayerChange(layer.id, 'fontWeight', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50"
                                >
                                    <option value="normal">Regular</option>
                                    <option value="bold">Bold</option>
                                    <option value="300">Light</option>
                                    <option value="800">Extra Bold</option>
                                </select>
                            </div>

                            {/* Alignment Buttons */}
                            <div className="col-span-2 space-y-1 pt-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase">Alignment</label>
                                <div className="flex border border-gray-200 dark:border-white/5 rounded-lg overflow-hidden bg-gray-50 dark:bg-black/20">
                                    {[
                                        { icon: <AlignLeft size={12} />, val: 'left', key: 'align' },
                                        { icon: <AlignCenter size={12} />, val: 'center', key: 'align' },
                                        { icon: <AlignRight size={12} />, val: 'right', key: 'align' },
                                        { icon: <ArrowUpToLine size={12} />, val: 'top', key: 'verticalAlign' },
                                        { icon: <MoveVertical size={12} />, val: 'center', key: 'verticalAlign' },
                                        { icon: <ArrowDownToLine size={12} />, val: 'bottom', key: 'verticalAlign' }
                                    ].map((opt, i) => (
                                        <button 
                                            key={i}
                                            type="button"
                                            onClick={() => handleTextLayerChange(layer.id, opt.key as any, opt.val)}
                                            className={`flex-1 flex justify-center py-1.5 hover:bg-white dark:hover:bg-white/10 ${
                                                // @ts-ignore
                                                layer[opt.key] === opt.val ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-gray-400'
                                            }`}
                                        >
                                            {opt.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Color & Width */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase">Color</label>
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded px-2 py-1.5 h-[30px]">
                                    <input 
                                        type="color" 
                                        value={layer.color}
                                        onChange={(e) => handleTextLayerChange(layer.id, 'color', e.target.value)}
                                        className="w-4 h-4 rounded cursor-pointer border-none p-0 bg-transparent"
                                    />
                                    <span className="text-[9px] text-gray-500 font-mono uppercase">{layer.color}</span>
                                </div>
                            </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase">Width</label>
                                <div className="flex items-center bg-gray-50 dark:bg-black/20 rounded border border-gray-200 dark:border-white/5 px-2 py-1.5 h-[30px]">
                                    <input 
                                        type="number" 
                                        value={layer.boxWidth || 80}
                                        onChange={(e) => handleTextLayerChange(layer.id, 'boxWidth', parseInt(e.target.value))}
                                        className="w-full bg-transparent border-none p-0 text-xs text-gray-900 dark:text-white focus:ring-0"
                                    />
                                    <span className="text-[9px] text-gray-400">%</span>
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