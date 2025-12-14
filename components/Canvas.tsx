import React, { useRef, useState } from 'react';
import { ProjectState, TextLayer } from '../types';
import { Move } from 'lucide-react';

interface Props {
  project: ProjectState;
  scale: number;
  onUpdateLayer: (id: string, updates: Partial<TextLayer>) => void;
  onRemoveLayer: (id: string) => void;
}

type InteractionType = 'moving' | 'resizing_left' | 'resizing_right';

interface InteractionState {
  type: InteractionType;
  layerId: string;
  startX: number;
  startY: number;
  initial: {
    x: number;
    y: number;
    boxWidth: number;
  };
}

const Canvas: React.FC<Props> = ({ project, scale, onUpdateLayer }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [interaction, setInteraction] = useState<InteractionState | null>(null);

  const handleBackgroundClick = () => {
    setSelectedId(null);
  };

  const handleLayerMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    
    const layer = project.textLayers.find(l => l.id === id);
    if (!layer) return;

    setInteraction({
      type: 'moving',
      layerId: id,
      startX: e.clientX,
      startY: e.clientY,
      initial: {
        x: layer.x,
        y: layer.y,
        boxWidth: layer.boxWidth || 80
      }
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, id: string, direction: 'left' | 'right') => {
    e.stopPropagation();
    const layer = project.textLayers.find(l => l.id === id);
    if (!layer) return;

    setInteraction({
      type: direction === 'left' ? 'resizing_left' : 'resizing_right',
      layerId: id,
      startX: e.clientX,
      startY: e.clientY,
      initial: {
        x: layer.x,
        y: layer.y,
        boxWidth: layer.boxWidth || 80
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interaction) return;

    const { type, layerId, startX, startY, initial } = interaction;
    const layer = project.textLayers.find(l => l.id === layerId);
    if (!layer) return;

    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    if (rect.width === 0) return;

    const effectiveScaleX = rect.width / project.width;
    const effectiveScaleY = rect.height / project.height;

    const deltaXPixels = (e.clientX - startX) / effectiveScaleX;
    const deltaYPixels = (e.clientY - startY) / effectiveScaleY;

    const deltaXPct = (deltaXPixels / project.width) * 100;
    const deltaYPct = (deltaYPixels / project.height) * 100;

    if (type === 'moving') {
      let newX = initial.x + deltaXPct;
      let newY = initial.y + deltaYPct;
      
      // Allow slight overscroll
      newX = Math.max(-20, Math.min(120, newX));
      newY = Math.max(-20, Math.min(120, newY));

      onUpdateLayer(layerId, { x: newX, y: newY });
    } 
    else if (type === 'resizing_right') {
        let newWidth = initial.boxWidth;
        if (layer.align === 'left') {
            newWidth = initial.boxWidth + deltaXPct;
        } else if (layer.align === 'center') {
            newWidth = initial.boxWidth + (deltaXPct * 2);
        } else if (layer.align === 'right') {
            newWidth = initial.boxWidth - deltaXPct; 
        }
        newWidth = Math.max(5, Math.min(100, newWidth));
        onUpdateLayer(layerId, { boxWidth: newWidth });
    } 
    else if (type === 'resizing_left') {
        let newWidth = initial.boxWidth;
        if (layer.align === 'right') {
            newWidth = initial.boxWidth - deltaXPct; 
        } else if (layer.align === 'center') {
            newWidth = initial.boxWidth - (deltaXPct * 2);
        }
        newWidth = Math.max(5, Math.min(100, newWidth));
        onUpdateLayer(layerId, { boxWidth: newWidth });
    }
  };

  const handleMouseUp = () => {
    setInteraction(null);
  };

  const getTransform = (alignX: string, alignY: string) => {
    const x = alignX === 'left' ? '0%' : alignX === 'right' ? '-100%' : '-50%';
    const y = alignY === 'top' ? '0%' : alignY === 'bottom' ? '-100%' : '-50%';
    return `translate(${x}, ${y})`;
  };

  return (
    <div 
        ref={containerRef}
        className="absolute inset-0 bg-white overflow-hidden origin-top-left select-none shadow-sm"
        style={{
          width: project.width,
          height: project.height,
          transform: `scale(${scale})`,
          backgroundImage: project.background ? `url(${project.background})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: project.background ? 'transparent' : '#18181b' // Zinc-900
        }}
        onMouseDown={handleBackgroundClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
        {/* Full screen overlay to catch mouse events for dragging when mouse moves fast */}
        {interaction && (
            <div className="fixed inset-0 z-50" style={{ cursor: interaction.type === 'moving' ? 'move' : 'col-resize' }} />
        )}

        {/* Fallback pattern for empty state transparency illusion */}
        {!project.background && !project.svgContent && (
            <div className="absolute inset-0 opacity-10" 
                 style={{ 
                    backgroundImage: 'linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px'
                 }} 
            />
        )}

        {project.svgContent && (
            <div 
                className="absolute inset-0 flex items-center justify-center p-12"
                dangerouslySetInnerHTML={{ __html: project.svgContent }}
            />
        )}

        {project.textLayers.map(layer => {
            const isSelected = selectedId === layer.id;
            
            return (
            <div
                key={layer.id}
                onMouseDown={(e) => handleLayerMouseDown(e, layer.id)}
                className={`absolute group px-2 py-1 transition-[outline] ${isSelected ? 'z-40' : 'z-10'}`}
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
                    lineHeight: 1.3,
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                    cursor: 'move',
                    outline: isSelected ? '1.5px solid #0d9488' : 'none', // Teal-600 solid line for cleaner look
                }}
            >   
                {/* Drag Handle Indicator */}
                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 transition-opacity bg-teal-600 text-white p-1.5 rounded-full shadow-lg pointer-events-none origin-bottom ${isSelected || 'opacity-0 group-hover:opacity-100'}`}>
                    <Move size={14} />
                </div>
                
                {layer.text}

                {/* Resize Handles - Square Design */}
                {isSelected && (
                    <>
                        {/* Right Handle */}
                        {(layer.align === 'left' || layer.align === 'center') && (
                            <div 
                                className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-teal-600 shadow-sm cursor-e-resize z-50 hover:scale-125 transition-transform"
                                onMouseDown={(e) => handleResizeMouseDown(e, layer.id, 'right')}
                            />
                        )}
                        {/* Left Handle */}
                        {(layer.align === 'right' || layer.align === 'center') && (
                            <div 
                                className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-teal-600 shadow-sm cursor-w-resize z-50 hover:scale-125 transition-transform"
                                onMouseDown={(e) => handleResizeMouseDown(e, layer.id, 'left')}
                            />
                        )}
                    </>
                )}
            </div>
            );
        })}

        <div className="absolute bottom-5 right-5 text-[10px] text-white/30 font-mono pointer-events-none mix-blend-difference font-semibold tracking-widest uppercase">
            Aura AI
        </div>
    </div>
  );
};

export default Canvas;