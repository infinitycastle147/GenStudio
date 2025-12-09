import React, { useRef, useState, useEffect } from 'react';
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

  // Clear selection when clicking outside (handled by the background click)
  const handleBackgroundClick = () => {
    setSelectedId(null);
  };

  const handleLayerMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent background click
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
      startY: e.clientY, // Not used for width resize but good to have
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
    
    // Calculate deltas in pixels relative to the UN-SCALED project dimensions
    // e.clientX delta / scale = project pixel delta
    // project pixel delta / project width * 100 = percentage delta
    const rect = container.getBoundingClientRect();
    
    // Safety check for zero width
    if (rect.width === 0) return;

    // Use scale from props or derive from rect
    // Derived scale is safer if scale prop lags, but prop is fine usually.
    // Let's use rect.width / project.width as effective scale for X
    const effectiveScaleX = rect.width / project.width;
    const effectiveScaleY = rect.height / project.height;

    const deltaXPixels = (e.clientX - startX) / effectiveScaleX;
    const deltaYPixels = (e.clientY - startY) / effectiveScaleY;

    const deltaXPct = (deltaXPixels / project.width) * 100;
    const deltaYPct = (deltaYPixels / project.height) * 100;

    if (type === 'moving') {
      let newX = initial.x + deltaXPct;
      let newY = initial.y + deltaYPct;

      // Clamp to keep roughly on screen (optional, maybe allow off-screen)
      newX = Math.max(-20, Math.min(120, newX));
      newY = Math.max(-20, Math.min(120, newY));

      onUpdateLayer(layerId, { x: newX, y: newY });
    } 
    else if (type === 'resizing_right') {
        // Dragging Right Handle
        let newWidth = initial.boxWidth;

        if (layer.align === 'left') {
            newWidth = initial.boxWidth + deltaXPct;
        } else if (layer.align === 'center') {
            // Symmetric expansion
            newWidth = initial.boxWidth + (deltaXPct * 2);
        } else if (layer.align === 'right') {
            // Right edge is anchored. Dragging right handle on right-aligned text is generally
            // not the primary way to resize, but if we supported it, it would shrink leftwards?
            // For UX consistency, we usually resize the "Free" edge.
            // But we can support standard expansion:
            newWidth = initial.boxWidth - deltaXPct; 
        }
        
        newWidth = Math.max(5, Math.min(100, newWidth));
        onUpdateLayer(layerId, { boxWidth: newWidth });
    } 
    else if (type === 'resizing_left') {
        let newWidth = initial.boxWidth;

        if (layer.align === 'right') {
            // Dragging left handle (free edge) moves left.
            // DeltaX negative (move left) -> Width increases.
            newWidth = initial.boxWidth - deltaXPct; 
        } else if (layer.align === 'center') {
             // Symmetric
            newWidth = initial.boxWidth - (deltaXPct * 2);
        } else if (layer.align === 'left') {
            // Dragging left handle on left-aligned text moves the anchor visually if we wanted to support it,
            // but for simple boxWidth resizing, we keep anchor fixed.
            // Supporting "Left Handle" for Left Align usually implies moving the anchor X.
            // We'll skip complex anchor moving logic for now.
        }

        newWidth = Math.max(5, Math.min(100, newWidth));
        onUpdateLayer(layerId, { boxWidth: newWidth });
    }
  };

  const handleMouseUp = () => {
    setInteraction(null);
  };

  // Transform Logic
  const getTransform = (alignX: string, alignY: string) => {
    const x = alignX === 'left' ? '0%' : alignX === 'right' ? '-100%' : '-50%';
    const y = alignY === 'top' ? '0%' : alignY === 'bottom' ? '-100%' : '-50%';
    return `translate(${x}, ${y})`;
  };

  return (
    <div 
        ref={containerRef}
        className="absolute inset-0 bg-white overflow-hidden origin-top-left select-none"
        style={{
          width: project.width,
          height: project.height,
          transform: `scale(${scale})`,
          backgroundImage: project.background ? `url(${project.background})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: project.background ? 'transparent' : '#1a1a1a' 
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

        {/* Fallback checkerboard */}
        {!project.background && !project.svgContent && (
            <div className="absolute inset-0 opacity-20" 
                 style={{ 
                    backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
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
            const isMoving = interaction?.layerId === layer.id && interaction?.type === 'moving';

            return (
            <div
                key={layer.id}
                onMouseDown={(e) => handleLayerMouseDown(e, layer.id)}
                className={`absolute group px-2 py-1 ${isSelected ? 'z-40' : 'z-10'}`}
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
                    outline: isSelected ? '2px dashed #6366f1' : 'none', // Indigo-500
                }}
            >   
                {/* Drag Handle Indicator (Only visible on hover if not selected, or always if selected?) */}
                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 transition-opacity bg-indigo-600 text-white p-1.5 rounded-full shadow-lg pointer-events-none scale-75 origin-bottom ${isSelected || 'opacity-0 group-hover:opacity-100'}`}>
                    <Move size={16} />
                </div>
                
                {layer.text}

                {/* Resize Handles */}
                {isSelected && (
                    <>
                        {/* Right Handle - Show for Left and Center align */}
                        {(layer.align === 'left' || layer.align === 'center') && (
                            <div 
                                className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-e-resize z-50 hover:scale-125 transition-transform shadow-sm"
                                onMouseDown={(e) => handleResizeMouseDown(e, layer.id, 'right')}
                            />
                        )}
                        {/* Left Handle - Show for Right and Center align */}
                        {(layer.align === 'right' || layer.align === 'center') && (
                            <div 
                                className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-w-resize z-50 hover:scale-125 transition-transform shadow-sm"
                                onMouseDown={(e) => handleResizeMouseDown(e, layer.id, 'left')}
                            />
                        )}
                    </>
                )}
            </div>
            );
        })}

        <div className="absolute bottom-6 right-6 text-[10px] text-white/40 font-mono pointer-events-none mix-blend-difference font-bold tracking-widest uppercase">
            GenStudio AI
        </div>
    </div>
  );
};

export default Canvas;