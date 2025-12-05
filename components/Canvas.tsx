import React, { useRef, useState, useEffect } from 'react';
import { ProjectState, TextLayer } from '../types';
import { Move } from 'lucide-react';

interface Props {
  project: ProjectState;
  onUpdateLayer: (id: string, updates: Partial<TextLayer>) => void;
  onRemoveLayer: (id: string) => void;
}

const Canvas: React.FC<Props> = ({ project, onUpdateLayer }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Auto-fit canvas to container
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;
      
      const parentW = parent.clientWidth;
      const parentH = parent.clientHeight;
      
      const padding = 64; // px
      const availW = parentW - padding;
      const availH = parentH - padding;

      const scaleW = availW / project.width;
      const scaleH = availH / project.height;

      setScale(Math.min(scaleW, scaleH, 1)); // Don't scale up past 1x if it fits
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [project.width, project.height]);


  // Simple Drag Logic
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel coordinates back to percentage relative to unscaled dimension
    let newXPercent = (x / scale / project.width) * 100;
    let newYPercent = (y / scale / project.height) * 100;

    // Clamp
    newXPercent = Math.max(0, Math.min(100, newXPercent));
    newYPercent = Math.max(0, Math.min(100, newYPercent));

    onUpdateLayer(draggingId, { x: newXPercent, y: newYPercent });
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  // Improved Transform Logic for accurate anchoring
  const getTransform = (alignX: string, alignY: string) => {
    const x = alignX === 'left' ? '0%' : alignX === 'right' ? '-100%' : '-50%';
    const y = alignY === 'top' ? '0%' : alignY === 'bottom' ? '-100%' : '-50%';
    return `translate(${x}, ${y})`;
  };

  return (
    <div 
        className="flex items-center justify-center w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
      <div 
        ref={containerRef}
        className="relative bg-white shadow-2xl overflow-hidden transition-all duration-200 ease-out"
        style={{
          width: project.width,
          height: project.height,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          backgroundImage: project.background ? `url(${project.background})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: project.background ? 'transparent' : '#ffffff' 
        }}
      >
        {!project.background && !project.svgContent && (
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
            />
        )}

        {project.svgContent && (
            <div 
                className="absolute inset-0 flex items-center justify-center p-12"
                dangerouslySetInnerHTML={{ __html: project.svgContent }}
            />
        )}

        {project.textLayers.map(layer => (
            <div
                key={layer.id}
                onMouseDown={(e) => handleMouseDown(e, layer.id)}
                className={`absolute cursor-move group select-none hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-dashed rounded px-2 py-1 ${draggingId === layer.id ? 'outline outline-2 outline-blue-500 outline-dashed z-50' : 'z-10'}`}
                style={{
                    left: `${layer.x}%`,
                    top: `${layer.y}%`,
                    transform: getTransform(layer.align, layer.verticalAlign || 'center'), 
                    color: layer.color,
                    fontSize: `${layer.fontSize}px`,
                    fontFamily: layer.fontFamily,
                    fontWeight: layer.fontWeight,
                    textAlign: layer.align,
                    whiteSpace: 'pre-wrap',
                    width: `${layer.boxWidth || 80}%`, 
                    lineHeight: 1.3
                }}
            >   
                {/* Drag Handle Indicator */}
                <div className="absolute -top-3 left-0 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-blue-500 text-white p-0.5 rounded shadow">
                        <Move size={10} />
                    </div>
                </div>
                {layer.text}
            </div>
        ))}

        <div className="absolute bottom-4 right-4 text-[10px] text-white/50 font-mono pointer-events-none mix-blend-difference opacity-50">
            GenStudio
        </div>

      </div>
    </div>
  );
};

export default Canvas;