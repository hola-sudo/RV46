/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SceneAnalysisResult {
  movimiento_camara: string;
  descripcion_escena: string;
}

export interface AnalysisParams {
  estiloVisual: string; // e.g., "Realismo Cinematográfico (Roger Deakins)", "Fotografía de Arquitectura Coreana", etc.
  relacionAspecto: string; // "16:9", "9:16", "4:3", "1:1"
  motorVideo: string; // "Runway Gen-3", "Luma Dream Machine", "Kling AI", "Sora"
  puntosFoco?: string; // e.g., texturas, iluminación, geometría, vegetación
}

export interface SampleScene {
  id: string;
  titulo: string;
  descripcion: string;
  imageUrl: string;
  videoUrl?: string;
  renderSource: string; // Creator/style info
  params: AnalysisParams;
}

export interface AnalyzedItem {
  id: string;
  titulo: string;
  fecha: string;
  imageUrl: string;
  videoUrl?: string;
  puntosFoco?: string;
  params: AnalysisParams;
  resultado: SceneAnalysisResult;
  promptCompuesto: string;
}
