export enum AssetType {
  POSTER = 'POSTER',
  SLIDE = 'SLIDE',
  ICON = 'ICON',
  LOGO = 'LOGO',
}

export interface TextLayer {
  id: string;
  text: string;
  x: number; // Percentage 0-100. Anchor point X.
  y: number; // Percentage 0-100. Anchor point Y.
  color: string;
  fontSize: number; // Calculated pixel value
  fontSizePct?: number; // Store original percentage for resizing logic
  fontFamily: string;
  fontWeight: string; // 'normal' | 'bold' | etc.
  align: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'center' | 'bottom';
  boxWidth: number; // Percentage 0-100 max width relative to canvas
}

export interface ProjectState {
  assetType: AssetType;
  brief: string;
  width: number;
  height: number;
  background: string | null; // Base64 string
  svgContent: string | null; // Raw SVG string
  textLayers: TextLayer[];
  isGenerating: boolean;
  isAnalyzing: boolean;
}

export interface LayoutSuggestion {
  textLayers: Omit<TextLayer, 'id'>[];
}