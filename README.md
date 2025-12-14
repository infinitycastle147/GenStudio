# Aura AI | Intelligent Design Suite

**Aura AI** is a professional, web-based design tool powered by Google's Gemini models. It allows users to generate high-quality visual assets like posters, slides, icons, and logos simply by describing them.

## 🚀 Features

-   **AI Asset Generation**: Create strict text-free backgrounds for posters and slides, or scalable vectors for icons and logos.
-   **Smart Layouts**: Automatically analyzes generated images to suggest optimal text placement and typography using multimodal AI.
-   **Interactive Workspace**:
    -   Drag-and-drop text layers.
    -   On-canvas resizing (square handles).
    -   Smart alignment tools.
    -   Zoom & Fit-to-screen controls.
-   **Theme Support**: Built-in Dark and Light modes with a refined, glassmorphic UI.
-   **Export**: Download designs as high-resolution PNGs or raw SVGs.

## 🛠 Tech Stack

-   **Frontend**: React 19, TypeScript, Tailwind CSS
-   **AI Integration**: Google GenAI SDK (Gemini 2.5 Flash & Flash Image)
-   **Icons**: Lucide React
-   **Build Tool**: Parcel (implied by environment)

## 📦 Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/aura-ai.git
    cd aura-ai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    API_KEY=your_google_api_key_here
    ```

4.  **Run the development server**:
    ```bash
    npm start
    ```

## 🎮 Usage Guide

1.  **Select Asset Type**: Choose between Poster, Slide, Icon, or Logo.
2.  **Describe Vision**: Enter a creative brief (e.g., "A cyberpunk street food festival poster").
3.  **Generate**: Click "Generate Design". Aura AI will create the visual and suggest a text layout.
4.  **Refine**:
    -   Click text on the canvas to edit.
    -   Drag to move.
    -   Use the side handles to resize text boxes.
    -   Use the sidebar to adjust fonts, colors, and alignment.
5.  **Download**: Export your final creation.

## 📄 License

This project is open-source and available under the MIT License.