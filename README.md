# Aura AI ✦ Intelligent Design Suite

![Aura AI Banner](https://placehold.co/1200x300/14b8a6/ffffff?text=Aura+AI)

**Aura AI** is a professional, web-based design generation tool powered by Google's state-of-the-art **Gemini 2.5** models. It bridges the gap between creative ideation and visual execution by generating high-fidelity assets and intelligently suggesting professional layouts.

Whether you need a sleek presentation slide, a vibrant event poster, or a scalable vector logo, Aura AI understands your creative brief and brings it to life.

---

## ✨ Key Features

### 🎨 Generative Design
-   **Posters & Slides**: Generates high-resolution, text-free backgrounds tailored for overlaying content. Uses strict negative prompting to ensure clean canvases.
-   **Vectors (Icons/Logos)**: Generates raw SVG code for infinitely scalable icons and logos, not just raster images.

### 🧠 Smart Layout Engine
-   **Multimodal Analysis**: Uses Vision capabilities to analyze the generated background.
-   **Intelligent Placement**: Identifies low-contrast "safe zones" in the image to place text where it's most legible.
-   **Typography Suggestions**: Automatically selects font sizes, weights, and alignment based on the asset type (e.g., large headlines for posters, bullet points for slides).

### 🎛️ Professional Workspace
-   **Interactive Canvas**: Drag-and-drop text layers with snap-to-grid feel.
-   **On-Canvas Editing**: Resize text boxes directly using intuitive drag handles.
-   **Theme Support**: A beautiful, glassmorphic UI that toggles seamlessly between **Dark** and **Light** modes.
-   **Precision Control**: Fine-tune properties like kerning, line height (implied), colors, and dimensions.

---

## 🤖 AI Models Under the Hood

Aura AI leverages the specific strengths of different Gemini models via the Google GenAI SDK:

| Feature | Model Used | Reason |
| :--- | :--- | :--- |
| **Image Generation** | `gemini-2.5-flash-image` | High-speed, high-fidelity image synthesis with strict prompt adherence. |
| **Vector/SVG Gen** | `gemini-2.5-flash` | Excellent code generation capabilities for writing valid, clean SVG XML. |
| **Layout Analysis** | `gemini-2.5-flash` | Multimodal capabilities to "see" the image and reason about spatial composition JSON. |

---

## 🛠️ Tech Stack

-   **Framework**: React 19
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS (Custom config with brand colors)
-   **Icons**: Lucide React
-   **AI SDK**: `@google/genai`
-   **Build Tool**: Parcel / Vite (Environment dependent)

---

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18 or higher)
-   npm or yarn
-   A valid **Google Gemini API Key** (Get one at [aistudio.google.com](https://aistudio.google.com/))

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/aura-ai.git
    cd aura-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory. This is critical for the AI service to function.
    ```env
    API_KEY=your_actual_api_key_starts_with_AIza
    ```

4.  **Run the application**
    ```bash
    npm start
    ```
    Open [http://localhost:1234](http://localhost:1234) to view it in the browser.

---

## 📂 Project Structure

```text
aura-ai/
├── components/
│   ├── Canvas.tsx        # Main drawing area with interaction logic
│   ├── ControlPanel.tsx  # Sidebar for inputs and layer management
│   └── Header.tsx        # Branding and theme toggle
├── services/
│   └── geminiService.ts  # All interaction with Google GenAI SDK
├── types.ts              # TypeScript interfaces for Project State
├── App.tsx               # Main application controller
├── index.html            # Entry point with Tailwind CDN
└── index.tsx             # React Mount
```

---

## 🎮 How to Use

1.  **Define Intent**: Select your asset type (Poster, Slide, Icon, or Logo) from the sidebar.
2.  **Briefing**: Type a description. Be descriptive!
    *   *Example: "A futuristic jazz festival poster set in neon Tokyo, cyan and magenta color palette."*
3.  **Generate**: Hit the **Generate** button.
    *   *Phase 1*: Generates the visual asset.
    *   *Phase 2 (Posters/Slides)*: Analyzes the image and adds placeholder text in optimal positions.
4.  **Refine**:
    *   Click any text on the canvas to select it.
    *   Drag the box to move it.
    *   Drag the **white square handles** to resize the text width.
    *   Use the sidebar to change fonts, colors, or add new layers.
5.  **Export**: Click the **Download** button in the top toolbar to save your creation.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  <span style="color: #9ca3af">Designed & Built with ❤️ using Gemini API</span>
</p>
