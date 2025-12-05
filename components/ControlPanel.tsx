import React from 'react';
import { AssetType, ProjectState, TextLayer } from '../types';
import { 
    Layers, Plus, Trash2, Wand2, 
    AlignLeft, AlignCenter, AlignRight, 
    ArrowUpToLine, ArrowDownToLine, MoveVertical,
    RectangleVertical, Presentation, Image, Hexagon,
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
      { type: AssetType.POSTER, icon: <RectangleVertical size={16} />, label: "Poster" },
      { type: AssetType.SLIDE, icon: <Presentation size={16} />, label: "Slide" },
      { type: AssetType.ICON, icon: <Image size={16} />, label: "Icon" },
      { type: AssetType.LOGO, icon: <Hexagon size={16} />, label: "Logo" },
  ];

  return (
    <div className="p-6 flex flex-col gap-8 pb-20">
      
      {/* 1. Configuration */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Wand2 size={14} /> Generator Settings
            </h2>
            {hasContent && (
                <button 
                    type="button"
                    onClick={onReset}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-blue-900/20"
                >
                    <RotateCcw size={12} /> Start New
                </button>
            )}
        </div>
        
        {/* Asset Type Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300 flex justify-between">
              Asset Type
              {hasContent && <span className="text-xs text-gray-500 font-normal">(Locked)</span>}
          </label>
          <div className={`grid grid-cols-4 gap-1 bg-gray-800 p-1 rounded-lg ${hasContent ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {ASSET_OPTS.map(({ type, icon, label }) => (
              <button
                key={type}
                type="button"
                disabled={hasContent}
                onClick={() => setProject(p => ({ ...p, assetType: type, 
                    // Set sensible defaults for dimensions
                    width: type === AssetType.POSTER ? 800 : type === AssetType.SLIDE ? 1280 : 512,
                    height: type === AssetType.POSTER ? 1000 : type === AssetType.SLIDE ? 720 : 512
                }))}
                className={`flex flex-col items-center justify-center py-2 rounded-md transition-all duration-200 ${
                  project.assetType === type 
                    ? 'bg-gray-700 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'
                } ${hasContent ? 'cursor-not-allowed' : ''}`}
                title={label}
              >
                {icon}
                <span className="text-[10px] mt-1 font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Dimensions (px)</label>
            <div className={`flex items-center gap-2 ${hasContent ? 'opacity-75' : ''}`}>
                <div className="relative w-full">
                    <input 
                        type="number" 
                        value={project.width} 
                        disabled={hasContent}
                        onChange={(e) => handleDimensionChange(e, 'width')}
                        className="w-full bg-gray-800 border border-gray-700 rounded-l rounded-r px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 pl-8 disabled:cursor-not-allowed"
                    />
                    <span className="absolute left-2.5 top-2 text-gray-500 text-xs font-mono pt-0.5">W</span>
                </div>
                <span className="text-gray-600">×</span>
                <div className="relative w-full">
                    <input 
                        type="number" 
                        value={project.height}
                        disabled={hasContent}
                        onChange={(e) => handleDimensionChange(e, 'height')}
                        className="w-full bg-gray-800 border border-gray-700 rounded-l rounded-r px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 pl-8 disabled:cursor-not-allowed"
                    />
                     <span className="absolute left-2.5 top-2 text-gray-500 text-xs font-mono pt-0.5">H</span>
                </div>
            </div>
        </div>

        {/* Brief */}
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Creative Brief</label>
            <textarea 
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none h-28 leading-relaxed"
                placeholder={getPlaceholder(project.assetType)}
                value={project.brief}
                onChange={(e) => setProject(p => ({ ...p, brief: e.target.value }))}
            />
        </div>

        {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-xs">
                {error}
            </div>
        )}

        <button 
            type="button"
            onClick={onGenerate}
            disabled={project.isGenerating || project.isAnalyzing}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded shadow-lg transition-all flex items-center justify-center gap-2 group"
        >
            <Wand2 size={16} className={project.isGenerating ? 'animate-spin' : 'group-hover:scale-110 transition-transform'} />
            {project.isGenerating ? 'Generating...' : hasContent ? 'Regenerate All' : 'Generate Design'}
        </button>
      </section>

      {/* 2. Layer Controls (Only if not SVG/Icon mode) */}
      {(project.assetType === AssetType.POSTER || project.assetType === AssetType.SLIDE) && (
          <section className="space-y-4 border-t border-gray-800 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Layers size={14} /> Text Layers
                </h2>
                <button onClick={onAddText} type="button" className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded" title="Add Layer">
                    <Plus size={16} />
                </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {project.textLayers.length === 0 && (
                    <div className="text-center p-4 border border-dashed border-gray-800 rounded text-gray-600 text-xs">
                        No text layers. Add one or generate a layout.
                    </div>
                )}
                {project.textLayers.map((layer, idx) => (
                    <div key={layer.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 group hover:border-gray-600 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-tight">Layer {idx + 1}</span>
                            <button onClick={() => deleteLayer(layer.id)} type="button" className="text-gray-600 hover:text-red-400 transition-colors">
                                <Trash2 size={12} />
                            </button>
                        </div>
                        <textarea 
                            value={layer.text}
                            onChange={(e) => handleTextLayerChange(layer.id, 'text', e.target.value)}
                            className="w-full bg-transparent border-b border-gray-700 pb-1 text-sm text-white focus:outline-none focus:border-blue-500 mb-3 h-14 resize-none placeholder-gray-600"
                            placeholder="Enter text content..."
                        />
                        
                        <div className="space-y-3">
                            {/* Alignment Controls */}
                            <div className="flex items-center justify-between gap-2 bg-gray-900 rounded p-1 border border-gray-700">
                                <div className="flex gap-1">
                                    <button 
                                        type="button"
                                        onClick={() => handleTextLayerChange(layer.id, 'align', 'left')}
                                        className={`p-1 rounded ${layer.align === 'left' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        title="Align Left"
                                    >
                                        <AlignLeft size={14} />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleTextLayerChange(layer.id, 'align', 'center')}
                                        className={`p-1 rounded ${layer.align === 'center' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        title="Align Center"
                                    >
                                        <AlignCenter size={14} />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleTextLayerChange(layer.id, 'align', 'right')}
                                        className={`p-1 rounded ${layer.align === 'right' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        title="Align Right"
                                    >
                                        <AlignRight size={14} />
                                    </button>
                                </div>
                                <div className="w-px h-4 bg-gray-700"></div>
                                <div className="flex gap-1">
                                    <button 
                                        type="button"
                                        onClick={() => handleTextLayerChange(layer.id, 'verticalAlign', 'top')}
                                        className={`p-1 rounded ${layer.verticalAlign === 'top' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        title="Align Top"
                                    >
                                        <ArrowUpToLine size={14} />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleTextLayerChange(layer.id, 'verticalAlign', 'center')}
                                        className={`p-1 rounded ${(!layer.verticalAlign || layer.verticalAlign === 'center') ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        title="Align Middle"
                                    >
                                        <MoveVertical size={14} />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleTextLayerChange(layer.id, 'verticalAlign', 'bottom')}
                                        className={`p-1 rounded ${layer.verticalAlign === 'bottom' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        title="Align Bottom"
                                    >
                                        <ArrowDownToLine size={14} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Font Styles */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-500 uppercase">Size (px)</label>
                                    <input 
                                        type="number" 
                                        value={layer.fontSize}
                                        onChange={(e) => handleTextLayerChange(layer.id, 'fontSize', parseInt(e.target.value))}
                                        className="bg-gray-900 border border-gray-700 rounded text-xs px-2 py-1.5 text-gray-300 w-full focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-500 uppercase">Weight</label>
                                    <select 
                                        value={layer.fontWeight}
                                        onChange={(e) => handleTextLayerChange(layer.id, 'fontWeight', e.target.value)}
                                        className="bg-gray-900 border border-gray-700 rounded text-xs px-2 py-1.5 text-gray-300 w-full focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="bold">Bold</option>
                                        <option value="300">Light</option>
                                        <option value="800">Heavy</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-500 uppercase">Width (%)</label>
                                    <input 
                                        type="number" 
                                        value={layer.boxWidth || 80}
                                        onChange={(e) => handleTextLayerChange(layer.id, 'boxWidth', parseInt(e.target.value))}
                                        className="bg-gray-900 border border-gray-700 rounded text-xs px-2 py-1.5 text-gray-300 w-full focus:border-blue-500 focus:outline-none"
                                        min="10" max="100"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-500 uppercase">Color</label>
                                    <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded px-2 py-1.5">
                                        <input 
                                            type="color" 
                                            value={layer.color}
                                            onChange={(e) => handleTextLayerChange(layer.id, 'color', e.target.value)}
                                            className="w-4 h-4 rounded cursor-pointer bg-transparent border-none p-0"
                                        />
                                        <span className="text-xs text-gray-400 font-mono">{layer.color}</span>
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