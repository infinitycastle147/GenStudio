import { GoogleGenAI, Type } from "@google/genai";
import { AssetType, LayoutSuggestion } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a background image or visual asset using an image generation model.
 */
export async function generateBackground(brief: string, type: AssetType): Promise<string> {
  const ai = getClient();
  // Using Nano Banana (Flash Image) model as requested
  const model = "gemini-2.5-flash-image"; 

  let prompt = "";
  let aspectRatio = "1:1";

  switch (type) {
    case AssetType.POSTER:
      aspectRatio = "3:4"; // Closest to 4:5 vertical poster
      prompt = `Create a high-fidelity, strictly text-free poster background for: "${brief}". 
      
      CRITICAL CONSTRAINTS:
      1. ABSOLUTELY NO TEXT, LETTERS, NUMBERS, OR CHARACTERS. 
      2. The image must be purely visual/illustrative.
      3. Use a professional graphic design style with high visual impact.
      4. Leave distinct negative space (low detail, low contrast) suitable for overlaying text later.`;
      break;
    case AssetType.SLIDE:
      aspectRatio = "16:9";
      prompt = `Create a high-fidelity, strictly text-free presentation slide background for: "${brief}".
      
      CRITICAL CONSTRAINTS:
      1. ABSOLUTELY NO TEXT, WORDS, OR CHARACTERS.
      2. NO watermarks or placeholder labels.
      3. Clean, minimalist aesthetic suitable for business or creative presentations.
      4. Ensure large empty areas or subtle textures specifically designed for bullet points and body text.`;
      break;
    default:
      aspectRatio = "1:1";
      prompt = `An artistic background for ${brief}. High quality, abstract, strictly no text or letters.`;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          // imageSize is not supported for gemini-2.5-flash-image, so we only send aspectRatio
          aspectRatio: aspectRatio,
        }
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
       for (const part of candidates[0].content.parts) {
         if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
         }
       }
    }
    
    throw new Error("No image data returned from API.");

  } catch (error) {
    console.error("Image generation failed", error);
    throw error;
  }
}

/**
 * Generates an SVG string for Icons or Logos.
 */
export async function generateSvgIcon(brief: string, type: AssetType): Promise<string> {
  const ai = getClient();
  const model = "gemini-2.5-flash"; 

  const systemPrompt = `You are an expert SVG designer. 
  Create a ${type === AssetType.ICON ? 'simple, scalable icon' : 'geometric, modern logo'} for: "${brief}".
  
  Requirements:
  - Return ONLY valid XML SVG code.
  - Do not use markdown code blocks.
  - Use 'viewBox="0 0 512 512"'.
  - Use accessible colors or flat styles.
  - Ensure the SVG is self-contained.
  - ${type === AssetType.LOGO ? 'Focus on unique shapes, negative space, and brand identity.' : 'Focus on clarity, readability at small sizes, and standard iconography.'}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: systemPrompt,
    config: {
        responseMimeType: "text/plain"
    }
  });

  let text = response.text || "";
  
  text = text.replace(/```svg/g, '').replace(/```xml/g, '').replace(/```/g, '').trim();
  
  const svgStart = text.indexOf('<svg');
  const svgEnd = text.lastIndexOf('</svg>');
  
  if (svgStart !== -1 && svgEnd !== -1) {
    return text.substring(svgStart, svgEnd + 6);
  }
  
  return text; 
}

/**
 * Analyzes a background image and suggests layout placement based on AssetType.
 */
export async function suggestLayout(imageBase64: string, brief: string, type: AssetType): Promise<LayoutSuggestion> {
  const ai = getClient();
  const model = "gemini-2.5-flash"; // Multimodal

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  let typeContext = "";
  if (type === AssetType.POSTER) {
      typeContext = "This is a POSTER. I need a catchy HEADLINE (large, top/center), a SUBHEADLINE (medium), and optionally a DATE/LOCATION or CTA (bottom).";
  } else {
      typeContext = "This is a PRESENTATION SLIDE. I need a TITLE (top/left), and BODY TEXT or BULLET POINTS (mid-sized, aligned left/center in whitespace).";
  }

  const prompt = `Analyze this background image for a ${type.toLowerCase()} design about "${brief}".
  ${typeContext}
  
  Identify high-contrast areas where text will be legible.
  Return a JSON object with a 'textLayers' array.
  
  IMPORTANT POSITIONING RULES:
  1. 'x' and 'y' are percentages (0-100).
  2. 'x' determines horizontal anchor:
     - align='left' -> x is Left edge.
     - align='center' -> x is Center.
     - align='right' -> x is Right edge.
  3. 'y' determines vertical anchor:
     - verticalAlign='top' -> y is Top edge.
     - verticalAlign='center' -> y is Center.
     - verticalAlign='bottom' -> y is Bottom edge.
  4. 'fontSize' is % of the image's SHORTEST dimension.
     - Poster Headline: 10-15%
     - Slide Title: 6-8%
     - Body Text: 3-5%
  5. 'boxWidth' is max width percentage (avoid 100% unless centered background).

  Generate 2-4 text layers suitable for this specific asset type.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: "image/png", data: base64Data } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          textLayers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                color: { type: Type.STRING },
                fontSize: { type: Type.NUMBER },
                fontWeight: { type: Type.STRING },
                align: { type: Type.STRING },
                verticalAlign: { type: Type.STRING },
                fontFamily: { type: Type.STRING },
                boxWidth: { type: Type.NUMBER },
              },
              required: ["text", "x", "y", "color", "fontSize", "align"]
            }
          }
        }
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("No layout suggestions returned.");
    return JSON.parse(text) as LayoutSuggestion;
  } catch (e) {
    console.error("Failed to parse layout suggestion", e);
    // Fallback
    return {
      textLayers: [
        {
          text: brief.toUpperCase(),
          x: 50,
          y: 50,
          color: "#ffffff",
          fontSize: 8, 
          fontWeight: "bold",
          align: "center",
          verticalAlign: "center",
          fontFamily: "Inter",
          boxWidth: 80
        }
      ]
    };
  }
}