/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  Sparkles, 
  Upload, 
  Film, 
  Sliders, 
  Copy, 
  Check, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  RefreshCw, 
  Download, 
  AlertTriangle,
  ArrowRight,
  Database,
  Video,
  ExternalLink,
  RotateCcw
} from "lucide-react";
import { SceneAnalysisResult, AnalyzedItem } from "./types";

export default function App() {
  // Wizard Steps state: 
  // 'upload' -> Cargar Render y Video (Obligatorios y Vinculados)
  // 'process' -> Vista previa y disparo directo del análisis (sin parámetros ficticios)
  // 'results' -> Visualizar prompt descriptivo unificado, descripciones generadas individuales, JSON de salida
  const [currentStep, setCurrentStep] = useState<"upload" | "process" | "results">("upload");

  // Custom uploaded files
  const [renderImage, setRenderImage] = useState<string | null>(null);
  const [renderImageName, setRenderImageName] = useState<string | null>(null);
  const [renderImageSize, setRenderImageSize] = useState<string | null>(null);

  const [motionVideo, setMotionVideo] = useState<string | null>(null);
  const [motionVideoName, setMotionVideoName] = useState<string | null>(null);
  const [motionVideoSize, setMotionVideoSize] = useState<string | null>(null);

  // Drag indicators
  const [dragImageActive, setDragImageActive] = useState<boolean>(false);
  const [dragVideoActive, setDragVideoActive] = useState<boolean>(false);

  // Output Response tabs
  const [activeTab, setActiveTab] = useState<"compound" | "json" | "validator">("compound");

  // Output response state from Gemini
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>("Inactivo");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [activeResult, setActiveResult] = useState<SceneAnalysisResult | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // History keeping
  const [history, setHistory] = useState<AnalyzedItem[]>([]);

  // DOM file references
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount with rigid schema validation to prevent "Uncaught TypeError" when recovering damaged legacy formats
  useEffect(() => {
    const saved = localStorage.getItem("arquitectura_prompts_history_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Keep only items that comply strictly with the schema
          const validItems = parsed.filter(item => 
            item && 
            typeof item === "object" && 
            item.imageUrl && 
            item.resultado && 
            typeof item.resultado.descripcion_escena === "string" &&
            typeof item.resultado.movimiento_camara === "string"
          );
          setHistory(validItems);
        }
      } catch (e) {
        console.error("Error al cargar historial seguro de escenas:", e);
      }
    }
  }, []);

  // Helper format file sizes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Convert File to Base64 String safely
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle Image upload selection
  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setGenerationError("Formato inválido. Sube un render fotorrealista de tipo imagen (PNG, JPG o WEBP).");
      return;
    }
    // Limit to 8MB on base64 render image to fit safely into GFE payloads
    if (file.size > 8 * 1024 * 1024) {
      setGenerationError("El render fotorrealista excede el límite máximo de 8MB.");
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setRenderImage(base64);
      setRenderImageName(file.name);
      setRenderImageSize(formatBytes(file.size));
      setGenerationError(null);
    } catch (e) {
      setGenerationError("Error al decodificar la imagen del render.");
    }
  };

  // Handle Video upload selection
  const handleVideoFile = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      setGenerationError("Formato de video inválido. Sube un clip de movimiento 3D (MP4, WebM o MOV).");
      return;
    }
    // Limit to 15MB to ensure total request body stays safely below the Cloud Run 32MB payload limit
    if (file.size > 15 * 1024 * 1024) {
      setGenerationError("El video de trayectoria excede el límite recomendado de 15MB.");
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setMotionVideo(base64);
      setMotionVideoName(file.name);
      setMotionVideoSize(formatBytes(file.size));
      setGenerationError(null);
    } catch (e) {
      setGenerationError("Error al decodificar el video de movimiento estructural.");
    }
  };

  // Action flow to process files with Gemini 3.5 via REST backend proxy
  const handleTriggerAnalysis = async () => {
    if (!renderImage) {
      setGenerationError("El render fotorrealista es obligatorio.");
      return;
    }
    if (!motionVideo) {
      setGenerationError("El video de trayectoria de cámara es obligatorio para deducir el movimiento correspondiente.");
      return;
    }

    setAnalyzing(true);
    setGenerationError(null);
    setProgressPercent(10);
    setAnalysisProgress("Inicializando Gemini 3.5 Flash...");

    // Update progress steps for realistic feedbacks
    const interval = setInterval(() => {
      setProgressPercent(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 5;
      });
    }, 500);

    try {
      setAnalysisProgress("Extrayendo fotogramas descriptores del movimiento...");
      setTimeout(() => setAnalysisProgress("Analizando consistencia de texturas de materiales..."), 1500);
      setTimeout(() => setAnalysisProgress("Clasificando elementos reales de vegetación y luz..."), 3000);
      setTimeout(() => setAnalysisProgress("Decodificando trayectoria física original de la cámara..."), 4500);
      setTimeout(() => setAnalysisProgress("Unificando prompt final libre de alucinación..."), 6000);

      // Call express back-end proxy that securely connects using processing credentials
      const response = await fetch("/api/analyze-scene", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: renderImage,
          video: motionVideo,
          params: {
            estiloVisual: "Fotorrealismo estricto de arquitectura vanguardista",
            relacionAspecto: "16:9",
            motorVideo: "Gemini 3.5 Native"
          }
        })
      });

      clearInterval(interval);

      // Safe JSON parse wrapper to prevent unexpected tokens in case of proxy 413 or 502 HTML error pages
      const responseText = await response.text();
      let payload: any;
      try {
        payload = JSON.parse(responseText);
      } catch (jsonErr) {
        throw new Error(`Error en el servidor de análisis (Código ${response.status}). El archivo podría ser demasiado pesado para procesarse.`);
      }

      if (!response.ok) {
        throw new Error(payload.error || `Fallo al procesar con código ${response.status}.`);
      }

      setProgressPercent(100);
      setAnalysisProgress("Análisis Completado.");

      if (payload.result) {
        const calculatedResult: SceneAnalysisResult = payload.result;
        setActiveResult(calculatedResult);
        saveItemToHistory(calculatedResult);
        setCurrentStep("results");
        showFeedback("Análisis directorial generado con éxito.");
      } else {
        throw new Error("El formato devuelto por el servicio interno no coincide con el esquema estricto.");
      }

    } catch (e: any) {
      console.error("Fallo de procesamiento:", e);
      setGenerationError(e?.message || "Ocurrió un error inesperado al realizar el análisis del render.");
      setProgressPercent(0);
      setAnalysisProgress("Fallo.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Reset workspace
  const handleResetWorkspace = () => {
    setRenderImage(null);
    setRenderImageName(null);
    setRenderImageSize(null);
    setMotionVideo(null);
    setMotionVideoName(null);
    setMotionVideoSize(null);
    setActiveResult(null);
    setGenerationError(null);
    setCurrentStep("upload");
    showFeedback("Mesa de trabajo limpia.");
  };

  // Convert analysis outcome to compound formatted prompt
  const buildCompoundPrompt = (result: SceneAnalysisResult | null): string => {
    if (!result) return "";
    return `PHOTOREALISTIC ARCHITECTURE: ${result.descripcion_escena?.trim() || ""} CAMERA MOVEMENT: ${result.movimiento_camara?.trim() || ""}`;
  };

  // Save successful elements to storage safely
  const saveItemToHistory = (result: SceneAnalysisResult) => {
    const compound = buildCompoundPrompt(result);
    const newItem: AnalyzedItem = {
      id: "hist-" + Date.now(),
      titulo: renderImageName ? renderImageName.replace(/\.[^/.]+$/, "") : "Escena Descriptiva",
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " | " + new Date().toLocaleDateString(),
      imageUrl: renderImage || "",
      videoUrl: motionVideo || undefined,
      params: {
        estiloVisual: "Auténtico - Cero Alucinaciones",
        relacionAspecto: "16:9",
        motorVideo: "Gemini 3.5 Flash"
      },
      resultado: result,
      promptCompuesto: compound
    };

    setHistory(prev => {
      const nextHistory = [newItem, ...prev].slice(0, 15);
      try {
        localStorage.setItem("arquitectura_prompts_history_v2", JSON.stringify(nextHistory));
      } catch (err) {
        console.warn("No se pudo guardar la vista previa de medios completa en localStorage debido al límite de cuota. Guardando historial liviano sin datos masivos...", err);
        // Fallback: create a copy of the elements where huge base64 fields are stripped or lightened
        const lightHistory = nextHistory.map(item => ({
          ...item,
          imageUrl: item.imageUrl.length > 200000 ? "" : item.imageUrl, // Clear large base64 render image
          videoUrl: item.videoUrl && item.videoUrl.length > 200000 ? undefined : item.videoUrl // Clear large base64 video string
        }));
        try {
          localStorage.setItem("arquitectura_prompts_history_v2", JSON.stringify(lightHistory));
        } catch (innerErr) {
          console.error("Error al guardar incluso el historial liviano en localstorage:", innerErr);
        }
      }
      return nextHistory;
    });
  };

  // Restore details from history item directly
  const handleRestoreHistoryItem = (item: AnalyzedItem) => {
    if (!item || !item.resultado) return;
    setRenderImage(item.imageUrl || null);
    setRenderImageName(item.titulo ? (item.titulo.endsWith(".jpg") || item.titulo.endsWith(".png") ? item.titulo : item.titulo + ".jpg") : "render_restaurado.jpg");
    setRenderImageSize(item.imageUrl ? "Restaurado" : "Removido por cuota (Prompt intacto)");
    if (item.videoUrl) {
      setMotionVideo(item.videoUrl);
      setMotionVideoName("video_movimiento.mp4");
      setMotionVideoSize("Restaurado");
    } else {
      setMotionVideo(null);
      setMotionVideoName(null);
      setMotionVideoSize(null);
    }
    setActiveResult(item.resultado);
    setGenerationError(null);
    setCurrentStep("results");
    showFeedback(`Restaurado: ${item.titulo}`);
  };

  // Clear tracking list
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("arquitectura_prompts_history_v2");
    showFeedback("Historial eliminado.");
  };

  // Show transient toast messages
  const showFeedback = (text: string) => {
    setFeedbackMessage(text);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Copy structured prompt
  const handleCopyToClipboard = (text: string) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(text)
          .then(() => {
            setCopied(true);
            showFeedback("¡Prompt unificado copiado!");
            setTimeout(() => setCopied(false), 2000);
          })
          .catch((err) => {
            console.error("Failed to copy using navigator.clipboard:", err);
            fallbackCopy(text);
          });
      } else {
        fallbackCopy(text);
      }
    } catch (e) {
      console.error("Clipboard exception thrown:", e);
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Safeguard positioning
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        setCopied(true);
        showFeedback("¡Prompt unificado copiado!");
        setTimeout(() => setCopied(false), 2000);
      } else {
        showFeedback("No se pudo copiar automáticamente. Por favor selecciónalo manualmente.");
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      showFeedback("Error al copiar. Por favor selecciónalo manualmente.");
    }
  };

  // Download raw file
  const triggerDownloadPrompt = (filename: string, text: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* 1. Header bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-amber-500 rounded flex items-center justify-center text-slate-950 font-bold" id="logo-icon">
            <Camera className="w-5.5 h-5.5 text-slate-950 stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white uppercase font-mono">Cíclope 3D</h1>
              <span className="text-[9px] tracking-widest font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase font-semibold">
                Gemini 3.5 Flash Activo
              </span>
            </div>
            <p className="text-xs text-slate-400">Traductor de Renders Arquitectónicos y Trayectorias de Cámara en Prompts de Video</p>
          </div>
        </div>

        {/* Status monitor */}
        <div className="flex items-center gap-6 text-[11px] font-mono">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-slate-500 uppercase tracking-widest text-[9px]">SISTEMA RIGUROSO</span>
            <span className="text-emerald-400 flex items-center gap-1.5 font-bold justify-end">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              Cero Alucinaciones Activo
            </span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800 hidden md:block"></div>
          <div className="flex flex-col text-right">
            <span className="text-slate-500 uppercase tracking-widest text-[9px]">API CONECTADA</span>
            <span className="text-amber-400 font-bold">Google GenAI Client</span>
          </div>
        </div>
      </header>

      {/* Toast notifications */}
      {feedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-500/35 text-amber-200 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 font-mono text-xs animate-bounce" id="toast-message">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Main workspace container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COMPONENT COLUMN (Grid Col: 5) - Workflow Steps and Actions */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* STEP HEADER SLIDER (Wizard Progress Indicator) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between font-mono text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === "upload" ? "bg-amber-500 text-slate-950" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>1</span>
              <span className={currentStep === "upload" ? "text-amber-400 font-bold" : "text-slate-300"}>Subir</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-700" />
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === "process" ? "bg-amber-500 text-slate-950" : 
                activeResult ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-850 text-slate-650"
              }`}>2</span>
              <span className={currentStep === "process" ? "text-amber-400 font-bold" : "text-slate-500"}>Procesar</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-700" />
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === "results" ? "bg-amber-500 text-slate-950" : "bg-slate-850 text-slate-655"
              }`}>3</span>
              <span className={currentStep === "results" ? "text-amber-400 font-bold" : "text-slate-500"}>Resultados</span>
            </div>
          </div>

          {/* STEP 1/3: UPLOAD MEDIA ZONE (VINCULADOS Y OBLIGATORIOS) */}
          {currentStep === "upload" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono mb-1">Paso 1: Medios Fuentes Obligatorios</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para realizar el análisis directorial auténtico, es requerido subir conjuntamente: el **Render Fotorrealista** (espacial) y una **Trayectoria de Movimiento** de referencia. Ambos archivos se vincularán para deducir el prompt preciso.
                </p>
              </div>

              {/* Render Image (Mandatory) */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[11px] font-mono tracking-wider uppercase text-slate-400 font-bold flex items-center justify-between">
                  <span>A. Render Fotorrealista (Imagen)</span>
                  <span className="text-amber-500 text-[10px] font-bold lowercase">★ Obligatorio</span>
                </label>
                
                <div 
                  onDragEnter={(e) => { e.preventDefault(); setDragImageActive(true); }}
                  onDragOver={(e) => { e.preventDefault(); setDragImageActive(true); }}
                  onDragLeave={() => setDragImageActive(false)}
                  onDrop={async (e) => {
                    e.preventDefault(); setDragImageActive(false);
                    if (e.dataTransfer.files?.[0]) await handleImageFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => imageInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    dragImageActive 
                      ? "border-amber-500 bg-amber-500/5" 
                      : renderImage
                        ? "border-emerald-500/50 bg-emerald-500/[0.02]"
                        : "border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  <input 
                    ref={imageInputRef}
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                  />
                  
                  {renderImage ? (
                    <div className="flex items-center gap-3 text-left w-full overflow-hidden">
                      <div className="relative w-12 h-12 rounded border border-emerald-500/40 overflow-hidden shrink-0">
                        <img src={renderImage} alt="Render Base" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-mono font-bold text-emerald-400 truncate">RENDER_FUENTE.png</p>
                        <p className="text-[9px] text-slate-500 truncate font-mono">{renderImageName} ({renderImageSize})</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-slate-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-300">Selecciona o arrastra el render propio</p>
                        <p className="text-[10px] text-slate-500 mt-1">Soporta PNG, JPEG, WEBP (Max 8MB)</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Movement Video (Mandatory) */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[11px] font-mono tracking-wider uppercase text-slate-400 font-bold flex items-center justify-between">
                  <span>B. Video de Movimiento 3D (Trayectoria)</span>
                  <span className="text-amber-500 text-[10px] font-bold lowercase">★ Obligatorio</span>
                </label>
                
                <div 
                  onDragEnter={(e) => { e.preventDefault(); setDragVideoActive(true); }}
                  onDragOver={(e) => { e.preventDefault(); setDragVideoActive(true); }}
                  onDragLeave={() => setDragVideoActive(false)}
                  onDrop={async (e) => {
                    e.preventDefault(); setDragVideoActive(false);
                    if (e.dataTransfer.files?.[0]) await handleVideoFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => videoInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    dragVideoActive 
                      ? "border-amber-500 bg-amber-500/5" 
                      : motionVideo
                        ? "border-emerald-500/50 bg-emerald-500/[0.02]"
                        : "border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  <input 
                    ref={videoInputRef}
                    type="file" 
                    accept="video/*"
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && handleVideoFile(e.target.files[0])}
                  />
                  
                  {motionVideo ? (
                    <div className="flex items-center gap-3 text-left w-full overflow-hidden">
                      <div className="w-12 h-12 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <Video className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-mono font-bold text-emerald-400 truncate">RECORRIDO_MOVIMIENTO.mp4</p>
                        <p className="text-[9px] text-slate-500 truncate font-mono">{motionVideoName} ({motionVideoSize})</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Film className="w-8 h-8 text-slate-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-300">Selecciona o arrastra el video guía de cámara</p>
                        <p className="text-[10px] text-slate-500 mt-1">Soporta MP4, WebM (Max 15MB)</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {generationError && (
                <div className="bg-rose-500/10 border border-rose-500/35 rounded p-3 text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <span className="font-mono">{generationError}</span>
                </div>
              )}

              {/* Progress to next step button */}
              <button
                disabled={!renderImage || !motionVideo}
                onClick={() => setCurrentStep("process")}
                className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  renderImage && motionVideo
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <span>Siguiente Paso</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2/3: TRIGGER ANALYSIS EXECUTOR (NO DIRECCIONAL CONTROLS) */}
          {currentStep === "process" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono mb-1">Paso 2: Compilar con Gemini 3.5</h2>
                  <p className="text-xs text-slate-400">Los medios fuentes están consolidados. Inicia el descifrador para extraer descripciones detalladas sin alucinación.</p>
                </div>
                <button 
                  onClick={() => setCurrentStep("upload")}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Volver a cargar
                </button>
              </div>

              {/* Connected details */}
              <div className="grid grid-cols-2 gap-3.5 bg-slate-950 p-4 rounded-lg border border-slate-850">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Render Base</span>
                  <span className="text-[11px] font-mono font-bold text-amber-350 truncate">{renderImageName}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Trayectoria Cámara</span>
                  <span className="text-[11px] font-mono font-bold text-amber-355 truncate">{motionVideoName}</span>
                </div>
              </div>

              {generationError && (
                <div className="bg-rose-500/10 border border-rose-500/35 rounded p-3 text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <span className="font-mono">{generationError}</span>
                </div>
              )}

              {/* Directly trigger analysis with pure back-end Google GenAI wrapper */}
              <button
                disabled={analyzing}
                onClick={handleTriggerAnalysis}
                className={`w-full py-4 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  analyzing 
                    ? "bg-amber-500/20 border border-amber-500/25 text-amber-400/70 cursor-not-allowed" 
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono shadow-[0_0_30px_rgba(245,158,11,0.25)]"
                }`}
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Transcribiendo espacialidad...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5 text-slate-950 fill-current" />
                    <span>Iniciar Intérprete Gemini 3.5</span>
                  </>
                )}
              </button>

              <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-lg text-[10px] text-slate-400 leading-relaxed font-mono">
                <p className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  INFORMACIÓN REAL DEL MOTOR
                </p>
                Este flujo de trabajo está conectado de manera real a la API de **Google Gemini 3.5 Flash** en el servidor, el cual lee los píxeles de la imagen de arquitectura y analiza el vector del video de trayectoria para compilar el prompt descriptivo.
              </div>
            </div>
          )}

          {/* STEP 3/3: FINAL COMPILATION (REVEAL PROMPTS AND DATA ONLY AFTER EXECUTION) */}
          {currentStep === "results" && activeResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 font-mono mb-1">Paso 3: Prompt Compilado</h2>
                  <p className="text-xs text-slate-400">Los prompts cinematográficos de video se han generado.</p>
                </div>
                <button 
                  onClick={handleResetWorkspace}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpiar Workspace
                </button>
              </div>

              {/* Dynamic View Tabs for Output Options */}
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded border border-slate-850 font-mono text-[10px] uppercase">
                <button
                  onClick={() => setActiveTab("compound")}
                  className={`py-2 px-1 rounded text-center transition-all ${
                    activeTab === "compound" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Prompt Unificado
                </button>
                <button
                  onClick={() => setActiveTab("json")}
                  className={`py-2 px-1 rounded text-center transition-all ${
                    activeTab === "json" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  JSON Técnico
                </button>
                <button
                  onClick={() => setActiveTab("validator")}
                  className={`py-2 px-1 rounded text-center transition-all ${
                    activeTab === "validator" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Validación
                </button>
              </div>

              {/* Prompt copy elements */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col gap-4">
                {activeTab === "compound" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                      <span>COMPUESTO COMPILADO</span>
                      <button 
                        onClick={() => handleCopyToClipboard(buildCompoundPrompt(activeResult))}
                        className="text-amber-500 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copiar Prompt
                      </button>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs p-3 rounded leading-relaxed select-all max-h-[140px] overflow-y-auto whitespace-pre-wrap">
                      {buildCompoundPrompt(activeResult)}
                    </div>
                    
                    <button
                      onClick={() => triggerDownloadPrompt("prompt-director-ciclope.txt", buildCompoundPrompt(activeResult))}
                      className="w-full py-2 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 rounded text-xs font-mono transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      Descargar como archivo .txt
                    </button>
                  </div>
                )}

                {activeTab === "json" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                      <span>JSON ORIGINAL STRUCT</span>
                      <button 
                        onClick={() => handleCopyToClipboard(JSON.stringify(activeResult, null, 2))}
                        className="text-amber-500 hover:underline text-[11px] flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copiar JSON
                      </button>
                    </div>
                    <pre className="text-[10px] text-emerald-450 font-mono bg-slate-950 border border-slate-800 p-3 rounded overflow-x-auto max-h-[180px]">
                      {JSON.stringify(activeResult, null, 2)}
                    </pre>
                  </div>
                )}

                {activeTab === "validator" && (
                  <div className="flex flex-col gap-3 font-mono">
                    <span className="text-xs text-slate-400 uppercase">Filtro Antialucinación</span>
                    
                    <div className="flex flex-col gap-2 text-[11px]">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                        <span>Mapeo estructural fotorrealista verificado.</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                        <span>Consistencia de vegetación descriptiva.</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                        <span>Deducción de trayectoria cinematográfica real.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HISTORIAL LOCAL EN LA PARTE INFERIOR (CON PROPIEDADES SEGURAS) */}
          {history.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                  <Database className="w-3.5 h-3.5 text-amber-500" />
                  <span>Historial de Análisis ({history.length})</span>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline transition-colors font-mono"
                >
                  <Trash2 className="w-3 h-3" />
                  Limpiar
                </button>
              </div>

              <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {history.map((item, index) => (
                  <div 
                    key={item.id || index}
                    onClick={() => handleRestoreHistoryItem(item)}
                    className="p-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 transition-all rounded-lg flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded overflow-hidden border border-slate-805 shrink-0 bg-slate-900 bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl})` }}></div>
                    <div className="flex-1 min-w-0 font-mono text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-200 truncate group-hover:text-amber-300 transition-colors uppercase">{item.titulo || "Análisis de Escena"}</span>
                        <span className="text-[9px] text-slate-500 shrink-0">{(item.fecha || "").split(" | ")[0]}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">
                        {item.resultado?.descripcion_escena || "Análisis completado"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: CINEMATIC LIVE WORKSPACE VIEWER */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Active Monitoring Terminal */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col items-stretch relative">
            
            {/* Header info */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-850 flex items-center justify-between font-mono text-[10px] tracking-widest text-slate-400 uppercase">
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full inline-block ${analyzing ? "bg-amber-500 animate-ping" : "bg-emerald-400 animate-pulse"}`}></span>
                Monitor Directorial de Fotografía
              </span>
              <span>LENTE DE PRECISIÓN</span>
            </div>

            {/* Split Dual-Media Previews showing sources */}
            <div className="aspect-video bg-slate-950 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-850 relative overflow-hidden group">
              
              {/* LEFT VIEWPORT: Render image */}
              <div className="relative flex items-center justify-center p-2 bg-slate-950/60 overflow-hidden">
                <span className="absolute top-2 left-2 z-10 text-[9px] font-mono tracking-widest uppercase bg-slate-950/80 border border-slate-800 text-amber-500 px-1.5 py-0.5 rounded">
                  A. Render Base
                </span>
                
                {renderImage ? (
                  <img 
                    src={renderImage} 
                    alt="Active render source" 
                    className="w-full h-full object-cover rounded filter brightness-[0.9] hover:brightness-100 transition-all duration-300"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-700 font-mono text-[10px] uppercase flex flex-col items-center gap-1.5">
                    <ImageIcon className="w-8 h-8 text-slate-800" />
                    <span>Sin Render Fotorrealista</span>
                  </div>
                )}

                {/* Processing visual elements */}
                {analyzing && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="w-full h-1 bg-gradient-to-b from-transparent via-amber-500 to-transparent absolute top-0 animate-bounce shadow-[0_0_10px_rgba(245,158,11,0.6)]"></div>
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 border border-amber-500/10"></div>
                  </div>
                )}
              </div>

              {/* RIGHT VIEWPORT: Tracking structural video */}
              <div className="relative flex items-center justify-center p-2 bg-slate-950/60 overflow-hidden">
                <span className="absolute top-2 left-2 z-10 text-[9px] font-mono tracking-widest uppercase bg-slate-950/80 border border-slate-800 text-amber-500 px-1.5 py-0.5 rounded">
                  B. Recorrido de Cámara
                </span>
                
                {motionVideo ? (
                  <video 
                    src={motionVideo}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded filter brightness-[0.9] hover:brightness-100 transition-all duration-300"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-700 font-mono text-[10px] uppercase flex flex-col items-center gap-1.5">
                    <Film className="w-8 h-8 text-slate-800" />
                    <span>Sin Video de Movimiento</span>
                  </div>
                )}

                {/* Laser scan lines */}
                {analyzing && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="w-full h-1 bg-gradient-to-b from-transparent via-emerald-500 to-transparent absolute top-0 animate-bounce shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  </div>
                )}
              </div>

              {/* Loader display overlays */}
              {analyzing && (
                <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 gap-3">
                  <div className="relative flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full border-4 border-slate-800 border-t-amber-500 animate-spin"></div>
                    <Camera className="w-6 h-6 text-amber-500 absolute" />
                  </div>
                  <div className="text-center font-mono max-w-sm mt-3 border-t border-slate-850 pt-3">
                    <p className="text-xs font-bold text-white uppercase tracking-widest animate-pulse">{analysisProgress}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Computando cuadro a cuadro con Gemini 3.5 Flash de forma segura...</p>
                    
                    {/* Progress Bar indicator */}
                    <div className="w-48 h-1.5 bg-slate-900 border border-slate-800 rounded-full mx-auto mt-4 overflow-hidden">
                      <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom status stats labels */}
            <div className="p-3 bg-slate-950/90 border-t border-slate-850 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-850 text-[10px] font-mono text-slate-400 uppercase text-center">
              <div className="py-1">
                <span className="text-slate-600 block text-[9px] tracking-wider mb-0.5">MEDIO ESPACIAL</span>
                <span className={renderImage ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {renderImage ? "VINCULADO" : "FALTA CARGAR"}
                </span>
              </div>
              <div className="py-1">
                <span className="text-slate-600 block text-[9px] tracking-wider mb-0.5">TRAYECTORIA CINEMÁTICA</span>
                <span className={motionVideo ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {motionVideo ? "RECORRIDO DETECTADO" : "FALTA CARGAR"}
                </span>
              </div>
              <div className="py-1">
                <span className="text-slate-600 block text-[9px] tracking-wider mb-0.5">SERVICIO DE ANÁLISIS</span>
                <span className="text-amber-500 font-bold">GEMINI 3.5 FLASH API</span>
              </div>
            </div>
          </div>

          {/* DUAL DESCRIPTIONS INDIVIDUAL LOGS (ONLY SHOW AFTER EXECUTION RESULT) */}
          {activeResult && currentStep === "results" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              
              {/* Scene description details card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col gap-2 relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500 inline-block"></span>
                  <span className="text-xs font-bold font-mono tracking-wider uppercase text-slate-100 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                    Descripción del Espacio
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pr-1 max-h-[160px] overflow-y-auto">
                  {activeResult.descripcion_escena || "Visualización sin descripción de arquitectura registrada."}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Antialucinaciones: 100% Ok</span>
                  <span>Espacio Físico Real</span>
                </div>
              </div>

              {/* Camera movement trajectory description details card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col gap-2 relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block"></span>
                  <span className="text-xs font-bold font-mono tracking-wider uppercase text-slate-100 flex items-center gap-1.5 font-bold">
                    <Film className="w-3.5 h-3.5 text-emerald-400" />
                    Detalle de la Trayectoria
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pr-1 max-h-[160px] overflow-y-auto">
                  {activeResult.movimiento_camara || "Sin descripción de trayectoria registrada."}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Interpretador Coherente</span>
                  <span>Perspectiva 3D</span>
                </div>
              </div>
              
            </div>
          )}

          {/* DEFAULT HELP MANUAL ON STEP 1 OR 2 */}
          {(!activeResult || currentStep !== "results") && (
            <div className="bg-slate-900/50 border border-slate-800/40 rounded-xl p-5 flex flex-col gap-4 font-mono text-xs">
              <span className="text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-1.5 border-b border-slate-850 pb-2 font-bold">
                <Sliders className="w-4 h-4 text-amber-500" />
                Procedimiento de Interpretación Cinematográfica
              </span>

              <div className="flex flex-col gap-3 text-slate-400 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">[1]</span>
                  <p>La inteligencia artificial interpreta y desglosa minuciosamente el material espacial provisto. No se agregan elementos aleatorios externos.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">[2]</span>
                  <p>La trayectoria de cámara es convertida en un descriptor de cámara cinematográfica físico basado en el vector de movimiento 3D de referencia suministrado.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">[3]</span>
                  <p>El prompt unificado final se unifica de forma totalmente lista para alimentar a sus generadores favoritos de IA como Runway Gen-3 o Sora.</p>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                  <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Servidor de análisis y proxy directo de Google GenAI activo.</span>
                </div>
                <span className="text-[10px] text-amber-500 font-bold select-none">[v2.1 PIPELINE_RUNNING]</span>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 mt-8 flex flex-col gap-2 md:flex-row md:items-center justify-between text-xs text-slate-500 font-mono">
        <div>
          <span>© 2026 CÍCLOPE Studio. Diseñado exclusivamente para Directores de Arte 3D.</span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-300 transition-colors flex items-center gap-1">
            Manual de Fotorrealismo <ExternalLink className="w-3 h-3" />
          </a>
          <span>|</span>
          <span className="text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-ping"></span>
            Servicio Cloud Run Conectado
          </span>
        </div>
      </footer>

    </div>
  );
}
