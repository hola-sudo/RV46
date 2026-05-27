/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SampleScene } from "./types";

export const SAMPLE_SCENES: SampleScene[] = [
  {
    id: "brutalist-reflection",
    titulo: "Casa Brutalista & Espejo de Agua",
    descripcion: "Estructura geométrica de hormigón visto sobre un estanque reflejante durante la hora azul.",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    renderSource: "Render por Visuals Studio (Hourglass Blue)",
    params: {
      estiloVisual: "Cinemático (Denis Villeneuve / Roger Deakins - Contraste alto, luz difusa fría)",
      relacionAspecto: "16:9",
      motorVideo: "Runway Gen-3",
      puntosFoco: "Geometría del hormigón, reflejos perfectos del agua y luz ambiental cenital"
    }
  },
  {
    id: "japanese-zen",
    titulo: "Atrio Loft Japones & Madera de Cedro",
    descripcion: "Interior minimalista con pantallas Washi de papel, luz cenital rasante e interiores de cedro pulido.",
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    renderSource: "Diseño por Kengo Kuma Associates (Inspiracional)",
    params: {
      estiloVisual: "Fotografía de Arquitectura Japonesa (Luz natural suave, tonos tierra)",
      relacionAspecto: "9:16",
      motorVideo: "Luma Dream Machine",
      puntosFoco: "Veteado de la madera, polvo suspendido en el haz de luz y pantallas de papel"
    }
  },
  {
    id: "glass-conservatory",
    titulo: "Pabellón de Cristal & Helechos",
    descripcion: "Estructura ligera de acero negro y cristal de doble altura con un 90% de helechos colgantes.",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    renderSource: "Invernadero Estructural Modernista",
    params: {
      estiloVisual: "Cinemático Vintage (35mm Anamórfico, grano sutil, tonos verdes ricos)",
      relacionAspecto: "16:9",
      motorVideo: "Kling AI",
      puntosFoco: "Reflejos del cristal mojado, follaje verde denso y perfiles metálicos finos"
    }
  }
];

// Curated analyses for the sample scenes, ensuring zero hallucinations and extreme detail
export const SAMPLE_ANALYSES: Record<string, { movimiento_camara: string; descripcion_escena: string }> = {
  "brutalist-reflection": {
    descripcion_escena: "Arquitectura brutalista compuesta por amplias losas horizontales de hormigón poroso visto de tono gris cenizo, con encofrado texturizado lineal. Gran ventanal acristalado de suelo a techo con perfilería de aluminio negro anodizado, dejando ver un interior con luz artificial indirecta de tono amberino cálido a 2700K. En el primer plano, un estanque rectangular de aguas completamente quietas y oscuras funciona como un espejo, duplicando simétricamente la geometría del edificio. Vegetación circundante integrada por una alfombra uniforme de hierba verde oscura al 95% y 5% de gravilla caliza blanca perimetral. La iluminación general corresponde al crepúsculo u hora azul; el cielo presenta un gradiente de azul profundo a violeta pálido, proyectando una luz fría y ambiental homogénea sobre las texturas rugosas del hormigón.",
    movimiento_camara: "Dolly in lento a ras del agua del estanque, avanzando horizontalmente a una velocidad constante e imperceptible. El eje de cámara permanece estrictamente nivelado a 0 grados para mantener las líneas de fuga simétricas y reflejar fielmente la volumetría ortogonal del hormigón."
  },
  "japanese-zen": {
    descripcion_escena: "Espacio central de planta libre revestido en su totalidad por tableros de cedro japonés de veteado vertical fino y tono ocre claro. Del lateral izquierdo incide un haz de luz solar directa y rasante a 45 grados cargado de partículas flotantes sutiles, recortando sombras duras y alargadas de las columnas estructurales sobre el pavimento de microcemento pulido color gris ratón. Pantallas corredizas estriadas de madera y papel de arroz traslúcido de color blanco roto cubren la fachada posterior, difuminando siluetas de bambú exterior de follaje verde oliva. Mobiliario escaso consistente en una mesa de té monolítica de granito negro sin pulir en el centro geométrico de la sala; sin más elementos decorativos superfluos.",
    movimiento_camara: "Paneo extremadamente lento de izquierda a derecha (30 grados totales) combinado con un suave travelling descendente (grúa abajo). El foco de la lente se mantiene crítico en las partículas del haz de luz antes de pasar gradualmente a la textura rugosa del granito central."
  },
  "glass-conservatory": {
    descripcion_escena: "Estructura geométrica e invernadero contemporáneo de doble altura compuesta por pórticos de acero estructural con acabado mate negro mate y paneles de cristal templado transparente de alta transmitancia de 12mm. Desde las cerchas superiores del techo cuelga un denso follaje vegetal suspendido compuesto por un 85% de helechos Nephrolepis exaltata de hojas serradas verde brillante muy compactas y un 15% de enredaderas Fitonia de hojas veteadas de tonalidad verde pálido. Debajo, un suelo de losetas hidráulicas de terracota natural de formato cuadrado dispuestas en hilada regular. La iluminación es cenital y difusa, típica de un día nublado húmedo, lo que suaviza las sombras y genera destellos especulares delicados a lo largo de las juntas del cristal húmedo.",
    movimiento_camara: "Tilt-up (inclinación hacia arriba) majestuoso partiendo del suelo de terracota hacia la estructura del techo, revelando progresivamente la escala del invernadero y la densidad de la vegetación colgante de forma elegante y estable."
  }
};
