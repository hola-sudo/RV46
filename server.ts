/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger JSON payload parsing for high-res base64 renders and videos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini client lazily to avoid immediate crashes if key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("ADVERTENCIA: GEMINI_API_KEY no está definida. Las llamadas de análisis fallarán.");
      throw new Error("GEMINI_API_KEY environment variable is required to perform scene analysis.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Function to safely extract mimeType and base64 content from DataURL
function parseBase64(base64DataUrl: string) {
  if (!base64DataUrl) return null;
  const matches = base64DataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9\-\+\.]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }
  return {
    mimeType: matches[1],
    data: matches[2],
  };
}

// REST API endpoint to analyze scene renders (Image + Video)
app.post("/api/analyze-scene", async (req, res) => {
  try {
    const { image, video, params } = req.body;

    if (!image) {
      return res.status(400).json({ error: "La imagen fotorrealista es un parámetro obligatorio." });
    }

    const ai = getGeminiClient();

    // Prepare media parts
    const parts: any[] = [];

    // Parse image
    const parsedImage = parseBase64(image);
    if (!parsedImage) {
      return res.status(400).json({ error: "El formato de la imagen base64 es inválido o no está soportado." });
    }
    parts.push({
      inlineData: {
        mimeType: parsedImage.mimeType,
        data: parsedImage.data,
      },
    });

    // Parse video if present
    const hasVideo = !!video;
    if (video) {
      const parsedVideo = parseBase64(video);
      if (parsedVideo) {
        parts.push({
          inlineData: {
            mimeType: parsedVideo.mimeType,
            data: parsedVideo.data,
          },
        });
      }
    }

    // Set up detailed prompt using role instructions
    const styleCue = params?.estiloVisual ? `Estilo visual / cinematográfico adicional deseado: ${params.estiloVisual}.` : "";
    const focusCue = params?.puntosFoco ? `Presta especial atención a estos puntos de enfoque del usuario: ${params.puntosFoco}.` : "";
    
    // Construct instructions adhering strictly to user guidelines
    const promptString = `
Eres un Director de Fotografía y Arquitecto Experto en visualización 3D. Tu objetivo es analizar imágenes fotorrealistas de proyectos arquitectónicos (y videos 3D estructurales de referencia, si se proporcionan) para redactar prompts descriptivos hiperdetallados.

Tu trabajo alimentará a un motor de generación de video (Text-to-Video / Image-to-Video como Runway Gen-3, Luma Dream Machine, Kling AI, o Sora).

Por lo tanto, la precisión y la ausencia total de "alucinaciones" son críticas.

REGLAS ESTRICTAS DE ANÁLISIS:
1. CERO ALUCINACIONES: Describe ÚNICAMENTE lo que es visible en los medios proporcionados (la imagen y el video opcional). No inventes mobiliario, personas, plantas ni elementos que no estén explícitamente presentes.
2. DETALLE ARQUITECTÓNICO EXTREMO: Describe de manera técnica los materiales (ej: hormigón visto o concreto poroso, madera de roble natural, perfiles de metal dorado o latón anodizado, vidrios templados de doble altura, mármol travertino pulido), la luz (dirección, calidez, sombras proyectadas con suavidad, haz de luz cenital, reflejos especulares en agua o suelo húmedo) y los colores exactos.
3. FLORA Y DECORACIÓN REALISTA: Si hay plantas o vegetación, analiza detalladamente el tipo y especifica proporciones aproximadas (ej. 'follaje verde colgante predominante en un 80%, complementado con 20% de flores blancas bajas'). No uses vaguedades.
4. DETECTAR O SUGERIR MOVIMIENTO DE CÁMARA:
   - SI SE PROPORCIONA UN VIDEO: Traduce el movimiento de cámara exacto que se muestra a términos cinematográficos precisos (ej: 'Dolly in lento a la altura de los ojos con ligero cabeceo', 'Travelling suave hacia la izquierda con paneo de 15 grados', 'Grúa descendente desde un plano cenital').
   - SI NO SE PROPORCIONA VIDEO (solo la imagen): Sugiere un movimiento sutil e imperceptible para dar vida al render sin distorsionar la arquitectura, por ejemplo: 'Zoom in imperceptible, paneo extremadamente lento para revelar la espacialidad' o 'Dolly in lento hacia el centro'.
5. NO INCLUIR términos narrativos como 'en la imagen veo', 'este render muestra', o preámbulos. Describe el espacio espacial de inmediato de forma vívida y objetiva.

Información contextual del usuario:
- Estilo o Director de referencia: ${styleCue || "Realismo fotorrealista neutro de fotografía de arquitectura de alta gama."}
- Puntos de interés sugeridos: ${focusCue || "Geometría general, texturas de materiales, e iluminación volumétrica."}
- Presencia de video de referencia: ${hasVideo ? "SÍ. Se ha adjuntado un video corto que muestra la trayectoria física. Describe el movimiento de esta trayectoria exacta en términos de cámara cinematográfica profesional." : "NO. Sugiere un movimiento de cámara lento, majestuoso e imperceptible perfecto para este render."}
`;

    parts.push({ text: promptString });

    // Execute content generation using gemini-3.5-flash with structured output JSON schema
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            movimiento_camara: {
              type: Type.STRING,
              description: "Descripción cinematográfica y técnica del movimiento de cámara. Por ejemplo: 'Dolly in lento a la altura de los ojos en línea recta, velocidad suave, manteniendo la verticalidad arquitectónica'.",
            },
            descripcion_escena: {
              type: Type.STRING,
              description: "Descripción hiperdetallada y puramente literal de la arquitectura, texturas, colores, vegetación e iluminación presentes en el render. Sin alucinaciones, sin preámbulos, directa y objetiva.",
            },
          },
          required: ["movimiento_camara", "descripcion_escena"],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("No se pudo obtener una respuesta válida del motor de análisis.");
    }

    const parsedResult = JSON.parse(outputText.trim());
    return res.json({ result: parsedResult });
  } catch (error: any) {
    console.error("Error en el análisis de escena:", error);
    return res.status(500).json({
      error: error?.message || "Ocurrió un error inesperado al procesar la escena.",
    });
  }
});

// Configure Vite middleware in development, and static file serving in production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: any, res: any) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BACKEND] Servidor Express corriendo en el puerto ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Critical error starting application server:", err);
});
